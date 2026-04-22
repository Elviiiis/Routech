import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json(
    {
      error: 'Este endpoint não é mais usado. Entre pelo Firebase Auth no painel.',
    },
    { status: 410 }
  )
}
