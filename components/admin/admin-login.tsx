"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function AdminLogin() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedback, setFeedback] = useState("")

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setFeedback("")

    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ password }),
    })

    const payload = (await response.json().catch(() => null)) as
      | { error?: string }
      | null

    if (!response.ok) {
      setFeedback(payload?.error || "Não foi possível validar o acesso.")
      setIsSubmitting(false)
      return
    }

    router.refresh()
  }

  const handleGoToSite = () => {
    router.push("/")
  }

  return (
    <main className="min-h-screen bg-background flex items-center">
      <div className="max-w-md mx-auto w-full px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-border bg-card p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">
            Painel Routech
          </p>
          <h1 className="mt-4 text-3xl font-bold text-foreground">
            Entrar na area de edicao
          </h1>
          <p className="mt-3 text-muted-foreground">
            Use a senha para abrir a area onde voce altera maquinas,
            destaque da home e contatos recebidos.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Digite a senha do painel"
                required
              />
            </div>
            <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Entrando..." : "Entrar"}
            </Button>
            <Button type="button" variant="outline" size="lg" className="w-full" onClick={handleGoToSite}>
              Voltar para o site
            </Button>
            {feedback ? (
              <p className="text-sm text-destructive">{feedback}</p>
            ) : null}
          </form>
        </div>
      </div>
    </main>
  )
}
