import { siteConfig } from "@/lib/site"
import type { Machine } from "@/lib/content-types"
import { QuoteForm } from "@/components/quote-form"

interface ContactProps {
  machines: Machine[]
  initialMachineId?: string | null
}

export function Contact({
  machines,
  initialMachineId = null,
}: ContactProps) {
  return (
    <section id="contato" className="py-16 lg:py-24 bg-secondary/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-12 lg:gap-16">
          <div>
            <h2 className="text-sm font-semibold text-primary uppercase tracking-wider">
              Comercial Routech
            </h2>
            <p className="mt-4 text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground leading-tight text-balance">
              Envie seu orçamento e receba retorno do time comercial.
            </p>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
              Preencha o formulário abaixo com sua necessidade e nossa equipe entra
              em contato usando os dados enviados.
            </p>

            <div className="mt-8 space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">WhatsApp comercial</p>
                <a
                  href={siteConfig.whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-flex text-foreground font-medium hover:text-primary transition-colors"
                >
                  {siteConfig.whatsappDisplay}
                </a>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="mt-1 inline-flex text-foreground font-medium hover:text-primary transition-colors"
                >
                  {siteConfig.email}
                </a>
              </div>
            </div>
          </div>

          <QuoteForm machines={machines} initialMachineId={initialMachineId} />
        </div>
      </div>
    </section>
  )
}
