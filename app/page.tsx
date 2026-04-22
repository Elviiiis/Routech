import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { About } from "@/components/about"
import { Products } from "@/components/products"
import { Gallery } from "@/components/gallery"
import { Contact } from "@/components/contact"
import { Footer } from "@/components/footer"
import { getPublicSiteSnapshot } from "@/lib/public-data"

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const snapshot = await getPublicSiteSnapshot()

  return (
    <>
      <Header />
      <main>
        <Hero
          showcaseMachine={snapshot.showcaseMachine}
          showcase={snapshot.showcase}
        />
        <Products
          machines={snapshot.machines}
          carouselImages={snapshot.carouselImages}
        />
        <Gallery images={snapshot.galleryImages} />
        <About />
        <Contact machines={snapshot.machines} />
      </main>
      <Footer />
    </>
  )
}
