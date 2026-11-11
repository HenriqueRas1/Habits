# Habit Tracker pessoal

Web app de hábitos (PWA) para um único usuário, usado no PC, iPhone e tablet Android.
Todos os dados ficam no Supabase; nada é guardado só no aparelho (sem localStorage para dados).

## Stack
React + Vite + TypeScript (strict), Tailwind, React Router, TanStack Query, Zustand,
Supabase (Postgres, Auth, Realtime), date-fns com fuso, Recharts, React Hook Form + Zod,
vite-plugin-pwa, Vitest + Testing Library. Lint com oxlint, formatação com Prettier. Deploy na Vercel.

## Comandos
- npm run dev / build / test / lint / format
- supabase db push            # aplica migrações
- supabase gen types typescript --linked > src/types/database.ts

## Regras de arquitetura
- Regras de negócio só em src/domain/, como funções puras. Sem React, Supabase ou Date.now();
  "hoje" e "agora" chegam por parâmetro.
- Acesso ao Supabase só em src/features/*/api.ts. Componentes usam hooks do TanStack Query.
- Query keys: ['habits'], ['entries', habitId, from, to], ['timers'], ['profile'].
- Realtime: uma assinatura em src/lib/realtime.ts que só invalida query keys.
- Gravações com id gerado no cliente (crypto.randomUUID()) e atualização otimista.
- Datas de calendário como string YYYY-MM-DD no fuso do perfil (padrão America/Sao_Paulo).
  Conversões de fuso só em src/lib/dates.ts.
- Nunca usar a chave service_role no frontend.
- Mudanças no banco só por nova migração em supabase/migrations/. Nunca editar migrações antigas.

## Regras de domínio (resumo)
- Metas: goal_kind check | count | duration; goal_period day | week | month.
- Progresso: check = dias distintos com done; count/duration = soma de value.
- Estados do período: completed, skipped, not_scheduled, in_progress, missed.
- Streak: conta completed; skipped, not_scheduled e in_progress são neutros; missed quebra.
- Registro retroativo permitido de start_date até hoje; nada no futuro.
- "Dias sem": tempo desde a última entry kind = relapse (ou quit_started_at).
- Timer: estado em active_timers; ao parar vira entry done com value em minutos e source = timer.

## Convenções
- Interface em português; código e commits em inglês (Conventional Commits).
- Sem any. Componentes com até ~150 linhas.
- Testes de domínio antes da implementação (TDD).
- Antes de encerrar uma tarefa: npm run lint && npm run test && npm run build.
- Sempre apresentar um plano antes de implementar uma fase.

## Notas de ferramentas
- O projeto usa TypeScript 7 (template atual do Vite). O typescript-eslint ainda não suporta
  TS 7, por isso o lint é feito com oxlint (.oxlintrc.json) em vez de ESLint.

## Fase atual
Fase 0 — base do projeto. (Atualize esta linha ao terminar cada fase.)
