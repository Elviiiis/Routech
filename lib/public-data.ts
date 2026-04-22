import 'server-only'

import type { MachineImageAsset } from '@/lib/content-types'
import { getPublicMachines, readRoutechContentStore } from '@/lib/content-store'

function dedupeImages(images: MachineImageAsset[]) {
  const uniqueImages = new Map<string, MachineImageAsset>()

  images.forEach((image) => {
    if (!uniqueImages.has(image.url)) {
      uniqueImages.set(image.url, image)
    }
  })

  return Array.from(uniqueImages.values())
}

export async function getPublicSiteSnapshot() {
  const [machines, store] = await Promise.all([
    getPublicMachines(),
    readRoutechContentStore(),
  ])

  const showcaseMachine =
    machines.find((machine) => machine.id === store.showcase.featuredMachineId) ||
    null

  const galleryImages = dedupeImages(
    machines.flatMap((machine) => [
      ...(machine.mainImage ? [machine.mainImage] : []),
      ...machine.gallery,
    ])
  )

  const carouselImages = galleryImages.slice(0, 6)

  return {
    machines,
    showcase: store.showcase,
    showcaseMachine,
    galleryImages,
    carouselImages,
  }
}
