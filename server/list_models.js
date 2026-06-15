import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
  try {
    const modelList = await genAI.listModels();
    console.log("AVAILABLE MODELS:");
    console.log(JSON.stringify(modelList, null, 2));
  } catch (error) {
    console.error("Error listing models:", error.message);
  }
}

listModels();
