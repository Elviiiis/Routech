"use client"

import { useState } from "react"
import Image from "next/image"
import { X, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import type { MachineImageAsset } from "@/lib/content-types"

interface GalleryProps {
  images: MachineImageAsset[]
}

export function Gallery({ images }: GalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  if (images.length === 0) {
    return null
  }

  const openLightbox = (index: number) => {
    setSelectedIndex(index)
  }

  const closeLightbox = () => {
    setSelectedIndex(null)
  }

  const goToPrevious = () => {
    if (selectedIndex !== null) {
      setSelectedIndex(selectedIndex === 0 ? images.length - 1 : selectedIndex - 1)
    }
  }

  const goToNext = () => {
    if (selectedIndex !== null) {
      setSelectedIndex(selectedIndex === images.length - 1 ? 0 : selectedIndex + 1)
    }
  }

  return (
    <section id="galeria" className="py-16 lg:py-24 bg-secondary/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-sm font-semibold text-primary uppercase tracking-wider">
            Galeria
          </h2>
          <p className="mt-4 text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground leading-tight text-balance">
            Imagens reais cadastradas no catálogo
          </p>
        </div>

        <div className="mt-12 grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((image, index) => (
            <button
              key={`${image.publicId}-${index}`}
              onClick={() => openLightbox(index)}
              className={cn(
                "relative overflow-hidden rounded-lg bg-secondary aspect-square group",
                index === 0 && "md:col-span-2 md:row-span-2"
              )}
            >
              <Image
                src={image.url}
                alt="Galeria Routech"
                fill
                sizes="(max-width: 768px) 50vw, 33vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/20 transition-colors" />
            </button>
          ))}
        </div>
      </div>

      {selectedIndex !== null ? (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={closeLightbox}
        >
          <button
            className="absolute top-4 right-4 z-10 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            onClick={closeLightbox}
            aria-label="Fechar"
          >
            <X className="h-6 w-6" />
          </button>

          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            onClick={(event) => {
              event.stopPropagation()
              goToPrevious()
            }}
            aria-label="Imagem anterior"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            onClick={(event) => {
              event.stopPropagation()
              goToNext()
            }}
            aria-label="Próxima imagem"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          <div
            className="relative w-full h-full max-w-5xl max-h-[80vh] mx-4"
            onClick={(event) => event.stopPropagation()}
          >
            <Image
              src={images[selectedIndex].url}
              alt="Galeria Routech"
              fill
              sizes="100vw"
              className="object-contain"
              priority
            />
          </div>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={(event) => {
                  event.stopPropagation()
                  setSelectedIndex(index)
                }}
                className={cn(
                  "w-2 h-2 rounded-full transition-colors",
                  selectedIndex === index ? "bg-white" : "bg-white/40 hover:bg-white/60"
                )}
                aria-label={`Ver imagem ${index + 1}`}
              />
            ))}
          </div>
        </div>
      ) : null}
    </section>
  )
}
