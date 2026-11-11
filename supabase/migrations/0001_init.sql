-- Tipos
create type habit_type   as enum ('build', 'quit');
create type goal_kind    as enum ('check', 'count', 'duration');
create type goal_period  as enum ('day', 'week', 'month');
create type entry_kind   as enum ('done', 'skip', 'relapse');
create type entry_source as enum ('manual', 'timer');

-- Perfil (1 por usuário, criado por trigger)
create table public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  timezone     text not null default 'America/Sao_Paulo',
  week_start   smallint not null default 1 check (week_start in (0, 1)), -- 0 = domingo, 1 = segunda
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- Hábitos
create table public.habits (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name            text not null check (char_length(name) between 1 and 60),
  description     text,
  icon            text not null default '✅',
  color           text not null default '#6366f1',
  type            habit_type  not null default 'build',
  goal_kind       goal_kind   not null default 'check',
  goal_target     integer     not null default 1 check (goal_target > 0),
  goal_unit       text,                      -- ex.: 'copos', 'páginas'
  goal_period     goal_period not null default 'day',
  schedule_days   smallint[],                -- null = todo dia; 0=dom ... 6=sáb (só period = day)
  start_date      date not null,             -- enviado pelo app, no fuso do usuário
  quit_started_at timestamptz,               -- só type = quit
  sort_order      integer not null default 0,
  archived_at     timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Registros
create table public.entries (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  habit_id   uuid not null references public.habits(id) on delete cascade,
  entry_date date not null,
  kind       entry_kind   not null default 'done',
  value      numeric(10,2) not null default 1 check (value >= 0),
  source     entry_source not null default 'manual',
  started_at timestamptz,                    -- preenchido quando vem do timer
  ended_at   timestamptz,
  note       text check (char_length(note) <= 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Timer em andamento (sincroniza entre aparelhos)
create table public.active_timers (
  habit_id            uuid primary key references public.habits(id) on delete cascade,
  user_id             uuid not null default auth.uid() references auth.users(id) on delete cascade,
  mode                text not null default 'stopwatch' check (mode in ('stopwatch', 'countdown')),
  countdown_seconds   integer,
  started_at          timestamptz not null default now(),
  paused_at           timestamptz,
  accumulated_seconds integer not null default 0
);

-- Índices
create index entries_user_habit_date_idx on public.entries (user_id, habit_id, entry_date);
create index habits_user_active_idx      on public.habits (user_id) where archived_at is null;

-- updated_at automático
create or replace function public.set_updated_at() returns trigger
language plpgsql as $$ begin new.updated_at = now(); return new; end; $$;

create trigger profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger habits_updated_at   before update on public.habits   for each row execute function public.set_updated_at();
create trigger entries_updated_at  before update on public.entries  for each row execute function public.set_updated_at();

-- Cria o perfil quando alguém se cadastra
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end; $$;

create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();

-- Segurança (Row Level Security): cada linha só pode ser lida e gravada pelo próprio dono
alter table public.profiles      enable row level security;
alter table public.habits        enable row level security;
alter table public.entries       enable row level security;
alter table public.active_timers enable row level security;

create policy "perfil próprio" on public.profiles for all
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

create policy "hábitos próprios" on public.habits for all
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

create policy "registros próprios" on public.entries for all
  using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
    and exists (select 1 from public.habits h where h.id = habit_id and h.user_id = (select auth.uid()))
  );

create policy "timers próprios" on public.active_timers for all
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

-- Tempo real para estas tabelas
alter publication supabase_realtime add table public.habits, public.entries, public.active_timers;
