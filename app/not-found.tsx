import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <main className="min-h-screen bg-background flex items-center">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <p className="text-sm font-semibold text-primary uppercase tracking-wider">
          Página não encontrada
        </p>
        <h1 className="mt-4 text-4xl font-bold text-foreground">
          Não encontramos a máquina que você procurou.
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Volte para a página inicial para explorar o catálogo completo da
          Routech.
        </p>
        <div className="mt-8">
          <Button asChild size="lg">
            <Link href="/#maquinas">Voltar para as máquinas</Link>
          </Button>
        </div>
      </div>
    </main>
  )
}
