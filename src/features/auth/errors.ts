type AuthErrorLike = { message: string; code?: string; status?: number }

const byCode: Record<string, string> = {
  invalid_credentials: 'Email ou senha incorretos.',
  email_not_confirmed:
    'Confirme seu email antes de entrar. Procure o link na sua caixa de entrada.',
  user_already_exists: 'Já existe uma conta com esse email.',
  weak_password: 'Senha fraca. Use pelo menos 6 caracteres.',
  over_email_send_rate_limit: 'Muitos emails enviados. Espere alguns minutos e tente de novo.',
  over_request_rate_limit: 'Muitas tentativas. Espere um pouco e tente de novo.',
  same_password: 'A nova senha precisa ser diferente da atual.',
  validation_failed: 'Confira o email e a senha.',
}

export function translateAuthError(error: AuthErrorLike): string {
  if (error.code && byCode[error.code]) return byCode[error.code]
  if (/fetch|network/i.test(error.message))
    return 'Sem conexão com o servidor. Verifique a internet.'
  return 'Algo deu errado. Tente de novo.'
}
