import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { all, initDb, run } from "./db.js";
import { getEmbedding } from "./embedding.js";
import { cosineSimilarity, parseEmbedding } from "./vector.js";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 4000);

app.use(cors());
app.use(express.json());

function requireApiKey(req, res, next) {
  const expected = process.env.APP_API_KEY;
  if (!expected) {
    return next();
  }

  const received = req.headers["x-api-key"];
  if (!received || received !== expected) {
    return res.status(401).json({
      error: "Unauthorized. Provide a valid x-api-key header."
    });
  }

  return next();
}

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "hybrid-sql-vector-backend" });
});

app.post("/documents", requireApiKey, async (req, res) => {
  const { title, category, content } = req.body;
  if (!title || !category || !content) {
    return res.status(400).json({
      error: "title, category, and content are required"
    });
  }

  try {
    run("INSERT INTO documents(title, category, content) VALUES (?, ?, ?)", [
      title,
      category,
      content
    ]);
    const inserted = all("SELECT last_insert_rowid() AS id");
    const documentId = inserted[0].id;
    const embedding = await getEmbedding(`${title} ${content}`);

    run("INSERT INTO vectors(document_id, embedding) VALUES (?, ?)", [
      documentId,
      JSON.stringify(embedding)
    ]);

    return res.status(201).json({
      id: documentId,
      title,
      category,
      content
    });
  } catch (error) {
    return res.status(500).json({
      error: "Failed to embed and store document.",
      details: error.message
    });
  }
});

app.get("/documents", (req, res) => {
  const category = req.query.category;
  const searchTerm = req.query.searchTerm;

  let query = "SELECT * FROM documents WHERE 1=1";
  const params = [];

  if (category) {
    query += " AND category = ?";
    params.push(category);
  }

  if (searchTerm) {
    query += " AND (title LIKE ? OR content LIKE ?)";
    params.push(`%${searchTerm}%`, `%${searchTerm}%`);
  }

  query += " ORDER BY id DESC";
  const docs = all(query, params);
  return res.json(docs);
});

app.post("/search/hybrid", requireApiKey, async (req, res) => {
  const { query, category, limit = 5 } = req.body;
  if (!query) {
    return res.status(400).json({ error: "query is required" });
  }

  let sql = `
    SELECT d.id, d.title, d.category, d.content, v.embedding
    FROM documents d
    JOIN vectors v ON v.document_id = d.id
    WHERE 1=1
  `;
  const params = [];

  if (category) {
    sql += " AND d.category = ?";
    params.push(category);
  }

  let rows;
  let queryEmbedding;
  try {
    rows = all(sql, params);
    queryEmbedding = await getEmbedding(query);
  } catch (error) {
    return res.status(500).json({
      error: "Hybrid search failed.",
      details: error.message
    });
  }

  const scored = rows
    .map((row) => {
      const storedEmbedding = parseEmbedding(row.embedding);
      const vectorScore = cosineSimilarity(queryEmbedding, storedEmbedding);
      const keywordBoost =
        row.title.toLowerCase().includes(query.toLowerCase()) ||
        row.content.toLowerCase().includes(query.toLowerCase())
          ? 0.15
          : 0;

      return {
        id: row.id,
        title: row.title,
        category: row.category,
        content: row.content,
        vectorScore,
        hybridScore: vectorScore + keywordBoost
      };
    })
    .sort((a, b) => b.hybridScore - a.hybridScore)
    .slice(0, Number(limit));

  return res.json({
    query,
    category: category || null,
    count: scored.length,
    results: scored
  });
});

initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Backend running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Database initialization failed:", error.message);
    process.exit(1);
  });
