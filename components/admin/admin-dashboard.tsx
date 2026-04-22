"use client"

import Image from "next/image"
import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, RefreshCcw, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CloudinaryUploader } from "@/components/admin/cloudinary-uploader"
import type {
  Machine,
  MachineImageAsset,
  QuoteRequest,
  QuoteStatus,
  ShowcaseSettings,
} from "@/lib/content-types"
import {
  createMachineTemplate,
  getMachineDisplayPrice,
  slugifyMachineTitle,
} from "@/lib/machine-utils"

type AdminTab = "machines" | "showcase" | "quotes"

interface AdminDashboardProps {
  initialMachines: Machine[]
  initialQuotes: QuoteRequest[]
  initialShowcase: ShowcaseSettings
  cloudinaryEnabled: boolean
}

function sortMachines(machines: Machine[]) {
  return [...machines].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
}

function sortQuotes(quotes: QuoteRequest[]) {
  return [...quotes].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

function createSpecification() {
  return {
    id: crypto.randomUUID(),
    label: "",
    value: "",
  }
}

function createBlankMachine() {
  return {
    ...createMachineTemplate(),
    specifications: [createSpecification()],
    features: [""],
  }
}

export function AdminDashboard({
  initialMachines,
  initialQuotes,
  initialShowcase,
  cloudinaryEnabled,
}: AdminDashboardProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<AdminTab>("machines")
  const [machines, setMachines] = useState(sortMachines(initialMachines))
  const [quotes, setQuotes] = useState(sortQuotes(initialQuotes))
  const [showcase, setShowcase] = useState(initialShowcase)
  const [machineForm, setMachineForm] = useState<Machine>(createBlankMachine())
  const [isSavingMachine, setIsSavingMachine] = useState(false)
  const [machineFeedback, setMachineFeedback] = useState("")
  const [showcaseFeedback, setShowcaseFeedback] = useState("")
  const [isSavingShowcase, setIsSavingShowcase] = useState(false)
  const [quoteFeedback, setQuoteFeedback] = useState("")

  const publishedMachines = useMemo(
    () => machines.filter((machine) => machine.published),
    [machines]
  )

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" })
    router.refresh()
  }

  const handleGoToSite = () => {
    router.push("/")
  }

  const resetMachineForm = () => {
    setMachineForm(createBlankMachine())
    setMachineFeedback("")
  }

  const editMachine = (machine: Machine) => {
    setMachineForm({
      ...machine,
      features: machine.features.length > 0 ? machine.features : [""],
      specifications:
        machine.specifications.length > 0 ? machine.specifications : [createSpecification()],
    })
    setActiveTab("machines")
    setMachineFeedback("")
  }

  const handleMachineFieldChange = (
    field: keyof Machine,
    value: string | boolean | MachineImageAsset | null | MachineImageAsset[]
  ) => {
    setMachineForm((current) => {
      if (field === "title") {
        const title = String(value)
        const shouldUpdateSlug =
          !current.slug || current.slug === slugifyMachineTitle(current.title)

        return {
          ...current,
          title,
          slug: shouldUpdateSlug ? slugifyMachineTitle(title) : current.slug,
        }
      }

      return {
        ...current,
        [field]: value,
      } as Machine
    })
  }

  const handleFeatureChange = (index: number, value: string) => {
    setMachineForm((current) => {
      const features = [...current.features]
      features[index] = value
      return {
        ...current,
        features,
      }
    })
  }

  const addFeature = () => {
    setMachineForm((current) => ({
      ...current,
      features: [...current.features, ""],
    }))
  }

  const removeFeature = (index: number) => {
    setMachineForm((current) => {
      const features = current.features.filter((_, featureIndex) => featureIndex !== index)
      return {
        ...current,
        features: features.length > 0 ? features : [""],
      }
    })
  }

  const handleSpecificationChange = (
    index: number,
    field: "label" | "value",
    value: string
  ) => {
    setMachineForm((current) => {
      const specifications = [...current.specifications]
      specifications[index] = {
        ...specifications[index],
        [field]: value,
      }

      return {
        ...current,
        specifications,
      }
    })
  }

  const addSpecification = () => {
    setMachineForm((current) => ({
      ...current,
      specifications: [...current.specifications, createSpecification()],
    }))
  }

  const removeSpecification = (index: number) => {
    setMachineForm((current) => {
      const specifications = current.specifications.filter(
        (_, specificationIndex) => specificationIndex !== index
      )

      return {
        ...current,
        specifications: specifications.length > 0 ? specifications : [createSpecification()],
      }
    })
  }

  const addGalleryImage = (image: MachineImageAsset) => {
    setMachineForm((current) => ({
      ...current,
      gallery: [...current.gallery, image],
      mainImage: current.mainImage || image,
    }))
  }

  const removeGalleryImage = (publicId: string) => {
    setMachineForm((current) => ({
      ...current,
      gallery: current.gallery.filter((image) => image.publicId !== publicId),
      mainImage:
        current.mainImage?.publicId === publicId ? null : current.mainImage,
    }))
  }

  const saveMachine = async () => {
    setIsSavingMachine(true)
    setMachineFeedback("")

    const method = machines.some((machine) => machine.id === machineForm.id)
      ? "PATCH"
      : "POST"
    const endpoint =
      method === "POST"
        ? "/api/admin/machines"
        : `/api/admin/machines/${machineForm.id}`

    const response = await fetch(endpoint, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(machineForm),
    })

    const payload = (await response.json().catch(() => null)) as
      | { machine?: Machine; error?: string }
      | null

    if (!response.ok || !payload?.machine) {
      setMachineFeedback(payload?.error || "Não foi possível salvar a máquina.")
      setIsSavingMachine(false)
      return
    }

    setMachines((current) => sortMachines(
      current.some((machine) => machine.id === payload.machine?.id)
        ? current.map((machine) =>
            machine.id === payload.machine?.id ? payload.machine! : machine
          )
        : [payload.machine!, ...current]
    ))
    setMachineForm(payload.machine)
    setMachineFeedback("Máquina salva com sucesso.")
    setIsSavingMachine(false)
    router.refresh()
  }

  const removeCurrentMachine = async () => {
    if (!machines.some((machine) => machine.id === machineForm.id)) {
      resetMachineForm()
      return
    }

    const confirmed = window.confirm("Deseja remover esta máquina do catálogo?")
    if (!confirmed) {
      return
    }

    const response = await fetch(`/api/admin/machines/${machineForm.id}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      setMachineFeedback("Não foi possível remover a máquina.")
      return
    }

    setMachines((current) =>
      sortMachines(current.filter((machine) => machine.id !== machineForm.id))
    )

    if (showcase.featuredMachineId === machineForm.id) {
      setShowcase((current) => ({
        ...current,
        featuredMachineId: null,
      }))
    }

    resetMachineForm()
    setMachineFeedback("Máquina removida com sucesso.")
    router.refresh()
  }

  const saveShowcase = async () => {
    setIsSavingShowcase(true)
    setShowcaseFeedback("")

    const response = await fetch("/api/admin/showcase", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(showcase),
    })

    const payload = (await response.json().catch(() => null)) as
      | { showcase?: ShowcaseSettings; error?: string }
      | null

    if (!response.ok || !payload?.showcase) {
      setShowcaseFeedback(payload?.error || "Não foi possível salvar a vitrine.")
      setIsSavingShowcase(false)
      return
    }

    setShowcase(payload.showcase)
    setShowcaseFeedback("Vitrine principal atualizada com sucesso.")
    setIsSavingShowcase(false)
    router.refresh()
  }

  const updateQuoteStatus = async (
    quoteId: string,
    updates: Pick<QuoteRequest, "status" | "notes">
  ) => {
    setQuoteFeedback("")

    const response = await fetch(`/api/admin/quotes/${quoteId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates),
    })

    const payload = (await response.json().catch(() => null)) as
      | { quote?: QuoteRequest; error?: string }
      | null

    if (!response.ok || !payload?.quote) {
      setQuoteFeedback(payload?.error || "Não foi possível atualizar o orçamento.")
      return
    }

    setQuotes((current) =>
      sortQuotes(
        current.map((quote) =>
          quote.id === payload.quote?.id ? payload.quote! : quote
        )
      )
    )
    setQuoteFeedback("Orçamento atualizado.")
    router.refresh()
  }

  const summary = useMemo(() => {
    return {
      totalMachines: machines.length,
      publishedMachines: publishedMachines.length,
      totalQuotes: quotes.length,
      newQuotes: quotes.filter((quote) => quote.status === "new").length,
    }
  }, [machines, publishedMachines.length, quotes])

  const featuredMachine =
    machines.find((machine) => machine.id === showcase.featuredMachineId) || null

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">
              Area de edicao
            </p>
            <h1 className="mt-3 text-3xl lg:text-4xl font-bold text-foreground">
              Edite maquinas, destaque da home e contatos recebidos
            </h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={handleGoToSite}>
              Voltar ao site
            </Button>
            <Button variant="outline" onClick={() => router.refresh()}>
              <RefreshCcw className="mr-2 h-4 w-4" />
              Recarregar
            </Button>
            <Button onClick={resetMachineForm}>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar maquina
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              Sair do painel
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground">Maquinas no painel</p>
            <p className="mt-2 text-3xl font-bold text-foreground">
              {summary.totalMachines}
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground">Visiveis no site</p>
            <p className="mt-2 text-3xl font-bold text-foreground">
              {summary.publishedMachines}
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground">Contatos recebidos</p>
            <p className="mt-2 text-3xl font-bold text-foreground">
              {summary.totalQuotes}
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground">Novos contatos</p>
            <p className="mt-2 text-3xl font-bold text-foreground">
              {summary.newQuotes}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {(["machines", "showcase", "quotes"] as AdminTab[]).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab === "machines"
                ? "Maquinas"
                : tab === "showcase"
                  ? "Destaque da home"
                  : "Contatos"}
            </button>
          ))}
        </div>

        {activeTab === "machines" ? (
          <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
            <div className="space-y-4">
              {machines.length > 0 ? (
                machines.map((machine) => {
                  const price = getMachineDisplayPrice(machine)
                  const isSelected = machine.id === machineForm.id

                  return (
                    <button
                      key={machine.id}
                      type="button"
                      onClick={() => editMachine(machine)}
                      className={`w-full rounded-2xl border p-5 text-left transition-colors ${
                        isSelected
                          ? "border-primary bg-primary/5"
                          : "border-border bg-card hover:border-primary/40"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs uppercase tracking-[0.25em] text-primary">
                            {machine.badge || machine.category}
                          </p>
                          <h3 className="mt-2 text-lg font-semibold text-foreground">
                            {machine.title || "Máquina sem título"}
                          </h3>
                          <p className="mt-2 text-sm text-muted-foreground">
                            {machine.shortDescription || "Descrição curta não preenchida."}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">
                            {machine.published ? "No site" : "Oculto"}
                          </p>
                          <p className="mt-2 text-sm font-medium text-foreground">
                            {price ? price.price : "Sob consulta"}
                          </p>
                        </div>
                      </div>
                    </button>
                  )
                })
              ) : (
                <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center">
                  <p className="text-muted-foreground">
                    Nenhuma máquina cadastrada ainda.
                  </p>
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-border bg-card p-6 lg:p-8 space-y-8">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Formulario</p>
                  <h2 className="text-2xl font-bold text-foreground">
                    {machines.some((machine) => machine.id === machineForm.id)
                      ? "Editar maquina"
                      : "Nova maquina"}
                  </h2>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={resetMachineForm}>
                    Nova ficha
                  </Button>
                  <Button onClick={saveMachine} disabled={isSavingMachine}>
                    {isSavingMachine ? "Salvando..." : "Salvar maquina"}
                  </Button>
                </div>
              </div>

              {machineFeedback ? (
                <p className="text-sm text-muted-foreground">{machineFeedback}</p>
              ) : null}

              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="title">Nome da maquina</Label>
                  <Input
                    id="title"
                    value={machineForm.title}
                    onChange={(event) =>
                      handleMachineFieldChange("title", event.target.value)
                    }
                    placeholder="Nome da máquina"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Link da pagina</Label>
                  <Input
                    id="slug"
                    value={machineForm.slug}
                    onChange={(event) =>
                      handleMachineFieldChange("slug", event.target.value)
                    }
                    placeholder="pagina-da-maquina"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="shortDescription">Descrição curta</Label>
                <Textarea
                  id="shortDescription"
                  value={machineForm.shortDescription}
                  onChange={(event) =>
                    handleMachineFieldChange("shortDescription", event.target.value)
                  }
                  rows={3}
                  placeholder="Resumo exibido nos cards da LP."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição completa</Label>
                <Textarea
                  id="description"
                  value={machineForm.description}
                  onChange={(event) =>
                    handleMachineFieldChange("description", event.target.value)
                  }
                  rows={6}
                  placeholder="Descrição completa da página de detalhes."
                />
              </div>

              <div className="grid gap-5 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Input
                    id="category"
                    value={machineForm.category}
                    onChange={(event) =>
                      handleMachineFieldChange("category", event.target.value)
                    }
                    placeholder="Máquina CNC"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="badge">Selo curto</Label>
                  <Input
                    id="badge"
                    value={machineForm.badge}
                    onChange={(event) =>
                      handleMachineFieldChange("badge", event.target.value)
                    }
                    placeholder="Destaque, Promocao..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ctaLabel">Texto do botao</Label>
                  <Input
                    id="ctaLabel"
                    value={machineForm.ctaLabel}
                    onChange={(event) =>
                      handleMachineFieldChange("ctaLabel", event.target.value)
                    }
                    placeholder="Solicitar orçamento"
                  />
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="priceMode">Como mostrar o preco</Label>
                  <select
                    id="priceMode"
                    value={machineForm.priceMode}
                    onChange={(event) =>
                      handleMachineFieldChange("priceMode", event.target.value)
                    }
                    className="border-input h-10 w-full rounded-md border bg-background px-3 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                  >
                    <option value="quote">Solicitar orçamento</option>
                    <option value="visible">Preço visível</option>
                  </select>
                </div>
                <div className="flex items-center gap-3 pt-7">
                  <input
                    id="published"
                    type="checkbox"
                    checked={machineForm.published}
                    onChange={(event) =>
                      handleMachineFieldChange("published", event.target.checked)
                    }
                  />
                  <Label htmlFor="published">Mostrar esta maquina no site</Label>
                </div>
              </div>

              {machineForm.priceMode === "visible" ? (
                <div className="grid gap-5 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="price">Preço</Label>
                    <Input
                      id="price"
                      value={machineForm.price}
                      onChange={(event) =>
                        handleMachineFieldChange("price", event.target.value)
                      }
                      placeholder="R$ 19.990"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="compareAtPrice">Preco anterior</Label>
                    <Input
                      id="compareAtPrice"
                      value={machineForm.compareAtPrice}
                      onChange={(event) =>
                        handleMachineFieldChange("compareAtPrice", event.target.value)
                      }
                      placeholder="R$ 22.990"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="priceLabel">Texto acima do preco</Label>
                    <Input
                      id="priceLabel"
                      value={machineForm.priceLabel}
                      onChange={(event) =>
                        handleMachineFieldChange("priceLabel", event.target.value)
                      }
                      placeholder="Preço promocional"
                    />
                  </div>
                </div>
              ) : null}

              <div className="grid gap-8 lg:grid-cols-2">
                <CloudinaryUploader
                  label="Foto principal"
                  value={machineForm.mainImage}
                  disabled={!cloudinaryEnabled}
                  helperText={
                    cloudinaryEnabled
                      ? "Envie a imagem de capa da máquina."
                      : "Configure o Cloudinary no .env para habilitar uploads."
                  }
                  onUploaded={(image) => handleMachineFieldChange("mainImage", image)}
                />

                <div className="space-y-4">
                  <CloudinaryUploader
                    label="Outras fotos"
                    disabled={!cloudinaryEnabled}
                    multiple
                    helperText="As imagens enviadas entram na galeria e podem aparecer na LP."
                    onUploaded={addGalleryImage}
                  />

                  {machineForm.gallery.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3">
                      {machineForm.gallery.map((image) => (
                        <div
                          key={image.publicId}
                          className="rounded-xl border border-border overflow-hidden bg-secondary/30"
                        >
                          <div className="relative aspect-square">
                            <Image
                              src={image.url}
                              alt="Galeria"
                              fill
                              sizes="160px"
                              className="object-cover"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeGalleryImage(image.publicId)}
                            className="w-full border-t border-border px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
                          >
                            Remover
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Destaques</h3>
                    <p className="text-sm text-muted-foreground">
                      Liste os principais diferenciais mostrados no site.
                    </p>
                  </div>
                  <Button variant="outline" onClick={addFeature}>
                    Adicionar destaque
                  </Button>
                </div>
                <div className="space-y-3">
                  {machineForm.features.map((feature, index) => (
                    <div key={index} className="flex gap-3">
                      <Input
                        value={feature}
                        onChange={(event) => handleFeatureChange(index, event.target.value)}
                        placeholder="Ex.: Área de trabalho ampla"
                      />
                      <Button
                        variant="outline"
                        onClick={() => removeFeature(index)}
                        disabled={machineForm.features.length === 1}
                      >
                        Remover
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      Informacoes tecnicas
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Cadastre os pares de rótulo e valor exibidos na página da máquina.
                    </p>
                  </div>
                  <Button variant="outline" onClick={addSpecification}>
                    Adicionar informacao
                  </Button>
                </div>
                <div className="space-y-3">
                  {machineForm.specifications.map((specification, index) => (
                    <div key={specification.id} className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
                      <Input
                        value={specification.label}
                        onChange={(event) =>
                          handleSpecificationChange(index, "label", event.target.value)
                        }
                        placeholder="Rótulo"
                      />
                      <Input
                        value={specification.value}
                        onChange={(event) =>
                          handleSpecificationChange(index, "value", event.target.value)
                        }
                        placeholder="Valor"
                      />
                      <Button
                        variant="outline"
                        onClick={() => removeSpecification(index)}
                        disabled={machineForm.specifications.length === 1}
                      >
                        Remover
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button onClick={saveMachine} disabled={isSavingMachine}>
                  {isSavingMachine ? "Salvando..." : "Salvar maquina"}
                </Button>
                <Button variant="outline" onClick={removeCurrentMachine}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir
                </Button>
              </div>
            </div>
          </div>
        ) : null}

        {activeTab === "showcase" ? (
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-3xl border border-border bg-card p-6 lg:p-8 space-y-6">
              <div>
                <p className="text-sm text-muted-foreground">Destaque da home</p>
                <h2 className="mt-2 text-2xl font-bold text-foreground">
                  Produto principal do topo da pagina
                </h2>
              </div>

              <div className="space-y-2">
                <Label htmlFor="featuredMachineId">Produto em destaque</Label>
                <select
                  id="featuredMachineId"
                  value={showcase.featuredMachineId || ""}
                  onChange={(event) =>
                    setShowcase((current) => ({
                      ...current,
                      featuredMachineId: event.target.value || null,
                    }))
                  }
                  className="border-input h-10 w-full rounded-md border bg-background px-3 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                >
                  <option value="">Nenhuma maquina selecionada</option>
                  {publishedMachines.map((machine) => (
                    <option key={machine.id} value={machine.id}>
                      {machine.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="showcaseEyebrow">Texto pequeno acima do titulo</Label>
                <Input
                  id="showcaseEyebrow"
                  value={showcase.eyebrow}
                  onChange={(event) =>
                    setShowcase((current) => ({
                      ...current,
                      eyebrow: event.target.value,
                    }))
                  }
                  placeholder="Vitrine Routech"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="showcaseTitle">Titulo do destaque</Label>
                <Input
                  id="showcaseTitle"
                  value={showcase.title}
                  onChange={(event) =>
                    setShowcase((current) => ({
                      ...current,
                      title: event.target.value,
                    }))
                  }
                  placeholder="Se ficar vazio, usa o nome da maquina"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="showcaseDescription">Texto do destaque</Label>
                <Textarea
                  id="showcaseDescription"
                  value={showcase.description}
                  onChange={(event) =>
                    setShowcase((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  rows={4}
                  placeholder="Se ficar vazio, usa o resumo da maquina"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="showcaseCtaLabel">Texto do botao</Label>
                <Input
                  id="showcaseCtaLabel"
                  value={showcase.ctaLabel}
                  onChange={(event) =>
                    setShowcase((current) => ({
                      ...current,
                      ctaLabel: event.target.value,
                    }))
                  }
                  placeholder="Ver detalhes"
                />
              </div>

              <div className="flex items-center gap-3">
                <Button onClick={saveShowcase} disabled={isSavingShowcase}>
                  {isSavingShowcase ? "Salvando..." : "Salvar destaque"}
                </Button>
                {showcaseFeedback ? (
                  <p className="text-sm text-muted-foreground">{showcaseFeedback}</p>
                ) : null}
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-card overflow-hidden">
              {featuredMachine?.mainImage ? (
                <div className="relative aspect-[4/3]">
                  <Image
                    src={featuredMachine.mainImage.url}
                    alt={featuredMachine.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="aspect-[4/3] bg-secondary/30 flex items-center justify-center text-muted-foreground">
                  Sem produto em destaque
                </div>
              )}
              <div className="p-6 lg:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
                  {showcase.eyebrow || featuredMachine?.badge || "Vitrine Routech"}
                </p>
                <h3 className="mt-3 text-2xl font-bold text-foreground">
                  {showcase.title || featuredMachine?.title || "Selecione uma máquina"}
                </h3>
                <p className="mt-3 text-muted-foreground leading-relaxed">
                  {showcase.description ||
                    featuredMachine?.shortDescription ||
                    "Escolha uma máquina publicada para enxergar a prévia da vitrine principal."}
                </p>
                {featuredMachine ? (
                  <div className="mt-6">
                    {getMachineDisplayPrice(featuredMachine) ? (
                      <div>
                        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                          {getMachineDisplayPrice(featuredMachine)?.label}
                        </p>
                        <p className="mt-2 text-3xl font-bold text-foreground">
                          {getMachineDisplayPrice(featuredMachine)?.price}
                        </p>
                        {getMachineDisplayPrice(featuredMachine)?.compareAtPrice ? (
                          <p className="text-sm text-muted-foreground line-through">
                            {getMachineDisplayPrice(featuredMachine)?.compareAtPrice}
                          </p>
                        ) : null}
                      </div>
                    ) : (
                      <p className="text-lg font-semibold text-foreground">
                        Solicitar orçamento
                      </p>
                    )}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}

        {activeTab === "quotes" ? (
          <div className="space-y-4">
            {quoteFeedback ? (
              <p className="text-sm text-muted-foreground">{quoteFeedback}</p>
            ) : null}
            {quotes.length > 0 ? (
              quotes.map((quote) => (
                <QuoteCard
                  key={quote.id}
                  quote={quote}
                  onSave={updateQuoteStatus}
                />
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center">
                <p className="text-muted-foreground">
                  Nenhum contato recebido ainda.
                </p>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </main>
  )
}

function QuoteCard({
  quote,
  onSave,
}: {
  quote: QuoteRequest
  onSave: (
    quoteId: string,
    updates: Pick<QuoteRequest, "status" | "notes">
  ) => Promise<void>
}) {
  const [status, setStatus] = useState<QuoteStatus>(quote.status)
  const [notes, setNotes] = useState(quote.notes)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    await onSave(quote.id, { status, notes })
    setIsSaving(false)
  }

  return (
    <div className="rounded-3xl border border-border bg-card p-6 lg:p-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
            {quote.machineTitle}
          </p>
          <h3 className="text-2xl font-bold text-foreground">
            {quote.customerName}
          </h3>
          <div className="grid gap-2 text-sm text-muted-foreground">
            <p>Email: {quote.email}</p>
            <p>WhatsApp: {quote.whatsapp}</p>
            <p>Empresa: {quote.company || "Não informado"}</p>
            <p>Cidade: {quote.city || "Não informado"}</p>
            <p>Recebido em: {new Date(quote.createdAt).toLocaleString("pt-BR")}</p>
          </div>
          {quote.message ? (
            <div className="rounded-2xl bg-secondary/40 p-4 text-sm text-muted-foreground">
              {quote.message}
            </div>
          ) : null}
        </div>

        <div className="w-full max-w-md space-y-4">
          <div className="space-y-2">
            <Label>Etapa do atendimento</Label>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as QuoteStatus)}
              className="border-input h-10 w-full rounded-md border bg-background px-3 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
            >
              <option value="new">Novo</option>
              <option value="contacted">Em contato</option>
              <option value="won">Fechado</option>
              <option value="lost">Perdido</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label>Observacoes internas</Label>
            <Textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={5}
              placeholder="Anote aqui o andamento do contato e os proximos passos."
            />
          </div>

          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Salvando..." : "Salvar atendimento"}
          </Button>
        </div>
      </div>
    </div>
  )
}
