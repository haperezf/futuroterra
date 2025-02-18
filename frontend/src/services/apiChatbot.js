import axios from "axios";

// Si no existe la variable de entorno REACT_APP_CHATBOT_URL,
// por defecto usa "http://localhost:6000"
const CHATBOT_URL = "http://localhost:6100";

/**
 * Envía un mensaje al chatbot.
 * @param {string} message - El texto que ingresa el usuario.
 * @returns {Promise<object>} - Respuesta del chatbot: { response: "...", error?: "..."}
 */
export async function sendChatMessage(message) {
  // Hacemos una petición POST a /chat con el cuerpo { message: "..." }
  const resp = await axios.post(`${CHATBOT_URL}/chat`, { message });
  // El backend debe devolver algo como { response: "..." }
  return resp.data;
}
