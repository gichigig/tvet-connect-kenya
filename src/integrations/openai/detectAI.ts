// OpenAI AI Essay Detector
// Usage: import { detectAIEssay } from './detectAI';

export async function detectAIEssay(essayText: string): Promise<{ isAI: boolean; score: number; reason: string }> {
  const apiKey = import.meta.env.VITE_REACT_APP_OPENAI_API_KEY || import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) throw new Error("OpenAI API key not set in environment variables");
  const endpoint = "https://api.openai.com/v1/chat/completions";

  const systemPrompt = `You are an AI essay detector. Given a student's essay, analyze and return if it is likely AI-generated. Respond with a JSON object: { isAI: true/false, score: 0-100, reason: "short explanation" }.`;

  const body = {
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: essayText }
    ],
    max_tokens: 100,
    temperature: 0.2
  };

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) throw new Error("OpenAI API error");
  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  try {
    const result = JSON.parse(content);
    return result;
  } catch {
    return { isAI: false, score: 0, reason: "Could not parse OpenAI response." };
  }
}
