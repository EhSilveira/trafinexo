# Trafinexo — preparação n8n / Fábrica INFOTEC

Este documento define o fluxo operacional que o n8n deve executar quando o runtime da fábrica estiver ativo. O banco central já produz eventos idempotentes em `factory_automation_outbox`.

## Princípios

1. O n8n é o orquestrador, não a fonte primária de dados.
2. O Supabase é a fonte de estado; GitHub/Vercel são fontes de código/deploy.
3. Todo evento deve respeitar `dedupe_key` e número máximo de tentativas.
4. Nenhuma credencial, refresh token ou secret de plataforma de anúncios deve entrar no payload da outbox.
5. Alterações de código de risco médio/alto passam por testes, gate de segurança e aprovação antes de produção.
6. Falhas são registradas em `last_error`; eventos esgotados vão para estado equivalente a dead-letter para análise humana.

## Padrão de desenvolvimento da fábrica

- **Claude** é o agente de desenvolvimento principal para implementar as melhorias aprovadas.
- **Codex** atua como revisor técnico independente, conferindo regressões, segurança, consistência e critérios de aceite.
- Um segundo gate de revisão/segurança pode ser acionado para mudanças críticas antes do merge.
- Nenhum agente recebe autorização irrestrita para produção: autenticação, billing, RLS, dados pessoais, infraestrutura, permissões, deleção de dados e integrações sensíveis exigem aprovação humana.

## Consumidor central da outbox

Cadência sugerida: a cada 1 minuto.

Passos:

1. Ler registros `pending` com `available_at <= now()` por prioridade.
2. Marcar lote como `processing`, preenchendo `locked_at` e `locked_by`.
3. Roteamento por `product=trafinexo` e `event_type`.
4. Executar workflow especializado.
5. Em sucesso: salvar `result`, `processed_at` e `status=processed`.
6. Em erro transitório: incrementar `attempts`, calcular backoff e retornar a `pending/retry`.
7. Em erro permanente ou `attempts >= max_attempts`: registrar erro final e notificar a operação.

## Workflow 1 — `trial.started`

Objetivo: acompanhar o novo usuário durante os 15 dias de validação.

- Validar workspace e usuário.
- Registrar evento analítico de trial.
- Criar sequência de onboarding.
- Disparar boas-vindas somente pelos canais autorizados.
- Programar checkpoints de uso (ex.: D1, D3, D7, D12, D15).
- Atualizar snapshot do produto/fábrica.
- Não cobrar automaticamente enquanto o plano comercial não estiver aprovado.

## Workflow 2 — `client.created` → Diagnóstico 360°

Objetivo: entregar ao gestor um briefing inteligente antes da primeira reunião.

1. Buscar `traf_clients` + `traf_onboarding_answers` do cliente.
2. Validar quais fontes estão autorizadas/conectadas em `traf_integrations`.
3. Para dados públicos, consultar somente fontes permitidas e respeitar termos/limites.
4. Analisar:
   - site e responsividade;
   - presença e consistência digital;
   - oferta/CTA/prova social;
   - reputação e sinais públicos;
   - estrutura de mensuração autorizada;
   - histórico de mídia conectado;
   - capacidade comercial/atendimento informada;
   - concorrentes indicados.
5. Enviar contexto estruturado ao agente de IA.
6. A IA retorna JSON validado com:
   - `maturity_score`;
   - `health_score` quando aplicável;
   - pontos fortes;
   - pontos de atenção;
   - riscos;
   - oportunidades;
   - questões para kickoff;
   - sugestões de campanha;
   - sugestões de testes A/B;
   - plano recomendado de primeiros passos.
7. Atualizar `traf_clients.diagnosis` e `traf_clients.ai_starting_plan`.
8. Criar tarefas recomendadas em `traf_tasks` quando aprovadas pelas regras do workflow.
9. Notificar o gestor de que o diagnóstico está pronto.

A IA recomenda; o gestor valida a estratégia final.

## Workflow 3 — `improvement.suggestion_submitted`

Objetivo: transformar feedback de uso em melhoria rastreável.

### Etapa A — triagem por IA

- Ler sugestão e contexto funcional relacionado.
- Alterar status para `ai_review`.
- Classificar:
  - categoria;
  - impacto esperado;
  - frequência/probabilidade;
  - prioridade;
  - risco técnico e de segurança;
  - esforço estimado por faixa, sem promessa de prazo.
- Gerar critérios de aceitação e plano de testes.
- Salvar em `ai_summary`, `ai_priority`, `ai_risk`, `ai_recommendation`.

### Etapa B — decisão de desenvolvimento

Sugestões válidas podem avançar para `planned` e gerar uma execução em `traf_improvement_runs`.

Fluxo de código recomendado:

1. Criar/atualizar issue no GitHub com contexto e critérios de aceitação.
2. Criar branch específica.
3. Claude implementa a mudança como desenvolvedor principal.
4. Codex realiza revisão independente e procura regressões, falhas de segurança e inconsistências com o padrão da fábrica.
5. Quando aplicável, um segundo revisor/gate especializado valida segurança e arquitetura.
6. Rodar build, lint, testes unitários/integração e testes específicos do critério de aceite.
7. Executar gate de segurança.
8. Abrir PR com evidências e resultados.

### Etapa C — gate de produção

- Risco baixo + mudança limitada e todos os gates aprovados: pode ser elegível a merge automatizado segundo política da fábrica.
- Risco médio/alto, auth, billing, RLS, integrações, dados pessoais, permissões, exclusão de dados ou alterações de infraestrutura: `approval_required` obrigatória.
- Falha em qualquer teste: status `failed/testing`, sem deploy.

Após produção:

- Atualizar sugestão para `deployed`.
- Registrar commit/PR/deploy.
- Gravar auditoria.
- Notificar quem sugeriu.
- Medir se a alteração atingiu o objetivo e adicionar aprendizado à base da fábrica.

## Workflow 4 — sincronização de anúncios

Por cliente/integration:

- Renovar OAuth no servidor quando necessário.
- Coletar somente contas explicitamente autorizadas.
- Normalizar Meta/Google/outros para o modelo `traf_campaigns`.
- Salvar métricas e `last_sync_at`.
- Evitar duplicação por IDs externos/idempotência.
- Em primeira fase, preferir **read-only** para reduzir risco operacional.
- Ações de escrita em campanhas devem ter RBAC, auditoria e confirmação adequada.

## Workflow 5 — alertas de performance

Cadência sugerida: horária/diária conforme métrica.

Exemplos:

- CPL/CPA acima da meta;
- ROAS abaixo do limite;
- campanha sem conversão;
- orçamento perto do limite;
- possível fadiga de criativo;
- meta mensal em risco;
- integração sem sincronização;
- contrato próximo da renovação.

Alertas devem ter janela, baseline e cooldown para evitar spam.

## Workflow 6 — snapshots da fábrica

Diariamente:

- calcular usuários/workspaces/trials/clientes;
- trials iniciados e conversões quando monetização for ativada;
- sinais de retenção;
- eventos de suporte/sugestões;
- atualizar `factory_project_metrics` e `factory_product_kpi_snapshots`;
- atualizar heartbeat da integração n8n.

Assim o Trafinexo passa a aparecer no cockpit executivo da INFOTEC com os mesmos critérios dos demais produtos.

## Segredos esperados no runtime n8n

Os nomes abaixo são sugestões; valores nunca devem ser commitados:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GITHUB_TOKEN`/conector autorizado
- `VERCEL_TOKEN`/conector autorizado
- `META_APP_ID`, `META_APP_SECRET`
- `GOOGLE_ADS_*` conforme OAuth/Developer Token
- credenciais de e-mail/WhatsApp quando aprovadas
- chave/modelo do provedor de IA definido pela fábrica

## Observabilidade

Cada execução relevante deve registrar:

- `run_id`;
- evento/dedupe_key;
- produto;
- etapa;
- duração;
- resultado;
- tentativas;
- erro sanitizado;
- links de issue/PR/deploy quando houver.

O dashboard da fábrica deve enxergar heartbeat, fila pendente, retries e falhas sem depender da interface do n8n.
