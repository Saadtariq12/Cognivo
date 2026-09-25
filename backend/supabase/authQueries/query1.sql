-- Keep recruiter profile creation aligned with the profiles table.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
    insert into public.profiles (
        id,
        full_name,
        email,
        role
    )
    values (
        new.id,
        new.raw_user_meta_data ->> 'full_name',
        new.email,
        'recruiter'
    );

    return new;
end;
$$;
