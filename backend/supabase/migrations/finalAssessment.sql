create table public.finalAssessments(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES interview_sessions(id) ON DELETE CASCADE,
    technical_score NUMERIC (technical_score >= 0 AND technical_score <= 100),
    communication_score NUMERIC (communication_score >= 0 AND communication_score <= 100),
    problem_solving_score NUMERIC (problem_solving_score >= 0 AND problem_solving_score <= 100),
    overall_correctness NUMERIC (overall_correctness >= 0 AND overall_correctness <= 100),
    eligibility_score NUMERIC (eligibility_score >= 0 AND eligibility_score <= 100), 
    strengths TEXT[],
    weakness TEXT[],
    recommendation TEXT CHECK (recommendation IN ('not recommended', 'needs improvement', 'good', 'highly recommended'))
);