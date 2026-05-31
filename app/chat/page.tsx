"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MarkdownMessage } from "./markdown-message";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type Chat = {
  id: string;
  title: string;
  messages: Message[];
};

/** Persisted shape in localStorage. */
type StoredChatState = {
  chats: Chat[];
  currentChatId: string;
};

/** API payload shape: role + content only (no UI id). */
type ChatHistoryMessage = Pick<Message, "role" | "content">;

const STORAGE_KEY = "gg-chat-messages";

const DEFAULT_MESSAGES: Message[] = [
  {
    id: "welcome",
    role: "assistant",
    content: "Hi! I'm your AI assistant. Send a message to get started.",
  },
];

function isValidMessage(value: unknown): value is Message {
  if (!value || typeof value !== "object") return false;
  const { id, role, content } = value as Message;
  return (
    typeof id === "string" &&
    (role === "user" || role === "assistant") &&
    typeof content === "string"
  );
}

function isValidChat(value: unknown): value is Chat {
  if (!value || typeof value !== "object") return false;
  const { id, title, messages } = value as Chat;
  return (
    typeof id === "string" &&
    typeof title === "string" &&
    Array.isArray(messages) &&
    messages.every(isValidMessage)
  );
}

function isValidStoredState(value: unknown): value is StoredChatState {
  if (!value || typeof value !== "object") return false;
  const { chats, currentChatId } = value as StoredChatState;
  return (
    Array.isArray(chats) &&
    chats.length > 0 &&
    chats.every(isValidChat) &&
    typeof currentChatId === "string" &&
    chats.some((c) => c.id === currentChatId)
  );
}

function createNewChat(): Chat {
  return {
    id: `chat-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    title: "New Chat",
    messages: [...DEFAULT_MESSAGES],
  };
}

function createInitialState(): StoredChatState {
  const chat = createNewChat();
  return { chats: [chat], currentChatId: chat.id };
}

/** Title from first user message, or fallback. */
function deriveTitleFromMessages(messages: Message[]): string {
  const firstUser = messages.find((m) => m.role === "user");
  if (!firstUser) return "New Chat";
  const text = firstUser.content.trim();
  if (text.length <= 32) return text;
  return `${text.slice(0, 32)}…`;
}

function loadFromStorage(): StoredChatState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);

    if (isValidStoredState(parsed)) {
      return parsed;
    }

    // Legacy: single messages array → one chat session.
    if (Array.isArray(parsed) && parsed.length > 0 && parsed.every(isValidMessage)) {
      const chat: Chat = {
        id: `chat-${Date.now()}`,
        title: deriveTitleFromMessages(parsed),
        messages: parsed,
      };
      return { chats: [chat], currentChatId: chat.id };
    }

    return null;
  } catch {
    return null;
  }
}

function syncNextIdFromChats(chats: Chat[], nextId: React.MutableRefObject<number>) {
  let max = 0;
  for (const chat of chats) {
    for (const msg of chat.messages) {
      const match = /^msg-(\d+)$/.exec(msg.id);
      if (match) max = Math.max(max, Number(match[1]));
    }
  }
  nextId.current = max + 1;
}

function toApiHistory(messages: Message[]): ChatHistoryMessage[] {
  return messages
    .filter((msg) => msg.id !== "welcome")
    .map(({ role, content }) => ({
      role,
      content,
    }));
}

export default function ChatPage() {
  const initial = createInitialState();
  const [chats, setChats] = useState<Chat[]>(initial.chats);
  const [currentChatId, setCurrentChatId] = useState(initial.currentChatId);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(1);
  const abortRef = useRef<AbortController | null>(null);

  const currentChat = useMemo(
    () => chats.find((c) => c.id === currentChatId) ?? chats[0],
    [chats, currentChatId],
  );

  const messages = currentChat?.messages ?? DEFAULT_MESSAGES;

  useEffect(() => {
    const stored = loadFromStorage();
    if (stored) {
      setChats(stored.chats);
      setCurrentChatId(stored.currentChatId);
      syncNextIdFromChats(stored.chats, nextId);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ chats, currentChatId } satisfies StoredChatState),
      );
    } catch {
      // Quota / private mode — ignore.
    }
  }, [chats, currentChatId, hydrated]);

  const updateCurrentChat = useCallback(
    (updater: (chat: Chat) => Chat) => {
      setChats((prev) =>
        prev.map((c) => (c.id === currentChatId ? updater(c) : c)),
      );
    },
    [currentChatId],
  );

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Keep the view scrolled as tokens stream in.
  useEffect(() => {
    if (streamingContent) {
      scrollToBottom();
    }
  }, [streamingContent, scrollToBottom]);

  const handleNewChat = useCallback(() => {
    abortRef.current?.abort();
    if (isTyping) return;
    const chat = createNewChat();
    setChats((prev) => [chat, ...prev]);
    setCurrentChatId(chat.id);
    setInput("");
  }, [isTyping]);

  const handleSelectChat = useCallback((chatId: string) => {
    abortRef.current?.abort();
    if (isTyping) return;
    setCurrentChatId(chatId);
    setInput("");
  }, [isTyping]);

  const handleStop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isTyping || !currentChat) return;

    // --- Append user message ---
    const userId = `msg-${nextId.current++}`;
    const userMessage: Message = {
      id: userId,
      role: "user",
      content: trimmed,
    };

    const nextMessages = [...messages, userMessage];
    const historyForApi = toApiHistory(nextMessages);

    updateCurrentChat((chat) => ({
      ...chat,
      messages: nextMessages,
      title:
        chat.title === "New Chat"
          ? deriveTitleFromMessages(nextMessages)
          : chat.title,
    }));
    setInput("");
    setIsTyping(true);
    requestAnimationFrame(scrollToBottom);

    // --- Streaming fetch ---
    const controller = new AbortController();
    abortRef.current = controller;

    // Local variable is the source of truth for accumulated content.
    // streamingContent state is only for rendering, never read back.
    let fullReply = "";

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: historyForApi }),
        signal: controller.signal,
      });

      // Non-200: read the JSON error body.
      if (!res.ok) {
        let errorText = `Request failed (${res.status}).`;
        try {
          const errData: { error?: string } = await res.json();
          if (errData.error) errorText = errData.error;
        } catch {
          // Body wasn't JSON — keep the status text.
        }
        fullReply = `Sorry, something went wrong: ${errorText}`;
        setStreamingContent(fullReply);
        return;
      }

      if (!res.body) {
        fullReply = "Sorry, no response body received.";
        setStreamingContent(fullReply);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });

        if (chunk.includes("__ERROR__:")) {
          const errMsg = chunk.replace("__ERROR__:", "").trim();
          if (fullReply) {
            fullReply += `\n\n*[Error: ${errMsg}]*`;
          } else {
            fullReply = `Sorry, something went wrong: ${errMsg}`;
          }
          setStreamingContent(fullReply);
          break;
        }

        fullReply += chunk;
        setStreamingContent(fullReply);
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        // User pressed Stop. fullReply holds the partial content — leave it.
      } else {
        const message =
          err instanceof Error ? err.message : "Unknown error";
        if (fullReply) {
          fullReply += `\n\n*[Error: ${message}]*`;
        } else {
          fullReply = `Sorry, I couldn't reach the server. Please check your connection and try again.`;
        }
        setStreamingContent(fullReply);
      }
    } finally {
      // Write the accumulated reply as a permanent message.
      if (fullReply) {
        updateCurrentChat((chat) => ({
          ...chat,
          messages: [
            ...chat.messages,
            {
              id: `msg-${nextId.current++}`,
              role: "assistant",
              content: fullReply,
            },
          ],
        }));
      }
      setStreamingContent("");
      setIsTyping(false);
      abortRef.current = null;
      requestAnimationFrame(scrollToBottom);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  /** Clear only the active session (same as before, scoped to current chat). */
  const handleClearChat = useCallback(() => {
    abortRef.current?.abort();
    if (isTyping) return;

    setChats((prev) => {
      const updated = prev.map((c) =>
        c.id === currentChatId
          ? { ...c, title: "New Chat", messages: [...DEFAULT_MESSAGES] }
          : c,
      );
      syncNextIdFromChats(updated, nextId);
      return updated;
    });
    setInput("");
  }, [isTyping, currentChatId]);

  return (
    <div className="flex min-h-dvh bg-[#0a0a0b] text-zinc-100">
      {/* Sidebar */}
      <aside className="flex w-56 shrink-0 flex-col border-r border-white/10 bg-[#111113] sm:w-64">
        <div className="border-b border-white/10 p-3">
          <button
            type="button"
            onClick={handleNewChat}
            disabled={isTyping}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 bg-zinc-800/60 px-3 py-2 text-sm text-zinc-200 transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <span className="text-lg leading-none">+</span>
            New Chat
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-2">
          <ul className="space-y-1">
            {chats.map((chat) => (
              <li key={chat.id}>
                <button
                  type="button"
                  onClick={() => handleSelectChat(chat.id)}
                  disabled={isTyping}
                  className={`w-full truncate rounded-lg px-3 py-2 text-left text-sm transition disabled:cursor-not-allowed disabled:opacity-40 ${
                    chat.id === currentChatId
                      ? "bg-zinc-800 text-zinc-100"
                      : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
                  }`}
                  title={chat.title}
                >
                  {chat.title}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main chat column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="shrink-0 border-b border-white/10 bg-[#111113]/80 px-4 py-3 backdrop-blur-md sm:px-6">
          <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 text-sm font-semibold shadow-lg shadow-violet-500/20">
                AI
              </div>
              <div className="min-w-0">
                <h1 className="truncate text-sm font-semibold tracking-tight sm:text-base">
                  {currentChat?.title ?? "GG AI Assistant"}
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

              {/* Streaming message bubble — progressive token rendering */}
              {streamingContent && (
                <div className="flex justify-start">
                  <div className="max-w-[85%] rounded-2xl rounded-bl-md border border-white/8 bg-zinc-800/90 px-4 py-2.5 text-sm leading-relaxed sm:max-w-[75%] sm:text-[15px]">
                    <MarkdownMessage content={streamingContent} />
                    <span className="ml-0.5 inline-block h-4 w-1.5 animate-pulse rounded-sm bg-zinc-300 align-middle" />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>
        </main>

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
            {isTyping ? (
              <button
                type="button"
                onClick={handleStop}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-zinc-600 text-white transition hover:bg-zinc-500 active:scale-95 sm:h-12 sm:w-12"
                aria-label="Stop generation"
              >
                <svg
                  className="h-4 w-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <rect x="6" y="6" width="12" height="12" rx="1.5" />
                </svg>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSend}
                disabled={!input.trim()}
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
            )}
          </div>
          <p className="mx-auto mt-2 hidden max-w-3xl text-center text-[11px] text-zinc-600 sm:block">
            Press Enter to send · Shift+Enter for new line
          </p>
        </footer>
      </div>
    </div>
  );
}
