import { expect, test } from '@playwright/test'

/**
 * Login → criar hábito → marcar o check → conferir o streak → apagar o hábito.
 * Usa a conta de teste A do .env.local (a mesma do teste de RLS) e não deixa lixo no banco.
 */
function env(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`Defina ${name} no .env.local para rodar o teste E2E.`)
  return value
}

test('criar um hábito, marcar o check e ver o streak', async ({ page }, testInfo) => {
  const name = `E2E ${testInfo.project.name} ${Date.now()}`

  await page.goto('/login')
  await page.getByLabel('Email').fill(env('RLS_USER_A_EMAIL'))
  await page.getByLabel('Senha').fill(env('RLS_USER_A_PASSWORD'))
  await page.locator('form').getByRole('button', { name: 'Entrar' }).click()
  await expect(page.getByRole('heading', { level: 1, name: 'Hoje' })).toBeVisible()

  await page.getByRole('button', { name: 'Novo hábito ou tarefa' }).click()
  await page.getByRole('menuitem', { name: /Hábito/ }).click()
  await page.getByLabel('Nome').fill(name)
  await page.getByRole('button', { name: 'Criar hábito' }).click()

  // Espera o banco confirmar o check antes de recarregar a página.
  const saved = page.waitForResponse(
    (r) => r.url().includes('/rest/v1/entries') && r.request().method() === 'POST',
  )
  await page.getByRole('button', { name: `${name}: marcar como feito` }).click()
  await expect(page.getByRole('button', { name: new RegExp(`^${name}: feito hoje`) })).toBeVisible()
  await expect(page.getByText('🔥 1 dia').first()).toBeVisible()

  expect((await saved).ok()).toBe(true)

  // O check sobrevive a recarregar a página: foi gravado no banco.
  await page.reload()
  await expect(page.getByRole('button', { name: new RegExp(`^${name}: feito hoje`) })).toBeVisible()

  // Limpeza: apaga o hábito de teste.
  page.on('dialog', (dialog) => void dialog.accept())
  await page.getByRole('button', { name: `Mais opções de ${name}` }).click()
  await page.getByRole('menuitem', { name: 'Editar hábito' }).click()
  await page.getByRole('button', { name: 'Apagar hábito' }).click()
  await expect(page.getByText(name)).toHaveCount(0)
})
