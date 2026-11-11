type Props = {
  title: string
  description?: string
}

export function PageHeader({ title, description }: Props) {
  return (
    <header className="mb-6">
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
    </header>
  )
}
