import axios from "axios";

const API_KEY = "AIzaSyBCxvUMBiaWaQW9iCM5nsVAeOKUddTf76k";
const MODEL = "gemini-2.5-flash"; 
const BASE_URL = `https://generativelanguage.googleapis.com/v1/models/${MODEL}:generateContent`;

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Extract retry delay from error details (if present)
const getRetryDelay = (error) => {
  try {
    const retryInfo = error.response?.data?.error?.details?.find(
      d => d['@type'] === 'type.googleapis.com/google.rpc.RetryInfo'
    );
    if (retryInfo?.retryDelay) {
      const seconds = parseFloat(retryInfo.retryDelay.replace('s', ''));
      return seconds * 1000;
    }
  } catch (e) {
  }
  return null; // no specific delay provided
};

export const askGemini = async (message, retries = 3) => {
  // If an API key is present, call Google directly
  if (API_KEY) {
    try {
      const res = await axios.post(
        `${BASE_URL}?key=${API_KEY}`,
        {
          contents: [
            {
              parts: [{ text: message }]
            }
          ]
        },
        {
          headers: { "Content-Type": "application/json" },
          timeout: 30000
        }
      );

      const reply = res?.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!reply) {
        console.error("Gemini returned unexpected response:", res.data);
        return "Error getting response: empty reply";
      }
      return reply;
    } catch (error) {
      // Handle quota exceeded (429) with retry
      if (error.response?.status === 429 && retries > 0) {
        const delay = getRetryDelay(error) || 30000; // default 30s
        console.log(`Quota exceeded. Retrying in ${delay / 1000}s... (${retries} retries left)`);
        await wait(delay);
        return askGemini(message, retries - 1);
      }

      // Other errors
      console.error("Gemini request error:", error);
      if (error.response) {
        console.error("Response data:", error.response.data);
        return `Error getting response: ${error.response.status} ${JSON.stringify(
          error.response.data
        )}`;
      }
      return `Error getting response: ${error.message}`;
    }
  }

  // No client API key: fallback to proxy server
  const SERVER_URL = process.env.REACT_APP_SERVER_URL || "http://localhost:8080";
  try {
    const proxyRes = await axios.post(
      `${SERVER_URL}/api/gemini`,
      { message },
      { headers: { "Content-Type": "application/json" }, timeout: 30000 }
    );
    return proxyRes?.data?.reply || "Error getting response: empty reply from proxy";
  } catch (err) {
    console.error("Proxy request error:", err?.response?.data || err.message);
    if (err.response) return `Error getting response: ${JSON.stringify(err.response.data)}`;
    return `Error getting response: ${err.message}`;
  }
};