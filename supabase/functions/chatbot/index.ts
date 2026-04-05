import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;

// Sistema de contexto para o chatbot da VeloTech
const SYSTEM_PROMPT = `Você é o assistente virtual da VeloTech, uma loja especializada em ciclismo e acessórios para bicicletas.

Seu papel é:
- Ajudar clientes a encontrar produtos ideais para suas necessidades
- Responder perguntas sobre ciclismo, manutenção de bicicletas e equipamentos
- Fornecer recomendações personalizadas com base nas preferências do cliente
- Ser amigável, prestativo e conhecedor do mundo do ciclismo

Quando produtos relevantes forem encontrados no contexto, mencione-os naturalmente na conversa com nome e preço.
Se não houver produtos específicos no contexto, ainda assim responda de forma útil sobre ciclismo em geral.

Mantenha respostas concisas mas informativas. Use emojis ocasionalmente para tornar a conversa mais amigável 🚴‍♂️`;

// Função para gerar embeddings usando o Lovable AI
async function generateEmbedding(text: string): Promise<number[] | null> {
  try {
    // Usando o modelo para gerar uma representação do texto
    // Como não temos acesso direto a embeddings, vamos usar uma abordagem de busca textual
    return null;
  } catch (error) {
    console.error("Error generating embedding:", error);
    return null;
  }
}

// Buscar produtos por texto (fallback quando embeddings não estão disponíveis)
async function searchProductsByText(supabase: any, query: string) {
  const searchTerms = query.toLowerCase().split(" ").filter(t => t.length > 2);
  
  const { data: products, error } = await supabase
    .from("product_embeddings")
    .select("product_id, product_name, product_description, product_category, product_price");
  
  if (error || !products || products.length === 0) {
    console.log("No products found or error:", error);
    return [];
  }

  // Filtrar produtos por relevância textual
  const scoredProducts = products.map((p: any) => {
    const searchText = `${p.product_name} ${p.product_description} ${p.product_category}`.toLowerCase();
    let score = 0;
    for (const term of searchTerms) {
      if (searchText.includes(term)) score++;
    }
    return { ...p, score };
  }).filter((p: any) => p.score > 0)
    .sort((a: any, b: any) => b.score - a.score)
    .slice(0, 5);

  return scoredProducts;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, conversationId, sessionId } = await req.json();
    
    if (!message) {
      return new Response(JSON.stringify({ error: "Message is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Buscar produtos relevantes
    const relevantProducts = await searchProductsByText(supabase, message);
    console.log("Found relevant products:", relevantProducts.length);

    // Construir contexto com produtos
    let productContext = "";
    if (relevantProducts.length > 0) {
      productContext = "\n\nProdutos relevantes encontrados na loja:\n";
      for (const p of relevantProducts) {
        productContext += `- ${p.product_name}: €${p.product_price} (Categoria: ${p.product_category})\n`;
        if (p.product_description) {
          productContext += `  Descrição: ${p.product_description}\n`;
        }
      }
    }

    // Buscar histórico de conversa se existir
    let conversationHistory: { role: string; content: string }[] = [];
    let currentConversationId = conversationId;

    if (currentConversationId) {
      const { data: messages } = await supabase
        .from("chat_messages")
        .select("role, content")
        .eq("conversation_id", currentConversationId)
        .order("created_at", { ascending: true })
        .limit(10);

      if (messages) {
        conversationHistory = messages;
      }
    } else {
      // Criar nova conversa
      const { data: newConversation, error: convError } = await supabase
        .from("chat_conversations")
        .insert({ session_id: sessionId || crypto.randomUUID() })
        .select()
        .single();

      if (newConversation) {
        currentConversationId = newConversation.id;
      }
    }

    // Salvar mensagem do usuário
    if (currentConversationId) {
      await supabase.from("chat_messages").insert({
        conversation_id: currentConversationId,
        role: "user",
        content: message,
      });
    }

    // Preparar mensagens para a API
    const apiMessages = [
      { role: "system", content: SYSTEM_PROMPT + productContext },
      ...conversationHistory,
      { role: "user", content: message },
    ];

    // Chamar Lovable AI
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: apiMessages,
        stream: false,
        max_tokens: 500,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI API error:", aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ 
          error: "Limite de requisições excedido. Tente novamente em alguns segundos." 
        }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ 
          error: "Créditos insuficientes. Por favor, adicione créditos à sua conta." 
        }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const assistantMessage = aiData.choices?.[0]?.message?.content || "Desculpe, não consegui processar sua pergunta.";

    // Salvar resposta do assistente
    if (currentConversationId) {
      await supabase.from("chat_messages").insert({
        conversation_id: currentConversationId,
        role: "assistant",
        content: assistantMessage,
      });
    }

    return new Response(JSON.stringify({
      message: assistantMessage,
      conversationId: currentConversationId,
      products: relevantProducts,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Chatbot error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Erro interno do servidor" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
