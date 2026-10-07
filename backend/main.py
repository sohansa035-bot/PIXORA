from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from backend.api.ingest import router as ingest_router

app = FastAPI(title="PIXORA", description="Evidence-Aware Digital Image Forensic Investigation System")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ingest_router)

class HealthResponse(BaseModel):
    status: str
    message: str

STATUS_CONSOLE_HTML = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PIXORA — Digital Image Forensics Console</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Newsreader:ital,opsz,wght@1,6..72,400&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #08090B;
      --card-bg: #0E1015;
      --card-hover: #12151C;
      --border: #1C2028;
      --border-subtle: #161920;
      --text-primary: #F4F4F6;
      --text-secondary: #8E929E;
      --text-muted: #525662;
      --accent-blue: #3155FF;
      --accent-green: #10B981;
      --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      --font-mono: "JetBrains Mono", SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
      --font-editorial: "Newsreader", Georgia, serif;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      background-color: var(--bg);
      background-image: 
        radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px);
      background-size: 24px 24px;
      color: var(--text-primary);
      font-family: var(--font-sans);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px 20px;
      line-height: 1.5;
      -webkit-font-smoothing: antialiased;
    }

    .console-container {
      width: 100%;
      max-width: 680px;
      border: 1px solid var(--border);
      background: rgba(14, 16, 21, 0.95);
      border-radius: 12px;
      padding: 36px 36px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
    }

    /* 1. HEADER */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding-bottom: 24px;
      border-bottom: 1px solid var(--border);
    }

    .brand-title {
      font-family: var(--font-editorial);
      font-size: 32px;
      font-weight: 400;
      letter-spacing: -0.02em;
      color: #FFFFFF;
      line-height: 1.1;
    }

    .brand-subtitle {
      font-family: var(--font-mono);
      font-size: 10.5px;
      letter-spacing: 0.16em;
      color: var(--text-muted);
      text-transform: uppercase;
      margin-top: 4px;
    }

    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      padding: 5px 11px;
      background: rgba(16, 185, 129, 0.08);
      border: 1px solid rgba(16, 185, 129, 0.25);
      border-radius: 9999px;
      font-family: var(--font-mono);
      font-size: 11px;
      font-weight: 600;
      color: var(--accent-green);
      letter-spacing: 0.08em;
    }

    .pulse-dot {
      width: 6px;
      height: 6px;
      background-color: var(--accent-green);
      border-radius: 50%;
      box-shadow: 0 0 8px var(--accent-green);
      animation: restrainedPulse 2.4s ease-in-out infinite;
    }

    @keyframes restrainedPulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.45; transform: scale(0.85); }
    }

    /* 2. HERO */
    .hero {
      padding: 28px 0;
      border-bottom: 1px solid var(--border);
    }

    .hero-lead {
      font-family: var(--font-editorial);
      font-size: 26px;
      font-style: italic;
      color: #FFFFFF;
      line-height: 1.25;
      margin-bottom: 8px;
    }

    .hero-desc {
      font-size: 13.5px;
      color: var(--text-secondary);
      max-width: 520px;
      line-height: 1.5;
    }

    /* SECTION COMMON */
    .section {
      padding: 26px 0;
      border-bottom: 1px solid var(--border);
    }

    .section-title {
      font-family: var(--font-mono);
      font-size: 10.5px;
      font-weight: 600;
      letter-spacing: 0.14em;
      color: var(--text-muted);
      text-transform: uppercase;
      margin-bottom: 16px;
    }

    /* 3. STATUS ROWS */
    .status-grid {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .status-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 14px;
      background: var(--card-bg);
      border: 1px solid var(--border-subtle);
      border-radius: 6px;
      font-family: var(--font-mono);
      font-size: 12px;
      transition: background 0.15s ease, border-color 0.15s ease;
    }

    .status-row:hover {
      background: var(--card-hover);
      border-color: #232834;
    }

    .status-left {
      display: flex;
      align-items: center;
      gap: 9px;
      color: var(--text-primary);
    }

    .status-dot {
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background: var(--accent-green);
    }

    .status-label {
      font-weight: 500;
      letter-spacing: 0.04em;
    }

    .status-value {
      font-weight: 600;
      letter-spacing: 0.08em;
      color: var(--accent-green);
      font-size: 11px;
    }

    /* 4. ENDPOINTS */
    .endpoint-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .endpoint-card {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 14px;
      background: var(--card-bg);
      border: 1px solid var(--border-subtle);
      border-radius: 6px;
      transition: background 0.15s ease, border-color 0.15s ease;
      text-decoration: none;
      color: inherit;
    }

    .endpoint-card.clickable {
      cursor: pointer;
    }

    .endpoint-card.clickable:hover {
      background: var(--card-hover);
      border-color: #2b3240;
    }

    .endpoint-left {
      display: flex;
      align-items: center;
      gap: 12px;
      min-width: 0;
    }

    .method-badge {
      font-family: var(--font-mono);
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.06em;
      padding: 3px 7px;
      border-radius: 4px;
      flex-shrink: 0;
    }

    .method-get {
      background: rgba(16, 185, 129, 0.1);
      color: var(--accent-green);
      border: 1px solid rgba(16, 185, 129, 0.25);
    }

    .method-post {
      background: rgba(49, 85, 255, 0.1);
      color: var(--accent-blue);
      border: 1px solid rgba(49, 85, 255, 0.25);
    }

    .endpoint-meta {
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 0;
    }

    .endpoint-path {
      font-family: var(--font-mono);
      font-size: 13px;
      font-weight: 500;
      color: #FFFFFF;
      letter-spacing: -0.01em;
    }

    .endpoint-desc {
      font-size: 11.5px;
      color: var(--text-secondary);
    }

    .action-btn {
      font-family: var(--font-mono);
      font-size: 10px;
      font-weight: 600;
      letter-spacing: 0.08em;
      padding: 5px 10px;
      border-radius: 4px;
      border: 1px solid #232834;
      background: #12151D;
      color: var(--text-secondary);
      flex-shrink: 0;
      transition: all 0.15s ease;
      text-decoration: none;
    }

    .endpoint-card.clickable:hover .action-btn {
      color: #FFFFFF;
      border-color: #3B4354;
      background: #171B24;
    }

    .action-post {
      border: 1px solid rgba(49, 85, 255, 0.25);
      background: rgba(49, 85, 255, 0.05);
      color: var(--accent-blue);
      cursor: default;
    }

    /* 5. FOOTER */
    .footer {
      padding-top: 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-family: var(--font-mono);
      font-size: 11px;
      color: var(--text-muted);
    }

    .footer-left {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }

    .footer-brand {
      color: var(--text-secondary);
      font-weight: 500;
      letter-spacing: 0.04em;
    }

    .footer-quote {
      font-style: italic;
      color: var(--text-muted);
    }

    .footer-version {
      font-weight: 600;
      letter-spacing: 0.08em;
    }

    /* RESPONSIVE */
    @media (max-width: 600px) {
      .console-container {
        padding: 24px 20px;
      }
      .brand-title {
        font-size: 26px;
      }
      .hero-lead {
        font-size: 21px;
      }
      .footer {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
      }
    }
  </style>
</head>
<body>
  <div class="console-container">
    <!-- 1. HEADER -->
    <header class="header">
      <div>
        <h1 class="brand-title">PIXORA</h1>
        <div class="brand-subtitle">DIGITAL IMAGE FORENSICS</div>
      </div>
      <div class="status-badge">
        <span class="pulse-dot"></span>
        <span>OPERATIONAL</span>
      </div>
    </header>

    <!-- 2. HERO -->
    <section class="hero">
      <div class="hero-lead">&ldquo;Every image leaves evidence.&rdquo;</div>
      <p class="hero-desc">
        Digital image forensic analysis infrastructure for evidence-aware image investigation.
      </p>
    </section>

    <!-- 3. FORENSIC API STATUS -->
    <section class="section">
      <h2 class="section-title">FORENSIC API STATUS</h2>
      <div class="status-grid">
        <div class="status-row">
          <div class="status-left">
            <span class="status-dot"></span>
            <span class="status-label">CORE ENGINE</span>
          </div>
          <span class="status-value">OPERATIONAL</span>
        </div>
        <div class="status-row">
          <div class="status-left">
            <span class="status-dot"></span>
            <span class="status-label">IMAGE INGESTION</span>
          </div>
          <span class="status-value">READY</span>
        </div>
        <div class="status-row">
          <div class="status-left">
            <span class="status-dot"></span>
            <span class="status-label">EVIDENCE ANALYSIS</span>
          </div>
          <span class="status-value">READY</span>
        </div>
        <div class="status-row">
          <div class="status-left">
            <span class="status-dot"></span>
            <span class="status-label">API GATEWAY</span>
          </div>
          <span class="status-value">ONLINE</span>
        </div>
      </div>
    </section>

    <!-- 4. API ENDPOINTS -->
    <section class="section">
      <h2 class="section-title">API ENDPOINTS</h2>
      <div class="endpoint-list">
        <!-- GET /api/health -->
        <a href="/api/health" class="endpoint-card clickable">
          <div class="endpoint-left">
            <span class="method-badge method-get">GET</span>
            <div class="endpoint-meta">
              <span class="endpoint-path">/api/health</span>
              <span class="endpoint-desc">Health status</span>
            </div>
          </div>
          <span class="action-btn">[ OPEN ]</span>
        </a>

        <!-- POST /api/investigate -->
        <div class="endpoint-card">
          <div class="endpoint-left">
            <span class="method-badge method-post">POST</span>
            <div class="endpoint-meta">
              <span class="endpoint-path">/api/investigate</span>
              <span class="endpoint-desc">Image forensic investigation</span>
            </div>
          </div>
          <span class="action-btn action-post">[ POST ]</span>
        </div>

        <!-- GET /docs -->
        <a href="/docs" class="endpoint-card clickable">
          <div class="endpoint-left">
            <span class="method-badge method-get">GET</span>
            <div class="endpoint-meta">
              <span class="endpoint-path">/docs</span>
              <span class="endpoint-desc">Interactive API documentation</span>
            </div>
          </div>
          <span class="action-btn">[ OPEN ]</span>
        </a>
      </div>
    </section>

    <!-- 5. FOOTER -->
    <footer class="footer">
      <div class="footer-left">
        <span class="footer-brand">PIXORA // DIGITAL IMAGE FORENSICS</span>
        <span class="footer-quote">Every image leaves evidence.</span>
      </div>
      <div class="footer-version">v1.0</div>
    </footer>
  </div>
</body>
</html>
"""

@app.get("/", response_class=HTMLResponse)
def root_status_console():
    return HTMLResponse(content=STATUS_CONSOLE_HTML, status_code=200)

@app.get("/api/health", response_model=HealthResponse)
def health_check():
    return HealthResponse(status="ok", message="IMAGE-TRACE core is running.")
