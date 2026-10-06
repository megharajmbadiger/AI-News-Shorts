require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { GoogleGenAI } = require("@google/genai");

const app = express();
const PORT = 5000;

// Gemini client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// Middleware
app.use(cors());
app.use(express.json());

// ================================
// FORMAT PUBLISHED TIME
// ================================

function formatTime(dateString) {
  const published = new Date(dateString);
  const now = new Date();

  const diffMs = now - published;
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffMinutes < 60) {
    return `${Math.max(1, diffMinutes)} min ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);

  if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  }

  const diffDays = Math.floor(diffHours / 24);

  return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
}

// ================================
// HEALTH CHECK
// ================================

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "AI News Shorts API is running",
  });
});

// ================================
// SEARCH NEWS
// ================================

app.get("/api/search", async (req, res) => {
  const query = req.query.q;

  if (!query || !query.trim()) {
    return res.status(400).json({
      success: false,
      message: "Please provide a search query.",
    });
  }

  try {
    const url =
      `https://newsapi.org/v2/everything?` +
      `q=${encodeURIComponent(query)}` +
      `&language=en` +
      `&sortBy=publishedAt` +
      `&pageSize=6`;

    const response = await fetch(url, {
      headers: {
        "X-Api-Key": process.env.NEWS_API_KEY,
      },
    });

    const data = await response.json();

    if (!response.ok || data.status !== "ok") {
      console.error("NewsAPI error:", data);

      return res.status(500).json({
        success: false,
        message: data.message || "Failed to fetch news.",
      });
    }

    const results = data.articles.map((article) => ({
      title: article.title,
      source: article.source?.name || "Unknown source",
      time: formatTime(article.publishedAt),
      summary:
        article.description ||
        "No summary available for this article.",
      url: article.url,
      image: article.urlToImage || null,
    }));

    res.json({
      success: true,
      query: query,
      results: results,
    });
  } catch (error) {
    console.error("Search error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch news.",
    });
  }
});

// ================================
// AI NEWS SHORT - GEMINI
// ================================

app.post("/api/summarize", async (req, res) => {
  const { title, summary, source } = req.body;

  if (!title || !summary) {
    return res.status(400).json({
      success: false,
      message: "Title and summary are required.",
    });
  }

  try {
    const prompt = `
You are an AI news editor for an app called "AI News Shorts".

Create a concise, engaging news short from the information below.

Title:
${title}

Source:
${source || "Unknown"}

Article summary:
${summary}

Return the response in exactly this structure:

HOOK:
One short sentence that grabs attention.

WHAT HAPPENED:
2-3 simple sentences explaining the news.

WHY IT MATTERS:
1-2 sentences explaining why this is important.

KEY TAKEAWAY:
One short sentence summarizing the main point.

Rules:
- Use simple English.
- Be factual.
- Do not invent information.
- Do not add facts that are not present in the provided information.
- Keep the entire response suitable for a 30-45 second news short.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents: prompt,
    });

    const aiText = response.text;

    res.json({
      success: true,
      short: aiText,
    });
  } catch (error) {
    console.error("Gemini error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to generate AI news short.",
    });
  }
});

// ================================
// START SERVER
// ================================

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});