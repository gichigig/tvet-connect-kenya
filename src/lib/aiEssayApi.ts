export async function detectAIEssay(text: string): Promise<number> {
  const res = await fetch('http://localhost:8000/detect', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  const data = await res.json();
  return data.ai_probability; // percentage
}
