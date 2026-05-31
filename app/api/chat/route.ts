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

/** Minimal typing for the DeepSeek / OpenAI-style error response. */
type DeepSeekErrorResponse = {
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
 * Accepts conversation history, calls DeepSeek with streaming enabled,
 * and forwards the token stream to the client as text/plain chunked.
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

  const systemPrompt = `你是 GG AI Assistant。

你是一名专业、友好、耐心的 AI 编程助手。

你知道当前用户叫郜轶元。

除非用户主动询问身份信息，
否则不要主动提及用户姓名。

回答要求：
- 使用 Markdown
- 结构清晰
- 优先分点
- 尽量简洁
- 帮助用户学习编程和 AI 开发`;

  const deepseekRequestBody = JSON.stringify({
    model: DEEPSEEK_MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      ...messages,
    ],
    stream: true,
  });

  // AbortSignal that fires when the downstream client disconnects, so we can
  // cancel the upstream DeepSeek request and avoid wasting tokens.
  const upstreamAbort = new AbortController();

  let deepseekResponse: Response;
  try {
    deepseekResponse = await fetch(DEEPSEEK_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: deepseekRequestBody,
      signal: upstreamAbort.signal,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to reach DeepSeek API." },
      { status: 502 },
    );
  }

  // If DeepSeek returned a non-200, read the error body (JSON) and return it.
  if (!deepseekResponse.ok) {
    let errorMessage = `DeepSeek API error (${deepseekResponse.status}).`;
    try {
      const errData = (await deepseekResponse.json()) as DeepSeekErrorResponse;
      if (errData.error?.message) errorMessage = errData.error.message;
    } catch {
      // Body wasn't parseable JSON — stick with the status text.
    }
    return NextResponse.json({ error: errorMessage }, { status: deepseekResponse.status });
  }

  if (!deepseekResponse.body) {
    return NextResponse.json(
      { error: "No response body from DeepSeek." },
      { status: 502 },
    );
  }

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const stream = new ReadableStream({
    async start(controller) {
      const reader = deepseekResponse.body!.getReader();

      // Buffer for incomplete SSE events that span chunk boundaries.
      let buffer = "";

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          // SSE events are separated by \n\n. Split on that boundary to
          // ensure each event is complete — a single JSON data line that
          // was split across chunks will be reassembled in the buffer.
          const events = buffer.split("\n\n");
          // The last segment is either an incomplete event or empty;
          // keep it in the buffer for the next chunk.
          buffer = events.pop() ?? "";

          for (const event of events) {
            const lines = event.split("\n");
            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed || !trimmed.startsWith("data:")) continue;

              const payload = trimmed.slice(5).trim();

              if (payload === "[DONE]") {
                controller.close();
                return;
              }

              try {
                const parsed = JSON.parse(payload);

                if (parsed.error) {
                  const errMsg =
                    typeof parsed.error === "string"
                      ? parsed.error
                      : parsed.error?.message ?? "Unknown upstream error";
                  controller.enqueue(encoder.encode(`__ERROR__:${errMsg}`));
                  controller.close();
                  return;
                }

                const delta = parsed.choices?.[0]?.delta?.content;
                if (delta) {
                  controller.enqueue(encoder.encode(delta));
                }
              } catch {
                // Malformed JSON in one SSE line — skip it.
              }
            }
          }
        }

        controller.close();
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Stream read failure";
        controller.enqueue(encoder.encode(`__ERROR__:${message}`));
        controller.close();
      }
    },

    cancel() {
      upstreamAbort.abort();
      deepseekResponse.body?.cancel().catch(() => {});
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
    },
  });
}
