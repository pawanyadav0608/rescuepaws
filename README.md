# RescuePaws - Community Animal Rescue Platform

RescuePaws is an AI-assisted community animal rescue coordination platform connecting citizens, dispatchers, and rescue volunteers in real time.

---

## 📦 What's Included in this ZIP

This archive contains the complete frontend and backend source code:

1. **Frontend (`/src`)**:
   - React 19 SPA built with Vite
   - Tailwind CSS v4 styling & responsive layout
   - Leaflet interactive rescue dispatch map (`InteractiveMap.tsx`)
   - AI Triage photo upload and analysis system
   - Citizen Report Intake with geo-tagging
   - Volunteer Dispatch Hub & Admin Management Dashboard
   - Client API layer with JWT authentication interceptors (`/src/api`)

2. **Backend Option 1 - Node.js Express (`server.ts`)**:
   - Unified full-stack server running on port `3000`
   - Express REST API with endpoints:
     - `/api/reports` (GET, POST, GET /:id, PATCH /:id, POST /:id/comments)
     - `/api/volunteers` (GET, GET /:id/assignments, POST /:id/availability)
     - `/api/appointments` (GET, POST - stores vet & intake bookings)
     - `/api/auth/login` and `/api/auth/signup`
     - `/api/stats`
     - `/api/triage` (Gemini Vision AI integration + heuristic fallback)
   - Serves Vite in dev and production static bundle in production

3. **Backend Option 2 - Python FastAPI (`/backend-python`)**:
   - Python 3 FastAPI implementation
   - Automatic Swagger documentation at `http://localhost:8000/docs`
   - Pydantic models and full REST endpoints

4. **Container & Deployment Configs**:
   - `Dockerfile` (production multi-stage build), `render.yaml`
   - `docker-compose.yml`
   - `.env.example`

---

## 🚀 Quick Start (Local Setup)

### Option A: Node.js Full-Stack (Recommended)

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start Development Server** (Express + Vite middleware on one port):
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

3. **Production Build**:
   ```bash
   npm run build
   npm start
   ```

---

### Option B: Frontend (Vite) + Python FastAPI Backend

1. **Start Python Backend**:
   ```bash
   cd backend-python
   python3 -m venv venv
   source venv/bin/activate    # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   uvicorn main:app --reload --port 8000
   ```

2. **Configure Frontend**:
   In `src/api/client.ts`, configure `baseURL: 'http://localhost:8000/api'`.

3. **Start Frontend**:
   ```bash
   npm install
   npm run dev
   ```

---

### Option C: Docker

Run the entire application in a single Docker container:

```bash
docker build -t rescuepaws .
docker run -p 3000:3000 rescuepaws
```

Or with Docker Compose:
```bash
docker-compose up --build
```

---

## 🛠️ API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Healthcheck and server status |
| `GET` | `/api/reports` | List animal rescue reports (supports `status` and `urgency` filters) |
| `POST` | `/api/reports` | Submit a new injured/stray animal report |
| `GET` | `/api/reports/:id` | Get details for an individual rescue report |
| `PATCH` | `/api/reports/:id` | Update report status (e.g. In Progress, Rescued) or assign volunteer |
| `POST` | `/api/reports/:id/comments` | Add update comment to case timeline |
| `GET` | `/api/volunteers` | List active rescue volunteers |
| `GET` | `/api/volunteers/:id/assignments` | Retrieve volunteer active & past rescues |
| `POST` | `/api/volunteers/:id/availability` | Toggle volunteer on-call availability |
| `POST` | `/api/appointments` | Register appointment (vet triage, intake, meet & greet) |
| `GET` | `/api/appointments` | View scheduled intake appointments |
| `POST` | `/api/auth/login` | Citizen / Volunteer / Admin login |
| `POST` | `/api/auth/signup` | Register new account |
| `POST` | `/api/triage` | AI vision triage (Gemini Vision) |
| `GET` | `/api/stats` | Platform dashboard statistics |

---

## 🌐 Deploying (tested)

**Render (easiest, free):**
1. Push this folder to a GitHub repo.
2. Render → New → Blueprint (it reads `render.yaml`) — or New Web Service with
   build `npm install && npm run build`, start `npm start`.
3. Optional: add `GEMINI_API_KEY` in the dashboard for real AI triage.
4. Open `https://<your-app>.onrender.com`. Health check: `/api/health`.

**Railway / Fly.io:** same build and start commands, or use the `Dockerfile`.

**Docker:** `docker build -t rescuepaws . && docker run -p 3000:3000 rescuepaws`

> Demo notes: data is held in memory and resets on restart, and login is
> demo-grade (no password check). Great for a presentation; add a database and
> real auth before real-world use. Free Render apps sleep after ~15 min idle —
> open the URL a minute before presenting.
