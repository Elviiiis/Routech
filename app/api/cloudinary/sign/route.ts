import { createHash } from 'node:crypto'
import { NextResponse } from 'next/server'
import { isAdminAuthenticated } from '@/lib/admin-auth'

function getCloudinaryEnvironment() {
  return {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
    folder: process.env.CLOUDINARY_UPLOAD_FOLDER || 'routech',
  }
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated(request))) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
  }

  const { cloudName, apiKey, apiSecret, folder } = getCloudinaryEnvironment()

  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json(
      { error: 'Cloudinary não configurado no ambiente.' },
      { status: 400 }
    )
  }

  const timestamp = Math.floor(Date.now() / 1000)
  const signatureBase = `folder=${folder}&timestamp=${timestamp}${apiSecret}`
  const signature = createHash('sha1').update(signatureBase).digest('hex')

  return NextResponse.json({
    cloudName,
    apiKey,
    timestamp,
    folder,
    signature,
  })
}
