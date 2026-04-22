import 'server-only'

import {
  applicationDefault,
  cert,
  getApp,
  getApps,
  initializeApp,
  type App,
  type ServiceAccount,
} from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'

function normalizePrivateKey(value: string | undefined) {
  return value?.replace(/\\n/g, '\n')
}

function readServiceAccountFromJson(): ServiceAccount | null {
  const rawJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim()

  if (!rawJson) {
    return null
  }

  try {
    const parsed = JSON.parse(rawJson) as Record<string, string | undefined>

    return {
      projectId: parsed.project_id || parsed.projectId,
      clientEmail: parsed.client_email || parsed.clientEmail,
      privateKey: normalizePrivateKey(parsed.private_key || parsed.privateKey),
    }
  } catch {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON inválido.')
  }
}

function readServiceAccountFromParts(): ServiceAccount | null {
  const projectId =
    process.env.FIREBASE_ADMIN_PROJECT_ID ||
    process.env.FIREBASE_PROJECT_ID ||
    process.env.GCLOUD_PROJECT ||
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  const clientEmail =
    process.env.FIREBASE_ADMIN_CLIENT_EMAIL || process.env.FIREBASE_CLIENT_EMAIL
  const privateKey = normalizePrivateKey(
    process.env.FIREBASE_ADMIN_PRIVATE_KEY || process.env.FIREBASE_PRIVATE_KEY
  )

  if (!projectId || !clientEmail || !privateKey) {
    return null
  }

  return {
    projectId,
    clientEmail,
    privateKey,
  }
}

function getFirebaseAdminApp(): App {
  if (getApps().length > 0) {
    return getApp()
  }

  const serviceAccount =
    readServiceAccountFromJson() || readServiceAccountFromParts()

  if (serviceAccount) {
    return initializeApp({
      credential: cert(serviceAccount),
    })
  }

  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    return initializeApp({
      credential: applicationDefault(),
    })
  }

  throw new Error(
    'Credenciais administrativas do Firebase não configuradas para o Firestore.'
  )
}

export function isFirestoreAdminConfigured() {
  return Boolean(
    readServiceAccountFromJson() ||
      readServiceAccountFromParts() ||
      process.env.GOOGLE_APPLICATION_CREDENTIALS
  )
}

export function getFirestoreAdmin() {
  return getFirestore(getFirebaseAdminApp())
}

export function getFirebaseAdminAuth() {
  return getAuth(getFirebaseAdminApp())
}
