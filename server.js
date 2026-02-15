import 'dotenv/config'; // if using ES Modules
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

// Serve static files (HTML, CSS, JS)
app.use(express.static(__dirname));

// Homepage route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});
console.log("GROQ_API_KEY =", GROQ_API_KEY);
const GROQ_API_KEY = process.env.GROQ_API_KEY;

// TikTok idea generator API
app.post("/generate", async (req, res) => {
  const { niche, style, count } = req.body;

  try {
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "system",
              content: "You are a creative TikTok content strategist. Respond with clear, actionable ideas only."
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

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate ideas" });
  }
});

// 404 route (catch-all)
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, '404.html'));
});

// Use Render’s port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
