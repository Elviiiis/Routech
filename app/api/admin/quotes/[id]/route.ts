import { NextResponse } from 'next/server'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { updateQuote } from '@/lib/content-store'
import type { QuoteStatus } from '@/lib/content-types'

type RouteContext = {
  params: Promise<{ id: string }>
}

function sanitizeQuoteStatus(status: string | undefined): QuoteStatus {
  switch (status) {
    case 'contacted':
    case 'won':
    case 'lost':
      return status
    default:
      return 'new'
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  if (!(await isAdminAuthenticated(request))) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
  }

  const { id } = await context.params
  const payload = (await request.json().catch(() => null)) as
    | { status?: string; notes?: string }
    | null

  if (!payload) {
    return NextResponse.json({ error: 'Payload inválido.' }, { status: 400 })
  }

  const quote = await updateQuote(id, {
    status: sanitizeQuoteStatus(payload.status),
    notes: (payload.notes || '').trim(),
  })

  if (!quote) {
    return NextResponse.json(
      { error: 'Contato não encontrado.' },
      { status: 404 }
    )
  }

  return NextResponse.json({ quote })
}
