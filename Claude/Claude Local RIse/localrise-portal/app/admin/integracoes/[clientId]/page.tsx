import { redirect } from 'next/navigation'

// Redireciona a rota antiga para a nova página de conexões OAuth
export default async function IntegracoesClienteRedirect({
  params,
}: {
  params: Promise<{ clientId: string }>
}) {
  const { clientId } = await params
  redirect(`/admin/clientes/${clientId}/conexoes`)
}
