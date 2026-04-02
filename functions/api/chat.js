const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...CORS_HEADERS
    }
  });
}

function toGeminiContents(chatHistory) {
  return chatHistory
    .filter((item) => item && typeof item.text === "string" && item.text.trim())
    .map((item) => ({
      role: item.role === "tutor" ? "model" : "user",
      parts: [{ text: item.text }]
    }));
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS
  });
}

export async function onRequestPost(context) {
  const { env, request } = context;
  const model = "gemini-3-flash-preview";

  if (!env.GEMINI_API_KEY) {
    return jsonResponse({ error: "Missing server API configuration." }, 500);
  }

  let payload;
  try {
    payload = await request.json();
  } catch (_error) {
    return jsonResponse({ error: "Invalid JSON body." }, 400);
  }

  const { chatHistory, systemPrompt } = payload || {};

  if (!Array.isArray(chatHistory) || typeof systemPrompt !== "string" || !systemPrompt.trim()) {
    return jsonResponse({ error: "Request must include chatHistory[] and systemPrompt." }, 400);
  }

  const geminiContents = toGeminiContents(chatHistory);
  if (!geminiContents.length) {
    return jsonResponse({ error: "chatHistory must contain at least one message." }, 400);
  }

  try {
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          systemInstruction: {
            role: "system",
            parts: [{ text: systemPrompt }]
          },
          contents: geminiContents,
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 700
          }
        })
      }
    );

    const rawUpstream = await geminiResponse.text();
    let geminiData = null;
    try {
      geminiData = rawUpstream ? JSON.parse(rawUpstream) : null;
    } catch (_error) {
      geminiData = null;
    }

    if (!geminiResponse.ok) {
      const upstreamMessage = geminiData?.error?.message;
      const detailsText =
        typeof upstreamMessage === "string" && upstreamMessage.trim()
          ? upstreamMessage
          : rawUpstream || "Unknown upstream error";

      return jsonResponse(
        {
          error: "Gemini API request failed.",
          details: `HTTP ${geminiResponse.status}: ${detailsText} (model: ${model})`
        },
        geminiResponse.status
      );
    }

    const reply = geminiData?.candidates?.[0]?.content?.parts
      ?.map((part) => part.text || "")
      .join("")
      .trim();

    if (!reply) {
      return jsonResponse({ error: "No response text returned by Gemini." }, 502);
    }

    return jsonResponse({ reply });
  } catch (error) {
    return jsonResponse(
      {
        error: "Server error while contacting Gemini.",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      500
    );
  }
}
