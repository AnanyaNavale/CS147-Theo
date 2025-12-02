const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

export type AiTask = { text: string; minutes: number };
export type ReflectionTurn = { from: "user" | "assistant"; text: string };

function parseTasksFromText(text: string): AiTask[] {
  const cleaned = text.replace(/```(\w+)?/g, "").trim();

  const tryParseArray = (candidate: string): AiTask[] | null => {
    const sanitized = candidate.replace(/,\s*([}\]])/g, "$1").trim();
    const attempts = [sanitized];

    if (sanitized.startsWith("[") && !sanitized.endsWith("]")) {
      const trimmed = sanitized.replace(/,\s*$/, "");
      attempts.push(`${trimmed}]`);
    }

    for (const attempt of attempts) {
      try {
        const parsed = JSON.parse(attempt);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch {
        // keep trying other candidates
      }
    }

    return null;
  };

  // Try direct parse if the whole content is JSON
  const direct = tryParseArray(cleaned);
  if (direct) return direct;

  // Extract the first array-looking section, even if it's truncated.
  const start = cleaned.indexOf("[");
  if (start >= 0) {
    const tail = cleaned.slice(start);
    const lastBracket = tail.lastIndexOf("]");
    const lastBrace = tail.lastIndexOf("}");

    const candidate =
      lastBracket >= 0
        ? tail.slice(0, lastBracket + 1)
        : lastBrace >= 0
        ? `${tail.slice(0, lastBrace + 1)}]`
        : tail;

    const parsed = tryParseArray(candidate);
    if (parsed) return parsed;
  }

  // Fallback: salvage any standalone objects we can parse.
  const salvaged: AiTask[] = [];
  for (const match of cleaned.matchAll(/\{[^{}]*\}/g)) {
    try {
      const parsed = JSON.parse(match[0]);
      if (parsed && typeof parsed === "object") {
        salvaged.push(parsed as AiTask);
      }
    } catch {
      // ignore bad fragments
    }
  }

  if (salvaged.length > 0) {
    console.warn("[Gemini][tasks] salvaged partial task list", {
      count: salvaged.length,
    });
    return salvaged;
  }

  console.warn("[Gemini][tasks] parse failed", {
    original: cleaned.slice(0, 400),
  });
  throw new Error("AI response did not include a task list.");
}

function digForTasks(node: unknown): AiTask[] | null {
  if (!node) return null;

  // If it's already an array of tasks, return it
  if (Array.isArray(node)) {
    const looksLikeTaskArray = node.every(
      (n) =>
        n &&
        typeof n === "object" &&
        "text" in (n as any) &&
        "minutes" in (n as any)
    );
    if (looksLikeTaskArray) return node as AiTask[];

    for (const item of node) {
      const found = digForTasks(item);
      if (found) return found;
    }
  }

  if (typeof node === "object") {
    for (const value of Object.values(node)) {
      const found = digForTasks(value);
      if (found) return found;
    }
  }

  return null;
}

function extractTasksFromParts(parts: Array<Record<string, any>>): AiTask[] | null {
  for (const part of parts) {
    const rawArgs = part?.functionCall?.args;
    if (!rawArgs) continue;

    let args: any = rawArgs;
    if (typeof rawArgs === "string") {
      try {
        args = JSON.parse(rawArgs);
      } catch {
        // ignore bad JSON strings
      }
    }

    if (Array.isArray(args)) return args as AiTask[];
    if (Array.isArray(args?.tasks)) return args.tasks as AiTask[];

    const nested = digForTasks(args);
    if (nested) return nested;
  }
  return null;
}

function normalizeTasks(tasks: AiTask[]): AiTask[] {
  return tasks
    .map((t) => ({
      text: typeof t.text === "string" ? t.text : "",
      minutes: Number(t.minutes) || 0,
    }))
    .filter((t) => t.text.length > 0 && t.minutes > 0);
}

export async function generateTasksWithAI(goal: string): Promise<AiTask[]> {
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing EXPO_PUBLIC_GEMINI_API_KEY for task generation.");
  }

  const prompt = `
Generate 3-6 focused tasks for a study/work session.
Return strict JSON of the form:
[
  {"text": "Task name", "minutes": 25},
  ...
]

Goal/context: ${goal || "None provided"}
Prefer short, actionable tasks. Keep minutes between 10 and 45.
`;

  const callGemini = async (body: Record<string, unknown>) => {
    const response = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const fallback = await response.text().catch(() => "");
      let message = `AI request failed (${response.status}).`;
      try {
        const parsed = JSON.parse(fallback);
        message = parsed?.error?.message ?? message;
      } catch {
        if (fallback) message = `${message} ${fallback}`;
      }
      throw new Error(message.trim());
    }

    const data = await response.json();
    const parts =
      (data?.candidates?.[0]?.content?.parts as Array<Record<string, any>> | undefined) ??
      [];
    const text =
      parts
        .map((p) => (typeof p.text === "string" ? p.text : ""))
        .join("")
        .trim() || "";

    return { text, parts, data, status: response.status };
  };

  const primary = await callGemini({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.35,
      maxOutputTokens: 512,
      responseMimeType: "application/json",
    },
  });

  console.log("[Gemini][tasks] raw response", {
    hasCandidates: Array.isArray(primary?.data?.candidates),
    status: primary.status,
    promptFeedback: primary?.data?.promptFeedback,
  });
  console.log("[Gemini][tasks] parsed text", {
    length: primary.text.length,
    preview: primary.text.slice(0, 160),
  });

  const parseOrNull = (text: string) => {
    if (!text) return null;
    try {
      return parseTasksFromText(text);
    } catch {
      return null;
    }
  };

  let parsed = parseOrNull(primary.text) ?? extractTasksFromParts(primary.parts);

  if (!parsed || parsed.length === 0) {
    console.warn("[Gemini][tasks] empty or unparseable response; retrying with plain text");
    const fallback = await callGemini({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.45,
        maxOutputTokens: 512,
      },
    });
    console.log("[Gemini][tasks] fallback parsed text", {
      length: fallback.text.length,
      preview: fallback.text.slice(0, 160),
    });
    parsed = parseOrNull(fallback.text) ?? extractTasksFromParts(fallback.parts);
  }

  if (!parsed || parsed.length === 0) {
    const block = primary?.data?.promptFeedback?.blockReason;
    const safety =
      primary?.data?.promptFeedback?.safetyRatings
        ?.map((s: any) => s?.category)
        .filter(Boolean)
        .join(", ");
    const details = block
      ? `Blocked: ${block}${safety ? ` (${safety})` : ""}`
      : "AI response was empty. Check API key/quota and try again.";
    throw new Error(details);
  }

  return normalizeTasks(parsed);
}

/**
 * Generates a short reflective reply based on the chat history.
 */
export async function generateReflectionReply(
  history: ReflectionTurn[],
  goal?: string
): Promise<string> {
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing EXPO_PUBLIC_GEMINI_API_KEY for reflections.");
  }

  const safeFallback = "I'm here and listening - tell me more about how that felt.";
  const recent = history.slice(-4);
  const lastUser =
    [...recent].reverse().find((t) => t.from === "user")?.text ?? "";

  const prompt = `
You are Theo, a warm, concise study reflection partner.
- Reply in 1-3 short sentences.
- Be encouraging, reflective, and specific to the user's last message.
- Do NOT return JSON or lists.
- If a goal is provided, gently relate to it.
- Keep your reply under 60 words.

Goal: ${goal || "None provided"}

Chat so far:
${recent
  .map(
    (turn) =>
      `${turn.from === "user" ? "User" : "Theo"}: ${turn.text.trim()}`
  )
  .join("\n")}
`;

  try {
    console.log("[Gemini][reflection] sending prompt", {
      historyCount: history.length,
      goalPresent: Boolean(goal),
    });

    // helper to call Gemini with different bodies
    const callGemini = async (body: Record<string, unknown>) => {
      const response = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const fallback = await response.text().catch(() => "");
        let message = `AI request failed (${response.status}).`;
        try {
          const parsed = JSON.parse(fallback);
          message = parsed?.error?.message ?? message;
        } catch {
          if (fallback) message = `${message} ${fallback}`;
        }
        console.warn("Gemini reflection request failed", message);
        return { text: "", finishReason: "HTTP_ERROR", promptFeedback: message };
      }

      const data = await response.json();
      const parts =
        (data?.candidates?.[0]?.content?.parts as Array<{ text?: string }> | undefined) ??
        [];
      const text =
        parts.map((p) => (typeof p.text === "string" ? p.text : "")).join("").trim() ||
        "";

      return {
        text,
        finishReason: data?.candidates?.[0]?.finishReason,
        promptFeedback: data?.promptFeedback,
      };
    };

    console.log("[Gemini][reflection] sending prompt", {
      historyCount: history.length,
      goalPresent: Boolean(goal),
      promptLength: prompt.length,
    });

    const primary = await callGemini({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.45,
        maxOutputTokens: 320,
      },
      safetySettings: [
        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
      ],
    });

    console.log("[Gemini][reflection] raw", {
      finishReason: primary.finishReason,
      promptFeedback: primary.promptFeedback,
      hasText: Boolean(primary.text),
    });

    const truncated =
      (primary.finishReason === "MAX_TOKENS" && (primary.text?.length ?? 0) < 40) ||
      ((primary.text ?? "").split(/\s+/).filter(Boolean).length <= 3);

    if (primary.text && !truncated) {
      return primary.text;
    }

    if (truncated) {
      console.warn("[Gemini][reflection] truncation detected, retrying with minimal prompt", {
        finishReason: primary.finishReason,
        textLen: primary.text?.length,
        wordCount: primary.text?.split(/\s+/).filter(Boolean).length,
      });
    }

    // Fallback: minimal prompt, very small token budget to dodge MAX_TOKENS
    const minimalPrompt = `Respond supportively in one short sentence to: "${lastUser || "I'm thinking about my session."}"`;
    const fallback = await callGemini({
      contents: [{ role: "user", parts: [{ text: minimalPrompt }] }],
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 120,
      },
      safetySettings: [
        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
      ],
    });

    console.log("[Gemini][reflection] fallback raw", {
      finishReason: fallback.finishReason,
      promptFeedback: fallback.promptFeedback,
      hasText: Boolean(fallback.text),
    });

    if (fallback.text) {
      return fallback.text;
    }

    console.warn("Gemini reflection reply was empty after fallback.");
    return safeFallback;
  } catch (err) {
    console.error("Gemini reflection error", err);
    return safeFallback;
  }
}
