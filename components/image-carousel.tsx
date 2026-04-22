"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ImageCarouselProps {
  images: { src: string; alt: string }[]
  autoPlay?: boolean
  interval?: number
}

export function ImageCarousel({
  images,
  autoPlay = true,
  interval = 4000,
}: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  useEffect(() => {
    if (!autoPlay || images.length <= 1) {
      return undefined
    }

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length)
    }, interval)

    return () => clearInterval(timer)
  }, [autoPlay, images.length, interval])

  return (
    <div className="relative w-full overflow-hidden rounded-lg bg-secondary/30">
      <div className="aspect-[16/9] md:aspect-[16/10] relative">
        {images.map((image, index) => (
          <div
            key={image.src}
            className={cn(
              "absolute inset-0 transition-opacity duration-500",
              index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
            )}
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              sizes="(max-width: 768px) 100vw, 80vw"
              className="object-contain md:object-cover"
              priority={index === 0}
            />
          </div>
        ))}
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="absolute left-3 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background text-foreground rounded-full shadow-lg"
        onClick={goToPrev}
        aria-label="Imagem anterior"
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="absolute right-3 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background text-foreground rounded-full shadow-lg"
        onClick={goToNext}
        aria-label="Próxima imagem"
      >
        <ChevronRight className="h-5 w-5" />
      </Button>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {images.map((_, index) => (
          <button
            key={index}
            className={cn(
              "w-2 h-2 rounded-full transition-all",
              index === currentIndex
                ? "bg-primary w-6"
                : "bg-background/60 hover:bg-background/80"
            )}
            onClick={() => setCurrentIndex(index)}
            aria-label={`Ir para imagem ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
