"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signInWithEmailAndPassword } from "firebase/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getFirebaseAuth } from "@/lib/firebase-client"

export function AdminLogin() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedback, setFeedback] = useState("")

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setFeedback("")

    const auth = getFirebaseAuth()

    if (!auth) {
      setFeedback("Firebase Auth nao esta configurado neste ambiente.")
      setIsSubmitting(false)
      return
    }

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password)
      router.refresh()
    } catch {
      setFeedback("Nao foi possivel entrar. Verifique email e senha.")
      setIsSubmitting(false)
    }
  }

  const handleGoToSite = () => {
    router.push("/")
  }

  return (
    <main className="flex min-h-screen items-center bg-background">
      <div className="mx-auto w-full max-w-md px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-border bg-card p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">
            Painel Routech
          </p>
          <h1 className="mt-4 text-3xl font-bold text-foreground">
            Entrar na area de edicao
          </h1>
          <p className="mt-3 text-muted-foreground">
            Use o email e a senha cadastrados no Firebase para editar as
            maquinas, o destaque da home e os contatos recebidos.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="voce@empresa.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Digite sua senha"
                required
              />
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Entrando..." : "Entrar"}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="w-full"
              onClick={handleGoToSite}
            >
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
