import Link from 'next/link'
import Image from 'next/image'
import SidebarNav, { MobileProductNav } from '@/components/SidebarNav'

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ background: 'radial-gradient(circle at top, rgba(227,27,35,0.08), transparent 28%), #09090b' }}>
      <div className="flex min-h-screen">
        <aside
          className="hidden xl:flex xl:w-[300px] xl:flex-col"
          style={{
            background: 'rgba(10,10,12,0.9)',
            borderRight: '1px solid rgba(255,255,255,0.06)',
            backdropFilter: 'blur(18px)',
          }}
        >
          <div className="border-b border-white/6 px-5 py-5">
            <div className="flex items-center gap-3">
              <div
                className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl"
                style={{
                  background: 'linear-gradient(180deg, rgba(227,27,35,0.18), rgba(255,255,255,0.02))',
                  border: '1px solid rgba(227,27,35,0.18)',
                }}
              >
                <Image src="/logo-icon.png" alt="LocalRise" width={28} height={28} style={{ width: 28, height: 28, objectFit: 'contain' }} />
              </div>
              <div>
                <div className="text-sm font-black tracking-tight text-white">LocalRise</div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: '#E31B23' }}>
                  Public Demo
                </div>
              </div>
            </div>
          </div>

          <div className="px-4 pt-4">
            <div className="rounded-3xl border border-white/8 bg-white/[0.03] px-4 py-4">
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">Preview comercial</div>
              <div className="mt-2 text-sm font-bold text-white">Don Aurelio Prime Grill</div>
              <div className="mt-2 text-xs leading-5 text-zinc-400">
                Versao demonstrativa do produto LocalRise para apresentacoes comerciais.
              </div>
              <Link href="/" className="mt-4 inline-flex text-xs font-semibold text-red-300">
                Voltar para o site
              </Link>
            </div>
          </div>

          <SidebarNav isAdmin={false} basePath="/demo" />
        </aside>

        <main className="min-w-0 flex-1">
          <div className="border-b border-white/6 bg-black/20 px-4 py-4 backdrop-blur xl:hidden">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">LocalRise Public Demo</div>
                <div className="text-sm font-bold text-white">Don Aurelio Prime Grill</div>
              </div>
              <div className="rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-300">
                Preview comercial
              </div>
            </div>
          </div>
          <MobileProductNav basePath="/demo" />
          {children}
        </main>
      </div>
    </div>
  )
}
