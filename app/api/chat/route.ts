import { NextRequest, NextResponse } from "next/server";

/** DeepSeek chat completions endpoint (OpenAI-compatible). */
const DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions";

/** Model id requested for this route. */
const DEEPSEEK_MODEL = "deepseek-chat";

/** Roles supported in multi-turn chat (matches DeepSeek / OpenAI format). */
type ChatRole = "user" | "assistant";

/** One turn in the conversation sent from the client. */
type ChatHistoryMessage = {
  role: ChatRole;
  content: string;
};

/** Shape of the JSON body the client sends on POST. */
type ChatRequestBody = {
  /** Full thread: prior user/assistant messages plus the latest user message. */
  messages: ChatHistoryMessage[];
};

/** Shape of the JSON body this route returns on success. */
type ChatResponseBody = {
  reply: string;
};

/** Minimal typing for the DeepSeek / OpenAI-style completion response. */
type DeepSeekCompletionResponse = {
  choices?: Array<{
    message?: {
      content?: string | null;
    };
  }>;
  error?: {
    message?: string;
  };
};

/** Returns true when value is a non-empty user or assistant message. */
function isValidHistoryMessage(value: unknown): value is ChatHistoryMessage {
  if (!value || typeof value !== "object") return false;
  const { role, content } = value as ChatHistoryMessage;
  return (
    (role === "user" || role === "assistant") &&
    typeof content === "string" &&
    content.trim().length > 0
  );
}

/**
 * POST /api/chat
 *
 * Accepts conversation history, calls DeepSeek with the full thread, and returns
 * the assistant reply for the latest turn.
 */
export async function POST(request: NextRequest) {
  // --- API key (server-only env var, never exposed to the browser) ---
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "DEEPSEEK_API_KEY is not configured on the server." },
      { status: 500 },
    );
  }

  // --- Parse and validate request body ---
  let body: ChatRequestBody;
  try {
    body = (await request.json()) as ChatRequestBody;
  } catch {
    return NextResponse.json(
      {
        error:
          'Invalid JSON body. Expected { "messages": [{ "role": "user"|"assistant", "content": "..." }] }.',
      },
      { status: 400 },
    );
  }

  // --- Validate multi-turn history ---
  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return NextResponse.json(
      { error: "Missing or empty \"messages\" array." },
      { status: 400 },
    );
  }

  if (!body.messages.every(isValidHistoryMessage)) {
    return NextResponse.json(
      {
        error:
          'Each message must have role "user" or "assistant" and non-empty content.',
      },
      { status: 400 },
    );
  }

  // DeepSeek expects the last message in the array to be from the user.
  const lastMessage = body.messages[body.messages.length - 1];
  if (lastMessage.role !== "user") {
    return NextResponse.json(
      { error: "The last message in history must have role \"user\"." },
      { status: 400 },
    );
  }

  // Trim content before forwarding to the model.
  const messages = body.messages.map((msg) => ({
    role: msg.role,
    content: msg.content.trim(),
  }));

  // --- Call DeepSeek chat completions API ---
  let deepseekResponse: Response;
  try {
    deepseekResponse = await fetch(DEEPSEEK_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: DEEPSEEK_MODEL,
        messages: [
          {
            role: "system",
            content: `
你是 GG AI Assistant。

你是一名专业、友好、耐心的 AI 编程助手。

你知道当前用户叫郜轶元。

除非用户主动询问身份信息，
否则不要主动提及用户姓名。

回答要求：
- 使用 Markdown
- 结构清晰
- 优先分点
- 尽量简洁
- 帮助用户学习编程和 AI 开发
      `,
          },
          ...messages,
        ],
        stream: false,
      }),
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to reach DeepSeek API." },
      { status: 502 },
    );
  }

  // --- Parse DeepSeek response ---
  let data: DeepSeekCompletionResponse;
  try {
    data = (await deepseekResponse.json()) as DeepSeekCompletionResponse;
  } catch {
    return NextResponse.json(
      { error: "Invalid response from DeepSeek API." },
      { status: 502 },
    );
  }

  if (!deepseekResponse.ok) {
    return NextResponse.json(
      {
        error:
          data.error?.message ??
          `DeepSeek API error (${deepseekResponse.status}).`,
      },
      { status: deepseekResponse.status },
    );
  }

  // --- Extract assistant text from the first choice ---
  const reply = data.choices?.[0]?.message?.content?.trim();
  if (!reply) {
    return NextResponse.json(
      { error: "No reply content returned from DeepSeek." },
      { status: 502 },
    );
  }

  // --- Success: return { reply } as required ---
  const responseBody: ChatResponseBody = { reply };
  return NextResponse.json(responseBody);
}
