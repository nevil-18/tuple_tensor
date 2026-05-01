const EMBEDDING_DIM = 128;

function normalize(vec) {
  const magnitude = Math.sqrt(vec.reduce((sum, value) => sum + value * value, 0));
  if (magnitude === 0) {
    return vec;
  }
  return vec.map((value) => value / magnitude);
}

function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

export function embedText(text) {
  const vec = new Array(EMBEDDING_DIM).fill(0);
  const tokens = tokenize(text);

  for (const token of tokens) {
    let hash = 2166136261;
    for (let i = 0; i < token.length; i += 1) {
      hash ^= token.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    const index = Math.abs(hash) % EMBEDDING_DIM;
    vec[index] += 1;
  }

  return normalize(vec);
}

export function cosineSimilarity(a, b) {
  let dot = 0;
  for (let i = 0; i < a.length; i += 1) {
    dot += a[i] * b[i];
  }
  return dot;
}

export function parseEmbedding(raw) {
  return JSON.parse(raw);
}
