import 'server-only'

import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import path from 'node:path'
import {
  defaultRoutechContentStore,
  type Machine,
  type QuoteRequest,
  type RoutechContentStore,
  type ShowcaseSettings,
} from '@/lib/content-types'

const dataDirectory = path.join(process.cwd(), 'data')
const storePath = path.join(dataDirectory, 'routech-content.json')

async function ensureStore() {
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

export async function readRoutechContentStore(): Promise<RoutechContentStore> {
  await ensureStore()
  const raw = await readFile(storePath, 'utf8')

  try {
    const parsed = JSON.parse(raw) as Partial<RoutechContentStore>

    return {
      machines: Array.isArray(parsed.machines) ? parsed.machines : [],
      showcase: {
        ...defaultRoutechContentStore.showcase,
        ...(parsed.showcase ?? {}),
      },
      quotes: Array.isArray(parsed.quotes) ? parsed.quotes : [],
    }
  } catch {
    return structuredClone(defaultRoutechContentStore)
  }
}

export async function writeRoutechContentStore(
  content: RoutechContentStore
): Promise<void> {
  await ensureStore()
  const tempPath = `${storePath}.tmp`
  await writeFile(tempPath, JSON.stringify(content, null, 2), 'utf8')
  await rename(tempPath, storePath)
}

export async function getPublicMachines() {
  const store = await readRoutechContentStore()
  return store.machines.filter((machine) => machine.published)
}

export async function getMachineBySlug(slug: string) {
  const machines = await getPublicMachines()
  return machines.find((machine) => machine.slug === slug)
}

export async function saveMachine(machine: Machine) {
  const store = await readRoutechContentStore()
  const index = store.machines.findIndex((entry) => entry.id === machine.id)

  if (index >= 0) {
    store.machines[index] = machine
  } else {
    store.machines.unshift(machine)
  }

  await writeRoutechContentStore(store)
  return machine
}

export async function deleteMachine(machineId: string) {
  const store = await readRoutechContentStore()
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

  await writeRoutechContentStore(store)
}

export async function saveShowcase(showcase: ShowcaseSettings) {
  const store = await readRoutechContentStore()
  store.showcase = showcase
  await writeRoutechContentStore(store)
  return showcase
}

export async function createQuote(quote: QuoteRequest) {
  const store = await readRoutechContentStore()
  store.quotes.unshift(quote)
  await writeRoutechContentStore(store)
  return quote
}

export async function updateQuote(
  quoteId: string,
  updates: Partial<Pick<QuoteRequest, 'status' | 'notes'>>
) {
  const store = await readRoutechContentStore()
  const index = store.quotes.findIndex((quote) => quote.id === quoteId)

  if (index === -1) {
    return null
  }

  store.quotes[index] = {
    ...store.quotes[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  }

  await writeRoutechContentStore(store)
  return store.quotes[index]
}
