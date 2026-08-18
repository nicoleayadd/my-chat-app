# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.


# AI Chat Assistant

A full-stack AI chat application with streaming responses, grounded citations, conversation persistence, response regeneration, and feedback capture — built with React, Node/Express, MongoDB, and the Google Gemini API.

## Features

- Real-time streaming chat responses (Server-Sent Events)
- Persistent conversation history with a sidebar to resume any past chat
- Inline citations with hoverable source tooltips
- Response regeneration with version switching
- Thumbs up/down feedback with a reason-select modal
- Delete conversations (with confirmation)
- Markdown rendering with syntax-highlighted code blocks
- Copy-to-clipboard on any response

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Vite, React, TypeScript, Tailwind CSS, shadcn/ui |
| Backend | Node.js, Express |
| Database | MongoDB (via Mongoose) |
| AI Model | Google Gemini API (`gemini-3.6-flash`) via `@google/genai` |

## Prerequisites

Before you start, make sure you have:

- **Node.js** (v18 or later) and **npm** — [nodejs.org](https://nodejs.org)
- **MongoDB** running locally, or a MongoDB connection string (e.g. from MongoDB Atlas)
- A **Google Gemini API key** — get one at [aistudio.google.com/apikey](https://aistudio.google.com/apikey)

## Setup (under 5 minutes)

### 1. Clone the repo

```bash
git clone https://github.com/nicoleayadd/my-chat-app.git
cd my-chat-app
```

### 2. Install frontend dependencies

From the project root:

```bash
npm install
```

### 3. Install backend dependencies

```bash
cd server
npm install
```

### 4. Set up your environment variables

Still inside `server/`, create a `.env` file:

```bash
touch .env
```

Open `server/.env` in your editor and add your Gemini API key:

```
GEMINI_API_KEY=your_api_key_here
```

> `.env` is gitignored — never commit your API key.

### 5. Start MongoDB

**macOS (Homebrew):**
```bash
brew services start mongodb-community
```

**Other platforms:** start your local `mongod` service, or use a MongoDB Atlas connection string instead (update the connection URI in `server/db.js`).

### 6. Run the backend

From `server/`:

```bash
node index.js
```

You should see:
```
MongoDB connected
Server running on http://localhost:3001
```

### 7. Run the frontend

Open a **new terminal tab**, go back to the project root, and run:

```bash
npm run dev
```

Vite will print a local URL (typically `http://localhost:5173` — if that port's taken, it'll increment to 5174, etc.). Open it in your browser.

## You're all set

You should now see the chat interface. Send a message to confirm the Gemini connection is working — you should see the response stream in token-by-token.

## Project Structure

```
my-chat-app/
  src/                    # React frontend
    components/chat/      # Chat UI components
    hooks/useChat.ts       # Chat state management
    lib/                  # API client, types, utils
  server/                 # Express backend
    index.js               # API routes + Gemini integration
    db.js                  # MongoDB connection + schema
    .env                    # API key (not committed)
  CLAUDE.md               # AI coding assistant context
```

## Troubleshooting

- **"MongoDB connection error"** — confirm MongoDB is running (`brew services list` on macOS should show `mongodb-community` as `started`).
- **Gemini API errors** — double check `GEMINI_API_KEY` in `server/.env` is set and valid.
- **Port already in use** — the frontend (Vite) will auto-increment to the next free port; check your terminal output for the actual URL. The backend is fixed to port `3001` — stop any other process using that port before starting the server.
- **Both servers must run simultaneously** — the frontend (port 5173+) and backend (port 3001) are separate processes; keep both terminal tabs open during development.