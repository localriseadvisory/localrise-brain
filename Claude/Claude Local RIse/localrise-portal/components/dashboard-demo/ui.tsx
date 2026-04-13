import { type ElementType, ReactNode } from 'react'
import Link from 'next/link'
import { ArrowRight, Check, Clock, Sparkles } from 'lucide-react'

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

export function ChannelKpiCard({
  icon: Icon,
  label,
  value,
  change,
  iconColor,
  iconBg,
  positive = true,
}: {
  icon: ElementType
  label: string
  value: string
  change: string
  iconColor: string
  iconBg: string
  positive?: boolean
}) {
  return (
    <div className="lr-panel p-5">
      {/* Ícone colorido no topo esquerdo */}
      <div
        className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl"
        style={{ background: iconBg }}
      >
        <Icon size={18} style={{ color: iconColor }} />
      </div>
      {/* TODO: substituir value, change e positive por dados reais do banco
          quando as integrações estiverem ativas (ex: buscar de metrics_snapshots) */}
      <div className="text-2xl font-black tracking-tight text-white">{value}</div>
      <div className="mt-1 text-sm text-zinc-400">{label}</div>
      <div className={`mt-3 text-xs font-semibold ${positive ? 'text-emerald-400' : 'text-amber-400'}`}>
        {change}
      </div>
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

// ─── Onboarding Checklist ─────────────────────────────────────────────────────
// Exibido quando o cliente já tem conta mas ainda não tem métricas coletadas.
//
// COMO ALTERNAR CADA ITEM ENTRE CONCLUÍDO E PENDENTE:
//   Mude o campo `done` de cada objeto abaixo para `true` (concluído) ou
//   `false` (pendente). Quando todas as integrações estiverem ativas, esses
//   valores podem vir do banco — substitua pelo campo correspondente em
//   `clients` ou `onboarding_status` via Supabase (ver TODO em cada item).
// ─────────────────────────────────────────────────────────────────────────────
const ONBOARDING_STEPS: { label: string; done: boolean }[] = [
  {
    label: 'Conta criada com sucesso',
    done: true,
    // TODO: sempre true quando o usuário existe; pode ser removido da lista se quiser
  },
  {
    label: 'Google Business Profile vinculado',
    done: false,
    // TODO: substituir por: client.gbp_connected === true  (campo em `clients`)
  },
  {
    label: 'Instagram conectado',
    done: false,
    // TODO: substituir por: client.instagram_connected === true
  },
  {
    label: 'Site auditado',
    done: false,
    // TODO: substituir por: client.site_audited === true
  },
  {
    label: 'Primeira campanha configurada',
    done: false,
    // TODO: substituir por: client.first_campaign_active === true
  },
  {
    label: 'Métricas iniciais coletadas',
    done: false,
    // TODO: este item torna-se true assim que hasMeaningfulMetrics() retornar true
    //       — nesse ponto o dashboard exibe os dados reais e este checklist some
  },
]

export function OnboardingChecklist() {
  const completed = ONBOARDING_STEPS.filter((step) => step.done).length
  const total = ONBOARDING_STEPS.length
  const percent = Math.round((completed / total) * 100)

  return (
    <div className="lr-panel p-8">
      {/* Cabeçalho */}
      <div className="mb-2 flex items-center gap-2 text-red-300">
        <Sparkles size={15} />
        <span className="text-xs font-semibold uppercase tracking-[0.16em]">Configuração em andamento</span>
      </div>
      <h2 className="text-2xl font-black tracking-tight text-white">
        Estamos configurando tudo para você 🚀
      </h2>
      <p className="mt-2 text-sm text-zinc-400">
        Acompanhe abaixo o progresso da sua configuração
      </p>

      {/* Barra de progresso */}
      <div className="mt-8 mb-8">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-zinc-400">Progresso geral</span>
          <span className="font-bold text-white">{percent}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-white/8">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${percent}%`,
              background: 'linear-gradient(90deg, #E31B23, #f87171)',
            }}
          />
        </div>
        <div className="mt-2 text-xs text-zinc-500">
          {completed} de {total} etapas concluídas
        </div>
      </div>

      {/* Lista de itens */}
      <div className="space-y-3">
        {ONBOARDING_STEPS.map((step) => (
          <div
            key={step.label}
            className="flex items-center gap-4 rounded-2xl border px-5 py-4"
            style={{
              borderColor: step.done ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.06)',
              background: step.done ? 'rgba(34,197,94,0.05)' : 'rgba(255,255,255,0.02)',
            }}
          >
            {/* Ícone de status */}
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
              style={{
                background: step.done ? 'rgba(34,197,94,0.18)' : 'rgba(255,255,255,0.06)',
              }}
            >
              {step.done ? (
                <Check size={14} style={{ color: '#4ade80' }} />
              ) : (
                <Clock size={14} style={{ color: '#52525b' }} />
              )}
            </div>

            {/* Label */}
            <span
              className="flex-1 text-sm font-medium"
              style={{ color: step.done ? '#ffffff' : '#71717a' }}
            >
              {step.label}
            </span>

            {/* Badge de status */}
            <span
              className="rounded-full px-3 py-1 text-xs font-semibold"
              style={{
                background: step.done ? 'rgba(34,197,94,0.12)' : 'rgba(255,255,255,0.05)',
                color: step.done ? '#4ade80' : '#52525b',
              }}
            >
              {step.done ? 'Concluído' : 'Em andamento'}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
