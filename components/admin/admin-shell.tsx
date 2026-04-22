"use client"

import { useEffect, useState } from "react"
import { onAuthStateChanged } from "firebase/auth"
import { AdminDashboard } from "@/components/admin/admin-dashboard"
import { AdminLogin } from "@/components/admin/admin-login"
import type {
  Machine,
  QuoteRequest,
  ShowcaseSettings,
} from "@/lib/content-types"
import {
  getFirebaseAuth,
  getFirebaseAuthorizationHeaders,
} from "@/lib/firebase-client"

interface AdminBootstrapPayload {
  machines: Machine[]
  quotes: QuoteRequest[]
  showcase: ShowcaseSettings
  cloudinaryEnabled: boolean
}

type AdminShellState =
  | { status: "loading"; message: string }
  | { status: "login" }
  | { status: "ready"; payload: AdminBootstrapPayload }
  | { status: "error"; message: string }

async function loadAdminBootstrap(): Promise<AdminBootstrapPayload> {
  const response = await fetch("/api/admin/bootstrap", {
    headers: await getFirebaseAuthorizationHeaders(),
  })

  const payload = (await response.json().catch(() => null)) as
    | (Partial<AdminBootstrapPayload> & { error?: string })
    | null

  if (
    !response.ok ||
    !payload?.machines ||
    !payload?.quotes ||
    !payload?.showcase ||
    typeof payload.cloudinaryEnabled !== "boolean"
  ) {
    throw new Error(payload?.error || "Nao foi possivel carregar os dados do painel.")
  }

  return {
    machines: payload.machines,
    quotes: payload.quotes,
    showcase: payload.showcase,
    cloudinaryEnabled: payload.cloudinaryEnabled,
  }
}

export function AdminShell() {
  const auth = getFirebaseAuth()
  const [state, setState] = useState<AdminShellState>({
    status: "loading",
    message: "Verificando acesso ao painel...",
  })

  useEffect(() => {
    if (!auth) {
      return
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setState({ status: "login" })
        return
      }

      setState({
        status: "loading",
        message: "Carregando dados da area de edicao...",
      })

      try {
        const payload = await loadAdminBootstrap()
        setState({
          status: "ready",
          payload,
        })
      } catch (error) {
        setState({
          status: "error",
          message:
            error instanceof Error
              ? error.message
              : "Nao foi possivel carregar o painel.",
        })
      }
    })

    return unsubscribe
  }, [auth])

  if (!auth) {
    return (
      <main className="flex min-h-screen items-center bg-background">
        <div className="mx-auto w-full max-w-md px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-border bg-card p-8 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">
              Painel Routech
            </p>
            <h1 className="mt-4 text-3xl font-bold text-foreground">
              Nao foi possivel abrir o painel
            </h1>
            <p className="mt-3 text-muted-foreground">
              Firebase Auth nao esta configurado neste ambiente.
            </p>
          </div>
        </div>
      </main>
    )
  }

  if (state.status === "login") {
    return <AdminLogin />
  }

  if (state.status === "loading") {
    return (
      <main className="flex min-h-screen items-center bg-background">
        <div className="mx-auto w-full max-w-md px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-border bg-card p-8 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">
              Painel Routech
            </p>
            <h1 className="mt-4 text-3xl font-bold text-foreground">
              Aguarde um instante
            </h1>
            <p className="mt-3 text-muted-foreground">{state.message}</p>
          </div>
        </div>
      </main>
    )
  }

  if (state.status === "error") {
    return (
      <main className="flex min-h-screen items-center bg-background">
        <div className="mx-auto w-full max-w-md px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-border bg-card p-8 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">
              Painel Routech
            </p>
            <h1 className="mt-4 text-3xl font-bold text-foreground">
              Nao foi possivel abrir o painel
            </h1>
            <p className="mt-3 text-muted-foreground">{state.message}</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <AdminDashboard
      initialMachines={state.payload.machines}
      initialQuotes={state.payload.quotes}
      initialShowcase={state.payload.showcase}
      cloudinaryEnabled={state.payload.cloudinaryEnabled}
    />
  )
}
