# Dashboard Data Layer

Esta pasta organiza a demo SaaS da LocalRise em camadas prontas para backend real.

## Arquivos

- `contracts.ts`
  Define os contratos tipados do dashboard.
- `mock-data.ts`
  Contem o restaurante demo usado hoje.
- `source.ts`
  Resolve a fonte de dados ativa (`mock` ou `supabase`).
- `page-data.ts`
  Monta o payload server-side consumido pelas paginas.

## Fluxo atual

`route/page -> server-page -> page-data -> source -> mock-data`

## Como plugar backend real

1. Implementar `SupabaseDashboardSource` em `source.ts`.
2. Substituir a montagem mock por queries/agregacoes reais.
3. Manter o contrato de `DashboardData` estavel para a UI nao precisar mudar.
4. Opcionalmente usar `LOCALRISE_DASHBOARD_SOURCE=supabase` no ambiente.

## API auxiliar

- `GET /demo-data`
  Retorna o payload inteiro do restaurante demo em JSON.
