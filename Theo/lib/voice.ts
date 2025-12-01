import { Platform } from "react-native";

const WHISPER_URL = "https://api.openai.com/v1/audio/transcriptions";
const DEFAULT_MODEL = "whisper-1";

function guessMimeType(uri: string) {
  if (uri.toLowerCase().endsWith(".wav")) return "audio/wav";
  if (uri.toLowerCase().endsWith(".mp3")) return "audio/mpeg";
  if (uri.toLowerCase().endsWith(".ogg")) return "audio/ogg";
  return "audio/m4a";
}

/**
 * Sends an audio file to OpenAI Whisper and returns the transcription text.
 */
export async function transcribeAudioFile(uri: string): Promise<string> {
  const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing EXPO_PUBLIC_OPENAI_API_KEY for voice input.");
  }

  if (!uri) {
    throw new Error("No audio file to transcribe.");
  }

  const fileName = uri.split("/").pop() ?? "voice-note.m4a";
  const mimeType = guessMimeType(uri);

  const form = new FormData();
  form.append("file", {
    // @ts-expect-error React Native File shim
    uri,
    name: fileName,
    type: mimeType,
  });
  form.append("model", DEFAULT_MODEL);
  form.append("response_format", "json");

  const headers: Record<string, string> = {
    Authorization: `Bearer ${apiKey}`,
    Accept: "application/json",
  };

  // Only provide Content-Type on web to avoid RN boundary issues
  if (Platform.OS === "web") {
    headers["Content-Type"] = "multipart/form-data";
  }

  const response = await fetch(WHISPER_URL, {
    method: "POST",
    headers,
    body: form as any,
  });

  if (!response.ok) {
    const fallback = await response.text().catch(() => "");
    let message = `Transcription failed (${response.status}).`;
    try {
      const parsed = JSON.parse(fallback);
      message = parsed?.error?.message ?? message;
    } catch {
      if (fallback) message = `${message} ${fallback}`;
    }
    throw new Error(message.trim());
  }

  const data = (await response.json()) as { text?: string };
  if (!data?.text) {
    throw new Error("No transcription returned. Please try again.");
  }

  return data.text;
}
