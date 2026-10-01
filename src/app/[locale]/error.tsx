"use client"

import { usePathname } from "next/navigation"

import { Button } from "@/components/ui/button"

// Kept tiny on purpose: the error boundary must not pull the full dictionaries into the bundle.
const COPY = {
  en: {
    title: "Something went wrong on our side.",
    body: "Your demo data is stored in this browser and is safe. Try again, or reset the demo if it keeps happening.",
    retry: "Try again",
  },
  fr: {
    title: "Un problème est survenu de notre côté.",
    body: "Vos données de démo sont enregistrées dans ce navigateur et sont intactes. Réessayez, ou réinitialisez la démo si le problème persiste.",
    retry: "Réessayer",
  },
}

export default function ErrorBoundary({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const pathname = usePathname() ?? ""
  const copy = pathname.startsWith("/fr") ? COPY.fr : COPY.en
  return (
    <section role="alert" className="mx-auto flex w-full max-w-xl flex-1 flex-col items-start justify-center px-4 py-20">
      <h1 className="text-3xl font-extrabold tracking-tight">{copy.title}</h1>
      <p className="mt-4 text-muted-foreground">{copy.body}</p>
      <Button className="mt-8 rounded-full" size="lg" onClick={reset}>
        {copy.retry}
      </Button>
    </section>
  )
}
