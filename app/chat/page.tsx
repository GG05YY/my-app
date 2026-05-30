"use client";

import { useCallback, useRef, useState } from "react";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

const FAKE_REPLIES = [
  "That's a great question! In a real app, this would come from an AI API.",
  "I understand. Let me think about that for a moment…",
  "Thanks for sharing! Here's a helpful perspective on what you mentioned.",
  "Interesting point. I'd suggest breaking it down into smaller steps.",
  "Got it! Feel free to ask anything else — I'm here to help.",
];

function pickFakeReply(): string {
  return FAKE_REPLIES[Math.floor(Math.random() * FAKE_REPLIES.length)];
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hi! I'm your AI assistant. Send a message to get started.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(1);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || isTyping) return;

    const userId = `msg-${nextId.current++}`;
    setMessages((prev) => [
      ...prev,
      { id: userId, role: "user", content: trimmed },
    ]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${nextId.current++}`,
          role: "assistant",
          content: pickFakeReply(),
        },
      ]);
      setIsTyping(false);
      requestAnimationFrame(scrollToBottom);
    }, 600);

    requestAnimationFrame(scrollToBottom);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex min-h-dvh flex-col bg-[#0a0a0b] text-zinc-100">
      {/* Header */}
      <header className="shrink-0 border-b border-white/10 bg-[#111113]/80 px-4 py-3 backdrop-blur-md sm:px-6">
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 text-sm font-semibold shadow-lg shadow-violet-500/20">
            AI
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-tight sm:text-base">
              AI Chat
            </h1>
            <p className="text-xs text-zinc-500">Always here to help</p>
          </div>
        </div>
      </header>

      {/* Messages */}
      <main className="flex flex-1 flex-col overflow-hidden">
        <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-3 py-4 sm:px-6 sm:py-6">
          <div className="flex flex-1 flex-col gap-3 overflow-y-auto overscroll-contain pr-1 sm:gap-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed sm:max-w-[75%] sm:text-[15px] ${
                    msg.role === "user"
                      ? "rounded-br-md bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                      : "rounded-bl-md border border-white/8 bg-zinc-800/90 text-zinc-100"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-white/8 bg-zinc-800/90 px-4 py-3">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-zinc-500 [animation-delay:0ms]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-zinc-500 [animation-delay:150ms]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-zinc-500 [animation-delay:300ms]" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>
      </main>

      {/* Input */}
      <footer className="shrink-0 border-t border-white/10 bg-[#111113]/90 px-3 py-3 backdrop-blur-md sm:px-6 sm:py-4">
        <div className="mx-auto flex max-w-3xl items-end gap-2 sm:gap-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message…"
            rows={1}
            disabled={isTyping}
            className="max-h-32 min-h-[44px] flex-1 resize-none rounded-xl border border-white/10 bg-zinc-900/80 px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none transition focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50 sm:min-h-[48px] sm:text-[15px]"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white transition hover:bg-indigo-500 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 sm:h-12 sm:w-12"
            aria-label="Send message"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 12 12 6l6 6M12 18V6"
              />
            </svg>
          </button>
        </div>
        <p className="mx-auto mt-2 hidden max-w-3xl text-center text-[11px] text-zinc-600 sm:block">
          Press Enter to send · Shift+Enter for new line
        </p>
      </footer>
    </div>
  );
}
