import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Define response type for TS
interface PerplexityResponse {
  choices?: {
    message?: {
      content?: string;
    };
  }[];
}

// Health check
app.get("/api/perplexity/status", (_req, res) => {
  res.json({ status: "ok", message: "Perplexity backend is active ✅" });
});

// Main Perplexity AI endpoint
app.post("/api/perplexity/ask", async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).send("Prompt is required");

  try {
    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "sonar",
        messages: [
          {
            role: "system",
            content: `You are Tiru AI — a friendly, concise AI assistant.
Always reply with clean, short, human-like text.
Do not include markdown, JSON, quotes, or extra explanation.`,
          },
          { role: "user", content: prompt },
        ],
      }),
    });

    const data = (await response.json()) as PerplexityResponse;

    const text =
      data.choices?.[0]?.message?.content?.trim() ||
      "No response from Perplexity";

    res.send(text);
  } catch (error) {
    console.error("Perplexity API error:", error);
    res.status(500).send("Error connecting to Perplexity API");
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Perplexity backend running at http://localhost:${PORT}`);
});
