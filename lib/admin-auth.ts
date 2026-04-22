import "server-only"

interface FirebaseLookupUser {
  localId?: string
  email?: string
  emailVerified?: boolean
  disabled?: boolean
}

interface AuthenticatedAdmin {
  uid: string
  email: string | null
  emailVerified: boolean
}

function getBearerToken(request: Request) {
  const authorization = request.headers.get("authorization")

  if (!authorization?.startsWith("Bearer ")) {
    return null
  }

  const token = authorization.slice("Bearer ".length).trim()
  return token || null
}

async function lookupFirebaseUser(
  idToken: string
): Promise<AuthenticatedAdmin | null> {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.trim()

  if (!apiKey) {
    return null
  }

  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ idToken }),
      cache: "no-store",
    }
  )

  const payload = (await response.json().catch(() => null)) as
    | { users?: FirebaseLookupUser[] }
    | null

  const user = payload?.users?.[0]

  if (!response.ok || !user?.localId || user.disabled) {
    return null
  }

  return {
    uid: user.localId,
    email: user.email || null,
    emailVerified: Boolean(user.emailVerified),
  }
}

export async function getAuthenticatedAdmin(
  request: Request
): Promise<AuthenticatedAdmin | null> {
  const token = getBearerToken(request)

  if (!token) {
    return null
  }

  try {
    return await lookupFirebaseUser(token)
  } catch {
    return null
  }
}

export async function isAdminAuthenticated(request: Request) {
  return Boolean(await getAuthenticatedAdmin(request))
}
