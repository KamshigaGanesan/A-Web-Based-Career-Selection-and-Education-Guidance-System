import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function listModels() {
  try {
    const models = await ai.models.list();
    console.log("AVAILABLE MODELS (V2):");
    models.forEach(model => {
      console.log(`- ${model.name} (${model.description || "No description"})`);
    });
  } catch (error) {
    console.error("Error listing models (V2):", error.message || error);
  }
}

listModels();
