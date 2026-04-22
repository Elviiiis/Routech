"use client"

import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app"
import { getAnalytics, isSupported, type Analytics } from "firebase/analytics"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

function hasFirebaseConfig() {
  return Boolean(
    firebaseConfig.apiKey &&
      firebaseConfig.authDomain &&
      firebaseConfig.projectId &&
      firebaseConfig.storageBucket &&
      firebaseConfig.messagingSenderId &&
      firebaseConfig.appId
  )
}

export function getFirebaseApp(): FirebaseApp | null {
  if (!hasFirebaseConfig()) {
    return null
  }

  return getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)
}

let analyticsPromise: Promise<Analytics | null> | null = null

export function initializeFirebaseAnalytics() {
  if (typeof window === "undefined") {
    return Promise.resolve<Analytics | null>(null)
  }

  if (analyticsPromise) {
    return analyticsPromise
  }

  analyticsPromise = (async () => {
    const app = getFirebaseApp()

    if (!app || !firebaseConfig.measurementId) {
      return null
    }

    const analyticsSupported = await isSupported().catch(() => false)

    if (!analyticsSupported) {
      return null
    }

    return getAnalytics(app)
  })()

  return analyticsPromise
}
