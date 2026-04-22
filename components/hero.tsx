import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Machine, ShowcaseSettings } from "@/lib/content-types"
import { getMachineDisplayPrice } from "@/lib/machine-utils"

interface HeroProps {
  showcaseMachine: Machine | null
  showcase: ShowcaseSettings
}

export function Hero({ showcaseMachine, showcase }: HeroProps) {
  const showcasePrice = showcaseMachine ? getMachineDisplayPrice(showcaseMachine) : null

  return (
    <section id="inicio" className="pt-24 sm:pt-28 lg:pt-36 pb-16 lg:pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div className="max-w-4xl">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">
              Routech Automation
            </p>
          <h1 className="mt-5 text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-foreground leading-tight text-balance">
            Automação e máquinas CNC para produção de alto nível.
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-3xl text-pretty">
            A Routech Automation apresenta soluções em máquinas CNC e automação
            industrial para quem precisa elevar produtividade, precisão e padronização
            na linha de produção.
          </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="text-base px-8 py-6 group">
                <Link href="#maquinas">
                  Ver máquinas
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-base px-8 py-6">
                <Link href="#contato">Solicitar orçamento</Link>
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(219,76,52,0.18),transparent_60%)] blur-3xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-border bg-card shadow-xl">
              {showcaseMachine ? (
                <>
                  <div className="relative aspect-[4/3] bg-secondary/40">
                    {showcaseMachine.mainImage ? (
                      <Image
                        src={showcaseMachine.mainImage.url}
                        alt={showcaseMachine.title}
                        fill
                        priority
                        sizes="(max-width: 1024px) 100vw, 40vw"
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                        Sem imagem destacada
                      </div>
                    )}
                  </div>
                  <div className="p-6 lg:p-8">
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
                      {showcase.eyebrow || showcaseMachine.badge || "Vitrine Routech"}
                    </p>
                    <h2 className="mt-3 text-2xl font-bold text-foreground">
                      {showcase.title || showcaseMachine.title}
                    </h2>
                    <p className="mt-3 text-muted-foreground leading-relaxed">
                      {showcase.description || showcaseMachine.shortDescription}
                    </p>
                    {showcasePrice ? (
                      <div className="mt-6 flex flex-wrap items-end gap-3">
                        <div>
                          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                            {showcasePrice.label}
                          </p>
                          <p className="text-3xl font-bold text-foreground">
                            {showcasePrice.price}
                          </p>
                        </div>
                        {showcasePrice.compareAtPrice ? (
                          <p className="text-sm text-muted-foreground line-through">
                            {showcasePrice.compareAtPrice}
                          </p>
                        ) : null}
                      </div>
                    ) : (
                      <p className="mt-6 text-lg font-semibold text-foreground">
                        Solicite um orçamento personalizado
                      </p>
                    )}
                    <div className="mt-6">
                      <Button asChild size="lg">
                        <Link href={`/maquinas/${showcaseMachine.slug}`}>
                          {showcase.ctaLabel || "Ver detalhes"}
                        </Link>
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="p-8 lg:p-10">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
                    Vitrine Routech
                  </p>
                  <h2 className="mt-3 text-2xl font-bold text-foreground">
                    Nenhuma máquina em destaque no momento.
                  </h2>
                  <p className="mt-4 text-muted-foreground leading-relaxed">
                    Nosso catálogo está em atualização. Em breve, novos equipamentos
                    aparecerão nesta vitrine principal.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
