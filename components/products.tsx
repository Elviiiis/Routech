import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ImageCarousel } from "@/components/image-carousel"
import type { Machine, MachineImageAsset } from "@/lib/content-types"
import { getMachineDisplayPrice } from "@/lib/machine-utils"

interface ProductsProps {
  machines: Machine[]
  carouselImages: MachineImageAsset[]
}

export function Products({ machines, carouselImages }: ProductsProps) {
  return (
    <section id="maquinas" className="py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-primary">
            Maquinas Routech
          </h2>
          <p className="mt-4 text-2xl font-bold leading-tight text-balance text-foreground sm:text-3xl lg:text-4xl">
            Catalogo completo de maquinas e solucoes Routech
          </p>
        </div>

        {carouselImages.length > 0 ? (
          <div className="mt-12 lg:mt-16">
            <ImageCarousel
              images={carouselImages.map((image) => ({
                src: image.url,
                alt: "Maquinas Routech",
              }))}
            />
          </div>
        ) : null}

        {machines.length > 0 ? (
          <div className="mt-12 grid grid-cols-1 gap-8 lg:mt-16 lg:grid-cols-2">
            {machines.map((machine) => {
              const price = getMachineDisplayPrice(machine)

              return (
                <Card
                  key={machine.id}
                  className="group overflow-hidden border border-border bg-card transition-colors hover:border-primary/30"
                >
                  <Link href={`/maquinas/${machine.slug}`}>
                    <div className="relative aspect-[4/3] overflow-hidden bg-secondary/50">
                      {machine.mainImage ? (
                        <Image
                          src={machine.mainImage.url}
                          alt={machine.title}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                          Imagem em atualizacao
                        </div>
                      )}
                    </div>
                  </Link>
                  <CardContent className="p-6 lg:p-8">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.25em] text-primary">
                          {machine.badge || machine.category}
                        </p>
                        <Link href={`/maquinas/${machine.slug}`}>
                          <h3 className="mt-2 text-xl font-bold text-foreground transition-colors hover:text-primary lg:text-2xl">
                            {machine.title}
                          </h3>
                        </Link>
                      </div>
                      {price ? (
                        <div className="text-right">
                          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                            {price.label}
                          </p>
                          <p className="text-xl font-bold text-foreground">{price.price}</p>
                          {price.compareAtPrice ? (
                            <p className="text-sm text-muted-foreground line-through">
                              {price.compareAtPrice}
                            </p>
                          ) : null}
                        </div>
                      ) : (
                        <p className="text-sm font-semibold text-primary">
                          Solicitar orcamento
                        </p>
                      )}
                    </div>

                    <p className="mt-4 leading-relaxed text-muted-foreground">
                      {machine.shortDescription}
                    </p>

                    {machine.features.length > 0 ? (
                      <ul className="mt-6 space-y-3">
                        {machine.features.slice(0, 3).map((feature) => (
                          <li key={feature} className="flex items-center gap-3">
                            <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                              <Check className="h-3 w-3 text-primary" />
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {feature}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : null}

                    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                      <Button asChild className="flex-1">
                        <Link href={`/maquinas/${machine.slug}`}>
                          Ver detalhes
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                      <Button asChild variant="outline" className="flex-1">
                        <Link href={`/maquinas/${machine.slug}#orcamento`}>
                          {machine.ctaLabel || "Solicitar orcamento"}
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <div className="mt-12 rounded-3xl border border-dashed border-border bg-secondary/30 p-10 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">
              Catalogo em construcao
            </p>
            <h3 className="mt-4 text-2xl font-bold text-foreground">
              Nenhuma maquina publicada ainda.
            </h3>
            <p className="mt-3 text-muted-foreground">
              Estamos preparando a vitrine de maquinas da Routech. Fale com nossa
              equipe comercial para receber atendimento e orientacoes.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
