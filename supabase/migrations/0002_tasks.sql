-- Tarefas do dia: ficam presas à data em que foram criadas (não passam para o dia seguinte).
create table public.tasks (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  task_date  date not null,                -- dia da tarefa, no fuso do usuário
  title      text not null check (char_length(title) between 1 and 200),
  done_at    timestamptz,                  -- null = pendente
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index tasks_user_date_idx on public.tasks (user_id, task_date);

create trigger tasks_updated_at before update on public.tasks
for each row execute function public.set_updated_at();

alter table public.tasks enable row level security;

create policy "tarefas próprias" on public.tasks for all
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

alter publication supabase_realtime add table public.tasks;
