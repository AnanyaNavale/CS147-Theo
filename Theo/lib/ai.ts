const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

export type AiTask = { text: string; minutes: number };
export type ReflectionTurn = { from: "user" | "assistant"; text: string };

type GeminiTaskCallResult = {
  text: string;
  finishReason?: string;
  blockReason?: string;
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
  for (const cand of candidates) {
    const parts =
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

    // JSON mode can return a functionCall instead of text; salvage it.
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

  // Last-resort: stringify the content so salvage can try to parse objects.
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
    finishReason: data?.candidates?.[0]?.finishReason,
    blockReason: block ? `${block}${safety ? ` (${safety})` : ""}` : undefined,
  };
}

function repairJsonArray(raw: string): string | null {
  // Attempt to close truncated JSON like missing } or ] from the model.
  const trimmed = raw.trim();
  if (!trimmed.startsWith("[")) return null;

  let fixed = trimmed.replace(/,\s*$/, ""); // drop trailing comma if present
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

function normalizeTasks(tasks: AiTask[]): AiTask[] {
  return tasks
    .map((t: any) => {
      const rawText =
        t?.text ?? t?.task ?? t?.title ?? t?.description ?? t?.name;
      const text = typeof rawText === "string" ? rawText.trim() : "";
      const rawMinutes =
        typeof t?.minutes === "string"
          ? parseInt(t.minutes, 10)
          : Number(t?.minutes ?? t?.time ?? t?.duration);
      const minutes =
        Number.isFinite(rawMinutes) && rawMinutes > 0 ? rawMinutes : 30;
      return { text, minutes };
    })
    .filter((t) => t.text.length > 0 && t.minutes > 0);
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

function parseTasksFromText(text: string): AiTask[] {
  const cleaned = text.replace(/```(\w+)?/g, "").trim();

  const parsePlainTextLines = (source: string): AiTask[] => {
    const lines = source
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    const tasks: AiTask[] = [];
    for (const line of lines) {
      // Strip bullets / numbering
      const withoutPrefix = line.replace(/^[-*•\d\).\s]+/, "").trim();
      // Extract minutes from patterns like "25 min", "20mins", "15 minutes", "30m"
      const minMatch = withoutPrefix.match(
        /(\d{1,3})\s*(?:minutes?|mins?|min|m)\b/i
      );
      const minutes = minMatch ? Number(minMatch[1]) : 0;
      const textPart = minMatch
        ? withoutPrefix
            .replace(minMatch[0], "")
            .replace(/[-–—:]+$/, "")
            .trim()
        : withoutPrefix;
      if (textPart && minutes > 0) {
        tasks.push({ text: textPart, minutes });
      }
    }
    return tasks;
  };

  const salvageObjects = (source: string): AiTask[] | null => {
    const objectSnippets = source.match(/\{[^{}]*\}/g) ?? [];
    const salvaged = objectSnippets
      .map((snippet) => {
        try {
          return JSON.parse(snippet);
        } catch {
          return null;
        }
      })
      .filter(
        (obj): obj is AiTask =>
          !!obj &&
          (typeof (obj as any).text === "string" ||
            typeof (obj as any).task === "string")
      )
      .map((obj: any) => ({
        text:
          typeof obj.text === "string"
            ? obj.text.trim()
            : typeof obj.task === "string"
            ? obj.task.trim()
            : "",
        minutes:
          Number(obj.minutes ?? obj.time ?? obj.duration) ||
          (typeof obj.minutes === "string" ? parseInt(obj.minutes, 10) : 0),
      }))
      .filter((t) => t.text.length > 0 && t.minutes > 0);

    return salvaged.length ? salvaged : null;
  };

  // Try direct parse if the whole content is JSON
  try {
    const direct = JSON.parse(cleaned);
    if (Array.isArray(direct)) return direct;
    if (direct && typeof direct === "object") {
      const combined = fromTaskTimeArrays(direct);
      if (combined) return combined;

      const maybeArray =
        (direct as any).tasks ||
        (direct as any).items ||
        (direct as any).list ||
        (direct as any).data;
      if (Array.isArray(maybeArray)) return maybeArray;
    }
  } catch {
    // ignore and try to extract an array below
  }

  const match = cleaned.match(/\[[\s\S]*\]/);
  const arrayCandidate =
    match?.[0] ??
    (cleaned.includes("[") ? cleaned.slice(cleaned.indexOf("[")) : "");
  if (!arrayCandidate) {
    const salvaged = salvageObjects(cleaned);
    if (salvaged) return salvaged;
    throw new Error("AI response did not include a task list.");
  }

  try {
    const extracted = JSON.parse(arrayCandidate);
    if (!Array.isArray(extracted)) {
      throw new Error("AI response was not an array.");
    }
    return extracted;
  } catch (err) {
    const repaired = repairJsonArray(arrayCandidate);
    if (repaired) {
      try {
        const recovered = JSON.parse(repaired);
        if (Array.isArray(recovered)) return recovered;
      } catch {
        // fall through to throw below
      }
    }

    const salvaged = salvageObjects(arrayCandidate);
    if (salvaged) return salvaged;

    const fromLines = parsePlainTextLines(cleaned);
    if (fromLines.length) return fromLines;

    throw new Error("Could not read AI task list.");
  }
}

export async function generateTasksWithAI(goal: string): Promise<AiTask[]> {
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing EXPO_PUBLIC_GEMINI_API_KEY for task generation.");
  }

  const prompt = `
Generate 3-8 atomic tasks for a study/work session that incrementally complete the user goal. Try to infer what the goal is if there are typos.
Return a JSON object with two arrays of equal length:
{
  "tasks": ["Task name 1", "Task name 2"],
  "minutes": [20, 25]
}
Goal/context: ${goal || "None provided"}
Tasks must be granular and actionable. Keep minutes between 10 and 30.
Do NOT include markdown or code fences; only return the JSON object.
`;

  const parseSafely = (label: string, text: string | undefined) => {
    if (!text) return null;
    try {
      return normalizeTasks(parseTasksFromText(text));
    } catch (err) {
      console.warn(
        `[Gemini][tasks] parse failed (${label})`,
        err,
        text ? { preview: text.slice(0, 240) } : {}
      );
      return null;
    }
  };

  try {
    const primary = await callGeminiForTasks(apiKey, {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.35,
        maxOutputTokens: 512,
      },
      safetySettings: [
        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_NONE",
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_NONE",
        },
      ],
    });

    let parsed = parseSafely("primary", primary.text);

    if (!parsed || parsed.length === 0) {
      console.warn("[Gemini][tasks] primary empty", {
        blockReason: primary.blockReason,
        textPreview: (primary.text || "").slice(0, 160),
      });

      // Fallback: less strict prompt without responseMimeType (mirrors reflection flow)
      const fallbackPrompt = `Give 5-8 atomic tasks for this goal. Return a JSON object with "tasks" (array of strings) and "minutes" (array of numbers 15-30), matching by index. No markdown or code fences. Goal: ${goal}`;
      const fallback = await callGeminiForTasks(apiKey, {
        contents: [{ role: "user", parts: [{ text: fallbackPrompt }] }],
        generationConfig: {
          temperature: 0.35,
          maxOutputTokens: 512,
        },
        safetySettings: [
          { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_NONE",
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_NONE",
          },
        ],
      });

      parsed = parseSafely("fallback", fallback.text);

      if (!parsed || parsed.length === 0) {
        const details =
          fallback.blockReason ||
          primary.blockReason ||
          "AI response was empty. Check API key/quota and try again.";
        console.warn(
          "[Gemini][tasks] returning fallback tasks. Reason:",
          details,
          {
            fallbackTextPreview: (fallback.text || "").slice(0, 160),
          }
        );
        return fallbackTasks(goal);
      }
    }

    return parsed;
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "AI request failed. Try again.";
    throw new Error(message);
  }
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
        temperature: 0.45,
        maxOutputTokens: 256,
      },
      safetySettings: [
        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_NONE",
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_NONE",
        },
      ],
    });

    console.log("[Gemini][reflection] raw", {
      finishReason: primary.finishReason,
      promptFeedback: primary.promptFeedback,
      hasText: Boolean(primary.text),
    });

    if (primary.text) {
      return primary.text;
    }

    // Fallback: minimal prompt, very small token budget to dodge MAX_TOKENS
    const minimalPrompt = `Respond supportively in one short sentence to: "${
      lastUser || "I'm thinking about my session."
    }"`;
    const fallback = await callGemini({
      contents: [{ role: "user", parts: [{ text: minimalPrompt }] }],
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 120,
      },
      safetySettings: [
        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_NONE",
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_NONE",
        },
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
