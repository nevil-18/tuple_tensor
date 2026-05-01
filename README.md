# TupleTensor: SQL + Vector Retrieval Architecture for LLM Applications

This project is a full-stack starter built from scratch with:

- **Backend:** Node.js + Express + SQLite (`better-sqlite3`)
- **Vector Layer:** Pluggable embedding provider (`local` or `OpenAI`) + cosine similarity retrieval
- **Frontend:** React + Vite

TupleTensor demonstrates **hybrid retrieval**:

1. Structured filtering and lookup through SQL
2. Semantic similarity ranking through vector embeddings
3. Combined hybrid score for better relevance

## Security + Embeddings

- API key auth is supported through `APP_API_KEY` and request header `x-api-key`.
- Embedding provider is controlled by `EMBEDDING_PROVIDER`.
  - `local`: hash-based local embeddings (no external API)
  - `openai`: real embeddings via OpenAI API

## Project Structure

```text
tuple_tensor/
  backend/
    data/
    src/
      db.js
      seed.js
      server.js
      vector.js
  frontend/
    src/
      App.jsx
      main.jsx
      styles.css
```

## Run Backend

```bash
cd backend
npm install
copy .env.example .env
npm run seed
npm run dev
```

Backend API runs on `http://localhost:4000`.

## Run Frontend

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

Frontend runs on `http://localhost:5173`.

## API Endpoints

- `GET /health` - basic health check
- `POST /documents` - insert document and embedding
- `GET /documents?category=&searchTerm=` - SQL filtering
- `POST /search/hybrid` - hybrid semantic search

Example request:

```json
{
  "query": "how to improve rag retrieval quality",
  "category": "rag",
  "limit": 5
}
```

## Docker Run

From project root:

```bash
docker compose up --build
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:4000`
