import Image from "next/image"
import Link from "next/link"
import { siteConfig } from "@/lib/site"

export function Footer() {
  return (
    <footer className="border-t border-border py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <Link href="/#inicio">
            <Image
              src="/images/logo.png"
              alt="Routech Automation"
              width={140}
              height={40}
              className="h-10 w-auto"
            />
          </Link>

          <div className="text-center sm:text-right">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} {siteConfig.name} - Máquinas CNC e
              automação industrial
            </p>
            <a
              href={`mailto:${siteConfig.email}`}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {siteConfig.email}
            </a>
            <div className="mt-3 flex justify-center sm:justify-end">
              <a
                href="https://aresdevelopment.com.br/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[11px] font-medium tracking-[0.16em] text-muted-foreground transition-colors hover:text-[var(--brand-blue)]"
              >
                <span
                  aria-hidden="true"
                  className="h-1.5 w-1.5 rounded-full bg-current"
                />
                Design e desenvolvimento por Ares Dev
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
