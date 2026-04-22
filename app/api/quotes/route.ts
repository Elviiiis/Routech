import { NextResponse } from 'next/server'
import { createQuote, readRoutechContentStore } from '@/lib/content-store'
import type { QuoteRequest } from '@/lib/content-types'

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => null)) as
    | {
        machineId?: string | null
        customerName?: string
        email?: string
        whatsapp?: string
        company?: string
        city?: string
        message?: string
      }
    | null

  if (!payload) {
    return NextResponse.json({ error: 'Payload inválido.' }, { status: 400 })
  }

  const customerName = (payload.customerName || '').trim()
  const email = (payload.email || '').trim()
  const whatsapp = (payload.whatsapp || '').trim()

  if (!customerName || !email || !whatsapp) {
    return NextResponse.json(
      { error: 'Preencha nome, email e WhatsApp.' },
      { status: 400 }
    )
  }

  const store = await readRoutechContentStore()
  const machine =
    store.machines.find((entry) => entry.id === payload.machineId) || null

  const now = new Date().toISOString()

  const quote: QuoteRequest = {
    id: crypto.randomUUID(),
    machineId: machine?.id || null,
    machineTitle: machine?.title || 'Orçamento geral',
    customerName,
    email,
    whatsapp,
    company: (payload.company || '').trim(),
    city: (payload.city || '').trim(),
    message: (payload.message || '').trim(),
    status: 'new',
    notes: '',
    createdAt: now,
    updatedAt: now,
  }

  await createQuote(quote)

  return NextResponse.json({
    success: true,
    quote,
  })
}
