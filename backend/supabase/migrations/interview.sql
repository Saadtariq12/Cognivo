create table public.interviews (
    id uuid primary key default gen_random_uuid(),
    recruiter_id uuid not null references public.profiles(id) on delete cascade,
    title text not null,
    description text,
    duration integer not null, 
    required_skills text[] default '{}', 
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Index for fast lookup of interviews created by a specific recruiter
create index idx_interviews_recruiter_id on public.interviews(recruiter_id);