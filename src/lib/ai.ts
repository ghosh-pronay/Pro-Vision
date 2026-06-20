const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

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

export async function generateGeminiResponse(
  messages: GeminiMessage[],
  systemPrompt?: string,
): Promise<string> {
  if (!GEMINI_API_KEY) {
    return "AI is not configured. Add your Gemini API key to VITE_GEMINI_API_KEY in .env.local to enable real AI coaching.";
  }

  const contents = messages.map((m) => ({
    role: m.role,
    parts: [{ text: m.parts }],
  }));

  const systemInstruction = systemPrompt
    ? { systemInstruction: { parts: [{ text: systemPrompt }] } }
    : {};

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents,
          ...systemInstruction,
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
        }),
      },
    );

    if (!res.ok) {
      const error = await res.text();
      console.error("Gemini API error:", error);
      return "Sorry, I encountered an error processing your request. Please try again.";
    }

    const data: GeminiResponse = await res.json();
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
  if (!GEMINI_API_KEY) {
    return "AI image analysis is not configured. Add your Gemini API key to VITE_GEMINI_API_KEY in .env.local.";
  }

  const base64Data = imageBase64.includes(",")
    ? imageBase64.split(",")[1]
    : imageBase64;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
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
        }),
      },
    );

    if (!res.ok) {
      return "Image analysis failed. Please try again.";
    }

    const data: GeminiResponse = await res.json();
    return (
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No analysis available."
    );
  } catch {
    return "Unable to analyze image. Please try again.";
  }
}

export function isGeminiConfigured(): boolean {
  return !!GEMINI_API_KEY;
}
