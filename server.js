import 'dotenv/config';
import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

app.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'index.html'));
});

const GROQ_API_KEY = process.env.GROQ_API_KEY;

// ===============================
// TikTok Idea Generator API
// ===============================
app.post("/generate", async (req, res) => {
  const { niche, style, count } = req.body;

  if (!GROQ_API_KEY) {
    console.error("GROQ_API_KEY is missing!");
    return res.status(500).json({ error: "Missing GROQ API key" });
  }

  try {
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "system",
              content: "You are a creative TikTok content strategist. Return numbered ideas only."
            },
            {
              role: "user",
              content: `Generate ${count} TikTok ideas for ${niche} in ${style} style`
            }
          ],
          temperature: 0.8,
          max_tokens: 2000
        })
      }
    );

    if (!response.ok) {
      const text = await response.text();
      console.error("Groq API error:", text);
      return res.status(500).json({ error: "Groq API request failed" });
    }

    const data = await response.json();
    res.json(data);

  } catch (err) {
    console.error("Server crashed:", err);
    res.status(500).json({ error: "Server crashed" });
  }
});

// Catch-all route
app.use((req, res) => {
  res.status(404).sendFile(path.resolve(__dirname, '404.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
