"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MarkdownMessage } from "./markdown-message";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

/** API payload shape: role + content only (no UI id). */
type ChatHistoryMessage = Pick<Message, "role" | "content">;

/** localStorage key for persisted chat history. */
const STORAGE_KEY = "gg-chat-messages";

/** Default thread shown when nothing is saved yet. */
const DEFAULT_MESSAGES: Message[] = [
  {
    id: "welcome",
    role: "assistant",
    content: "Hi! I'm your AI assistant. Send a message to get started.",
  },
];

/** True when a value looks like a valid Message (guards against corrupt storage). */
function isValidMessage(value: unknown): value is Message {
  if (!value || typeof value !== "object") return false;
  const { id, role, content } = value as Message;
  return (
    typeof id === "string" &&
    (role === "user" || role === "assistant") &&
    typeof content === "string"
  );
}

/** Parse JSON from localStorage into messages, or null if invalid. */
function loadMessagesFromStorage(): Message[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return null;
    if (!parsed.every(isValidMessage)) return null;
    return parsed;
  } catch {
    return null;
  }
}

/** Keep nextId in sync after restore so new ids do not collide with saved ones. */
function syncNextIdFromMessages(messages: Message[], nextId: React.MutableRefObject<number>) {
  let max = 0;
  for (const msg of messages) {
    const match = /^msg-(\d+)$/.exec(msg.id);
    if (match) max = Math.max(max, Number(match[1]));
  }
  nextId.current = max + 1;
}

/** Convert in-memory messages into the format POST /api/chat expects. */
function toApiHistory(messages: Message[]): ChatHistoryMessage[] {
  return messages
    .filter((msg) => msg.id !== "welcome")
    .map(({ role, content }) => ({
      role,
      content,
    }));
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>(DEFAULT_MESSAGES);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  // After first client render, we load from localStorage (avoids SSR mismatch).
  const [hydrated, setHydrated] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(1);

  // --- Load: run once on mount (browser only) ---
  useEffect(() => {
    const stored = loadMessagesFromStorage();
    if (stored) {
      setMessages(stored);
      syncNextIdFromMessages(stored, nextId);
    }
    setHydrated(true);
  }, []);

  // --- Save: whenever messages change, after hydration ---
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      // Quota exceeded or private mode — ignore so chat still works.
    }
  }, [messages, hydrated]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isTyping) return;

    const userId = `msg-${nextId.current++}`;
    const userMessage: Message = {
      id: userId,
      role: "user",
      content: trimmed,
    };

    // Build full thread from current state + this send (state updates async).
    const historyForApi = toApiHistory([...messages, userMessage]);

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);
    requestAnimationFrame(scrollToBottom);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Multi-turn: send welcome, prior turns, and the new user message.
        body: JSON.stringify({ messages: historyForApi }),
      });

      let data: { reply?: string; error?: string } = {};
      try {
        data = await res.json();
      } catch {
        // Response was not JSON — handled below.
      }

      if (!res.ok || !data.reply) {
        const errorText =
          data.error ??
          (res.ok
            ? "No reply received from the server."
            : `Request failed (${res.status}).`);
        setMessages((prev) => [
          ...prev,
          {
            id: `msg-${nextId.current++}`,
            role: "assistant",
            content: `Sorry, something went wrong: ${errorText}`,
          },
        ]);
      } else {
        const reply = data.reply;
        setMessages((prev) => [
          ...prev,
          {
            id: `msg-${nextId.current++}`,
            role: "assistant",
            content: reply,
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${nextId.current++}`,
          role: "assistant",
          content:
            "Sorry, I couldn't reach the server. Please check your connection and try again.",
        },
      ]);
    } finally {
      setIsTyping(false);
      requestAnimationFrame(scrollToBottom);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  /** Reset UI state and wipe persisted history (header "Clear Chat"). */
  const handleClearChat = useCallback(() => {
    if (isTyping) return;

    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore storage errors; in-memory reset still runs.
    }

    setMessages([...DEFAULT_MESSAGES]);
    nextId.current = 1;
    setInput("");
  }, [isTyping]);

  return (
    <div className="flex min-h-dvh flex-col bg-[#0a0a0b] text-zinc-100">
      {/* Header */}
      <header className="shrink-0 border-b border-white/10 bg-[#111113]/80 px-4 py-3 backdrop-blur-md sm:px-6">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 text-sm font-semibold shadow-lg shadow-violet-500/20">
              AI
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-semibold tracking-tight sm:text-base">
                GG AI Assistant
              </h1>
              <p className="text-xs text-zinc-500">Always here to help</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClearChat}
            disabled={isTyping}
            aria-label="Clear chat"
            className="flex shrink-0 items-center gap-1.5 rounded-lg border border-white/10 px-2.5 py-1.5 text-xs text-zinc-400 transition hover:border-white/15 hover:bg-zinc-800/60 hover:text-zinc-200 disabled:cursor-not-allowed disabled:opacity-40 sm:gap-2 sm:px-3 sm:text-sm"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
              />
            </svg>
            Clear Chat
          </button>
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
                  {msg.role === "assistant" ? (
                    <MarkdownMessage content={msg.content} />
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2.5 rounded-2xl rounded-bl-md border border-white/8 bg-zinc-800/90 px-4 py-2.5 text-sm text-zinc-400 sm:text-[15px]">
                  <span>AI is typing...</span>
                  <span className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-500 [animation-delay:0ms]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-500 [animation-delay:150ms]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-500 [animation-delay:300ms]" />
                  </span>
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
