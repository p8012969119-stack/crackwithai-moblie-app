# JS Context Engineering & Data Analysis Engine

Production-ready, highly secure **Automated Context Search, DB Storage, and UI Analysis System** using Node.js, Express, MongoDB Mongoose, and Tailwind CSS.

---

## 🏗️ Architecture Overview

```
context-engine/
├── config/
│   └── db.js                      # MongoDB connection & disconnect helper
├── models/
│   └── Context.js                 # Mongoose ContextRecord Schema (query, sourceId, title, extractedFacts, reliabilityScore, url, timestamp)
├── controllers/
│   └── contextController.js       # Asynchronous Context Pipeline (Tavily API search, sanitization, bulkWrite upsert, JSON response)
├── public/
│   ├── index.html                 # Single-page dashboard UI (Tailwind CSS CDN)
│   └── app.js                     # Frontend client runtime logic (localStorage key management, step-by-step progress tracker, dynamic card rendering)
├── server.js                      # Express server with CORS, express.json(), static file hosting, and error middleware
├── .env.example                   # Environment configuration template
└── package.json                   # Project dependencies & scripts
```

---

## ⚡ Quick Start Instructions

### 1. Install Dependencies
```bash
cd context-engine
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### 3. Start the Server
```bash
# Production mode
npm start

# Development mode with nodemon
npm run dev
```

### 4. Open the Web Dashboard
Navigate to `http://localhost:5000` in your web browser.

---

## 🔌 API Documentation

### POST `/api/context/analyze`
Executes the context engineering pipeline:
1. Queries Tavily API for top 3 high-signal facts.
2. Sanitizes payload into `ContextRecord` Mongoose schema.
3. Performs bulk DB upsert into MongoDB (`context_records` collection).
4. Returns clean JSON response payload with color-coded reliability scores.

#### Request Body:
```json
{
  "userQuery": "Prompt engineering techniques for Claude 3.5",
  "tavilyApiKey": "tvly-xxxxxxxxxxxxxxxxxxxx"
}
```

#### Response Body (200 OK):
```json
{
  "success": true,
  "count": 3,
  "query": "Prompt engineering techniques for Claude 3.5",
  "answer": "Synthesized summary from Tavily...",
  "data": [
    {
      "query": "Prompt engineering techniques for Claude 3.5",
      "sourceId": "8f14e45fceea167a5a36dedd4bea2543",
      "title": "Anthropic Prompt Engineering Guide",
      "extractedFacts": "Clear instructions, few-shot examples, and XML tags improve response reliability...",
      "reliabilityScore": 0.94,
      "url": "https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering",
      "timestamp": "2026-09-29T00:00:00.000Z"
    }
  ]
}
```

---

## 🎨 UI Features
- **LocalStorage API Key Management**: API keys automatically commit to browser `localStorage`.
- **Step-by-Step Pipeline Tracker**: Animated progress bar tracking Tavily fetch -> DB bulk insertion -> UI rendering.
- **Color-Coded Reliability Badges**:
  - 🟢 **Green Badge** (`>= 85%`) for High Signal Context.
  - 🟡 **Amber Badge** (`< 85%`) for Moderate Signal Context.
- **Direct Source Links**: Anchor links (`target="_blank"`) to verify primary sources.
