-- Extend the existing invitation table for secure, recruiter-owned invitations.
alter table public.interview_invitations
    add column if not exists recruiter_id uuid,
    add column if not exists token_hash text,
    add column if not exists created_at timestamptz not null default now(),
    add column if not exists used_at timestamptz;

update public.interview_invitations invitations
set recruiter_id = interviews.recruiter_id
from public.interviews interviews
where invitations.interview_id = interviews.id
  and invitations.recruiter_id is null;

alter table public.interview_invitations
    alter column recruiter_id set not null;

alter table public.interview_invitations
    add constraint interview_invitations_recruiter_id_fkey
    foreign key (recruiter_id) references public.profiles(id) on delete cascade;

create unique index if not exists idx_interview_invitations_token_hash
    on public.interview_invitations(token_hash)
    where token_hash is not null;

create index if not exists idx_interview_invitations_recruiter_id
    on public.interview_invitations(recruiter_id);