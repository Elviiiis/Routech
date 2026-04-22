import Image from "next/image"
import Link from "next/link"
import { siteConfig } from "@/lib/site"

export function Footer() {
  return (
    <footer className="py-12 border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
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
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {siteConfig.email}
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
