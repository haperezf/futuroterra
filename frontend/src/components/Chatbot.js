import React, { useState } from "react";
import { sendChatMessage } from "../services/apiChatbot";

function Chatbot() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = { role: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    try {
      const resp = await sendChatMessage(input.trim());
      if (resp.response) {
        const botMsg = { role: "bot", text: resp.response };
        setMessages((prev) => [...prev, botMsg]);
      } else if (resp.error) {
        const errorMsg = { role: "bot", text: `Error: ${resp.error}` };
        setMessages((prev) => [...prev, errorMsg]);
      }
    } catch (error) {
      const errorMsg = { role: "bot", text: `Error: ${error.message}` };
      setMessages((prev) => [...prev, errorMsg]);
    }
  };

  return (
    <div className="chatbot-container">
      <h2>Chatbot FuturoTerra</h2>
      <div className="chat-history">
        {messages.map((m, idx) => (
          <div key={idx} className={`chat-message ${m.role}`}>
            <strong>{m.role === "user" ? "Tú" : "Bot"}:</strong> {m.text}
          </div>
        ))}
      </div>
      <div className="chat-input">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escribe tu mensaje..."
        />
        <button onClick={handleSend}>Enviar</button>
      </div>
    </div>
  );
}

export default Chatbot;
