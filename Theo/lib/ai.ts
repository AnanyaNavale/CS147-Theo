const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

export type AiTask = { text: string; minutes: number };

function parseTasksFromText(text: string): AiTask[] {
  const cleaned = text.replace(/```(\w+)?/g, "").trim();

  // Try direct parse if the whole content is JSON
  try {
    const direct = JSON.parse(cleaned);
    if (Array.isArray(direct)) {
      return direct;
    }
  } catch {
    // ignore and try to extract an array below
  }

  const match = cleaned.match(/\[[\s\S]*\]/);
  if (!match) {
    throw new Error("AI response did not include a task list.");
  }

  try {
    const extracted = JSON.parse(match[0]);
    if (!Array.isArray(extracted)) {
      throw new Error("AI response was not an array.");
    }
    return extracted;
  } catch (err) {
    throw new Error(
      err instanceof Error ? err.message : "Could not read AI task list."
    );
  }
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

  const response = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.35,
        maxOutputTokens: 512,
        responseMimeType: "application/json",
      },
    }),
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
    (data?.candidates?.[0]?.content?.parts as Array<{ text?: string }> | undefined) ??
    [];
  const text =
    parts.map((p) => (typeof p.text === "string" ? p.text : "")).join("").trim() ||
    "";

  if (!text) {
    const block = data?.promptFeedback?.blockReason;
    const safety =
      data?.promptFeedback?.safetyRatings
        ?.map((s: any) => s?.category)
        .filter(Boolean)
        .join(", ");
    const details = block
      ? `Blocked: ${block}${safety ? ` (${safety})` : ""}`
      : "AI response was empty. Check API key/quota and try again.";
    throw new Error(details);
  }

  let parsed: AiTask[];
  try {
    parsed = parseTasksFromText(text);
  } catch (err) {
    console.error("Failed to parse Gemini response text:", text);
    throw new Error("Could not parse AI response. Try again.");
  }

  return parsed
    .map((t) => ({
      text: typeof t.text === "string" ? t.text : "",
      minutes: Number(t.minutes) || 0,
    }))
    .filter((t) => t.text.length > 0 && t.minutes > 0);
}
