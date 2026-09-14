# AI Interview System — Backend

An AI-powered interview backend that conducts dynamic, context-aware interviews based on candidate information and job requirements.

The system uses multiple AI agents to generate interview questions, evaluate candidate responses, extract candidate context, and produce a final interview assessment.

> **Current Status:** Backend MVP under development. The core AI interview flow is implemented and currently being tested through Postman.

---

## Overview

The AI Interview System is designed to simulate a structured interview while dynamically adapting questions according to:

- Candidate introduction
- Candidate skills
- Candidate projects
- Job requirements
- Previous interview questions and answers
- Current interview stage
- Current topic
- Question difficulty
- Previous answer evaluation

Instead of following a fixed list of questions, the system determines what should be asked next based on the ongoing interview.

The AI-generated assessment is intended to provide decision-support information to recruiters rather than make autonomous hiring decisions.

---

## Tech Stack

### Backend
- Node.js
- Express.js
- JavaScript

### Database
- Supabase
- PostgreSQL

### AI
- Google Gemini API
- `@google/genai`

### Development & Testing
- Postman
- npm

---

## Core AI Components

The interview system is divided into specialized AI agents.

### Question Agent

The Question Agent generates the next interview question using the current interview context.

It considers information such as:

- Candidate introduction
- Candidate projects
- Candidate skills
- Job requirements
- Current interview stage
- Current topic
- Current difficulty
- Previous questions and answers
- Evaluation signals

The agent returns structured information describing the generated question, including its intent, topic, and difficulty where applicable.

---

### Evaluator Agent

The Evaluator Agent analyzes a candidate's answer to the current question.

The evaluation can contain:

- Correctness
- Concepts covered
- Concepts missing
- Need for follow-up
- Whether to move to another topic
- Whether difficulty should increase
- Current interview stage
- Whether the interview should finish
- Answer quality

These evaluation signals are used by the interview workflow to determine how the interview should continue.

---

### Context Extractor Agent

At the beginning of the interview, the system may not yet have enough structured information about the candidate.

The Context Extractor processes the candidate's introductory response and extracts information such as:

```json
{
  "introduction": "...",
  "projects": [],
  "skills": []
}
```

This context is stored and used by later questions.

---

### Final Assessment Agent

When the Evaluator Agent determines that the interview should finish, the Final Assessment Agent analyzes the interview as a whole.

It uses:

- Candidate context
- Job requirements
- Interview questions
- Candidate answers
- Evaluations

The resulting assessment contains information such as:

```json
{
  "technical_score": 0,
  "communication_score": 0,
  "problem_solving_score": 0,
  "eligibility_score": 0,
  "strengths": [],
  "weaknesses": [],
  "recommendation": ""
}
```

The assessment is stored in the database for later use by the recruiter-facing application.

---

## Interview Engine

The Interview Engine acts as the orchestration layer of the interview system.

Instead of allowing individual AI agents to control the entire interview, the backend controls the workflow and calls the appropriate agent when required.

Conceptually:

```text
Candidate Answer
      │
      ▼
Store Answer
      │
      ▼
Evaluator Agent
      │
      ▼
Store Evaluation
      │
      ▼
Interview Engine
      │
      ├──── finish_interview = false
      │              │
      │              ▼
      │       Question Agent
      │              │
      │              ▼
      │       Store Next Question
      │
      └──── finish_interview = true
                     │
                     ▼
             Final Assessment
                     │
                     ▼
            Store Final Assessment
```

---

## Backend Architecture

The backend follows a controller/service/model structure.

```text
src/
│
├── config/
│   └── database.js
│
├── controllers/
│   ├── interview.controller.js
│   └── assessment.controller.js
│
├── models/
│   ├── candidate.model.js
│   ├── interview.model.js
│   ├── questionAnswer.model.js
│   ├── evaluations.model.js
│   └── assessment.model.js
│
├── routers/
│   └── interview.routes.js
│
├── services/
│   │
│   ├── InterviewAgents/
│   │   ├── questionAgent.js
│   │   ├── evaluatorAgent.js
│   │   └── contextExtractorAgent.js
│   │
│   ├── AgentPrompts/
│   │   ├── questionAgent.prompt.js
│   │   ├── evaluatorAgent.prompt.js
│   │   └── assessmentAgent.prompt.js
│   │
│   ├── Assessment/
│   │   └── assessmentAgent.js
│   │
│   └── Interview/
│       └── interviewEngine.js
│
├── utils/
│
├── app.js
└── index.js
```

> The exact folder capitalization may differ in the repository. Import paths should match the actual project structure.

---

## Database

Supabase PostgreSQL is used for persistent storage.

The backend stores information related to:

- Candidates
- Interviews / job requirements
- Interview sessions
- Questions and answers
- Individual answer evaluations
- Final assessments

Supabase is accessed through `@supabase/supabase-js`.

---

## API Flow

The intended public interview API is kept small.

### Start Interview

```http
POST /api/interview/start
```

Starts the interview and generates the initial question.

Example development/testing body:

```json
{
  "session_id": "SESSION_ID",
  "candidate_id": "CANDIDATE_ID",
  "interview_id": "INTERVIEW_ID"
}
```

---

### Submit Answer

```http
POST /api/interview/answer
```

Submits the candidate's answer.

The final architecture is intended to allow this request to trigger the remaining interview processing internally:

```text
Submit Answer
→ Store Answer
→ Evaluate Answer
→ Continue Interview
→ Return Next Question

OR

Submit Answer
→ Store Answer
→ Evaluate Answer
→ Finish Interview
→ Generate Final Assessment
```

During development, some of these operations may temporarily be exposed through separate routes for easier Postman testing.

---

## Running Locally

### 1. Clone the repository

```bash
git clone <repository-url>
cd <repository-folder>
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the backend project.

Example:

```env
PORT=8000

SUPABASE_URL=your_supabase_url
SUPABASE_PUBLISHABLE_KEY=your_supabase_key

GEMINI_API_KEY=your_gemini_api_key
```

Use the environment variable names configured in the actual project if they differ from the example above.

**Never commit your `.env` file or API keys to GitHub.**

### 4. Start the backend

Depending on the scripts configured in `package.json`:

```bash
npm run dev
```

or:

```bash
npm start
```

---

## Testing

The current backend can be tested without a frontend using Postman.

A typical development test is:

```text
Create/use test database records
        ↓
Start interview
        ↓
Receive generated question
        ↓
Submit candidate answer
        ↓
Generate/store evaluation
        ↓
Generate next question
        ↓
Repeat
        ↓
Interview finishes
        ↓
Generate final assessment
```

Test candidates, interview sessions, and job requirements can be inserted manually into Supabase while authentication and recruiter-management functionality are still under development.

---

## Current Development Status

### Implemented

- Node.js/Express backend
- Supabase/PostgreSQL integration
- Candidate context storage
- Job-requirement-based interview context
- AI Question Agent
- AI Evaluator Agent
- AI Context Extractor Agent
- AI Final Assessment Agent
- Dynamic question generation
- Answer evaluation
- Interview stage/topic progression
- Difficulty adjustment signals
- Interview completion detection
- Final assessment generation
- Interview Engine/orchestration
- Postman-based backend testing

### Not Yet Implemented / Planned

- Frontend
- Complete authentication and authorization
- Recruiter dashboard
- Candidate dashboard/interface
- Recruiter job/interview creation workflow
- Redis caching/performance optimization
- Production deployment
- Additional production-level validation and security
- Real-time interview UX improvements

---

## Security

Environment variables and credentials must never be committed to the repository.

Ensure `.gitignore` contains:

```gitignore
node_modules/
.env
.env.*
```

If an API key has previously been committed, removing it from the current file is not sufficient. Revoke/rotate the exposed key.

---

## Future Improvements

Planned improvements may include:

- Redis caching
- Reduced AI response latency
- Authentication and authorization
- Recruiter and candidate interfaces
- Automated interview/session creation
- Better error handling and validation
- Rate limiting
- Production logging
- Deployment
- Voice-based interviews
- Interview transcripts
- Additional interview analytics

---

## Disclaimer

AI-generated interview evaluations and assessments are intended to assist recruiters by organizing and summarizing job-relevant interview evidence.

The system should not make autonomous employment decisions. Final hiring decisions should remain with the responsible human recruiter or hiring team.