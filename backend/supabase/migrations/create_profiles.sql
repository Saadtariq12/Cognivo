create table public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    full_name text,
    email text not null unique,
    role text not null default 'recruiter'
        check (role = 'recruiter'),
    created_at timestamptz default now()
);