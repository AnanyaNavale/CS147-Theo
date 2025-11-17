-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Table for storing user profile data and core preferences
drop table if exists public.user_profiles cascade;
create table public.user_profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    display_name text,
    avatar_url text,
    created_at timestamptz default timezone('utc', now()),
    updated_at timestamptz default timezone('utc', now())
);

create or replace function public.handle_user_updated()
returns trigger as $$
begin
    new.updated_at := timezone('utc', now());
    return new;
end;
$$ language plpgsql;

create trigger set_user_profiles_updated_at
before update on public.user_profiles
for each row execute procedure public.handle_user_updated();

-- Table for storing user level settings
drop table if exists public.user_settings cascade;
create table public.user_settings (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.user_profiles(id) on delete cascade,
    default_session_minutes integer default 50,
    default_break_minutes integer default 10,
    weekly_focus_goal_minutes integer,
    notifications_enabled boolean default true,
    timezone text,
    created_at timestamptz default timezone('utc', now()),
    updated_at timestamptz default timezone('utc', now()),
    unique(user_id)
);

create trigger set_user_settings_updated_at
before update on public.user_settings
for each row execute procedure public.handle_user_updated();

-- Table for reusable session presets
drop table if exists public.session_settings cascade;
create table public.session_settings (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.user_profiles(id) on delete cascade,
    title text not null,
    focus_minutes integer default 50,
    break_minutes integer default 10,
    auto_start_breaks boolean default false,
    auto_rotate_tasks boolean default false,
    created_at timestamptz default timezone('utc', now()),
    updated_at timestamptz default timezone('utc', now())
);

create trigger set_session_settings_updated_at
before update on public.session_settings
for each row execute procedure public.handle_user_updated();

-- Table for scheduled study sessions
drop table if exists public.scheduled_sessions cascade;
create table public.scheduled_sessions (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.user_profiles(id) on delete cascade,
    session_setting_id uuid references public.session_settings(id) on delete set null,
    scheduled_for timestamptz not null,
    duration_target_minutes integer,
    status text default 'scheduled',
    agenda text,
    created_at timestamptz default timezone('utc', now()),
    updated_at timestamptz default timezone('utc', now())
);

create trigger set_scheduled_sessions_updated_at
before update on public.scheduled_sessions
for each row execute procedure public.handle_user_updated();

create index scheduled_sessions_user_id_idx on public.scheduled_sessions(user_id);
create index scheduled_sessions_scheduled_for_idx on public.scheduled_sessions(scheduled_for);

-- Table for tasks tied to a scheduled session
drop table if exists public.session_tasks cascade;
create table public.session_tasks (
    id uuid primary key default gen_random_uuid(),
    scheduled_session_id uuid not null references public.scheduled_sessions(id) on delete cascade,
    title text not null,
    estimated_minutes integer default 0,
    order_index integer default 0,
    created_at timestamptz default timezone('utc', now())
);

create index session_tasks_session_id_idx on public.session_tasks(scheduled_session_id);

-- Table for completed sessions and reflections
drop table if exists public.completed_sessions cascade;
create table public.completed_sessions (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.user_profiles(id) on delete cascade,
    scheduled_session_id uuid references public.scheduled_sessions(id) on delete set null,
    started_at timestamptz,
    ended_at timestamptz,
    total_focus_minutes integer,
    total_break_minutes integer,
    reflection text,
    focus_score integer,
    energy_level integer,
    created_at timestamptz default timezone('utc', now())
);

create index completed_sessions_user_id_idx on public.completed_sessions(user_id);
create index completed_sessions_created_at_idx on public.completed_sessions(created_at desc);

-- Table capturing the snapshot of tasks completed during a session
drop table if exists public.completed_session_tasks cascade;
create table public.completed_session_tasks (
    id uuid primary key default gen_random_uuid(),
    completed_session_id uuid not null references public.completed_sessions(id) on delete cascade,
    title text not null,
    estimated_minutes integer,
    actual_minutes integer,
    completed boolean default false,
    notes text
);

create index completed_session_tasks_session_id_idx on public.completed_session_tasks(completed_session_id);

-- Policy helpers
alter table public.user_profiles enable row level security;
alter table public.user_settings enable row level security;
alter table public.session_settings enable row level security;
alter table public.scheduled_sessions enable row level security;
alter table public.session_tasks enable row level security;
alter table public.completed_sessions enable row level security;
alter table public.completed_session_tasks enable row level security;

create policy "Users can manage own profile" on public.user_profiles
    for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "Users can manage their settings" on public.user_settings
    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can manage their session presets" on public.session_settings
    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can manage their scheduled sessions" on public.scheduled_sessions
    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can manage tasks for own sessions" on public.session_tasks
    for all using (
        auth.uid() = (
            select user_id from public.scheduled_sessions where id = session_tasks.scheduled_session_id
        )
    ) with check (
        auth.uid() = (
            select user_id from public.scheduled_sessions where id = session_tasks.scheduled_session_id
        )
    );

create policy "Users can manage their completed sessions" on public.completed_sessions
    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can manage completed session tasks" on public.completed_session_tasks
    for all using (
        auth.uid() = (
            select user_id from public.completed_sessions where id = completed_session_tasks.completed_session_id
        )
    ) with check (
        auth.uid() = (
            select user_id from public.completed_sessions where id = completed_session_tasks.completed_session_id
        )
    );
