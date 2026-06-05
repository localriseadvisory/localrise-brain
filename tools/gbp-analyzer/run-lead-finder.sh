#!/bin/bash
# Executado pelo cron no Oracle VM (147.15.23.161)
# Cron: 0 12 * * 1,3,5 (Seg/Qua/Sex 09h Brasilia / 12h UTC)
# Outscraper bloqueia GitHub Actions — execucao local necessaria
cd ~/localrise-brain
git pull --quiet
node tools/gbp-analyzer/lead-finder.mjs
node tools/gbp-analyzer/import-leads-supabase.mjs
