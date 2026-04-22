export type PriceMode = 'visible' | 'quote'

export type QuoteStatus = 'new' | 'contacted' | 'won' | 'lost'

export interface MachineImageAsset {
  url: string
  publicId: string
}

export interface MachineSpecification {
  id: string
  label: string
  value: string
}

export interface Machine {
  id: string
  slug: string
  title: string
  shortDescription: string
  description: string
  category: string
  badge: string
  priceMode: PriceMode
  price: string
  compareAtPrice: string
  priceLabel: string
  ctaLabel: string
  published: boolean
  mainImage: MachineImageAsset | null
  gallery: MachineImageAsset[]
  features: string[]
  specifications: MachineSpecification[]
  createdAt: string
  updatedAt: string
}

export interface ShowcaseSettings {
  featuredMachineId: string | null
  eyebrow: string
  title: string
  description: string
  ctaLabel: string
}

export interface QuoteRequest {
  id: string
  machineId: string | null
  machineTitle: string
  customerName: string
  email: string
  whatsapp: string
  company: string
  city: string
  message: string
  status: QuoteStatus
  notes: string
  createdAt: string
  updatedAt: string
}

export interface RoutechContentStore {
  machines: Machine[]
  showcase: ShowcaseSettings
  quotes: QuoteRequest[]
}

export const defaultRoutechContentStore: RoutechContentStore = {
  machines: [],
  showcase: {
    featuredMachineId: null,
    eyebrow: 'Vitrine Routech',
    title: '',
    description: '',
    ctaLabel: 'Ver detalhes',
  },
  quotes: [],
}
