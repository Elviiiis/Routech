"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface QuoteFormProps {
  machines: Array<{
    id: string
    title: string
  }>
  initialMachineId?: string | null
  title?: string
  description?: string
}

export function QuoteForm({
  machines,
  initialMachineId = null,
  title = "Solicite um orçamento",
  description = "Preencha seus dados e nossa equipe comercial retornará o contato.",
}: QuoteFormProps) {
  const [formData, setFormData] = useState({
    machineId: initialMachineId || "",
    customerName: "",
    email: "",
    whatsapp: "",
    company: "",
    city: "",
    message: "",
  })
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">(
    "idle"
  )
  const [feedback, setFeedback] = useState("")

  const availableMachines = useMemo(
    () => [{ id: "", title: "Orçamento geral" }, ...machines],
    [machines]
  )

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target
    setFormData((current) => ({
      ...current,
      [name]: value,
    }))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setStatus("submitting")
    setFeedback("")

    const response = await fetch("/api/quotes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...formData,
        machineId: formData.machineId || null,
      }),
    })

    const payload = (await response.json().catch(() => null)) as
      | { success?: boolean; error?: string }
      | null

    if (!response.ok) {
      setStatus("error")
      setFeedback(payload?.error || "Não foi possível enviar o orçamento.")
      return
    }

    setStatus("success")
    setFeedback("Orçamento enviado com sucesso. Em breve entraremos em contato.")
    setFormData({
      machineId: initialMachineId || "",
      customerName: "",
      email: "",
      whatsapp: "",
      company: "",
      city: "",
      message: "",
    })
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-6 lg:p-8">
      <div className="max-w-2xl">
        <h3 className="text-2xl font-bold text-foreground">{title}</h3>
        <p className="mt-3 text-muted-foreground">{description}</p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-2">
          <Label htmlFor="machineId">Máquina</Label>
          <select
            id="machineId"
            name="machineId"
            value={formData.machineId}
            onChange={handleChange}
            className="border-input h-10 w-full rounded-md border bg-background px-3 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
          >
            {availableMachines.map((machine) => (
              <option key={machine.id || "general"} value={machine.id}>
                {machine.title}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="customerName">Nome</Label>
          <Input
            id="customerName"
            name="customerName"
            required
            value={formData.customerName}
            onChange={handleChange}
            placeholder="Seu nome completo"
            className="bg-background"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            value={formData.email}
            onChange={handleChange}
            placeholder="seu@email.com"
            className="bg-background"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="whatsapp">WhatsApp</Label>
          <Input
            id="whatsapp"
            name="whatsapp"
            required
            value={formData.whatsapp}
            onChange={handleChange}
            placeholder="(00) 00000-0000"
            className="bg-background"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="company">Empresa</Label>
          <Input
            id="company"
            name="company"
            value={formData.company}
            onChange={handleChange}
            placeholder="Nome da empresa"
            className="bg-background"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="city">Cidade</Label>
          <Input
            id="city"
            name="city"
            value={formData.city}
            onChange={handleChange}
            placeholder="Cidade / Estado"
            className="bg-background"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="message">Detalhes do orçamento</Label>
          <Textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows={5}
            placeholder="Conte um pouco sobre a máquina, o uso desejado e a necessidade do seu projeto."
            className="bg-background resize-none"
          />
        </div>

        <div className="md:col-span-2 flex flex-col gap-3">
          <Button type="submit" size="lg" disabled={status === "submitting"}>
            {status === "submitting" ? "Enviando..." : "Enviar orçamento"}
          </Button>
          {feedback ? (
            <p
              className={
                status === "error" ? "text-sm text-destructive" : "text-sm text-primary"
              }
            >
              {feedback}
            </p>
          ) : null}
        </div>
      </form>
    </div>
  )
}
