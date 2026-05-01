import { embedText as localEmbedText } from "./vector.js";

const OPENAI_EMBEDDING_MODEL = process.env.OPENAI_EMBEDDING_MODEL || "text-embedding-3-small";

async function embedWithOpenAI(text) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is missing.");
  }

  const response = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: OPENAI_EMBEDDING_MODEL,
      input: text
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI embedding failed: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  return data.data[0].embedding;
}

export async function getEmbedding(text) {
  const provider = (process.env.EMBEDDING_PROVIDER || "local").toLowerCase();
  if (provider === "openai") {
    return embedWithOpenAI(text);
  }
  return localEmbedText(text);
}

