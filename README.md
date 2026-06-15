# Career Guidance MERN Starter (Email/Password + Google OAuth)

This is a full MERN-stack starter that includes:
- **Backend**: Node.js + Express + MongoDB (Mongoose)
- **Auth**: Email/Password (JWT) + **Google OAuth 2.0** (Passport)
- **Frontend**: React (Vite) with **Register** and **Login** pages including Google Sign-In

## 1) Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Google Cloud OAuth Client (Web application)

## 2) Setup

### Backend
```bash
cd server
cp .env.example .env
npm install
npm run dev
```

### Frontend
```bash
cd client
cp .env.example .env
npm install
npm run dev
```

## 3) Environment variables

### server/.env
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - random secret for JWT signing
- `GOOGLE_CLIENT_ID` - Google OAuth client id
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `GOOGLE_CALLBACK_URL` - e.g. http://localhost:5000/auth/google/callback
- `CLIENT_URL` - e.g. http://localhost:5173

### client/.env
- `VITE_API_URL` - e.g. http://localhost:5000

## 4) How Google Login works (dev-friendly)
- In the React Login/Register pages, the **Continue with Google** button redirects the browser to:
  `http://localhost:5000/auth/google`
- After Google approves, the backend creates/links a user, issues a JWT, then redirects to:
  `http://localhost:5173/oauth-success?token=...`
- The frontend reads the token, stores it in `localStorage`, and routes to `/dashboard`.

## 5) Notes
- This starter is intentionally simple; for production, consider:
  - rotating refresh tokens
  - httpOnly cookies instead of localStorage
  - stricter CORS, rate limiting, CSRF protections
  - email verification and password reset flows
