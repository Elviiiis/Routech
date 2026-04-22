import 'server-only'

import { createHash, timingSafeEqual } from 'node:crypto'
import { cookies } from 'next/headers'

export const adminSessionCookieName = 'routech-admin-session'

function getAdminPassword() {
  return process.env.ROUTECH_ADMIN_PASSWORD || 'routech-admin'
}

function getAdminSessionValue() {
  return createHash('sha256')
    .update(`routech-admin:${getAdminPassword()}`)
    .digest('hex')
}

export async function isAdminAuthenticated() {
  const cookieStore = await cookies()
  const sessionValue = cookieStore.get(adminSessionCookieName)?.value

  if (!sessionValue) {
    return false
  }

  const expected = Buffer.from(getAdminSessionValue())
  const received = Buffer.from(sessionValue)

  if (expected.length !== received.length) {
    return false
  }

  return timingSafeEqual(expected, received)
}

export async function setAdminSession() {
  const cookieStore = await cookies()
  cookieStore.set(adminSessionCookieName, getAdminSessionValue(), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 12,
  })
}

export async function clearAdminSession() {
  const cookieStore = await cookies()
  cookieStore.delete(adminSessionCookieName)
}

export function verifyAdminPassword(password: string) {
  return password === getAdminPassword()
}
