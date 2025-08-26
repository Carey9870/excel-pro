import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function generateExcelOutput(
  input: string,
  outputType: string
): Promise<string> {
  try {
    const model = ai.models;

    let prompt: string;
    switch (outputType) {
      case "formula":
        prompt = `Generate an Excel formula for the following request: "${input}". Return only the formula, starting with =. Ensure the formula is valid for Excel 2016+.`;
        break;
      case "vba":
        prompt = `Generate VBA code for Excel to accomplish: "${input}". Ensure the code is safe, avoids file I/O or network calls, and is compatible with Excel 2016+. Return only the VBA code, formatted cleanly with proper indentation.`;
        break;
      case "chart":
        prompt = `Generate VBA code to create an Excel chart for: "${input}". Specify chart type (e.g., xlPie, xlColumnClustered), data range, and styling in blue (#1E3A8A) and dark green (#064E3B). Ensure the code is compatible with Excel 2016+. Return only the VBA code, formatted cleanly with proper indentation.`;
        break;
      default:
        throw new Error("Invalid output type");
    }

    const response = await model.generateContent({
      model: "gemini-2.0-flash-001",
      contents: prompt,
    });

    if (!response.text) {
      throw new Error("No content generated");
    }

    return response.text.trim();
  } catch (error: any) {
    console.error("Gemini API error:", error.name, error.message, error.status);
    throw new Error("Failed to generate Excel output");
  }
}
