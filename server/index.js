require('dotenv').config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

const API_KEY = process.env.GEMINI_API_KEY || process.env.REACT_APP_GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
const BASE_URL =  "https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${API_KEY}";

app.post("/api/gemini", async (req, res) => {
  const { message } = req.body || {};
  if (!message) return res.status(400).json({ error: "Missing message in body" });

  if (!API_KEY) {
    return res.status(500).json({ error: "Server missing Gemini API key" });
  }

  try {
    const r = await axios.post(
      `${BASE_URL}?key=${API_KEY}`,
      { contents: [{ parts: [{ text: message }] }] },
      { headers: { "Content-Type": "application/json" }, timeout: 30000 }
    );

    const reply = r?.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!reply) return res.status(502).json({ error: "Empty reply from Gemini", raw: r.data });
    res.json({ reply });
  } catch (err) {
    console.error("Proxy error:", err?.response?.data || err.message);
    if (err.response) return res.status(err.response.status).json({ error: err.response.data });
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`Gemini proxy running on http://localhost:${PORT}`));
