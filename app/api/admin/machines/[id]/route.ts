import { NextResponse } from 'next/server'
import {
  deleteMachine,
  readRoutechContentStore,
  saveMachine,
} from '@/lib/content-store'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { sanitizeMachinePayload } from '@/lib/machine-utils'

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function PATCH(request: Request, context: RouteContext) {
  if (!(await isAdminAuthenticated(request))) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
  }

  const { id } = await context.params
  const payload = await request.json().catch(() => null)

  if (!payload || typeof payload !== 'object') {
    return NextResponse.json({ error: 'Payload inválido.' }, { status: 400 })
  }

  const machine = sanitizeMachinePayload({
    ...payload,
    id,
  })

  if (!machine.title || !machine.shortDescription || !machine.description) {
    return NextResponse.json(
      { error: 'Preencha título, descrição curta e descrição completa.' },
      { status: 400 }
    )
  }

  const store = await readRoutechContentStore()
  const slugAlreadyExists = store.machines.some(
    (existingMachine) =>
      existingMachine.id !== id && existingMachine.slug === machine.slug
  )

  if (slugAlreadyExists) {
    return NextResponse.json(
      { error: 'Já existe outra máquina com este slug.' },
      { status: 400 }
    )
  }

  const savedMachine = await saveMachine(machine)
  return NextResponse.json({ machine: savedMachine })
}

export async function DELETE(request: Request, context: RouteContext) {
  if (!(await isAdminAuthenticated(request))) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
  }

  const { id } = await context.params
  await deleteMachine(id)

  return NextResponse.json({ success: true })
}
