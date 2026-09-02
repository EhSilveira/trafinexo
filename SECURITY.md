# Segurança — Trafinexo

O Trafinexo segue o padrão de segurança da fábrica INFOTEC com defesa em camadas.

## Identidade e isolamento

- Autenticação via Supabase Auth.
- Cada conta Trafinexo cria um workspace próprio durante o cadastro.
- O trigger de criação de workspace só executa quando `raw_user_meta_data.product = 'trafinexo'`.
- Dados de negócio são segregados por `workspace_id`.
- Row Level Security está habilitado nas tabelas `traf_*`.
- Funções `traf_is_member` e `traf_is_admin` centralizam a verificação de vínculo e papel.
- Papéis previstos: owner, admin, manager, analyst, designer, copywriter, commercial, client e viewer.

## Segredos e integrações

- A chave usada no frontend é somente a chave **publishable** do Supabase.
- Service Role, app secrets, refresh tokens e credenciais de plataformas de anúncios ficam apenas em backend/n8n/secret stores.
- Tokens de Meta/Google/TikTok não devem ser gravados em localStorage ou payload de eventos.
- Integrações começam preferencialmente em modo read-only.

## Dados e privacidade

- Coletar somente dados necessários ao serviço.
- Distinguir dados públicos de dados autorizados por OAuth.
- Não contornar controles de acesso de redes sociais, CRMs ou plataformas de anúncio.
- Logs e diagnósticos não devem armazenar secrets.
- Dados exportados para IA devem ser minimizados ao contexto necessário.

## Pipeline de melhorias

A aba Sugestões alimenta uma fila de desenvolvimento assistido, mas não concede permissão irrestrita para produção.

Obrigatório antes de deploy:

1. classificação de risco;
2. critérios de aceitação;
3. build/testes;
4. revisão de código;
5. checagem de segurança;
6. auditoria da mudança.

Mudanças em autenticação, billing, RLS, dados pessoais, deleção de dados, infraestrutura, credenciais, permissões ou integrações externas exigem aprovação humana antes de produção.

## Auditoria

`traf_audit_log` foi reservado para registrar ações relevantes como alterações de permissões, decisões de campanha, operações críticas e mudanças automatizadas. Logs devem incluir ator, entidade, antes/depois quando aplicável e contexto sanitizado.

## Resposta a incidentes

Em caso de suspeita:

- revogar/rotacionar credenciais afetadas;
- suspender workflow/integração relacionada;
- preservar logs e evidências;
- identificar workspaces afetados;
- corrigir antes de reativar automação;
- registrar o incidente e ação corretiva.

## Checklist para releases

- [ ] RLS e policies revisadas
- [ ] nenhuma service key no bundle frontend
- [ ] dependências sem vulnerabilidade crítica conhecida
- [ ] build concluído
- [ ] fluxos de login/cadastro revisados
- [ ] alterações multi-tenant testadas contra acesso cruzado
- [ ] eventos idempotentes
- [ ] logs sem secrets
- [ ] integrações externas com escopo mínimo
- [ ] gate de aprovação aplicado conforme risco
