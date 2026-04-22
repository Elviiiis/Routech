import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { cert, getApps, initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

function normalizePrivateKey(value) {
  return value?.replace(/\\n/g, '\n')
}

function getServiceAccount() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    const parsed = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON)

    return {
      projectId: parsed.project_id || parsed.projectId,
      clientEmail: parsed.client_email || parsed.clientEmail,
      privateKey: normalizePrivateKey(parsed.private_key || parsed.privateKey),
    }
  }

  return {
    projectId:
      process.env.FIREBASE_ADMIN_PROJECT_ID ||
      process.env.FIREBASE_PROJECT_ID ||
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail:
      process.env.FIREBASE_ADMIN_CLIENT_EMAIL || process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: normalizePrivateKey(
      process.env.FIREBASE_ADMIN_PRIVATE_KEY || process.env.FIREBASE_PRIVATE_KEY
    ),
  }
}

function ensureFirebaseAdmin() {
  const serviceAccount = getServiceAccount()

  if (
    !serviceAccount.projectId ||
    !serviceAccount.clientEmail ||
    !serviceAccount.privateKey
  ) {
    throw new Error(
      'Configure FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL e FIREBASE_ADMIN_PRIVATE_KEY antes de rodar o seed.'
    )
  }

  if (getApps().length === 0) {
    initializeApp({
      credential: cert(serviceAccount),
    })
  }

  return getFirestore()
}

async function main() {
  const storePath = path.join(process.cwd(), 'data', 'routech-content.json')
  const raw = await readFile(storePath, 'utf8')
  const store = JSON.parse(raw)
  const db = ensureFirebaseAdmin()
  const batch = db.batch()

  for (const machine of store.machines ?? []) {
    batch.set(db.collection('machines').doc(machine.id), machine)
  }

  for (const quote of store.quotes ?? []) {
    batch.set(db.collection('quotes').doc(quote.id), quote)
  }

  batch.set(
    db.collection('settings').doc('showcase'),
    store.showcase ?? {},
    { merge: true }
  )

  await batch.commit()

  console.log(
    `Seed concluido. Maquinas: ${(store.machines ?? []).length}, contatos: ${(store.quotes ?? []).length}.`
  )
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
