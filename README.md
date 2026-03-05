# Career Gap Job Finder 🚀

A production-ready full-stack application that helps students and gap professionals find companies that actively welcome career-gap candidates.

---

## 🛠️ Tech Stack
- **Frontend**: React + TypeScript + Tailwind CSS + Framer Motion + React Query
- **Backend**: Node.js + Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Auth**: JWT (JSON Web Tokens)
- **AI**: OpenAI GPT-4o-mini (Resume Analysis)
- **File Upload**: Multer (PDF only)

---

## 📁 Project Structure
```
Skill-gap analyser/
├── backend/              # Express API server
│   ├── src/
│   │   ├── config/       # MongoDB connection
│   │   ├── controllers/  # Business logic
│   │   ├── middleware/   # Auth, Upload, Validation
│   │   ├── models/       # Mongoose schemas
│   │   ├── routes/       # Express routes
│   │   ├── services/     # OpenAI & Matching Engine
│   │   └── utils/        # PDF extractor
│   ├── uploads/          # Resume PDFs
│   ├── .env              # Environment variables
│   └── server.js         # Entry point
│
└── frontend/             # React Vite app
    └── src/
        ├── context/      # Auth context
        ├── pages/        # Route pages
        │   ├── auth/     # Login, Register
        │   ├── student/  # Student dashboard, resume, matches
        │   ├── company/  # Company dashboard, post-job
        │   └── admin/    # Admin panel
        ├── services/     # Axios API client
        └── types/        # TypeScript interfaces
```

---

## ⚙️ Setup Instructions

### 1. Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- OpenAI API key

### 2. Backend Setup

```bash
cd backend
# Edit .env file and fill in your credentials
npm install
npm run dev
```

### 3. .env Configuration
```plaintext
MONGO_URI=mongodb://localhost:27017/career_gap_db
JWT_SECRET=your_secret_key_here
OPENAI_API_KEY=sk-your-openai-api-key
PORT=5000
CLIENT_URL=http://localhost:5173
```

### 4. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### 5. Seed Admin Account

After starting the backend, run once:
```bash
curl -X POST http://localhost:5000/api/admin/seed
```

**Admin Credentials:**
- Email: `admin@careergap.com`
- Password: `Admin@123`

---

## 🌐 Running the App

| Service    | Port | URL                         |
|------------|------|-----------------------------|
| Backend    | 5000 | http://localhost:5000       |
| Frontend   | 5173 | http://localhost:5173       |

---

## 🔑 API Endpoints

### Auth
- `POST /api/auth/student/register`
- `POST /api/auth/student/login`
- `POST /api/auth/company/register`
- `POST /api/auth/company/login`
- `POST /api/auth/admin/login`
- `GET  /api/auth/me`

### Student (Protected)
- `GET/PUT /api/student/profile`
- `POST /api/student/resume/upload` (multipart/form-data)
- `GET /api/student/matches` (AI job matching)
- `POST /api/student/apply/:jobId`
- `GET /api/student/applications`
- `POST /api/student/save/:jobId`
- `GET /api/student/dashboard`

### Company (Protected)
- `POST /api/company/jobs`
- `GET /api/company/jobs`
- `GET /api/company/jobs/:jobId/applications`
- `PUT /api/company/applications/:appId/status`

### Admin (Protected)
- `GET /api/admin/analytics`
- `GET/DELETE /api/admin/students/:id`
- `GET /api/admin/companies`
- `PUT /api/admin/companies/:id/approve`

---

## 🤖 AI Features

### Resume Analysis Flow
1. Student uploads PDF → Multer saves to `/uploads/`
2. `pdf-parse` extracts raw text
3. Text sent to OpenAI GPT-4o-mini with structured prompt
4. Returns: skills, gapDuration, gapRiskLevel, resumeScore, suggestedRoles, gapJustification, resumeSuggestions

### Matching Algorithm
```
IF student.gapDuration <= job.maxGapAllowed
AND job.acceptGap == true
AND skillMatchPercentage >= 30%
THEN → Show in Matched Jobs

Score = skillMatch(60%) + gapCompliance(30%) + resumeScore(10%)
```

---

## 🔒 Security
- All passwords bcrypt-hashed (12 rounds)
- JWT tokens expire in 7 days
- Role-based route protection (student/company/admin)
- PDF-only file uploads with 5MB limit
- Input validation via express-validator
- Duplicate application prevention (DB index)

---

## 👤 Test Accounts

After seeding:

| Role    | Email                         | Password   |
|---------|-------------------------------|------------|
| Admin   | admin@careergap.com           | Admin@123  |
| Student | Register via /register        | (your own) |
| Company | Register via /register        | (your own) |

> ⚠️ Companies need admin approval before posting jobs.
