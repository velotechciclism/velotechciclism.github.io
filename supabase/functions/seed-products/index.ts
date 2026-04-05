import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Produtos da VeloTech para popular o banco
const PRODUCTS = [
  {
    product_id: "1",
    product_name: "Bicicleta Speed Carbon Pro",
    product_description: "Bicicleta de estrada profissional com quadro em carbono, grupo Shimano Ultegra e rodas aerodinâmicas. Ideal para competições e treinos intensos.",
    product_category: "Bicicletas",
    product_price: 2499.99,
  },
  {
    product_id: "2",
    product_name: "Capacete Aero Elite",
    product_description: "Capacete aerodinâmico com sistema de ventilação avançado, proteção MIPS e design leve. Perfeito para ciclistas de alto rendimento.",
    product_category: "Capacetes",
    product_price: 89.99,
  },
  {
    product_id: "3",
    product_name: "Luvas Gel Pro",
    product_description: "Luvas de ciclismo com palmilha em gel para máximo conforto, tecido respirável e design ergonômico. Excelente para longas pedaladas.",
    product_category: "Luvas",
    product_price: 29.99,
  },
  {
    product_id: "4",
    product_name: "Jersey Team VeloTech",
    product_description: "Camisola de ciclismo da equipe VeloTech, tecido técnico com secagem rápida, bolsos traseiros e proteção UV.",
    product_category: "Vestuário",
    product_price: 59.99,
  },
  {
    product_id: "5",
    product_name: "Mountain Bike Trail Master",
    product_description: "Bicicleta de montanha com suspensão full, quadro em alumínio, freios a disco hidráulicos e pneus de alta tração para trilhas técnicas.",
    product_category: "Bicicletas",
    product_price: 1899.99,
  },
  {
    product_id: "6",
    product_name: "Bomba de Ar Portátil",
    product_description: "Bomba de ar compacta com manômetro integrado, compatível com válvulas Presta e Schrader. Essencial para emergências.",
    product_category: "Acessórios",
    product_price: 24.99,
  },
  {
    product_id: "7",
    product_name: "Luz LED Traseira Recarregável",
    product_description: "Luz traseira com LED de alta visibilidade, bateria recarregável via USB, múltiplos modos de iluminação para máxima segurança noturna.",
    product_category: "Iluminação",
    product_price: 19.99,
  },
  {
    product_id: "8",
    product_name: "Sapatilha de Ciclismo Pro",
    product_description: "Sapatilha de ciclismo com sola em carbono, sistema de encaixe SPD-SL, ajuste micro-métrico e ventilação superior.",
    product_category: "Calçado",
    product_price: 149.99,
  },
  {
    product_id: "9",
    product_name: "Kit de Ferramentas Multi-Tool",
    product_description: "Kit de ferramentas 16 em 1 para manutenção de bicicletas, inclui chaves allen, chave de corrente e extrator de pedivela.",
    product_category: "Ferramentas",
    product_price: 34.99,
  },
  {
    product_id: "10",
    product_name: "Garrafa Térmica Ciclismo",
    product_description: "Garrafa térmica de 750ml com isolamento duplo, mantém bebidas frias por até 4 horas. Compatível com suportes padrão.",
    product_category: "Hidratação",
    product_price: 22.99,
  },
  {
    product_id: "11",
    product_name: "Shorts Acolchoados Endurance",
    product_description: "Bermuda de ciclismo com espuma de alta densidade, costuras planas anti-atrito e tecido compressivo para longas distâncias.",
    product_category: "Vestuário",
    product_price: 69.99,
  },
  {
    product_id: "12",
    product_name: "Cadeado U-Lock Premium",
    product_description: "Cadeado em formato U com aço temperado de 16mm, resistente a cortes e arrombamentos. Inclui suporte para quadro.",
    product_category: "Segurança",
    product_price: 54.99,
  },
  {
    product_id: "13",
    product_name: "Computador de Ciclismo GPS",
    product_description: "Ciclocomputador com GPS integrado, monitor de frequência cardíaca, potência estimada, navegação por rotas e conectividade Bluetooth.",
    product_category: "Eletrônicos",
    product_price: 199.99,
  },
  {
    product_id: "14",
    product_name: "Pneu Continental Grand Prix 5000",
    product_description: "Pneu de alta performance para estrada, composto BlackChili, proteção anti-furos Vectran e baixa resistência ao rolamento.",
    product_category: "Pneus",
    product_price: 64.99,
  },
  {
    product_id: "15",
    product_name: "Selim Ergonômico Confort Plus",
    product_description: "Selim com design ergonômico, canal central para alívio de pressão, espuma de memória e trilhos em titânio.",
    product_category: "Componentes",
    product_price: 79.99,
  },
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Inserir ou atualizar produtos
    const { data, error } = await supabase
      .from("product_embeddings")
      .upsert(PRODUCTS, { onConflict: "product_id" })
      .select();

    if (error) {
      console.error("Error seeding products:", error);
      throw error;
    }

    return new Response(JSON.stringify({
      success: true,
      message: `${data?.length || 0} produtos inseridos/atualizados com sucesso`,
      products: data,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Seed error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Erro ao popular produtos" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
