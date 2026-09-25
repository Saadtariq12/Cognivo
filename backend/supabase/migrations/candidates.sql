create table public.candidates (
    id uuid primary key default gen_random_uuid(),
    email text not null,
    introduction text,
    projects jsonb default '[]'::jsonb,
    inital_claimed_skills text[] default '{}',
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);