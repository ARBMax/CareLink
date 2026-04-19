import React, { useState, useRef, useEffect, memo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MessageSquare, Send, X, Minimize2, Maximize2, Bot, User, Loader2 } from "lucide-react";
import { chatWithAnalyst } from "../services/geminiService";
import { AnalysisReport } from "../types";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatBotProps {
  report: AnalysisReport | null;
}

export const ChatBot = memo(function ChatBot({ report }: ChatBotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Ozone Co. online. How can I assist with your data analysis today?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !report || isLoading) return;

    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setIsLoading(true);

    try {
      const response = await chatWithAnalyst(report, userMsg, messages);
      setMessages(prev => [...prev, { role: "assistant", content: response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: "assistant", content: "Error: Failed to process query. Please check your connection." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[60] flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="chat-window"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: 0,
              height: isMinimized ? "60px" : "500px"
            }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="mb-4 w-[350px] overflow-hidden rounded-xl border border-[#141414]/20 bg-white dark:bg-[#141414] dark:border-white/10 shadow-2xl backdrop-blur-xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#141414]/10 bg-[#141414] dark:bg-white p-4 text-[#E4E3E0] dark:text-[#141414]">
              <div className="flex items-center gap-2">
                <Bot className="h-4 w-4 neon-glow-cyan" />
                <span className="text-xs font-mono uppercase tracking-widest neon-glow-cyan">Analyst AI</span>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="rounded p-1 hover:bg-white/10"
                >
                  {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="rounded p-1 hover:bg-white/10"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4" ref={scrollRef}>
                    {messages.map((msg, i) => (
                      <div 
                        key={`chat-msg-${i}`} 
                        className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                      >
                        <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-sm text-[10px] ${
                          msg.role === "assistant" ? "bg-[#141414] dark:bg-white text-white dark:text-[#141414]" : "bg-neon-cyan text-white"
                        }`}>
                          {msg.role === "assistant" ? <Bot className="h-3 w-3" /> : <User className="h-3 w-3" />}
                        </div>
                        <div className={`rounded-lg p-3 text-xs leading-relaxed ${
                          msg.role === "assistant" 
                            ? "bg-[#141414]/5 dark:bg-white/5 text-[#141414] dark:text-[#E4E3E0]" 
                            : "bg-neon-cyan/10 text-neon-cyan neon-glow-cyan"
                        }`}>
                          {msg.content}
                        </div>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex gap-3">
                        <div className="flex h-6 w-6 items-center justify-center rounded-sm bg-[#141414] text-white">
                          <Loader2 className="h-3 w-3 animate-spin" />
                        </div>
                        <div className="rounded-lg bg-[#141414]/5 p-3 text-[10px] font-mono opacity-50">
                          PROCESSING_QUERY...
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>

                {/* Input */}
                <div className="border-t border-[#141414]/10 p-4">
                  {!report ? (
                    <div className="text-center text-[10px] uppercase tracking-widest opacity-40 py-2">
                      Analyze data to enable chat
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
                        placeholder="Ask about the analysis..."
                        className="flex-1 bg-transparent text-xs outline-none placeholder:opacity-30"
                      />
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        onClick={handleSend}
                        disabled={isLoading || !input.trim()}
                        className="h-8 w-8"
                      >
                        <Send className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className={`flex h-14 w-14 items-center justify-center rounded-full shadow-2xl transition-colors ${
          isOpen ? "bg-white dark:bg-[#141414] text-[#141414] dark:text-white border border-[#141414]/10 dark:border-white/10" : "bg-[#141414] dark:bg-white text-white dark:text-[#141414] neon-border-cyan shadow-[0_0_15px_var(--color-neon-cyan)]"
        }`}
      >
        <MessageSquare className="h-6 w-6" />
      </motion.button>
    </div>
  );
});
