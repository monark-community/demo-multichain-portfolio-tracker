"use client"

import { createContext, useContext } from "react"

import type { Locale } from "./config"
import type { Dictionary } from "./dictionaries/en"

type AppDict = Dictionary["app"] & { common: Dictionary["common"]; networks: Dictionary["networks"] }

const Ctx = createContext<{ locale: Locale; d: AppDict } | null>(null)

/** Gives client components the app strings and the locale (the marketing copy stays on the server). */
export function DictProvider({ locale, d, children }: { locale: Locale; d: AppDict; children: React.ReactNode }) {
  return <Ctx.Provider value={{ locale, d }}>{children}</Ctx.Provider>
}

export function useDict() {
  const v = useContext(Ctx)
  if (!v) throw new Error("useDict outside DictProvider")
  return v
}

export type { AppDict }
