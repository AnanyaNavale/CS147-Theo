const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
const DEFAULT_TASK_MINUTES = 20;

export type AiTask = { text: string; minutes: number };
export type ReflectionTurn = { from: "user" | "assistant"; text: string };
type GenericReflectionMessage = {
  from?: string | null;
  role?: string | null;
  sender?: string | null;
  text?: string | null;
  content?: string | null;
};

type GeminiTaskCallResult = {
  text: string;
  finishReason?: string;
  blockReason?: string;
  parts?: Array<Record<string, any>>;
};

async function callGeminiForTasks(
  apiKey: string,
  body: Record<string, unknown>
): Promise<GeminiTaskCallResult> {
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
    console.log(message.trim());
    throw new Error(message.trim());
  }

  const data = await response.json();
  const candidates: any[] = Array.isArray(data?.candidates)
    ? (data.candidates as any[])
    : [];

  if (!candidates.length) {
    console.warn("[Gemini][tasks] no candidates returned", data);
  }

  let text = "";
  let parts: Array<Record<string, any>> = [];
  let finishReason: string | undefined;
  for (const cand of candidates) {
    if (!finishReason && cand?.finishReason) {
      finishReason = cand.finishReason;
    }
    parts =
      (cand?.content?.parts as Array<{ text?: string }> | undefined) ?? [];
    const joined =
      parts
        .map((p) => (typeof p.text === "string" ? p.text : ""))
        .join("")
        .trim() || "";
    if (joined) {
      text = joined;
      break;
    }

    const firstCall = parts.find((p: any) => p?.functionCall);
    const callArgs =
      (firstCall as any)?.functionCall?.args ??
      (firstCall as any)?.functionCall?.arguments;
    if (callArgs) {
      text =
        typeof callArgs === "string"
          ? callArgs
          : JSON.stringify(callArgs, null, 2);
      if (text) break;
    }
  }

  if (!text && data?.candidates?.[0]?.content) {
    try {
      text = JSON.stringify(data.candidates[0].content);
    } catch {
      // ignore
    }
  }

  if (!text) {
    console.warn("[Gemini][tasks] empty text after processing", data);
  }

  const block = data?.promptFeedback?.blockReason;
  const safety = data?.promptFeedback?.safetyRatings
    ?.map((s: any) => s?.category)
    .filter(Boolean)
    .join(", ");

  return {
    text,
    finishReason: finishReason ?? data?.candidates?.[0]?.finishReason,
    blockReason: block ? `${block}${safety ? ` (${safety})` : ""}` : undefined,
    parts,
  };
}

function repairJsonArray(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed.startsWith("[")) return null;

  let fixed = trimmed.replace(/,\s*$/, "");
  const openBraces = (fixed.match(/{/g) ?? []).length;
  const closeBraces = (fixed.match(/}/g) ?? []).length;
  if (openBraces > closeBraces) {
    fixed += "}".repeat(openBraces - closeBraces);
  }

  const openBrackets = (fixed.match(/\[/g) ?? []).length;
  const closeBrackets = (fixed.match(/]/g) ?? []).length;
  if (openBrackets > closeBrackets) {
    fixed += "]".repeat(openBrackets - closeBrackets);
  }

  return fixed;
}

function fallbackTasks(goal: string): AiTask[] {
  const goalSnippet = goal?.slice(0, 40) || "your goal";
  return [
    { text: `Outline steps for ${goalSnippet}`, minutes: 15 },
    { text: `Work on the core task for ${goalSnippet}`, minutes: 30 },
    { text: `Review and write notes`, minutes: 15 },
  ];
}

function fromTaskTimeArrays(obj: any): AiTask[] | null {
  const tasksArray =
    obj?.tasks ?? obj?.task ?? obj?.items ?? obj?.list ?? obj?.data;
  const minutesArray =
    obj?.minutes ?? obj?.times ?? obj?.durations ?? obj?.estimates;

  if (!Array.isArray(tasksArray) || !Array.isArray(minutesArray)) return null;

  const len = Math.min(tasksArray.length, minutesArray.length);
  if (len === 0) return null;

  const mapped: AiTask[] = [];
  for (let i = 0; i < len; i++) {
    const text =
      typeof tasksArray[i] === "string"
        ? tasksArray[i].trim()
        : String(tasksArray[i] ?? "");
    const minsRaw =
      typeof minutesArray[i] === "string"
        ? parseInt(minutesArray[i] as string, 10)
        : Number(minutesArray[i]);
    const minutes = Number.isFinite(minsRaw) && minsRaw > 0 ? minsRaw : 0;
    if (text && minutes) mapped.push({ text, minutes });
  }

  return mapped.length ? mapped : null;
}

function toAiTasks(arr: any[]): AiTask[] {
  return arr
    .map((item) => {
      if (typeof item === "string" || typeof item === "number") {
        const text = String(item).trim();
        return text ? { text, minutes: DEFAULT_TASK_MINUTES } : null;
      }

      if (item && typeof item === "object") {
        const rawText =
          (item as any)?.text ??
          (item as any)?.task ??
          (item as any)?.title ??
          (item as any)?.description ??
          (item as any)?.name;
        const text = typeof rawText === "string" ? rawText.trim() : "";
        const rawMinutes =
          typeof (item as any)?.minutes === "string"
            ? parseInt((item as any).minutes, 10)
            : Number(
                (item as any)?.minutes ??
                  (item as any)?.time ??
                  (item as any)?.duration ??
                  (item as any)?.estimate
              );
        const minutes =
          Number.isFinite(rawMinutes) && rawMinutes > 0
            ? rawMinutes
            : DEFAULT_TASK_MINUTES;
        return text ? { text, minutes } : null;
      }

      return null;
    })
    .filter(Boolean) as AiTask[];
}

function parseTasksFromText(text: string): AiTask[] {
  const cleaned = text.replace(/```(\w+)?/g, "").trim();

  const quotedTasksMatch = cleaned.match(/"tasks"\s*:\s*"([^"]+)"/);
  if (quotedTasksMatch && quotedTasksMatch[1]) {
    const quoted = quotedTasksMatch[1]
      .replace(/\\"/g, '"')
      .replace(/\\n/g, "")
      .trim();
    try {
      const parsedQuoted = JSON.parse(quoted);
      if (Array.isArray(parsedQuoted)) {
        console.warn("[Gemini][tasks] salvaged quoted tasks", {
          count: parsedQuoted.length,
        });
        return toAiTasks(parsedQuoted);
      }
    } catch {
      // ignore
    }
  }

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
          const mapped = toAiTasks(parsed);
          if (mapped.length) return mapped;
        }
      } catch {
        // keep trying other candidates
      }
    }

    return null;
  };

  const direct = tryParseArray(cleaned);
  if (direct) return direct;

  try {
    const obj = JSON.parse(cleaned);
    if (obj && typeof obj === "object") {
      const mapped = fromTaskTimeArrays(obj);
      if (mapped) return mapped;
      if (Array.isArray((obj as any)?.tasks)) {
        const mappedTasks = toAiTasks((obj as any).tasks);
        if (mappedTasks.length) return mappedTasks;
      }
    }
  } catch {
    // ignore
  }

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

    const repaired = repairJsonArray(candidate);
    if (repaired) {
      const parsed = tryParseArray(repaired);
      if (parsed) return parsed;
    }

    const parsed = tryParseArray(candidate);
    if (parsed) return parsed;
  }

  const salvaged: AiTask[] = [];
  for (const match of cleaned.matchAll(/\{[^{}]*\}/g)) {
    try {
      const parsed = JSON.parse(match[0]);
      if (parsed && typeof parsed === "object") {
        salvaged.push(parsed as AiTask);
      }
    } catch {
      // ignore
    }
  }

  if (salvaged.length > 0) {
    console.warn("[Gemini][tasks] salvaged partial task list", {
      count: salvaged.length,
    });
    return salvaged;
  }

  const taskKeyIndex = cleaned.indexOf('"tasks"');
  const quotedSection =
    taskKeyIndex >= 0 ? cleaned.slice(taskKeyIndex) : cleaned;
  const quotedTasks = Array.from(
    quotedSection.matchAll(/"([^"]+)"\s*(,|\])/g)
  ).map((m) => m[1]);
  if (quotedTasks.length > 0) {
    console.warn("[Gemini][tasks] salvaged quoted tasks", {
      count: quotedTasks.length,
    });
    return toAiTasks(quotedTasks);
  }

  const looseLines = quotedSection
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(
      (line) =>
        line.startsWith('"') &&
        !line.includes('":') &&
        !line.startsWith('"tasks"')
    );
  const looseTasks = looseLines
    .map((line) => {
      const content = line.slice(1);
      const endQuote = content.indexOf('"');
      const text =
        endQuote >= 0 ? content.slice(0, endQuote) : content.replace(/,?$/, "");
      return text.trim();
    })
    .filter((t) => t.length > 0);

  if (looseTasks.length > 0) {
    console.warn("[Gemini][tasks] salvaged loose quoted tasks", {
      count: looseTasks.length,
    });
    return toAiTasks(looseTasks);
  }

  console.warn("[Gemini][tasks] parse failed", {
    original: cleaned.slice(0, 400),
  });
  throw new Error("AI response did not include a task list.");
}

function digForTasks(node: unknown): AiTask[] | null {
  if (!node) return null;

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

function extractTasksFromParts(
  parts: Array<Record<string, any>>
): AiTask[] | null {
  for (const part of parts) {
    const rawArgs =
      part?.functionCall?.args ??
      part?.functionCall?.arguments ??
      (part as any)?.functionCall?.serializedArguments;
    if (!rawArgs) continue;

    let args: any = rawArgs;
    if (typeof rawArgs === "string") {
      try {
        args = JSON.parse(rawArgs);
      } catch {
        // ignore bad JSON strings
      }
    }

    if (Array.isArray(args)) {
      const normalized = toAiTasks(args);
      if (normalized.length) return normalized;
    }

    if (args && typeof args === "object") {
      const paired = fromTaskTimeArrays(args);
      if (paired?.length) return paired;

      if (Array.isArray((args as any)?.tasks)) {
        const mapped = toAiTasks((args as any).tasks);
        if (mapped.length) return mapped;
      }

      const nested = digForTasks(args);
      if (nested) return nested;
    }
  }
  return null;
}

function normalizeTasks(tasks: AiTask[]): AiTask[] {
  return tasks
    .map((t) => {
      if (typeof (t as any) === "string") {
        const text = (t as unknown as string).trim();
        return text ? { text, minutes: DEFAULT_TASK_MINUTES } : null;
      }

      const rawText =
        (t as any)?.text ??
        (t as any)?.task ??
        (t as any)?.title ??
        (t as any)?.description ??
        (t as any)?.name;
      const text = typeof rawText === "string" ? rawText.trim() : "";
      const rawMinutes =
        typeof (t as any)?.minutes === "string"
          ? parseInt((t as any).minutes, 10)
          : Number(
              (t as any)?.minutes ?? (t as any)?.time ?? (t as any)?.duration
            );
      const minutes =
        Number.isFinite(rawMinutes) && rawMinutes > 0
          ? rawMinutes
          : DEFAULT_TASK_MINUTES;

      return text ? { text, minutes } : null;
    })
    .filter((t): t is AiTask => Boolean(t))
    .map((t) => ({
      text: t.text,
      minutes: Math.max(5, Math.round(t.minutes)),
    }));
}

export async function generateTasksWithAI(goal: string): Promise<AiTask[]> {
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing EXPO_PUBLIC_GEMINI_API_KEY for task generation.");
  }

  const prompt = `
Generate 3-8 atomic tasks for a study/work session that incrementally complete the user goal. Infer the goal even if it has typos.
Respond ONLY with JSON using two arrays of equal length:
{
  "tasks": ["Task name 1", "Task name 2"],
  "minutes": [20, 25]
}
- Tasks must be granular and actionable.
- Minutes are whole numbers between 10 and 30.
- No markdown, no prose, no code fences.
Goal/context: ${goal || "None provided"}
`;

  const responseSchema = {
    type: "object",
    properties: {
      tasks: {
        type: "array",
        items: { type: "string" },
        minItems: 3,
        maxItems: 8,
      },
      minutes: {
        type: "array",
        items: { type: "integer" },
        minItems: 3,
        maxItems: 8,
      },
    },
    required: ["tasks", "minutes"],
  };

  const parseOrNull = (raw: string) => {
    if (!raw) return null;
    try {
      return parseTasksFromText(raw);
    } catch {
      return null;
    }
  };

  const primary = await callGeminiForTasks(apiKey, {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.35,
      maxOutputTokens: 4096,
      responseMimeType: "application/json",
      responseSchema,
    },
  });

  console.log("[Gemini][tasks] structured response", {
    finishReason: primary.finishReason,
    blockReason: primary.blockReason,
    preview: primary.text.slice(0, 120),
  });

  let parsed = parseOrNull(primary.text);

  if (!parsed || parsed.length === 0) {
    console.warn(
      "[Gemini][tasks] structured parse failed; retrying with relaxed output",
      {
        finishReason: primary.finishReason,
        blockReason: primary.blockReason,
      }
    );
    const fallback = await callGeminiForTasks(apiKey, {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.45,
        maxOutputTokens: 6144,
      },
    });
    console.log("[Gemini][tasks] fallback response", {
      finishReason: fallback.finishReason,
      blockReason: fallback.blockReason,
      preview: fallback.text.slice(0, 120),
    });
    parsed = parseOrNull(fallback.text);
  }

  if (!parsed || parsed.length === 0) {
    const details =
      primary.blockReason ||
      "AI response was empty. Check API key/quota and try again.";
    throw new Error(details);
  }

  return normalizeTasks(parsed);
}

export async function generateReflectionReply(
  history: ReflectionTurn[],
  goal?: string
): Promise<string> {
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing EXPO_PUBLIC_GEMINI_API_KEY for reflections.");
  }

  const safeFallback =
    "I'm here and listening - tell me more about how that felt.";
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
    (turn) => `${turn.from === "user" ? "User" : "Theo"}: ${turn.text.trim()}`
  )
  .join("\n")}
`;

  try {
    console.log("[Gemini][reflection] sending prompt", {
      historyCount: history.length,
      goalPresent: Boolean(goal),
    });

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
        return {
          text: "",
          finishReason: "HTTP_ERROR",
          promptFeedback: message,
        };
      }

      const data = await response.json();
      const parts =
        (data?.candidates?.[0]?.content?.parts as
          | Array<{ text?: string }>
          | undefined) ?? [];
      const text =
        parts
          .map((p) => (typeof p.text === "string" ? p.text : ""))
          .join("")
          .trim() || "";

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
        temperature: 0,
        maxOutputTokens: 2048,
      },
      safetySettings: [
        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_NONE",
        },
        {
          category: "HARM_CATEGORY_tertiaryOUS_CONTENT",
          threshold: "BLOCK_NONE",
        },
      ],
    });

    console.log("[Gemini][reflection] raw", {
      finishReason: primary.finishReason,
      promptFeedback: primary.promptFeedback,
      hasText: Boolean(primary.text),
    });

    if (
      isQuotaError(primary.text) ||
      isQuotaError(
        typeof primary.promptFeedback === "string"
          ? primary.promptFeedback
          : undefined
      )
    ) {
      const msg =
        primary.text ||
        (typeof primary.promptFeedback === "string"
          ? primary.promptFeedback
          : "") ||
        "You exceeded your current quota";
      throw new Error(msg);
    }

    const wordCount = (primary.text ?? "").split(/\s+/).filter(Boolean).length;
    const looksIncomplete = primary.text
      ? !/[.!?]"?$/.test(primary.text.trim())
      : true;
    const truncated =
      primary.finishReason === "MAX_TOKENS" ||
      wordCount <= 4 ||
      ((primary.text?.length ?? 0) < 24 && looksIncomplete) ||
      (looksIncomplete && wordCount < 30);

    if (primary.text && !truncated) {
      return primary.text;
    }

    if (truncated) {
      console.warn(
        "[Gemini][reflection] truncation detected, retrying with minimal prompt",
        {
          finishReason: primary.finishReason,
          textLen: primary.text?.length,
          wordCount,
          looksIncomplete,
        }
      );
    }

    const minimalPrompt = `Respond supportively in one short sentence to: "${
      lastUser || "I'm thinking about my session."
    }"`;
    const fallback = await callGemini({
      contents: [{ role: "user", parts: [{ text: minimalPrompt }] }],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 2048,
      },
      safetySettings: [
        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_NONE",
        },
        {
          category: "HARM_CATEGORY_tertiaryOUS_CONTENT",
          threshold: "BLOCK_NONE",
        },
      ],
    });

    console.log("[Gemini][reflection] fallback raw", {
      finishReason: fallback.finishReason,
      promptFeedback: fallback.promptFeedback,
      hasText: Boolean(fallback.text),
    });

    if (
      isQuotaError(fallback.text) ||
      isQuotaError(
        typeof fallback.promptFeedback === "string"
          ? fallback.promptFeedback
          : undefined
      )
    ) {
      const msg =
        fallback.text ||
        (typeof fallback.promptFeedback === "string"
          ? fallback.promptFeedback
          : "") ||
        "You exceeded your current quota";
      throw new Error(msg);
    }

    if (fallback.text) {
      return fallback.text;
    }

    console.warn("Gemini reflection reply was empty after fallback.");
    return safeFallback;
  } catch (err) {
    console.error("Gemini reflection error", err);
    if (err instanceof Error && isQuotaError(err.message)) {
      throw err;
    }
    return safeFallback;
  }
}

function isQuotaError(text: string | undefined | null): boolean {
  if (!text) return false;
  return text.trim().toLowerCase().includes("you exceeded your current quota");
}

/**
 * Summarizes a reflection chat into 1-3 sentences using Gemini.
 * Returns null if no user messages are present or if the call fails.
 */
export async function summarizeReflectionChat(
  reflectionChat: GenericReflectionMessage[] | null | undefined
): Promise<string | null> {
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("Missing EXPO_PUBLIC_GEMINI_API_KEY for reflection summary.");
    return null;
  }

  if (!Array.isArray(reflectionChat) || reflectionChat.length === 0) {
    return null;
  }

  const normalizedTurns = reflectionChat
    .map((turn) => {
      const text =
        (typeof turn?.text === "string" && turn.text.trim()) ||
        (typeof turn?.content === "string" && turn.content.trim()) ||
        "";
      if (!text) return null;
      const fromRaw = (turn?.from || turn?.role || turn?.sender || "").trim();
      const from =
        fromRaw.toLowerCase() === "assistant" ||
        fromRaw.toLowerCase() === "theo"
          ? "assistant"
          : "user";
      return { from, text };
    })
    .filter(Boolean) as ReflectionTurn[];

  if (normalizedTurns.length === 0) return null;
  const hasUserMessage = normalizedTurns.some((t) => t.from === "user");
  if (!hasUserMessage) return null;

  const transcript = normalizedTurns
    .slice(-12)
    .map((t) => `${t.from === "assistant" ? "Theo" : "User"}: ${t.text}`)
    .join("\n");

  const prompt = `
You are Theo, a warm and concise reflection summarizer.
- Write a short summary of the reflection in 1-2 sentences.
- Capture the user's main themes, feelings, and any progress noted.
- Be supportive and specific to the transcript. No bullet points.
- Keep it under 50 words.

Reflection chat:
${transcript}
`.trim();

  try {
    const response = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 512,
          topP: 0.8,
        },
      }),
    });

    if (!response.ok) {
      const fallback = await response.text().catch(() => "");
      console.warn(
        "[Gemini][reflection-summary] request failed",
        response.status,
        fallback
      );
      return null;
    }

    const data = await response.json();
    const parts =
      (data?.candidates?.[0]?.content?.parts as
        | Array<{ text?: string }>
        | undefined) ?? [];
    const text =
      parts
        .map((p) => (typeof p.text === "string" ? p.text : ""))
        .join("")
        .trim() || "";

    return text || null;
  } catch (err) {
    console.error("[Gemini][reflection-summary] error", err);
    return null;
  }
}
