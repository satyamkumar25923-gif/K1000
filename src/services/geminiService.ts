import { GoogleGenAI } from "@google/genai";

export async function searchExternalJobs(query: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
  
  const prompt = `
    Search for the 10 most recent and relevant internship or entry-level job postings for college students based on this query: "${query}".
    Focus on reputable sites like LinkedIn, Indeed, Glassdoor, and company career pages.
    
    For each job found, extract:
    1. title: The job title.
    2. company: The company name.
    3. location: The job location.
    4. type: Either "Internship" or "Full-time".
    5. workMode: "Remote", "Onsite", or "Hybrid".
    6. source: The name of the platform where it was found (e.g., LinkedIn).
    7. url: The direct link to the job posting or application page.
    8. description: A brief 1-2 sentence summary of the role.
    
    Return the results as a JSON array of objects. Do not include any markdown formatting or extra text, just the raw JSON array.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
      },
    });

    const text = response.text;
    if (!text) return [];
    
    return JSON.parse(text.trim());
  } catch (error) {
    console.error("Error searching external jobs:", error);
    return [];
  }
}
