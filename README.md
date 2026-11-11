# Hábitos

Web app pessoal de hábitos (PWA) para PC, iPhone e tablet Android, com dados no Supabase.
O planejamento completo e as regras do projeto estão em [CLAUDE.md](CLAUDE.md).

## Rodar localmente

```bash
npm install
npm run dev
```

## Comandos

| Comando          | O que faz                        |
| ---------------- | -------------------------------- |
| `npm run dev`    | Servidor local em localhost:5173 |
| `npm run build`  | Checa tipos e gera `dist/`       |
| `npm run test`   | Roda os testes (Vitest)          |
| `npm run lint`   | Lint com oxlint                  |
| `npm run format` | Formata com Prettier             |

## Deploy

A Vercel publica a cada push na `master`. O `vercel.json` redireciona todas as rotas para o
`index.html`, para que links como `/stats` funcionem ao recarregar a página.
