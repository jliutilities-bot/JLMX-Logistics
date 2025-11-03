import { GoogleGenAI } from "@google/genai";
import { Solicitud } from "../types";

// FIX: Per coding guidelines, initialize GoogleGenAI directly assuming API_KEY is present in environment variables.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });


export const geminiService = {
  analyzeShipment: async (material: string, packageType: string): Promise<string> => {
    // FIX: Removed conditional check for `ai` instance as the API is assumed to be available.
    try {
      const prompt = `Analyze the following logistics request details and provide a brief, one-sentence handling suggestion. Material: "${material}", Package Type: "${packageType}". Focus on potential risks or special requirements. If it's standard, say that.`;
      
      const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
      });

      return response.text.trim();
    } catch (error) {
      console.error("Error analyzing shipment with Gemini:", error);
      return "Could not analyze shipment details.";
    }
  },

  summarizePendingMovements: async (solicitudes: Solicitud[]): Promise<string> => {
    // FIX: Removed conditional check for `ai` instance as the API is assumed to be available.
    if (solicitudes.length === 0) return "No pending movements to summarize.";
    
    try {
        const prompt = `
            You are a logistics coordinator assistant. Based on the following list of pending material movements, provide a concise summary for the daily briefing.
            Highlight any potential bottlenecks (e.g., multiple requests to the same destination), urgent requests (older ones), and provide a general overview of the day's tasks.
            Format the output as clean markdown with headings and bullet points.

            Current Date: ${new Date().toLocaleDateString()}

            Pending movements:
            ${solicitudes.map(s => `- Tracking: ${s.tracking}, From: ${s.origen}, To: ${s.destino}, Material: ${s.material}, Status: ${s.status}, Requested: ${s.fechaHoraSolicitud.toLocaleString()}`).join('\n')}
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
        });

        return response.text;
    } catch (error) {
        console.error("Error summarizing movements with Gemini:", error);
        return "Could not generate summary.";
    }
  }
};