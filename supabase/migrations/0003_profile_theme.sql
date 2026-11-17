-- Tema do app salvo no perfil, para valer em todos os aparelhos.
alter table public.profiles
  add column theme text not null default 'light' check (theme in ('light', 'dark', 'system'));
