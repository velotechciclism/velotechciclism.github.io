import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Loader2, Bike } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { contactInfo } from "@/config/contact";
import { getApiUrl, shouldUseRemoteApi } from "@/lib/api";
import { askLocalRag } from "@/lib/chatbotLocalRag";
import { createConversationId, readLocalConversation, saveLocalChatMessage } from "@/lib/localChat";
import { Link } from "react-router-dom";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ProductSuggestion {
  product_id: string;
  product_name: string;
  product_price: number;
  product_category: string;
  path?: string;
}

const API_URL = getApiUrl();

const ChatbotWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [localConversationId] = useState<string>(() => createConversationId());
  const [remoteConversationId, setRemoteConversationId] = useState<string | null>(null);
  const [sessionId] = useState(() => crypto.randomUUID());
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [suggestionsByMessage, setSuggestionsByMessage] = useState<Record<string, ProductSuggestion[]>>({});

  useEffect(() => {
    setMessages(readLocalConversation(localConversationId));
  }, [localConversationId]);

  const formatMarkdownLinks = (text: string) => {
    const pattern = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match = pattern.exec(text);

    while (match) {
      const [full, label, href] = match;
      const startIndex = match.index;
      if (startIndex > lastIndex) {
        parts.push(text.slice(lastIndex, startIndex));
      }

      if (href.startsWith('/')) {
        parts.push(
          <Link key={`${href}-${startIndex}`} to={href} className="underline underline-offset-2 font-semibold text-orange-300 hover:text-orange-200">
            {label}
          </Link>
        );
      } else {
        parts.push(
          <a key={`${href}-${startIndex}`} href={href} target="_blank" rel="noreferrer" className="underline underline-offset-2 font-semibold text-orange-300 hover:text-orange-200">
            {label}
          </a>
        );
      }

      lastIndex = startIndex + full.length;
      match = pattern.exec(text);
    }

    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  // Mensagem de boas-vindas
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content: `Olá! Sou o assistente de compra da VeloTech. Posso encontrar o melhor produto por uso, orçamento, nível, tamanho e stock.

Experimente perguntar:
- bike para trilha até 300
- luvas baratas em stock
- roupa para treino
- presente para criança de 8 anos
- compare duas opções

📞 **Contato Direto:**
• WhatsApp: ${contactInfo.whatsapp.display}
• E-mail: ${contactInfo.email.address}
• Telefone: ${contactInfo.phone.number}`,
          timestamp: new Date(),
        },
      ]);
    }
  }, [isOpen, messages.length]);

  // Auto-scroll para última mensagem
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus no input quando abre
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const openChatbot = () => {
      setIsOpen(true);
    };

    window.addEventListener("velotech:open-chatbot", openChatbot);

    return () => {
      window.removeEventListener("velotech:open-chatbot", openChatbot);
    };
  }, []);

  const sendMessage = async (overrideMessage?: string) => {
    const messageText = (overrideMessage ?? inputValue).trim();
    if (!messageText || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: messageText,
      timestamp: new Date(),
    };

    const recentUserMessages = [
      ...messages.filter((message) => message.role === "user").map((message) => message.content),
      userMessage.content,
    ].slice(-5);

    setMessages((prev) => [...prev, userMessage]);
    await saveLocalChatMessage(localConversationId, userMessage);
    setInputValue("");
    setIsLoading(true);

    try {
      if (!shouldUseRemoteApi()) {
        throw new Error("modo-local");
      }
      const response = await fetch(`${API_URL}/chatbot`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage.content,
          conversationId: remoteConversationId,
          sessionId,
        }),
      });

      if (!response.ok) {
        throw new Error("Backend indisponivel para o assistente virtual");
      }

      const data = (await response.json()) as {
        conversationId: string;
        message: string;
        products: ProductSuggestion[];
      };

      if (data.conversationId && data.conversationId !== remoteConversationId) {
        setRemoteConversationId(data.conversationId);
      }

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.message,
        timestamp: new Date(),
      };

      const productSuggestions = (data.products || []).map((product) => ({
        ...product,
        path: `/products/${product.product_id}`,
      }));

      if (productSuggestions.length > 0) {
        setSuggestionsByMessage((prev) => ({
          ...prev,
          [assistantMessage.id]: productSuggestions,
        }));
      }

      setMessages((prev) => [...prev, assistantMessage]);
      await saveLocalChatMessage(localConversationId, assistantMessage);
    } catch {
      const localRag = askLocalRag(userMessage.content, {
        recentUserMessages,
      });

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: localRag.message,
        timestamp: new Date(),
      };

      if (localRag.products.length > 0) {
        setSuggestionsByMessage((prev) => ({
          ...prev,
          [assistantMessage.id]: localRag.products.map((product) => ({
            product_id: product.id,
            product_name: product.name,
            product_price: product.price,
            product_category: product.category,
            path: product.path,
          })),
        }));
      }

      setMessages((prev) => [...prev, assistantMessage]);
      await saveLocalChatMessage(localConversationId, assistantMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const sendSuggestedMessage = (message: string) => {
    if (isLoading) return;
    void sendMessage(message);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Botão flutuante do chatbot */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group",
          isOpen && "scale-0 opacity-0"
        )}
        aria-label="Abrir conversa"
      >
        <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
      </button>

      {/* Janela do chat */}
      <div
        className={cn(
          "fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-3rem)] bg-background border border-border rounded-2xl shadow-2xl transition-all duration-300 overflow-hidden",
          isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0 pointer-events-none"
        )}
        style={{ height: "min(600px, calc(100vh - 6rem))" }}
      >
        {/* Header */}
        <div className="bg-primary text-primary-foreground p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
            <Bike className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="font-display font-semibold">VeloTech Assistente</h3>
            <p className="text-xs opacity-80">Sempre pronto para ajudar</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-primary-foreground hover:bg-primary-foreground/20"
            onClick={() => setIsOpen(false)}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Mensagens */}
        <ScrollArea className="flex-1 p-4" style={{ height: "calc(100% - 140px)" }} ref={scrollRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-muted text-foreground rounded-bl-md"
                  )}
                >
                  <p className="whitespace-pre-wrap">{formatMarkdownLinks(message.content)}</p>
                  {message.role === "assistant" && suggestionsByMessage[message.id]?.length ? (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {suggestionsByMessage[message.id].map((suggestion) => (
                        <Link
                          key={`${message.id}-${suggestion.product_id}`}
                          to={suggestion.path || `/products/${suggestion.product_id}`}
                          className="rounded-md bg-primary/20 px-2 py-1 text-[11px] font-medium hover:bg-primary/30"
                        >
                          {suggestion.product_name}
                        </Link>
                      ))}
                    </div>
                  ) : null}
                  <p
                    className={cn(
                      "text-[10px] mt-1",
                      message.role === "user" ? "text-primary-foreground/60" : "text-muted-foreground"
                    )}
                  >
                    {message.timestamp.toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    <span className="text-sm text-muted-foreground">Digitando...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-background border-t border-border">
          {messages.length <= 1 && (
            <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
              {[
                "bike para trilha até 300",
                "luvas baratas em stock",
                "roupa para treino",
                "presente para criança",
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => sendSuggestedMessage(suggestion)}
                  className="shrink-0 rounded-full border border-border px-3 py-1 text-xs text-muted-foreground hover:border-primary hover:text-foreground"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Digite sua mensagem..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              onClick={() => sendMessage()}
              disabled={!inputValue.trim() || isLoading}
              size="icon"
              className="shrink-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatbotWidget;
