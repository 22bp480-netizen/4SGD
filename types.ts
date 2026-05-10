import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function breakdownTask(task: string) {
  const prompt = `You are an expert helper for neurodivergent students. 
  Break down the following task into small, manageable, non-overwhelming steps. 
  For each step, explain why it's important or how to start. 
  Use a supportive and encouraging tone. 
  Return the response in valid JSON format with an array of objects called "steps", each step having "title" and "description".
  
  Task: ${task}`;

  const result = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt
  });
  
  const responseText = result.text || "";
  try {
    const cleanedJson = responseText.replace(/```json|```/g, "").trim();
    return JSON.parse(cleanedJson);
  } catch (error) {
    console.error("Failed to parse Gemini response", error);
    return { steps: [{ title: "Focus on the start", description: responseText }] };
  }
}

export async function getTutorAdvice(query: string, context?: string) {
  const prompt = `You are "Lumina AI", a compassionate tutor for neurodivergent students.
  The student is asking: "${query}"
  Context (if any): ${context || "None"}
  Provide a clear, simple, and friendly explanation. Break things down. Use bullet points where helpful.
  Avoid large walls of text. Be supportive.`;

  const result = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt
  });
  return result.text || "";
}

export async function getHabitFeedback(habits: any) {
  const prompt = `Based on the following daily healthy habits: ${JSON.stringify(habits)},
  give a short, positive, and encouraging feedback or one small tip for tomorrow.
  Keep it under 3 sentences. Tone should be gentle and kind.`;

  const result = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt
  });
  return result.text || "";
}
