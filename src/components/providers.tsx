// app/providers.tsx
'use client'
import * as Hero from '@heroui/react'

const ResolvedHeroProvider: any = (Hero as any).HeroUIProvider ?? (Hero as any).HeroProvider ?? (Hero as any).default ?? (({ children }: any) => children)

export function Providers({ children }: { children: React.ReactNode }) {
  const Provider = ResolvedHeroProvider
  return (
    <Provider>
      {children}
    </Provider>
  )
}