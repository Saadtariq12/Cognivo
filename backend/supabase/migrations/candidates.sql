create table public.candidates(
    id uuid primary key references auth.users(id) on delete cascade,
    profile_id uuid references public.profiles(id) on delete cascade,
    experience text,
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
);