/**
 * Camada de dados do SaaS.
 *
 * Tenta buscar do backend (localhost:3001 via rewrite /backend/*).
 * Se offline ou em erro, cai no mock local — demo nunca quebra.
 */
import { MOCK } from './mock-data'

const BASE = '/backend'
const TIMEOUT_MS = 3000

async function fetchAPI<T>(path: string, fallback: T): Promise<T> {
  try {
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS)
    const res   = await fetch(`${BASE}${path}`, { signal: ctrl.signal, cache: 'no-store' })
    clearTimeout(timer)
    if (!res.ok) throw new Error(`${res.status}`)
    return await res.json() as T
  } catch {
    return fallback
  }
}

// ── Tipos ────────────────────────────────────────────────────────────────────

export interface Alert {
  id:           string
  type:         string
  severity:     'critical' | 'warning' | 'info'
  title:        string
  message:      string
  triggered_at: string
  status:       string
}

export interface CashFlowDay {
  date:     string
  opening:  number
  income:   number
  expenses: number
  closing:  number
}

export interface AccountPayable {
  id:            string
  description:   string
  supplier_name: string
  amount:        number
  due_date:      string
  status:        string
  priority:      string
  category:      string
}

export interface AccountReceivable {
  id:            string
  description:   string
  customer_name: string
  amount:        number
  due_date:      string
  status:        string
}

export interface Order {
  id:               string
  shopify_order_id: string
  status:           string
  customer_name:    string
  total_amount:     number
  payment_status:   string
  created_at:       string
}

export interface OperationItem {
  order_id:         string
  stage:            string
  assigned_to:      string
  hours_since_update: number
  is_stuck:         boolean
  order: {
    shopify_order_id: string
    customer_name:    string
    total_amount:     number
  }
}

export interface LogisticsItem {
  order_ref:        string
  customer:         string
  tracking:         string
  carrier:          string
  latest_status:    string
  latest_location:  string
  is_exception:     boolean
  events:           { status: string; location: string; timestamp: string; note?: string }[]
}

// ── Funções de dados ─────────────────────────────────────────────────────────

export async function getDashboard() {
  return fetchAPI('/api/dashboard', {
    current_balance: MOCK.current_balance,
    kpis:            MOCK.monthly_kpis,
    alerts:          MOCK.alerts,
    cash_flow_preview: MOCK.cash_flow.projection.slice(0, 7),
    upcoming_payments: MOCK.accounts_payable.items.slice(0, 5),
    orders_summary:  MOCK.orders_summary,
  })
}

export async function getCashFlow(days = 30) {
  return fetchAPI(`/api/financial/cashflow?days=${days}`, MOCK.cash_flow)
}

export async function getFinancialSummary() {
  return fetchAPI('/api/financial/summary', MOCK.financial_summary)
}

export async function getAccountsPayable(days?: number) {
  const qs = days ? `?days=${days}` : ''
  return fetchAPI<{ total: number; items: AccountPayable[] }>(
    `/api/financial/accounts-payable${qs}`,
    MOCK.accounts_payable as { total: number; items: AccountPayable[] }
  )
}

export async function getAccountsReceivable() {
  return fetchAPI<{ total: number; items: AccountReceivable[] }>(
    '/api/financial/accounts-receivable',
    MOCK.accounts_receivable as { total: number; items: AccountReceivable[] }
  )
}

export async function getAlerts(params?: { severity?: string; type?: string }) {
  const qs = new URLSearchParams(params as Record<string, string> || {}).toString()
  return fetchAPI<{ total: number; items: Alert[] }>(
    `/api/alerts${qs ? `?${qs}` : ''}`,
    MOCK.alerts as { total: number; items: Alert[] }
  )
}

export async function getOrders(status?: string) {
  const qs = status ? `?status=${status}` : ''
  return fetchAPI<{ total: number; items: Order[] }>(
    `/api/orders${qs}`,
    MOCK.orders as { total: number; items: Order[] }
  )
}

export async function getOperations() {
  return fetchAPI<{ items: OperationItem[] }>('/api/operations', MOCK.operations as { items: OperationItem[] })
}

export async function getLogistics() {
  return fetchAPI<{ items: LogisticsItem[] }>('/api/logistics', MOCK.logistics as { items: LogisticsItem[] })
}

// ── Ações (chamadas de mutação) ───────────────────────────────────────────────

export async function acknowledgeAlert(id: string) {
  try {
    const res = await fetch(`${BASE}/api/alerts/${id}/acknowledge`, { method: 'PATCH' })
    return res.ok
  } catch { return false }
}

export async function advanceOrderStage(orderId: string) {
  try {
    const res = await fetch(`${BASE}/api/orders/${orderId}/advance-stage`, { method: 'POST' })
    return res.ok ? await res.json() : null
  } catch { return null }
}

export async function payAccount(id: string) {
  try {
    const res = await fetch(`${BASE}/api/financial/accounts-payable/${id}/pay`, { method: 'POST' })
    return res.ok ? await res.json() : null
  } catch { return null }
}

export async function receiveAccount(id: string) {
  try {
    const res = await fetch(`${BASE}/api/financial/accounts-receivable/${id}/receive`, { method: 'POST' })
    return res.ok ? await res.json() : null
  } catch { return null }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

export function fmt(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR')
}

export function daysUntil(dateStr: string): number {
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const due   = new Date(dateStr + 'T00:00:00')
  return Math.round((due.getTime() - today.getTime()) / 86400000)
}

export function urgencyLabel(days: number) {
  if (days < 0)  return { label: `Venceu há ${Math.abs(days)}d`,  cls: 'badge-critical' }
  if (days === 0)return { label: 'Vence hoje',                    cls: 'badge-critical' }
  if (days <= 2) return { label: `Vence em ${days}d`,             cls: 'badge-critical' }
  if (days <= 7) return { label: `Vence em ${days}d`,             cls: 'badge-warning' }
  return               { label: `Em ${days}d`,                    cls: 'badge-ok' }
}
