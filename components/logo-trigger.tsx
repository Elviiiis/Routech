"use client"

import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { useRef } from "react"

interface LogoTriggerProps {
  width: number
  height: number
  className?: string
}

const clickWindowMs = 1800
const clickThreshold = 5
const navigateDelayMs = 450

export function LogoTrigger({
  width,
  height,
  className,
}: LogoTriggerProps) {
  const router = useRouter()
  const pathname = usePathname()
  const clickTimesRef = useRef<number[]>([])
  const navigateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleClick = () => {
    const now = Date.now()
    const recentClicks = [...clickTimesRef.current, now].filter(
      (timestamp) => now - timestamp <= clickWindowMs
    )

    clickTimesRef.current = recentClicks

    if (navigateTimerRef.current) {
      clearTimeout(navigateTimerRef.current)
      navigateTimerRef.current = null
    }

    if (recentClicks.length >= clickThreshold) {
      clickTimesRef.current = []
      router.push('/admin')
      return
    }

    navigateTimerRef.current = setTimeout(() => {
      clickTimesRef.current = []

      if (pathname === '/') {
        router.push('/#inicio')
      } else {
        router.push('/')
      }
    }, navigateDelayMs)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="flex-shrink-0"
      aria-label="Routech Automation"
    >
      <Image
        src="/images/logo.png"
        alt="Routech Automation"
        width={width}
        height={height}
        className={className}
        priority
      />
    </button>
  )
}
