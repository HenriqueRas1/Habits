# Backup e restauração

Há dois backups. O JSON pelo app resolve o dia a dia; o dump semanal é para desastre.

## 1. Backup JSON pelo app (dia a dia)

- **Exportar:** Ajustes → Dados → **Exportar JSON**. Baixa `habitos-backup-AAAA-MM-DD.json` com
  hábitos (inclusive arquivados), registros, tarefas e preferências.
- **Restaurar:** Ajustes → Dados → **Importar backup** → escolher o arquivo → conferir o resumo →
  confirmar.
  - Cada linha é gravada pelo id: o que foi apagado volta (com o histórico) e o que existe fica
    igual ao backup.
  - Nada que existe hoje e não está no arquivo é apagado.
- **Planilha:** **Exportar CSV** baixa os registros (separador `;`), para abrir no Excel.

## 2. Backup semanal automático (GitHub Actions)

O workflow `.github/workflows/backup.yml` roda todo domingo às 6h (horário de São Paulo) e pode ser
disparado à mão em **Actions → Backup semanal → Run workflow**. Ele faz um `pg_dump` do schema
`public`, criptografa com AES-256 (gpg) e guarda o arquivo como artifact por 90 dias. A execução
também conta como atividade no Supabase, o que evita a pausa por inatividade do plano grátis.

### Segredos (uma vez)

Em GitHub → repositório → **Settings → Secrets and variables → Actions → New repository secret**:

| Segredo             | Valor                                                                                                        |
| ------------------- | ------------------------------------------------------------------------------------------------------------ |
| `SUPABASE_DB_URL`   | Supabase → **Connect** → **Session pooler** → URI, com a senha do banco no lugar de `[YOUR-PASSWORD]`        |
| `BACKUP_PASSPHRASE` | Uma senha longa só para os backups. Guarde-a também no seu gerenciador de senhas: sem ela o backup não abre. |

O repositório é público, e qualquer pessoa logada no GitHub pode baixar artifacts de repositórios
públicos. Por isso o arquivo **sempre** sai criptografado.

### Restaurar o dump (desastre)

1. Em **Actions → Backup semanal**, abra a execução e baixe o artifact (vem em `.zip`).
2. Descompacte e descriptografe:

   ```bash
   gpg --decrypt --output habitos.dump habitos-AAAA-MM-DD.dump.gpg
   ```

3. Restaure os dados num banco que já tenha as migrações aplicadas (`npm run db:push`) e o mesmo
   usuário (o `user_id` aponta para `auth.users`):

   ```bash
   pg_restore --data-only --no-owner -d "$SUPABASE_DB_URL" habitos.dump
   ```

   Para restaurar só alguns dados, prefira o caminho do JSON pelo app.

## Teste de restauração (fase 8)

Backup nunca restaurado não conta como backup. Roteiro:

1. Crie um hábito de teste e marque alguns dias.
2. Ajustes → **Exportar JSON**.
3. Apague o hábito (Editar → Apagar hábito).
4. Ajustes → **Importar backup** → o resumo deve mostrar 1 hábito e os registros como "não existem
   hoje" → confirmar.
5. O hábito volta na Hoje com o histórico e o streak.
