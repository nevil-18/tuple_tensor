import { all, initDb, run } from "./db.js";
import { getEmbedding } from "./embedding.js";

const seedDocuments = [
  {
    title: "Prompt Engineering Best Practices",
    category: "llm",
    content:
      "Good prompts are specific, include role context, constraints, and examples. Use iterative refinement and evaluation datasets."
  },
  {
    title: "SQL Query Optimization",
    category: "database",
    content:
      "Use indexes on filtered columns, avoid select star for wide tables, and inspect query plans regularly to reduce execution cost."
  },
  {
    title: "Vector Search Fundamentals",
    category: "ai",
    content:
      "Vector databases retrieve semantically similar items by comparing embedding vectors. Similarity measures include cosine similarity."
  },
  {
    title: "Hybrid Retrieval for RAG",
    category: "rag",
    content:
      "Hybrid retrieval combines keyword or SQL filters with embedding-based search to improve relevance and reduce hallucination."
  }
];

async function runSeed() {
  await initDb();

  for (const doc of seedDocuments) {
    run("INSERT INTO documents(title, category, content) VALUES (?, ?, ?)", [
      doc.title,
      doc.category,
      doc.content
    ]);
    const inserted = all("SELECT last_insert_rowid() AS id");
    const documentId = inserted[0].id;
    const embedding = await getEmbedding(`${doc.title} ${doc.content}`);
    run("INSERT OR REPLACE INTO vectors(document_id, embedding) VALUES (?, ?)", [
      documentId,
      JSON.stringify(embedding)
    ]);
  }

  console.log(`Seeded ${seedDocuments.length} documents.`);
}

runSeed().catch((error) => {
  console.error("Seeding failed:", error.message);
  process.exit(1);
});
