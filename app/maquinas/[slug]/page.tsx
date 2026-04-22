import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Contact } from "@/components/contact"
import { ProductGallery } from "@/components/product-gallery"
import { LogoTrigger } from "@/components/logo-trigger"
import { type Machine } from "@/lib/content-types"
import { getMachineBySlug, getPublicMachines } from "@/lib/content-store"
import { getMachineDisplayPrice } from "@/lib/machine-utils"
import { siteConfig } from "@/lib/site"

type ProductPageProps = {
  params: Promise<{ slug: string }>
}

export const dynamic = 'force-dynamic'

async function findMachine(slug: string): Promise<Machine | undefined> {
  return getMachineBySlug(slug)
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params
  const machine = await findMachine(slug)

  if (!machine) {
    return {
      title: "Máquina não encontrada",
    }
  }

  return {
    title: machine.title,
    description: machine.shortDescription,
    openGraph: {
      title: `${machine.title} | ${siteConfig.name}`,
      description: machine.shortDescription,
    },
  }
}

export default async function ProductPage({
  params,
}: ProductPageProps) {
  const { slug } = await params
  const machine = await findMachine(slug)

  if (!machine) {
    return (
      <main className="min-h-screen bg-background flex items-center">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">
            Produto não encontrado
          </p>
          <h1 className="mt-4 text-4xl font-bold text-foreground">
            A máquina que você procurou não está disponível.
          </h1>
          <div className="mt-8">
            <Button asChild size="lg">
              <Link href="/#maquinas">Voltar para o catálogo</Link>
            </Button>
          </div>
        </div>
      </main>
    )
  }

  const machines = await getPublicMachines()
  const galleryImages =
    machine.gallery.length > 0
      ? machine.gallery
      : machine.mainImage
        ? [machine.mainImage]
        : []
  const price = getMachineDisplayPrice(machine)

  return (
    <>
      <main className="min-h-screen bg-background">
        <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link
                href="/#maquinas"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Voltar</span>
              </Link>
              <LogoTrigger width={120} height={40} className="h-8 w-auto" />
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            <ProductGallery images={galleryImages} productName={machine.title} />

            <div className="space-y-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-primary uppercase tracking-wider">
                    {machine.badge || machine.category}
                  </p>
                  <h1 className="mt-2 text-3xl lg:text-4xl font-bold text-foreground">
                    {machine.title}
                  </h1>
                </div>
                {price ? (
                  <div className="text-left sm:text-right">
                    <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                      {price.label}
                    </p>
                    <p className="mt-2 text-3xl font-bold text-foreground">
                      {price.price}
                    </p>
                    {price.compareAtPrice ? (
                      <p className="text-sm text-muted-foreground line-through">
                        {price.compareAtPrice}
                      </p>
                    ) : null}
                  </div>
                ) : (
                  <p className="text-lg font-semibold text-primary">
                    Solicitar orçamento
                  </p>
                )}
              </div>

              <p className="text-lg text-muted-foreground leading-relaxed">
                {machine.description}
              </p>

              {machine.features.length > 0 ? (
                <div>
                  <h2 className="text-lg font-semibold text-foreground mb-4">
                    Recursos
                  </h2>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {machine.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                          <Check className="h-3 w-3 text-primary" />
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button asChild size="lg" className="flex-1">
                  <Link href="#orcamento">
                    {machine.ctaLabel || "Solicitar orçamento"}
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="flex-1">
                  <a
                    href={siteConfig.whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Falar pelo WhatsApp
                  </a>
                </Button>
              </div>
            </div>
          </div>

          {machine.specifications.length > 0 ? (
            <Card className="mt-12 lg:mt-16 border border-border">
              <CardContent className="p-6 lg:p-8">
                <h2 className="text-xl lg:text-2xl font-bold text-foreground mb-6">
                  Especificações técnicas
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {machine.specifications.map((specification) => (
                    <div
                      key={specification.id}
                      className="p-4 bg-secondary/30 rounded-lg"
                    >
                      <p className="text-sm text-muted-foreground">
                        {specification.label}
                      </p>
                      <p className="mt-1 text-lg font-semibold text-foreground">
                        {specification.value}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </main>

      <div id="orcamento">
        <Contact machines={machines} initialMachineId={machine.id} />
      </div>
    </>
  )
}
