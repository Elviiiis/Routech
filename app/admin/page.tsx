import { AdminDashboard } from "@/components/admin/admin-dashboard"
import { AdminLogin } from "@/components/admin/admin-login"
import { isAdminAuthenticated } from "@/lib/admin-auth"
import { readRoutechContentStore } from "@/lib/content-store"

export const dynamic = 'force-dynamic'

function isCloudinaryEnabled() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  )
}

export default async function AdminPage() {
  const authenticated = await isAdminAuthenticated()

  if (!authenticated) {
    return <AdminLogin />
  }

  const store = await readRoutechContentStore()

  return (
    <AdminDashboard
      initialMachines={store.machines}
      initialQuotes={store.quotes}
      initialShowcase={store.showcase}
      cloudinaryEnabled={isCloudinaryEnabled()}
    />
  )
}
