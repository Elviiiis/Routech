import { NextResponse } from 'next/server'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { readRoutechContentStore } from '@/lib/content-store'

function isCloudinaryEnabled() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  )
}

export async function GET(request: Request) {
  if (!(await isAdminAuthenticated(request))) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
  }

  const store = await readRoutechContentStore()

  return NextResponse.json({
    machines: store.machines,
    quotes: store.quotes,
    showcase: store.showcase,
    cloudinaryEnabled: isCloudinaryEnabled(),
  })
}
