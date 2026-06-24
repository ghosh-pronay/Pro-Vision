const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY ?? "";

const GEMINI_BASE =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

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

async function callGemini(payload: {
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
  if (!GEMINI_API_KEY) {
    throw new Error("Gemini API key not configured");
  }
  const response = await fetch(`${GEMINI_BASE}?key=${GEMINI_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error?.error?.message || `Gemini API error ${response.status}`,
    );
  }
  return response.json();
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
    const data = await callGemini({
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
    if (!GEMINI_API_KEY) {
      return "AI is not configured. Please contact support.";
    }
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
    const data = await callGemini(payload);

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
