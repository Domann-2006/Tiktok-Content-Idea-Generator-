import 'dotenv/config'; // if using ES Modules
import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const GROQ_API_KEY = process.env.GROQ_API_KEY;

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

app.listen(3000, () => console.log("Server running on http://localhost:3000"));