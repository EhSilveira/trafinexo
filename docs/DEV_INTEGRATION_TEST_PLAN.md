# TrafiNexo — plano de testes de integrações DEV

Branch: `dev/integracoes-e2e-20260902`.

## Regras
- Nenhum teste DEV pode criar, pausar, ativar ou alterar orçamento de campanha real.
- OAuth/token são validados por presença/configuração e conectividade; escrita externa exige ambiente sandbox ou conta de teste do provedor.
- `traf-integration-diagnostics-dev` é somente leitura e exige JWT.

## Gate automático
1. `npm ci`.
2. Contratos mínimos dos 11 provedores.
3. `npm run build`.
4. Preview Vercel quando disponível.
5. Teste autenticado em `/dev/integracoes`.

## Provedores cobertos
Meta Ads, Google Ads, GA4, Search Console, TikTok Ads, LinkedIn Ads, Microsoft Ads, HubSpot, RD Station, Shopify e Webhook/CRM.

## Critério para considerar integração operante
Credenciais configuradas + OAuth/token válido + listagem da conta/recurso + leitura de dados reais da conta de teste + persistência isolada + retry/auditoria + teste de revogação. Ações de escrita só passam após teste sandbox e aprovação humana.
