"use client"

import Image from "next/image"
import { useRef, useState } from "react"
import type { MachineImageAsset } from "@/lib/content-types"
import { getFirebaseAuthorizationHeaders } from "@/lib/firebase-client"

interface CloudinaryUploaderProps {
  label: string
  value?: MachineImageAsset | null
  onUploaded: (image: MachineImageAsset) => void
  helperText?: string
  disabled?: boolean
  multiple?: boolean
}

interface CloudinarySignaturePayload {
  cloudName: string
  apiKey: string
  timestamp: number
  folder: string
  signature: string
}

async function uploadToCloudinary(file: File) {
  const signResponse = await fetch("/api/cloudinary/sign", {
    method: "POST",
    headers: await getFirebaseAuthorizationHeaders(),
  })

  const signPayload = (await signResponse.json().catch(() => null)) as
    | (CloudinarySignaturePayload & { error?: string })
    | null

  if (!signResponse.ok || !signPayload) {
    throw new Error(signPayload?.error || "Nao foi possivel autorizar o upload.")
  }

  const formData = new FormData()
  formData.append("file", file)
  formData.append("api_key", signPayload.apiKey)
  formData.append("timestamp", signPayload.timestamp.toString())
  formData.append("signature", signPayload.signature)
  formData.append("folder", signPayload.folder)

  const uploadResponse = await fetch(
    `https://api.cloudinary.com/v1_1/${signPayload.cloudName}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  )

  const uploadPayload = (await uploadResponse.json().catch(() => null)) as
    | { secure_url?: string; public_id?: string; error?: { message?: string } }
    | null

  if (!uploadResponse.ok || !uploadPayload?.secure_url || !uploadPayload.public_id) {
    throw new Error(uploadPayload?.error?.message || "Falha ao enviar imagem.")
  }

  return {
    url: uploadPayload.secure_url,
    publicId: uploadPayload.public_id,
  }
}

export function CloudinaryUploader({
  label,
  value = null,
  onUploaded,
  helperText,
  disabled = false,
  multiple = false,
}: CloudinaryUploaderProps) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [feedback, setFeedback] = useState("")

  const handleFileSelection = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(event.target.files ?? [])

    if (files.length === 0) {
      return
    }

    setIsUploading(true)
    setFeedback("")

    try {
      for (const file of files) {
        const image = await uploadToCloudinary(file)
        onUploaded(image)
      }

      setFeedback(
        files.length > 1
          ? "Imagens enviadas com sucesso."
          : "Imagem enviada com sucesso."
      )
    } catch (error) {
      setFeedback(
        error instanceof Error ? error.message : "Nao foi possivel concluir o upload."
      )
    } finally {
      setIsUploading(false)

      if (inputRef.current) {
        inputRef.current.value = ""
      }
    }
  }

  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        {helperText ? (
          <p className="mt-1 text-xs text-muted-foreground">{helperText}</p>
        ) : null}
      </div>

      {value ? (
        <div className="relative aspect-[4/3] max-w-sm overflow-hidden rounded-xl border border-border bg-secondary/40">
          <Image
            src={value.url}
            alt={label}
            fill
            sizes="320px"
            className="object-cover"
          />
        </div>
      ) : null}

      <div className="flex flex-col gap-3">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple={multiple}
          disabled={disabled || isUploading}
          onChange={handleFileSelection}
          className="block w-full text-sm text-foreground file:mr-4 file:rounded-md file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-foreground hover:file:bg-primary/90 disabled:opacity-60"
        />
        {feedback ? (
          <p className="text-sm text-muted-foreground">{feedback}</p>
        ) : null}
      </div>
    </div>
  )
}
