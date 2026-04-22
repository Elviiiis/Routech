import { NextResponse } from 'next/server'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { saveShowcase } from '@/lib/content-store'

export async function PATCH(request: Request) {
  if (!(await isAdminAuthenticated(request))) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
  }

  const payload = (await request.json().catch(() => null)) as
    | {
        featuredMachineId?: string | null
        eyebrow?: string
        title?: string
        description?: string
        ctaLabel?: string
      }
    | null

  if (!payload) {
    return NextResponse.json({ error: 'Payload inválido.' }, { status: 400 })
  }

  const showcase = await saveShowcase({
    featuredMachineId: payload.featuredMachineId || null,
    eyebrow: (payload.eyebrow || '').trim(),
    title: (payload.title || '').trim(),
    description: (payload.description || '').trim(),
    ctaLabel: (payload.ctaLabel || 'Ver detalhes').trim(),
  })

  return NextResponse.json({ showcase })
}
