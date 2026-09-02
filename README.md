# Trafinexo

**Trafinexo by INFOTEC — Gestão inteligente de tráfego e performance.**

Trafinexo nasce de **Tráfego + Nexo**: conecta clientes, contas de anúncio, campanhas, criativos, testes A/B, contratos, metas, resultados, IA e decisões em uma única operação para gestores de tráfego, freelancers e agências.

## URLs

- Produção: `https://trafinexo.useinfotec.com.br`
- Login: `/login`
- Cadastro/teste: `/cadastro`
- Dashboard: `/dashboard`

## Proposta do produto

O Trafinexo não é apenas um dashboard de anúncios. A proposta é funcionar como o sistema operacional da operação de tráfego, cobrindo o ciclo completo do cliente: onboarding, diagnóstico 360°, gestão, mídia, experimentos, contratos, rentabilidade, relatórios, alertas, IA e melhoria contínua.

## Funcionalidades previstas e estruturadas

- Onboarding inteligente do cliente e diagnóstico 360°.
- Carteira e visão 360° por cliente.
- Meta Ads, Google Ads e evolução para outros canais.
- Campanhas, métricas, metas, projeções e alertas.
- Biblioteca de criativos, performance e fadiga.
- Testes A/B e biblioteca de aprendizados.
- Contratos, renovações, fee, verba e rentabilidade.
- Tarefas, calendário operacional e diário de alterações.
- Portal do cliente e permissões de equipe.
- IA Analista de Performance.
- Aba de Sugestões com pipeline de melhoria assistido por IA.
- Integração com a fábrica INFOTEC e n8n via outbox de eventos.

## Teste gratuito

Todo novo cadastro feito pelo Trafinexo cria um workspace em modo `trial` por **15 dias**. O gatilho é limitado a usuários cujo cadastro contenha `product=trafinexo`, evitando interferência com outros produtos que compartilham a infraestrutura central da fábrica.

## Stack

- Next.js 16.3.3
- React 19
- Vercel
- Supabase central da fábrica
- PostgreSQL + Row Level Security
- n8n como orquestrador de automações
- GitHub como origem do código e fluxo de melhorias

## Banco e segurança

As tabelas do produto usam prefixo `traf_` e isolamento por workspace. A segurança é baseada em autenticação Supabase, RLS, funções auxiliares de associação/perfil e políticas de menor privilégio. Tokens sensíveis de integrações de anúncios não devem ser persistidos no navegador.

Principais entidades: `traf_workspaces`, `traf_workspace_members`, `traf_clients`, `traf_onboarding_answers`, `traf_integrations`, `traf_campaigns`, `traf_creatives`, `traf_experiments`, `traf_goals`, `traf_contracts`, `traf_tasks`, `traf_suggestions`, `traf_improvement_runs` e `traf_audit_log`.

## Integração com a fábrica

O produto está registrado em:

- `products_catalog`
- `factory_product_registry`
- `factory_project_metrics`
- `factory_product_kpi_snapshots`
- `factory_business_goals`
- `factory_event_catalog`
- `factory_automation_outbox`

Eventos iniciais: `trial.started`, `client.created` e `improvement.suggestion_submitted`.

Consulte `docs/N8N_FACTORY_WORKFLOW.md` e `SECURITY.md` para os detalhes de automação e governança.
