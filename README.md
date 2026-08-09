# ResumeIQ v2 — AI Resume Analyzer & Job Matcher (Spring Boot + Groq)

A full-stack resume analysis and job-matching platform. This is the v2 rewrite:
**Spring Boot + PostgreSQL** backend instead of Node/Express + MongoDB, and
**Groq (Llama 3.3)** instead of Gemini for all AI features. The React frontend
carries over with a richer, more interactive UI: a floating AI chat widget,
two new AI generators, and expanded dashboard charts.

## What's new in v2

- **Backend rewritten in Spring Boot 3 (Java 17)** — Spring Security + JWT,
  Spring Data JPA, PostgreSQL, Apache PDFBox/POI for parsing
- **Groq API** (OpenAI-compatible, Llama 3.3 70B by default) replaces Gemini
  for every AI feature, using JSON mode for structured output and free-text
  mode for chat/generation
- **AI Resume Chat** — floating chat widget on the analysis report, grounded
  in that resume, with conversation history persisted per resume
- **AI Job Match Chat** — same idea, grounded in the resume + job description
  for that specific match
- **Cover Letter Generator** — tailored letter from a resume + JD + company
- **LinkedIn Summary Generator** — polished "About" section, 3 tone options
- **Richer dashboard** — line chart (ATS trend), bar chart (job match scores
  by application), quick-action cards
- **Richer report pages** — job match report now includes a radar chart of
  the five match sub-scores, plus the chat widget

All AI outputs remain strictly grounded in the candidate's real resume text —
the system prompts explicitly forbid inventing skills or experience, for
analysis, matching, chat, and both generators.

## Tech Stack

**Frontend:** React (Vite), Tailwind CSS, React Router, Axios, Framer Motion,
Recharts, React Hook Form, react-hot-toast, jsPDF + html2canvas

**Backend:** Java 17, Spring Boot 3.3 (Web, Security, Data JPA, Validation),
PostgreSQL, JJWT, Apache PDFBox, Apache POI, Groq API (Llama 3.3 70B)

## Project Structure

```
resume-analyzer-v2/
├── backend/
│   ├── pom.xml
│   └── src/main/java/com/resumeiq/
│       ├── config/          SecurityConfig, GroqConfig, WebConfig, rate limiter
│       ├── model/            User, Resume, Analysis, JobMatch, CoverLetter, LinkedInSummary, ChatMessage
│       ├── repository/       Spring Data JPA repositories
│       ├── dto/               Request/response records
│       ├── controller/       Auth, Resume, Ai, JobMatch, Chat, Generator, History, Health
│       ├── service/           Business logic + GroqService (core AI integration)
│       ├── security/          JwtUtil, JwtAuthFilter, UserPrincipal, UserDetailsServiceImpl
│       └── exception/         ApiException, GlobalExceptionHandler
└── frontend/
    └── src/
        ├── api/                axios instance + endpoint wrappers (incl. chat, generators)
        ├── components/        Navbar, Sidebar, AppShell, ScoreRing, ChatWidget, …
        └── pages/               Dashboard, UploadResume, AnalysisResult, JobMatchForm,
                                   JobMatchResult, CoverLetterGenerator, LinkedInSummaryGenerator, …
```

## Local Setup

### 1. PostgreSQL

```bash
docker run --name resumeiq-db -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=resume_analyzer -p 5432:5432 -d postgres:16
```

### 2. Backend

```bash
cd backend
cp .env.example .env
export $(cat .env | grep -v '^#' | xargs)   # load vars into your shell
mvn spring-boot:run      # http://localhost:8080
```

Get a Groq API key at https://console.groq.com/keys.

Spring Boot creates/updates the schema automatically on boot (`ddl-auto: update`).

### 3. Frontend

```bash
cd frontend
cp .env.example .env     # points to http://localhost:8080/api by default
npm install
npm run dev                # http://localhost:5173
```

## API Overview

| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/register` \| `/login` | Auth |
| GET/PUT | `/api/auth/profile` | Profile (protected) |
| POST | `/api/resumes/upload` | Upload + parse a resume |
| POST | `/api/ai/analyze/{resumeId}` | Run Groq ATS analysis |
| POST | `/api/job-match` | Run Groq JD match |
| GET/POST | `/api/chat/resume/{resumeId}` | Resume-grounded chat |
| GET/POST | `/api/chat/job-match/{jobMatchId}` | Job-match-grounded chat |
| POST | `/api/generate/cover-letter` | Generate a cover letter |
| POST | `/api/generate/linkedin-summary` | Generate a LinkedIn About section |
| GET | `/api/history/dashboard` \| `/analyses` \| `/job-matches` | History & stats |

All protected routes require `Authorization: Bearer <token>`.

## Security Notes

- Passwords hashed with BCrypt (strength 12)
- Stateless JWT auth via a custom `OncePerRequestFilter`
- Per-user, per-hour rate limiting on every AI-backed endpoint via an
  in-memory interceptor
- File type/size validated server-side regardless of client-side checks
- Groq API key lives only in backend environment variables
- Every Groq structured-JSON response is deserialized against a strict DTO
  shape before being persisted; malformed responses are rejected with a 502
  rather than silently saved

## Deployment

See [`DEPLOYMENT.md`](./DEPLOYMENT.md) for Vercel (frontend) + Render (backend)
+ managed PostgreSQL instructions.
