CREATE TABLE interview_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES interview_sessions(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    question_intent TEXT,
    answer TEXT,
    correctness NUMERIC(5, 2) CHECK (correctness >= 0 AND correctness <= 100),
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    duration INTEGER GENERATED ALWAYS AS (EXTRACT(EPOCH FROM (ended_at - started_at))::INTEGER) STORED,
    recording_url TEXT,
    screen_recording_url TEXT
);