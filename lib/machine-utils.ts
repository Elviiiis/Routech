import type {
  Machine,
  MachineImageAsset,
  MachineSpecification,
  PriceMode,
} from '@/lib/content-types'

function normalizeSlugPart(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function slugifyMachineTitle(value: string) {
  return normalizeSlugPart(value) || `maquina-${Date.now()}`
}

export function createMachineTemplate(): Machine {
  const now = new Date().toISOString()

  return {
    id: crypto.randomUUID(),
    slug: '',
    title: '',
    shortDescription: '',
    description: '',
    category: 'Máquina CNC',
    badge: '',
    priceMode: 'quote',
    price: '',
    compareAtPrice: '',
    priceLabel: 'Solicite um orçamento',
    ctaLabel: 'Solicitar orçamento',
    published: true,
    mainImage: null,
    gallery: [],
    features: [''],
    specifications: [
      {
        id: crypto.randomUUID(),
        label: '',
        value: '',
      },
    ],
    createdAt: now,
    updatedAt: now,
  }
}

export function sanitizeImageAsset(
  image: Partial<MachineImageAsset> | null | undefined
): MachineImageAsset | null {
  if (!image?.url || !image.publicId) {
    return null
  }

  return {
    url: image.url,
    publicId: image.publicId,
  }
}

export function sanitizeSpecifications(
  specifications: Partial<MachineSpecification>[] | undefined
) {
  return (specifications ?? [])
    .map((specification) => ({
      id: specification.id || crypto.randomUUID(),
      label: (specification.label || '').trim(),
      value: (specification.value || '').trim(),
    }))
    .filter((specification) => specification.label && specification.value)
}

export function sanitizeMachinePayload(input: Partial<Machine>): Machine {
  const now = new Date().toISOString()
  const title = (input.title || '').trim()
  const slug = (input.slug || '').trim()

  return {
    id: input.id || crypto.randomUUID(),
    slug: slugifyMachineTitle(slug || title),
    title,
    shortDescription: (input.shortDescription || '').trim(),
    description: (input.description || '').trim(),
    category: (input.category || 'Máquina CNC').trim(),
    badge: (input.badge || '').trim(),
    priceMode: (input.priceMode === 'visible' ? 'visible' : 'quote') as PriceMode,
    price: (input.price || '').trim(),
    compareAtPrice: (input.compareAtPrice || '').trim(),
    priceLabel: (input.priceLabel || '').trim(),
    ctaLabel: (input.ctaLabel || 'Solicitar orçamento').trim(),
    published: Boolean(input.published),
    mainImage: sanitizeImageAsset(input.mainImage),
    gallery: (input.gallery ?? [])
      .map((image) => sanitizeImageAsset(image))
      .filter((image): image is MachineImageAsset => Boolean(image)),
    features: (input.features ?? [])
      .map((feature) => feature.trim())
      .filter(Boolean),
    specifications: sanitizeSpecifications(input.specifications),
    createdAt: input.createdAt || now,
    updatedAt: now,
  }
}

export function getMachineDisplayPrice(machine: Machine) {
  if (machine.priceMode !== 'visible' || !machine.price) {
    return null
  }

  return {
    label: machine.priceLabel || 'Valor',
    price: machine.price,
    compareAtPrice: machine.compareAtPrice,
  }
}
