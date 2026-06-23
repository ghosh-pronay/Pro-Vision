import { getFunctions, httpsCallable } from "firebase/functions";
import app from "./firebase";

const functions = getFunctions(app);

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY ?? "";

if (import.meta.env.DEV && GEMINI_API_KEY && GEMINI_API_KEY.length > 10) {
  console.warn(
    "Gemini API key detected in development. Ensure VITE_GEMINI_API_KEY is not committed to source control.",
  );
}

export interface GeminiMessage {
  role: "user" | "model";
  parts: string;
}

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
}

async function callGeminiProxy(payload: {
  contents: Array<{
    role: string;
    parts: Array<{
      text?: string;
      inlineData?: { mimeType: string; data: string };
    }>;
  }>;
  systemInstruction?: { parts: Array<{ text: string }> };
  generationConfig?: Record<string, unknown>;
}): Promise<GeminiResponse> {
  const proxyFn = httpsCallable(functions, "geminiProxy");
  const result = await proxyFn(payload);
  return result.data as GeminiResponse;
}

export async function generateGeminiResponse(
  messages: GeminiMessage[],
  systemPrompt?: string,
): Promise<string> {
  const contents = messages.map((m) => ({
    role: m.role,
    parts: [{ text: m.parts }],
  }));

  const systemInstruction = systemPrompt
    ? { systemInstruction: { parts: [{ text: systemPrompt }] } }
    : {};

  const generationConfig = {
    temperature: 0.7,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 1024,
  };

  try {
    const data = await callGeminiProxy({
      contents,
      ...systemInstruction,
      generationConfig,
    });

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      return "I received an empty response. Please try again.";
    }
    return text;
  } catch (error) {
    console.error("Gemini API call failed:", error);
    return "Unable to connect to AI service. Please check your internet connection and try again.";
  }
}

export async function analyzeImageWithGemini(
  imageBase64: string,
  prompt: string,
): Promise<string> {
  const base64Data = imageBase64.includes(",")
    ? imageBase64.split(",")[1]
    : imageBase64;

  const payload = {
    contents: [
      {
        role: "user" as const,
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Data,
            },
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: 1024,
    },
  };

  try {
    const data = await callGeminiProxy(payload);

    return (
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No analysis available."
    );
  } catch (error) {
    console.error("Gemini image analysis failed:", error);
    return "Unable to analyze image. Please try again.";
  }
}

export function isGeminiConfigured(): boolean {
  return !!GEMINI_API_KEY;
}
