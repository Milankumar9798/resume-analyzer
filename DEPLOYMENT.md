# Deployment Guide

Target: **Frontend → Vercel**, **Backend → Render (Docker/Java)**, **Database → Render/Neon PostgreSQL**.

## 1. PostgreSQL

Use Render's managed Postgres, or Neon/Supabase (all have free tiers):

1. Create a Postgres instance.
2. Note the connection details: host, port, database, username, password.
3. Build a JDBC URL: `jdbc:postgresql://<host>:<port>/<database>`

## 2. Backend on Render

Render can build a Spring Boot app directly from a `pom.xml` using its native
Java support, or via Docker. Native is simpler:

1. Push this repo to GitHub.
2. On https://render.com, **New → Web Service**, connect the repo:
   - **Root Directory:** `backend`
   - **Environment:** Java
   - **Build Command:** `mvn clean package -DskipTests`
   - **Start Command:** `java -jar target/resume-analyzer-backend-1.0.0.jar`
3. Environment variables:
   ```
   DB_URL=jdbc:postgresql://<host>:<port>/<database>
   DB_USERNAME=<user>
   DB_PASSWORD=<password>
   JWT_SECRET=<a long random string, 32+ chars>
   JWT_EXPIRATION_MS=604800000
   GROQ_API_KEY=<your Groq key>
   GROQ_BASE_URL=https://api.groq.com/openai/v1
   GROQ_MODEL=llama-3.3-70b-versatile
   CLIENT_URL=https://<your-vercel-app>.vercel.app
   AI_RATE_LIMIT=30
   PORT=8080
   ```
4. Deploy, then confirm: `GET https://<your-render-url>/api/health`.

> Free Render instances spin down after inactivity — first request after idle
> may take 30-60s.

## 3. Frontend on Vercel

1. **New Project**, import the repo:
   - **Root Directory:** `frontend`
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
2. Environment variable:
   ```
   VITE_API_BASE_URL=https://<your-render-url>/api
   ```
3. Deploy, then confirm `CLIENT_URL` on Render matches this exact Vercel URL
   (no trailing slash) so CORS allows it.

## 4. Post-deploy checklist

- [ ] Register a test account
- [ ] Upload a PDF and a DOCX resume — confirm both parse
- [ ] Run an ATS analysis — confirm Groq responds and scores render
- [ ] Open the resume chat widget and ask a question
- [ ] Run a job match, check the radar chart renders
- [ ] Open the job match chat widget
- [ ] Generate a cover letter and a LinkedIn summary
- [ ] Download a PDF report
- [ ] Toggle dark mode and reload — preference persists
- [ ] Log out — protected routes redirect to `/login`

## Environment Variable Reference

Backend: see `backend/.env.example`. Frontend: see `frontend/.env.example`.

Never commit real values. Only `VITE_API_BASE_URL` is safe client-side;
`GROQ_API_KEY`, `JWT_SECRET`, and DB credentials must stay server-side only.
