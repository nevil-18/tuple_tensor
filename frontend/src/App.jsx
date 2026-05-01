import { useEffect, useMemo, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";
const API_KEY = import.meta.env.VITE_API_KEY || "";

const initialDoc = {
  title: "",
  category: "",
  content: ""
};

function hybridScoreWidth(score) {
  const max = 1.15;
  return Math.min(100, Math.max(4, (score / max) * 100));
}

export default function App() {
  const [tab, setTab] = useState("search");
  const [doc, setDoc] = useState(initialDoc);
  const [documents, setDocuments] = useState([]);
  const [sqlFilter, setSqlFilter] = useState({ category: "", searchTerm: "" });
  const [hybridQuery, setHybridQuery] = useState({ query: "", category: "", limit: 5 });
  const [hybridResults, setHybridResults] = useState([]);
  const [status, setStatus] = useState("");

  function authHeaders(extra = {}) {
    const headers = { ...extra };
    if (API_KEY) {
      headers["x-api-key"] = API_KEY;
    }
    return headers;
  }

  async function loadDocuments(filter = sqlFilter) {
    const params = new URLSearchParams();
    if (filter.category) params.set("category", filter.category);
    if (filter.searchTerm) params.set("searchTerm", filter.searchTerm);

    const res = await fetch(`${API_BASE}/documents?${params.toString()}`, {
      headers: authHeaders()
    });
    const data = await res.json();
    setDocuments(data);
  }

  useEffect(() => {
    loadDocuments().catch(() => setStatus("Failed to load documents."));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (tab === "browse") {
      loadDocuments(sqlFilter).catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  async function handleCreateDocument(e) {
    e.preventDefault();
    setStatus("");

    const res = await fetch(`${API_BASE}/documents`, {
      method: "POST",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(doc)
    });

    if (!res.ok) {
      setStatus("Document creation failed. Fill all fields.");
      return;
    }

    setDoc(initialDoc);
    setStatus("Document added successfully.");
    await loadDocuments();
  }

  async function handleSqlFilter(e) {
    e.preventDefault();
    await loadDocuments(sqlFilter);
  }

  async function handleHybridSearch(e) {
    e.preventDefault();
    setStatus("");

    const res = await fetch(`${API_BASE}/search/hybrid`, {
      method: "POST",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(hybridQuery)
    });

    if (!res.ok) {
      setStatus("Search failed. Enter a query.");
      return;
    }

    const data = await res.json();
    setHybridResults(data.results || []);
  }

  const categoryOptions = useMemo(() => {
    const all = new Set(documents.map((item) => item.category));
    return Array.from(all);
  }, [documents]);

  const statusTone = status && /fail|error/i.test(status) ? "error" : "success";

  const tabs = [
    { id: "search", label: "Search" },
    { id: "browse", label: "Browse" },
    { id: "add", label: "Add document" }
  ];

  return (
    <div className="shell">
      <header className="masthead">
        <div className="masthead-inner">
        <div className="masthead-brand">
          <div className="masthead-symbol" aria-hidden="true">
            <svg
              className="logo-tt"
              width="40"
              height="36"
              viewBox="0 0 40 36"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="ttFace" x1="0" y1="6" x2="38" y2="34" gradientUnits="userSpaceOnUse">
                  <stop offset="0" stopColor="#7bf3e2" />
                  <stop offset="0.35" stopColor="#00f5d4" />
                  <stop offset="0.65" stopColor="#9d4edd" />
                  <stop offset="1" stopColor="#1a0a2e" />
                </linearGradient>
                <linearGradient id="ttRim" x1="10" y1="10" x2="32" y2="28" gradientUnits="userSpaceOnUse">
                  <stop offset="0" stopColor="#ffffff" stopOpacity="0.6" />
                  <stop offset="0.5" stopColor="#ffffff" stopOpacity="0.1" />
                  <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="ttGlow" x1="6" y1="33" x2="34" y2="37" gradientUnits="userSpaceOnUse">
                  <stop offset="0" stopColor="#00f5d4" stopOpacity="0.55" />
                  <stop offset="1" stopColor="#9d4edd" stopOpacity="0" />
                </linearGradient>
              </defs>
              {/* Fused TT lockup: adjacent caps share the center edge (zero gap ligature). */}
              <g className="logo-tt-depth" transform="translate(5.5 6.5)">
                <path
                  fill="#031a28"
                  fillOpacity="0.55"
                  d="M 6 7 H 19 V 11 H 16 V 32 H 11 V 11 H 6 Z M 19 7 H 32 V 11 H 29 V 32 H 24 V 11 H 19 Z"
                />
              </g>
              <g className="logo-tt-depth" transform="translate(3 4.5)">
                <path
                  fill="#062238"
                  fillOpacity="0.75"
                  d="M 6 7 H 19 V 11 H 16 V 32 H 11 V 11 H 6 Z M 19 7 H 32 V 11 H 29 V 32 H 24 V 11 H 19 Z"
                />
              </g>
              <g className="logo-tt-depth" transform="translate(1.5 2)">
                <path
                  fill="#0a3048"
                  fillOpacity="0.9"
                  d="M 6 7 H 19 V 11 H 16 V 32 H 11 V 11 H 6 Z M 19 7 H 32 V 11 H 29 V 32 H 24 V 11 H 19 Z"
                />
              </g>
              <ellipse cx="19" cy="35" rx="14" ry="3" fill="url(#ttGlow)" />
              <path
                fill="url(#ttFace)"
                stroke="rgba(255,255,255,0.32)"
                strokeWidth="0.45"
                strokeLinejoin="miter"
                d="M 6 7 H 19 V 11 H 16 V 32 H 11 V 11 H 6 Z M 19 7 H 32 V 11 H 29 V 32 H 24 V 11 H 19 Z"
              />
              <path fill="rgba(0,40,50,0.45)" d="M 18 7 h 2 V 33 h -2 Z" />
              <path
                fill="none"
                stroke="url(#ttRim)"
                strokeWidth="1.1"
                strokeLinecap="round"
                opacity="0.85"
                d="M 8 9 H 29 M 14 13 V 30 M 25 13 V 30"
              />
            </svg>
          </div>
          <span className="masthead-title">TupleTensor</span>
        </div>

        <div className="hud-strip" aria-hidden="true">
          <span className="hud-tag">
            <span className="hud-dot" />
            HYBRID_SOC
          </span>
          <span className="hud-tag hud-tag--ok">RET_OK</span>
          <span className="hud-tag">SQLITE_NODE</span>
        </div>

        <div
          className="segmented"
          role="tablist"
          aria-label="Workspace"
        >
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              id={`tab-${t.id}`}
              aria-controls={`panel-${t.id}`}
              aria-selected={tab === t.id}
              className={`segment ${tab === t.id ? "segment--active" : ""}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
        </div>
      </header>

      <main className="main">
        {tab === "search" && (
          <section className="hero-block">
            <h1 className="hero-headline">
              <span className="hero-line">Retrieval that mixes</span>
              <br />
              <span className="hero-muted">structure and meaning.</span>
            </h1>
            <p className="hero-copy">
              // SECURE_INDEX · SQL_FILTER + EMBED_SIG // Dual-path retrieval. Compartmentalized
              filters. Semantic rank on cleared corpus.
            </p>
          </section>
        )}

        <section
          className="panel"
          role="tabpanel"
          id={
            tab === "add"
              ? "panel-add"
              : tab === "browse"
                ? "panel-browse"
                : "panel-search"
          }
          aria-labelledby={`tab-${tab}`}
          aria-label={
            tab === "add"
              ? "Add document"
              : tab === "browse"
                ? "Browse documents"
                : "Fused search"
          }
        >
          {tab === "add" && (
            <>
              <div className="panel-head">
                <h2 className="panel-title">New document</h2>
                <p className="panel-desc">Stores a row and its embedding together.</p>
              </div>
              <form className="form" onSubmit={handleCreateDocument}>
                <label className="label">Title</label>
                <input
                  placeholder="Title"
                  value={doc.title}
                  onChange={(e) => setDoc((d) => ({ ...d, title: e.target.value }))}
                />
                <label className="label">Category</label>
                <input
                  placeholder="Category"
                  value={doc.category}
                  onChange={(e) => setDoc((d) => ({ ...d, category: e.target.value }))}
                />
                <label className="label">Content</label>
                <textarea
                  placeholder="Paste or type the passage to index."
                  value={doc.content}
                  onChange={(e) => setDoc((d) => ({ ...d, content: e.target.value }))}
                />
                <button type="submit" className="btn btn-primary btn-block">
                  Save
                </button>
              </form>
            </>
          )}

          {tab === "browse" && (
            <>
              <div className="panel-head">
                <h2 className="panel-title">Browse</h2>
                <p className="panel-desc">
                  Narrow by category or text. Results follow in full below—no cramped scroll areas.
                </p>
              </div>
              <form className="form form-inline" onSubmit={handleSqlFilter}>
                <div className="field-grow">
                  <label className="label">Category</label>
                  <input
                    placeholder="e.g. rag"
                    value={sqlFilter.category}
                    onChange={(e) =>
                      setSqlFilter((f) => ({ ...f, category: e.target.value }))
                    }
                  />
                </div>
                <div className="field-grow">
                  <label className="label">Keyword</label>
                  <input
                    placeholder="In title or content"
                    value={sqlFilter.searchTerm}
                    onChange={(e) =>
                      setSqlFilter((f) => ({ ...f, searchTerm: e.target.value }))
                    }
                  />
                </div>
                <div className="field-action">
                  <label className="label visually-hidden">Apply</label>
                  <button type="submit" className="btn btn-primary btn-pill">
                    Apply
                  </button>
                </div>
              </form>

              <ul className="results">
                {documents.length === 0 && (
                  <li className="result-empty">No documents match these filters.</li>
                )}
                {documents.map((item) => (
                  <li key={item.id} className="result-row">
                    <div className="result-top">
                      <span className="result-title">{item.title}</span>
                      <span className="result-badge">{item.category}</span>
                    </div>
                    <p className="result-body">{item.content}</p>
                  </li>
                ))}
              </ul>
            </>
          )}

          {tab === "search" && (
            <>
              <div className="panel-head">
                <h2 className="panel-title">Fused search</h2>
                <p className="panel-desc">
                  Ask in plain language. Optional category narrows candidates before scoring.
                </p>
              </div>
              <form className="form" onSubmit={handleHybridSearch}>
                <label className="label">Ask anything</label>
                <input
                  className="input-large"
                  placeholder="What are you trying to find?"
                  value={hybridQuery.query}
                  onChange={(e) =>
                    setHybridQuery((q) => ({ ...q, query: e.target.value }))
                  }
                />
                <div className="form-row">
                  <div className="field-grow">
                    <label className="label">Category</label>
                    <select
                      value={hybridQuery.category}
                      onChange={(e) =>
                        setHybridQuery((q) => ({ ...q, category: e.target.value }))
                      }
                    >
                      <option value="">All</option>
                      {categoryOptions.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="field-narrow">
                    <label className="label">Results</label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={hybridQuery.limit}
                      onChange={(e) =>
                        setHybridQuery((q) => ({
                          ...q,
                          limit: Number(e.target.value || 5)
                        }))
                      }
                    />
                  </div>
                  <div className="field-action field-action-search">
                    <label className="label visually-hidden">Search</label>
                    <button type="submit" className="btn btn-primary btn-pill btn-search">
                      Search
                    </button>
                  </div>
                </div>
              </form>

              <ul className="results">
                {hybridResults.length === 0 && (
                  <li className="result-empty">
                    Results appear here after you search.
                  </li>
                )}
                {hybridResults.map((item, idx) => (
                  <li key={`${item.id}-${idx}`} className="result-row result-row--score">
                    <div className="result-top">
                      <span className="result-title">{item.title}</span>
                      <span className="result-badge">{item.category}</span>
                    </div>
                    <p className="result-body">{item.content}</p>
                    <div className="score-line">
                      <div className="score-track" aria-hidden="true">
                        <div
                          className="score-fill"
                          style={{ width: `${hybridScoreWidth(item.hybridScore)}%` }}
                        />
                      </div>
                      <span className="score-label">
                        Fuse {item.hybridScore.toFixed(3)}
                        <span className="score-divider">·</span>
                        Vector {item.vectorScore.toFixed(3)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>

        {status && (
          <p className={`toast toast--${statusTone}`}>{status}</p>
        )}
      </main>

      <footer className="foot">
        <span>TupleTensor · AIR_GAPPED_UI · v0 · NO_LOG_EXFIL</span>
      </footer>
    </div>
  );
}
