import { NextResponse } from 'next/server'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { readRoutechContentStore, saveMachine } from '@/lib/content-store'
import { sanitizeMachinePayload } from '@/lib/machine-utils'

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
  }

  const payload = await request.json().catch(() => null)

  if (!payload || typeof payload !== 'object') {
    return NextResponse.json({ error: 'Payload inválido.' }, { status: 400 })
  }

  const machine = sanitizeMachinePayload(payload)

  if (!machine.title || !machine.shortDescription || !machine.description) {
    return NextResponse.json(
      { error: 'Preencha título, descrição curta e descrição completa.' },
      { status: 400 }
    )
  }

  const store = await readRoutechContentStore()
  const slugAlreadyExists = store.machines.some(
    (existingMachine) => existingMachine.slug === machine.slug
  )

  if (slugAlreadyExists) {
    return NextResponse.json(
      { error: 'Já existe uma máquina com este slug.' },
      { status: 400 }
    )
  }

  const savedMachine = await saveMachine(machine)
  return NextResponse.json({ machine: savedMachine })
}
