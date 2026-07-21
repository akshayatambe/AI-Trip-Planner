# AI Travel Planner

A full-stack AI trip planner: pick a destination, days, budget and travel style, sign in
with Google, and get a Gemini-generated day-by-day itinerary with hotel picks — saved to
"My Trips" for later.

- **Backend:** Java 17, Spring Boot 3 (Web, Security, OAuth2 Client, Data JPA), H2 file
  database, JWT for stateless API auth, Gemini API for itinerary generation.
- **Frontend:** React 18 (Vite), React Router, Tailwind CSS, Axios.

```
ai-trip-planner/
├── backend/     Spring Boot API (port 8080)
└── frontend/    React app (port 5173)
```

## How it works

1. User fills out the preferences form (destination, days, budget, who they're
   traveling with) — no login required to fill it out.
2. On submit, if they aren't signed in yet, a "Sign in with Google" modal opens. The
   form values are stashed in `sessionStorage` first.
3. Google OAuth2 login happens entirely on the backend (`/oauth2/authorization/google`).
   On success, the backend upserts the user, issues a JWT, and redirects to
   `FRONTEND_URL/oauth-callback?token=...`.
4. The frontend stores the JWT, resumes the stashed trip request (if any), and calls
   `POST /api/trips/generate`.
5. The backend prompts Gemini for a strict JSON itinerary, attaches image URLs, saves
   the trip, and returns it. The frontend renders it and it now shows up under "My Trips".

## Prerequisites

- Java 17+ and Maven 3.9+
- Node.js 18+ and npm
- A Google Cloud OAuth 2.0 Client ID (for "Sign in with Google")
- A Gemini API key (for itinerary generation) — get one at https://aistudio.google.com/apikey

## 1. Set up Google OAuth2

1. Go to the [Google Cloud Console](https://console.cloud.google.com/apis/credentials) →
   create a project (or pick one) → **Create Credentials → OAuth client ID**.
2. Application type: **Web application**.
3. Authorized JavaScript origins: `http://localhost:5173`
4. Authorized redirect URIs: `http://localhost:8080/login/oauth2/code/google`
5. Copy the generated **Client ID** and **Client Secret**.

## 2. Configure and run the backend

```bash
cd backend
cp .env.example .env   # then fill in the real values
export $(grep -v '^#' .env | xargs)   # or use direnv / your IDE's env var UI

mvn spring-boot:run
```

The API starts on `http://localhost:8080`. An H2 database file is created at
`backend/data/tripplanner.mv.db` automatically (no setup needed). You can browse it at
`http://localhost:8080/h2-console` (JDBC URL: `jdbc:h2:file:./data/tripplanner`).

Required environment variables (see `backend/.env.example`):

| Variable               | Description                                      |
|-------------------------|--------------------------------------------------|
| `GOOGLE_CLIENT_ID`      | From the Google Cloud OAuth client                |
| `GOOGLE_CLIENT_SECRET`  | From the Google Cloud OAuth client                |
| `GEMINI_API_KEY`        | From Google AI Studio                             |
| `JWT_SECRET`            | Any long random string (32+ chars)                |
| `FRONTEND_URL`          | Where the React app runs (default `http://localhost:5173`) |
| `BACKEND_URL`           | Where this API runs (default `http://localhost:8080`) — used to build image proxy URLs |
| `GOOGLE_PLACES_API_KEY` | Optional. Real photos of the actual place (not generic stock photos). Enable "Places API" in the same Google Cloud project, requires billing enabled. |
| `PEXELS_API_KEY`        | Optional. Fallback stock photo when Google Places has no photo for a place. |

## 3. Configure and run the frontend

```bash
cd frontend
cp .env.example .env   # defaults already point at localhost:8080
npm install
npm run dev
```

The app starts on `http://localhost:5173`.

## Key endpoints

| Method | Path                   | Auth | Description                          |
|--------|-------------------------|------|---------------------------------------|
| GET    | `/oauth2/authorization/google` | -    | Kicks off Google login               |
| GET    | `/api/auth/me`          | JWT  | Current signed-in user               |
| POST   | `/api/trips/generate`   | JWT  | Generate + save a new itinerary       |
| GET    | `/api/trips`            | JWT  | List the user's saved trips           |
| GET    | `/api/trips/{id}`       | JWT  | Full itinerary for one trip           |
| DELETE | `/api/trips/{id}`       | JWT  | Delete a trip                         |

## Notes & next steps

- **Images**: `ImageService` tries Google Places Photos first (real photos of the
  actual place — set `GOOGLE_PLACES_API_KEY`), falls back to Pexels stock photos
  (set `PEXELS_API_KEY`), and finally falls back to a deterministic
  `picsum.photos` placeholder if neither key is configured, so the app still
  runs with zero image API keys.
- **Production database:** switch `spring.datasource.*` in `application.yml` to
  PostgreSQL/MySQL and add the matching driver dependency — everything else (JPA
  entities, repositories) works unchanged.
- **Gemini model:** configurable via `GEMINI_MODEL` env var (defaults to
  `gemini-2.0-flash`). If a request fails with a model-not-found error, check
  https://ai.google.dev/gemini-api/docs/models for the current model name.
