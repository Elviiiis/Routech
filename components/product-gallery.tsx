"use client"

import { useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import type { MachineImageAsset } from "@/lib/content-types"

interface ProductGalleryProps {
  images: MachineImageAsset[]
  productName: string
}

export function ProductGallery({
  images,
  productName,
}: ProductGalleryProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const currentImage = images[currentImageIndex]

  if (!currentImage) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-secondary/30 p-10 text-center text-muted-foreground">
        Nenhuma imagem cadastrada para {productName}.
      </div>
    )
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === images.length - 1 ? 0 : prev + 1
    )
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? images.length - 1 : prev - 1
    )
  }

  return (
    <div className="space-y-4">
      <div className="relative aspect-[4/3] bg-secondary/30 rounded-xl overflow-hidden">
        <Image
          src={currentImage.url}
          alt={productName}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
        />
        {images.length > 1 ? (
          <>
            <button
              type="button"
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/90 flex items-center justify-center hover:bg-background transition-colors shadow-lg"
              aria-label={`Ver imagem anterior de ${productName}`}
            >
              <ChevronLeft className="h-5 w-5 text-foreground" />
            </button>
            <button
              type="button"
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/90 flex items-center justify-center hover:bg-background transition-colors shadow-lg"
              aria-label={`Ver próxima imagem de ${productName}`}
            >
              <ChevronRight className="h-5 w-5 text-foreground" />
            </button>
          </>
        ) : null}
      </div>

      {images.length > 1 ? (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={`${image.publicId}-${index}`}
              type="button"
              onClick={() => setCurrentImageIndex(index)}
              className={cn(
                "relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-colors",
                currentImageIndex === index
                  ? "border-primary"
                  : "border-transparent hover:border-primary/50"
              )}
              aria-label={`Selecionar imagem ${index + 1} de ${productName}`}
            >
              <Image
                src={image.url}
                alt={productName}
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
