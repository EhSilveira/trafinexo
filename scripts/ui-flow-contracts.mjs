import fs from 'node:fs';

const checks = [
  ['app/login/page.js',['onSubmit={submit}','onClick={recover}','/dashboard','/cadastro']],
  ['app/cadastro/page.js',['onSubmit={submit}','signUp','/dashboard','/login']],
  ['app/recuperar-senha/page.js',['onSubmit={submit}','updatePasswordWithRecoveryToken','/login']],
  ['components/CommandCenter.js',['onNavigate("Integrações")','href="/inteligencia"','href="/inteligencia/lab"','onNavigate("Testes A/B")','href="/operacao"','tab:"Mídia"']],
  ['components/IntegrationsCenter.js',['action:"oauth_start"','action:"token_connect"','action:"sync"','action:"select_account"']],
  ['components/ExperimentsCenter.js',['onSubmit={create}','traf_experiments']],
  ['components/ReportsCenter.js',['onSubmit={create}','togglePortal','toggleSchedule','/cliente?token=']],
  ['app/cliente/page.js',['traf_public_portal_get','traf_public_ticket_create','onSubmit={sendTicket}','/aprovar?token=']],
  ['app/aprovar/page.js',['traf_public_approval_get','traf_public_approval_decide','decide("approved")','decide("changes_requested")']],
  ['app/inteligencia/page.js',['action:"snapshot"','action:"budget_optimize"','action:"copilot"']],
  ['app/inteligencia/lab/page.js',['action:"overview"','action:"generate_proposals"','action:"proposal_decide"','decide(p.id,"approve")','decide(p.id,"reject")']],
  ['components/OperationsSuite.js',['ticketToTask','generateProjectFromPlan','traf_projects','traf_time_entries','traf_approvals','traf_content_calendar']]
];

for (const [file, terms] of checks) {
  const text = fs.readFileSync(file,'utf8');
  for (const term of terms) {
    if (!text.includes(term)) throw new Error(`${file}: fluxo ausente ou quebrado: ${term}`);
  }
}

const dashboard = fs.readFileSync('app/dashboard/page.js','utf8');
for (const tab of ['Comando','Clientes','Mídia','Testes A/B','Criativos','Central de ação','Atribuição','Metas','Relatórios','Tarefas','Contratos','Integrações','Sugestões']) {
  if (!dashboard.includes(`"${tab}"`)) throw new Error(`Dashboard sem aba válida: ${tab}`);
}
if (dashboard.includes('tab==="Campanhas"')) throw new Error('Dashboard contém aba órfã Campanhas; use Mídia');

console.log(`UI flow contracts OK: ${checks.length} superfícies críticas + navegação do dashboard`);
