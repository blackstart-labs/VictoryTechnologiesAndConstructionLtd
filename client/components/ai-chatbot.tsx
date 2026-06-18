"use client";

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  RiRobotLine,
  RiCloseLine,
  RiSendPlane2Fill,
  RiChatSmile3Line,
} from "react-icons/ri";

interface Message {
  role: "user" | "assistant";
  text: string;
}

export function AiChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      text: "Hello! I am your VDCBD AI assistant. Ask me anything about our architectural designs, structural consultancy services, office branch locations, or academy training programs!",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [systemContext, setSystemContext] = useState(
    "Victory Design & Construction (VDCBD) is an engineering and architectural consultancy firm in Bangladesh."
  );
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Fetch AI context from CMS on mount — fall back to default if missing
  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) return;
    fetch(`${apiUrl}/cms/ai-chatbot-context`)
      .then((r) => r.json())
      .then((json) => {
        const content = json?.data?.content;
        if (content) setSystemContext(content);
      })
      .catch(() => {
        /* use default context */
      });
  }, []);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userText = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userText }]);
    setIsTyping(true);

    try {
      const promptText = `You are a helpful customer support chatbot for Victory Design & Construction (VDCBD), an architectural and structural engineering consultancy company. Use the following context to answer questions about the company, branches, pricing, and courses. Be professional, concise, and helpful. If you do not know the answer, politely ask them to call customer care at +88 01779481486.

Context:
${systemContext}

User Question: ${userText}`;

      const response = await axios.post("/api/chat", {
        prompt: promptText,
        message: userText,
        context: systemContext
      });
      const responseText =
        response.data?.text ||
        "I'm sorry, I'm having trouble processing that right now. Please reach out to our team at +88 01779481486.";

      setMessages((prev) => [...prev, { role: "assistant", text: responseText }]);
    } catch (error) {
      console.error("AI Chatbot Error:", error);
      // Secondary local fallback if the API endpoint itself is unreachable
      let fallbackMsg = "Victory Design & Construction (VDCBD) is a leading architectural design and structural consultancy firm in Bangladesh.\n\nFor direct assistance, please contact us at +88 01779481486 or email victorydesign72@gmail.com.";
      
      const normalizedQuery = userText.toLowerCase();
      if (normalizedQuery.includes("course") || normalizedQuery.includes("learn") || normalizedQuery.includes("training")) {
        fallbackMsg = "We offer professional courses in structural engineering, interior design, and site supervision. Check out our Training page or call +88 01779481486 for details.";
      } else if (normalizedQuery.includes("branch") || normalizedQuery.includes("office") || normalizedQuery.includes("location")) {
        fallbackMsg = "Our offices are located at:\n- Main Branch: Eastern Kamalapur Complex, 2nd Floor, Room No 206, Kamalapur, Dhaka.\n- Branch Office: Madhya Bazar, Chandina, Cumilla.";
      }
      
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: fallbackMsg,
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full flex items-center justify-center text-white bg-gradient-to-tr from-[#135c7c] to-[#39c2e3] shadow-lg hover:shadow-cyan-500/25 hover:scale-105 active:scale-95 transition-all duration-300 relative group animate-bounce"
          title="VDCBD AI Support"
        >
          <RiChatSmile3Line className="text-2xl" />
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full" />
        </button>
      )}

      {/* Expanded Chat Dialog */}
      {isOpen && (
        <div className="w-80 sm:w-96 h-[500px] rounded-3xl border border-border/80 bg-card shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="px-5 py-4 bg-gradient-to-r from-[#135c7c] to-[#39c2e3] text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                <RiRobotLine className="text-xl text-white" />
              </div>
              <div>
                <h4 className="font-bold text-xs sm:text-sm tracking-wide">Victory AI Support</h4>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-[10px] text-white/80">Online & Ready</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-white/15 rounded-lg transition-all text-white/90 hover:text-white"
            >
              <RiCloseLine className="text-xl" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 dark:bg-zinc-950/20">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-2 max-w-[85%] ${
                  m.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                }`}
              >
                {m.role === "assistant" && (
                  <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                    <RiRobotLine className="text-sm text-primary" />
                  </div>
                )}
                <div
                  className={`rounded-2xl px-3.5 py-2 text-xs leading-relaxed shadow-sm ${
                    m.role === "user"
                      ? "bg-primary text-primary-foreground rounded-tr-none"
                      : "bg-white dark:bg-zinc-900 border border-border text-foreground rounded-tl-none"
                  }`}
                  style={{ whiteSpace: "pre-line" }}
                >
                  {m.text}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-2 mr-auto max-w-[85%]">
                <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                  <RiRobotLine className="text-sm text-primary" />
                </div>
                <div className="bg-white dark:bg-zinc-900 border border-border rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-1.5 shadow-sm shrink-0">
                  <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Form Input Area */}
          <form onSubmit={handleSend} className="p-3 border-t border-border bg-card flex gap-2 items-center shrink-0">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
              className="flex-1 px-3.5 py-2 rounded-xl border border-border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
            >
              <RiSendPlane2Fill className="text-sm" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
