import { ReactNode } from 'react'
import Link from 'next/link'
import { ArrowRight, Check, Sparkles } from 'lucide-react'

type Tone = 'red' | 'blue' | 'green' | 'amber' | 'purple'

const toneMap: Record<Tone, { border: string; soft: string; text: string }> = {
  red: { border: '#E31B23', soft: 'rgba(227,27,35,0.12)', text: '#ffb4b7' },
  blue: { border: '#3B82F6', soft: 'rgba(59,130,246,0.12)', text: '#b9d7ff' },
  green: { border: '#22C55E', soft: 'rgba(34,197,94,0.12)', text: '#bdf4cf' },
  amber: { border: '#F59E0B', soft: 'rgba(245,158,11,0.12)', text: '#ffe2a6' },
  purple: { border: '#A855F7', soft: 'rgba(168,85,247,0.12)', text: '#e6c7ff' },
}

export function PageIntro({
  eyebrow,
  title,
  description,
  ctaHref,
  ctaLabel,
}: {
  eyebrow: string
  title: string
  description: string
  ctaHref?: string
  ctaLabel?: string
}) {
  return (
    <div className="lr-panel mb-6 flex flex-col gap-4 p-6 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-3xl">
        <div className="lr-badge mb-4">
          <Sparkles size={13} />
          {eyebrow}
        </div>
        <h1 className="text-3xl font-black tracking-tight text-white md:text-4xl">{title}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-300 md:text-base">{description}</p>
      </div>
      {ctaHref && ctaLabel ? (
        <Link href={ctaHref} className="lr-cta">
          {ctaLabel}
          <ArrowRight size={15} />
        </Link>
      ) : null}
    </div>
  )
}

export function SectionTitle({
  title,
  description,
  badge,
}: {
  title: string
  description?: string
  badge?: string
}) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div>
        <h2 className="text-lg font-bold tracking-tight text-white">{title}</h2>
        {description ? <p className="mt-1 text-sm text-zinc-400">{description}</p> : null}
      </div>
      {badge ? <div className="lr-badge shrink-0">{badge}</div> : null}
    </div>
  )
}

export function Panel({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return <section className={`lr-panel p-5 ${className}`.trim()}>{children}</section>
}

export function KpiCard({
  label,
  value,
  delta,
  footnote,
  tone,
}: {
  label: string
  value: string
  delta: string
  footnote: string
  tone: Tone
}) {
  const style = toneMap[tone]
  return (
    <div
      className="lr-kpi"
      style={{
        borderColor: `${style.border}44`,
        background: `linear-gradient(180deg, ${style.soft}, rgba(12,12,14,0.98))`,
        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.03), 0 18px 40px rgba(0,0,0,0.28)`,
      }}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">{label}</span>
        <span className="rounded-full px-2 py-1 text-xs font-semibold" style={{ background: style.soft, color: style.text }}>
          {delta}
        </span>
      </div>
      <div className="text-3xl font-black tracking-tight text-white">{value}</div>
      <p className="mt-3 text-sm leading-6 text-zinc-400">{footnote}</p>
    </div>
  )
}

export function ProgressList({
  items,
}: {
  items: { label: string; value: number; color: string }[]
}) {
  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.label}>
          <div className="mb-2 flex items-center justify-between gap-3 text-sm">
            <span className="text-zinc-300">{item.label}</span>
            <span className="font-semibold text-white">{item.value}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/6">
            <div className="h-full rounded-full" style={{ width: `${item.value}%`, background: item.color }} />
          </div>
        </div>
      ))}
    </div>
  )
}

export function MiniBars({ points, color }: { points: { label: string; value: number }[]; color: string }) {
  const max = Math.max(...points.map((point) => point.value), 1)
  return (
    <div className="flex items-end gap-3 pt-3">
      {points.map((point) => (
        <div key={point.label} className="flex-1">
          <div className="flex h-36 items-end">
            <div
              className="w-full rounded-t-2xl"
              style={{
                height: `${(point.value / max) * 100}%`,
                background: `linear-gradient(180deg, ${color}, rgba(255,255,255,0.08))`,
              }}
            />
          </div>
          <div className="mt-3 text-center text-xs text-zinc-500">{point.label}</div>
        </div>
      ))}
    </div>
  )
}

export function FunnelBars({ points }: { points: { label: string; value: number }[] }) {
  const max = Math.max(...points.map((point) => point.value), 1)
  return (
    <div className="space-y-3">
      {points.map((point, index) => (
        <div key={point.label}>
          <div className="mb-1 flex items-center justify-between gap-3 text-sm">
            <span className="text-zinc-300">{index + 1}. {point.label}</span>
            <span className="font-semibold text-white">{point.value.toLocaleString('pt-BR')}</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-white/6">
            <div
              className="h-full rounded-full"
              style={{
                width: `${(point.value / max) * 100}%`,
                background: 'linear-gradient(90deg, #E31B23, #A855F7)',
              }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

export function DataTable({
  headers,
  rows,
}: {
  headers: string[]
  rows: ReactNode[][]
}) {
  return (
    <div className="overflow-hidden rounded-3xl border border-white/8">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-white/[0.04]">
            <tr>
              {headers.map((header) => (
                <th key={header} className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index} className="border-t border-white/6">
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="px-4 py-3 text-zinc-300">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function BulletList({ items }: { items: string[] }) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item} className="flex items-start gap-3">
          <div className="mt-0.5 rounded-full bg-emerald-500/12 p-1 text-emerald-300">
            <Check size={13} />
          </div>
          <p className="text-sm leading-6 text-zinc-300">{item}</p>
        </div>
      ))}
    </div>
  )
}
