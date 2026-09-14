CREATE TABLE public.evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    answer_id UUID NOT NULL
        REFERENCES public.interview_answers(id)
        ON DELETE CASCADE,

    correctness NUMERIC(5,2),
    concepts_covered TEXT[],
    concepts_missing TEXT[],
    need_follow_up BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);