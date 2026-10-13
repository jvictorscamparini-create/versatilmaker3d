import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, Sparkles, X, Send, Bot, User, Minimize2, Loader2, Zap } from "lucide-react";

interface Message {
  sender: "user" | "ai";
  text: string;
  time: string;
}

export const AIChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "ai",
      text: "Olá, Maker! Sou seu assistente de IA especialista em impressão 3D e gestão de oficinas. Como posso ajudar nas suas vendas, custos ou projetos hoje?",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [isOpen, messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userText = inputMessage.trim();
    setInputMessage("");

    const userMsg: Message = {
      sender: "user",
      text: userText,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chatbot/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userText,
          history: messages.slice(-6).map((m) => ({ role: m.sender === "user" ? "user" : "model", text: m.text })),
        }),
      });

      const data = await response.json();
      const reply = data.reply || "Desculpe, tive um pequeno problema de conexão. Lembre-se de manter sua margem de lucro acima de 35% e usar filamento PLA Premium para melhores resultados!";

      const aiMsg: Message = {
        sender: "ai",
        text: reply,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      const fallbackReply = "Sistema operando em modo local. Para precificação 3D, lembre-se: (Peso em gramas * Custo/g) + Energia (R$ 0,15/h) + Margem desejada (40%).";
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: fallbackReply,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Chat Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-3 text-xs font-black text-white shadow-2xl shadow-indigo-500/40 hover:scale-105 active:scale-95 transition cursor-pointer border border-indigo-400/30"
          title="Assistente IA Maker"
        >
          <div className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500"></span>
          </div>
          <Sparkles className="h-4 w-4 text-indigo-200" />
          <span>Chat IA Maker</span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-80 sm:w-96 flex flex-col rounded-2xl border border-indigo-500/30 bg-[#0b101d] shadow-2xl overflow-hidden backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 bg-[#0e1426] px-4 py-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
                <Bot className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>IA Maker Assistant</span>
                  <span className="rounded bg-indigo-500/20 px-1 py-0.5 text-[9px] font-semibold text-indigo-300">Gemini</span>
                </h3>
                <p className="text-[10px] text-emerald-400 font-medium">Online • Pronto para ajudar</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition cursor-pointer"
            >
              <Minimize2 className="h-4 w-4" />
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 max-h-96 min-h-80 overflow-y-auto p-4 flex flex-col gap-3 text-xs bg-[#080c18]/80">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-2.5 ${m.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {m.sender === "ai" && (
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-indigo-600/30 text-indigo-400 border border-indigo-500/30">
                    <Bot className="h-3 w-3" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-xs shadow-sm leading-relaxed ${
                    m.sender === "user"
                      ? "bg-indigo-600 text-white rounded-tr-xs"
                      : "bg-[#131b2e] border border-slate-800 text-slate-200 rounded-tl-xs"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.text}</p>
                  <span
                    className={`mt-1 block text-[9px] ${
                      m.sender === "user" ? "text-indigo-200 text-right" : "text-slate-400"
                    }`}
                  >
                    {m.time}
                  </span>
                </div>
                {m.sender === "user" && (
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-purple-600/30 text-purple-400 border border-purple-500/30">
                    <User className="h-3 w-3" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex items-center gap-2 text-slate-400 text-xs py-2">
                <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />
                <span>IA pensando na melhor estratégia...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form onSubmit={handleSendMessage} className="border-t border-slate-800 bg-[#0e1426] p-3 flex items-center gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Digite sua dúvida sobre impressão 3D ou custos..."
              className="flex-1 rounded-xl border border-slate-800 bg-[#090e1a] px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={isLoading || !inputMessage.trim()}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50 transition cursor-pointer shadow-md shadow-indigo-600/30"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
