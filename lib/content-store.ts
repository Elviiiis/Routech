import 'server-only'

import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import path from 'node:path'
import {
  defaultRoutechContentStore,
  type Machine,
  type MachineImageAsset,
  type MachineSpecification,
  type QuoteRequest,
  type RoutechContentStore,
  type ShowcaseSettings,
} from '@/lib/content-types'
import { getFirestoreAdmin, isFirestoreAdminConfigured } from '@/lib/firebase-admin'

const dataDirectory = path.join(process.cwd(), 'data')
const storePath = path.join(dataDirectory, 'routech-content.json')

const machinesCollection = 'machines'
const quotesCollection = 'quotes'
const settingsCollection = 'settings'
const showcaseDocumentId = 'showcase'

type DataProvider = 'file' | 'firestore'

function getDataProvider(): DataProvider {
  return process.env.ROUTECH_DATA_PROVIDER === 'firestore' ? 'firestore' : 'file'
}

function assertFirestoreReady() {
  if (!isFirestoreAdminConfigured()) {
    throw new Error(
      'Firestore definido como banco principal, mas as credenciais administrativas não foram configuradas.'
    )
  }
}

function normalizeImageAsset(
  raw: Partial<MachineImageAsset> | null | undefined
): MachineImageAsset | null {
  if (!raw?.url || !raw.publicId) {
    return null
  }

  return {
    url: raw.url,
    publicId: raw.publicId,
  }
}

function normalizeSpecification(
  raw: Partial<MachineSpecification> | null | undefined
): MachineSpecification | null {
  if (!raw?.id || !raw.label || !raw.value) {
    return null
  }

  return {
    id: raw.id,
    label: raw.label,
    value: raw.value,
  }
}

function normalizeMachine(raw: Partial<Machine>): Machine {
  return {
    id: raw.id || '',
    slug: raw.slug || '',
    title: raw.title || '',
    shortDescription: raw.shortDescription || '',
    description: raw.description || '',
    category: raw.category || 'Máquina CNC',
    badge: raw.badge || '',
    priceMode: raw.priceMode === 'visible' ? 'visible' : 'quote',
    price: raw.price || '',
    compareAtPrice: raw.compareAtPrice || '',
    priceLabel: raw.priceLabel || 'Solicite um orçamento',
    ctaLabel: raw.ctaLabel || 'Solicitar orçamento',
    published: Boolean(raw.published),
    mainImage: normalizeImageAsset(raw.mainImage),
    gallery: Array.isArray(raw.gallery)
      ? raw.gallery
          .map((image) => normalizeImageAsset(image))
          .filter((image): image is MachineImageAsset => Boolean(image))
      : [],
    features: Array.isArray(raw.features)
      ? raw.features.filter((feature): feature is string => Boolean(feature))
      : [],
    specifications: Array.isArray(raw.specifications)
      ? raw.specifications
          .map((specification) => normalizeSpecification(specification))
          .filter(
            (specification): specification is MachineSpecification =>
              Boolean(specification)
          )
      : [],
    createdAt: raw.createdAt || new Date().toISOString(),
    updatedAt: raw.updatedAt || new Date().toISOString(),
  }
}

function normalizeShowcase(raw: Partial<ShowcaseSettings> | null | undefined) {
  return {
    ...defaultRoutechContentStore.showcase,
    ...(raw ?? {}),
  }
}

function normalizeQuote(raw: Partial<QuoteRequest>): QuoteRequest {
  return {
    id: raw.id || '',
    machineId: raw.machineId || null,
    machineTitle: raw.machineTitle || 'Orçamento geral',
    customerName: raw.customerName || '',
    email: raw.email || '',
    whatsapp: raw.whatsapp || '',
    company: raw.company || '',
    city: raw.city || '',
    message: raw.message || '',
    status:
      raw.status === 'contacted' ||
      raw.status === 'won' ||
      raw.status === 'lost'
        ? raw.status
        : 'new',
    notes: raw.notes || '',
    createdAt: raw.createdAt || new Date().toISOString(),
    updatedAt: raw.updatedAt || new Date().toISOString(),
  }
}

function hasMeaningfulShowcase(showcase: ShowcaseSettings) {
  return (
    showcase.featuredMachineId !== null ||
    showcase.eyebrow !== defaultRoutechContentStore.showcase.eyebrow ||
    showcase.title !== defaultRoutechContentStore.showcase.title ||
    showcase.description !== defaultRoutechContentStore.showcase.description ||
    showcase.ctaLabel !== defaultRoutechContentStore.showcase.ctaLabel
  )
}

function hasMeaningfulStoreContent(store: RoutechContentStore) {
  return (
    store.machines.length > 0 ||
    store.quotes.length > 0 ||
    hasMeaningfulShowcase(store.showcase)
  )
}

async function ensureFileStore() {
  await mkdir(dataDirectory, { recursive: true })

  try {
    await readFile(storePath, 'utf8')
  } catch {
    await writeFile(
      storePath,
      JSON.stringify(defaultRoutechContentStore, null, 2),
      'utf8'
    )
  }
}

async function readFileContentStore(): Promise<RoutechContentStore> {
  await ensureFileStore()
  const raw = await readFile(storePath, 'utf8')

  try {
    const parsed = JSON.parse(raw) as Partial<RoutechContentStore>

    return {
      machines: Array.isArray(parsed.machines)
        ? parsed.machines.map((machine) => normalizeMachine(machine))
        : [],
      showcase: normalizeShowcase(parsed.showcase),
      quotes: Array.isArray(parsed.quotes)
        ? parsed.quotes.map((quote) => normalizeQuote(quote))
        : [],
    }
  } catch {
    return structuredClone(defaultRoutechContentStore)
  }
}

async function writeFileContentStore(content: RoutechContentStore): Promise<void> {
  await ensureFileStore()
  const tempPath = `${storePath}.tmp`
  await writeFile(tempPath, JSON.stringify(content, null, 2), 'utf8')
  await rename(tempPath, storePath)
}

async function bootstrapFirestoreFromFileStore() {
  const db = getFirestoreAdmin()
  const [machinesSnapshot, quotesSnapshot, showcaseSnapshot] = await Promise.all([
    db.collection(machinesCollection).limit(1).get(),
    db.collection(quotesCollection).limit(1).get(),
    db.collection(settingsCollection).doc(showcaseDocumentId).get(),
  ])

  const firestoreAlreadyHasData =
    !machinesSnapshot.empty || !quotesSnapshot.empty || showcaseSnapshot.exists

  if (firestoreAlreadyHasData) {
    return
  }

  const fileStore = await readFileContentStore()

  if (!hasMeaningfulStoreContent(fileStore)) {
    return
  }

  const batch = db.batch()

  for (const machine of fileStore.machines) {
    batch.set(db.collection(machinesCollection).doc(machine.id), machine)
  }

  for (const quote of fileStore.quotes) {
    batch.set(db.collection(quotesCollection).doc(quote.id), quote)
  }

  if (hasMeaningfulShowcase(fileStore.showcase)) {
    batch.set(
      db.collection(settingsCollection).doc(showcaseDocumentId),
      fileStore.showcase
    )
  }

  await batch.commit()
}

async function readFirestoreContentStore(): Promise<RoutechContentStore> {
  assertFirestoreReady()
  await bootstrapFirestoreFromFileStore()

  const db = getFirestoreAdmin()
  const [machinesSnapshot, quotesSnapshot, showcaseSnapshot] = await Promise.all([
    db.collection(machinesCollection).get(),
    db.collection(quotesCollection).get(),
    db.collection(settingsCollection).doc(showcaseDocumentId).get(),
  ])

  return {
    machines: machinesSnapshot.docs
      .map((doc) => normalizeMachine(doc.data() as Partial<Machine>))
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    showcase: normalizeShowcase(
      showcaseSnapshot.exists
        ? (showcaseSnapshot.data() as Partial<ShowcaseSettings>)
        : undefined
    ),
    quotes: quotesSnapshot.docs
      .map((doc) => normalizeQuote(doc.data() as Partial<QuoteRequest>))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  }
}

export async function readRoutechContentStore(): Promise<RoutechContentStore> {
  if (getDataProvider() === 'file') {
    return readFileContentStore()
  }

  return readFirestoreContentStore()
}

export async function writeRoutechContentStore(
  content: RoutechContentStore
): Promise<void> {
  if (getDataProvider() === 'file') {
    await writeFileContentStore(content)
    return
  }

  assertFirestoreReady()
  const db = getFirestoreAdmin()
  const batch = db.batch()

  for (const machine of content.machines) {
    batch.set(db.collection(machinesCollection).doc(machine.id), machine)
  }

  for (const quote of content.quotes) {
    batch.set(db.collection(quotesCollection).doc(quote.id), quote)
  }

  batch.set(
    db.collection(settingsCollection).doc(showcaseDocumentId),
    content.showcase
  )

  await batch.commit()
}

export async function getPublicMachines() {
  if (getDataProvider() === 'file') {
    const store = await readFileContentStore()
    return store.machines.filter((machine) => machine.published)
  }

  assertFirestoreReady()
  await bootstrapFirestoreFromFileStore()

  const snapshot = await getFirestoreAdmin()
    .collection(machinesCollection)
    .where('published', '==', true)
    .get()

  return snapshot.docs
    .map((doc) => normalizeMachine(doc.data() as Partial<Machine>))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
}

export async function getMachineBySlug(slug: string) {
  if (getDataProvider() === 'file') {
    const machines = await getPublicMachines()
    return machines.find((machine) => machine.slug === slug)
  }

  assertFirestoreReady()
  await bootstrapFirestoreFromFileStore()

  const snapshot = await getFirestoreAdmin()
    .collection(machinesCollection)
    .where('slug', '==', slug)
    .limit(1)
    .get()

  if (snapshot.empty) {
    return undefined
  }

  const machine = normalizeMachine(snapshot.docs[0].data() as Partial<Machine>)
  return machine.published ? machine : undefined
}

export async function saveMachine(machine: Machine) {
  if (getDataProvider() === 'file') {
    const store = await readFileContentStore()
    const index = store.machines.findIndex((entry) => entry.id === machine.id)

    if (index >= 0) {
      store.machines[index] = machine
    } else {
      store.machines.unshift(machine)
    }

    await writeFileContentStore(store)
    return machine
  }

  assertFirestoreReady()
  await getFirestoreAdmin()
    .collection(machinesCollection)
    .doc(machine.id)
    .set(machine)

  return machine
}

export async function deleteMachine(machineId: string) {
  if (getDataProvider() === 'file') {
    const store = await readFileContentStore()
    store.machines = store.machines.filter((machine) => machine.id !== machineId)

    if (store.showcase.featuredMachineId === machineId) {
      store.showcase.featuredMachineId = null
    }

    store.quotes = store.quotes.map((quote) =>
      quote.machineId === machineId
        ? {
            ...quote,
            machineId: null,
          }
        : quote
    )

    await writeFileContentStore(store)
    return
  }

  assertFirestoreReady()
  const db = getFirestoreAdmin()
  const batch = db.batch()

  batch.delete(db.collection(machinesCollection).doc(machineId))

  const showcaseReference = db
    .collection(settingsCollection)
    .doc(showcaseDocumentId)
  const showcaseSnapshot = await showcaseReference.get()

  if (showcaseSnapshot.exists) {
    const showcase = normalizeShowcase(
      showcaseSnapshot.data() as Partial<ShowcaseSettings>
    )

    if (showcase.featuredMachineId === machineId) {
      batch.set(
        showcaseReference,
        {
          ...showcase,
          featuredMachineId: null,
        },
        { merge: true }
      )
    }
  }

  const quotesSnapshot = await db
    .collection(quotesCollection)
    .where('machineId', '==', machineId)
    .get()

  for (const quoteDocument of quotesSnapshot.docs) {
    batch.set(
      quoteDocument.ref,
      {
        machineId: null,
      },
      { merge: true }
    )
  }

  await batch.commit()
}

export async function saveShowcase(showcase: ShowcaseSettings) {
  if (getDataProvider() === 'file') {
    const store = await readFileContentStore()
    store.showcase = showcase
    await writeFileContentStore(store)
    return showcase
  }

  assertFirestoreReady()
  await getFirestoreAdmin()
    .collection(settingsCollection)
    .doc(showcaseDocumentId)
    .set(showcase)

  return showcase
}

export async function createQuote(quote: QuoteRequest) {
  if (getDataProvider() === 'file') {
    const store = await readFileContentStore()
    store.quotes.unshift(quote)
    await writeFileContentStore(store)
    return quote
  }

  assertFirestoreReady()
  await getFirestoreAdmin()
    .collection(quotesCollection)
    .doc(quote.id)
    .set(quote)

  return quote
}

export async function updateQuote(
  quoteId: string,
  updates: Partial<Pick<QuoteRequest, 'status' | 'notes'>>
) {
  if (getDataProvider() === 'file') {
    const store = await readFileContentStore()
    const index = store.quotes.findIndex((quote) => quote.id === quoteId)

    if (index === -1) {
      return null
    }

    store.quotes[index] = {
      ...store.quotes[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    }

    await writeFileContentStore(store)
    return store.quotes[index]
  }

  assertFirestoreReady()
  const db = getFirestoreAdmin()
  const quoteReference = db.collection(quotesCollection).doc(quoteId)
  const quoteSnapshot = await quoteReference.get()

  if (!quoteSnapshot.exists) {
    return null
  }

  const nextQuote = {
    ...normalizeQuote(quoteSnapshot.data() as Partial<QuoteRequest>),
    ...updates,
    updatedAt: new Date().toISOString(),
  }

  await quoteReference.set(nextQuote)
  return nextQuote
}
