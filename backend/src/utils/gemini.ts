import dotenv from 'dotenv';
import axios from 'axios'; 

dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;
const MODEL = "gemini-2.5-flash";

export async function callGemini(promptText: string) {
  if (!API_KEY) {
    throw new Error("❌ Faltante: GEMINI_API_KEY en archivo .env");
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

  try {
    console.log(`🤖 Consultando IA (${MODEL})...`);
    
    const response = await axios.post(url, {
      contents: [{
        parts: [{ text: promptText }]
      }]
    }, {
      headers: { 'Content-Type': 'application/json' }
    });

    // Extraer el texto de la respuesta de Google
    return response.data.candidates?.[0]?.content?.parts?.[0]?.text || "";

  } catch (error: any) {
    // Manejo robusto de errores
    if (error.response) {
      const status = error.response.status;
      const errorBody = JSON.stringify(error.response.data);
      
      console.error(`❌ Error Google [${status}]:`, error.response.data);

      if (status === 404) {
         throw new Error(`El modelo '${MODEL}' no fue encontrado. Verifica la API Key y el modelo.`);
      }
      throw new Error(`Google Error (${status}): ${errorBody}`);
    } else if (error.request) {
      throw new Error("No hubo respuesta de Google. Revisa tu conexión a internet.");
    } else {
      throw new Error(`Error interno: ${error.message}`);
    }
  }
}
