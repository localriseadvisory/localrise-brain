import type { Metadata } from 'next'
import './globals.css'
import Sidebar from '@/components/Sidebar'

export const metadata: Metadata = {
  title:       'LocalRise — Gestão Inteligente',
  description: 'Sistema automatizado de gestão operacional e financeira',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <div className="flex h-screen overflow-hidden">
          <Sidebar criticalAlerts={2} />
          <main className="flex-1 ml-[240px] overflow-y-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
