"use client";
import {useEffect,useMemo,useState} from "react";
import {rest} from "../lib/infotecApi";
import "./portfolio-cockpit.css";

const brl=v=>(Number(v||0)/100).toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
const fmtDate=v=>v?new Date(v).toLocaleString("pt-BR",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"}):"—";
const cents=v=>Math.max(0,Math.round(Number(v||0)*100));
const todayLocal=()=>{const d=new Date();d.setMinutes(d.getMinutes()-d.getTimezoneOffset());return d.toISOString().slice(0,16)};

export default function PortfolioCockpit({clients=[],campaigns=[],tasks=[]}){
  const[workspaceId,setWorkspaceId]=useState("");
  const[data,setData]=useState({accounts:[],social:[],scenarios:[],forecasts:[],meetings:[],content:[],access:[]});
  const[error,setError]=useState("");
  const[busy,setBusy]=useState(false);
  const[sim,setSim]=useState({client_id:"",amount:"3000",name:"Cenário de crescimento"});
  const[meeting,setMeeting]=useState({client_id:"",title:"Reunião de performance",starts_at:todayLocal(),meeting_url:""});

  async function load(){
    try{
      const memberships=await rest("traf_workspace_members?select=workspace_id&limit=1");
      const wid=memberships?.[0]?.workspace_id;
      if(!wid)return;
      setWorkspaceId(wid);
      const [accounts,social,scenarios,forecasts,meetings,content,access]=await Promise.all([
        rest(`traf_ad_accounts?workspace_id=eq.${wid}&select=*&order=updated_at.desc`),
        rest(`traf_social_snapshots?workspace_id=eq.${wid}&select=*&order=snapshot_date.desc&limit=500`),
        rest(`traf_budget_scenarios?workspace_id=eq.${wid}&select=*&order=created_at.desc&limit=30`),
        rest(`traf_forecasts?workspace_id=eq.${wid}&select=*&order=forecast_date.desc&limit=100`),
        rest(`traf_meetings?workspace_id=eq.${wid}&select=*&order=starts_at.asc&limit=100`),
        rest(`traf_content_calendar?workspace_id=eq.${wid}&select=*&order=created_at.desc&limit=120`),
        rest(`traf_portal_access_log?workspace_id=eq.${wid}&select=*&order=accessed_at.desc&limit=100`)
      ]);
      setData({accounts:accounts||[],social:social||[],scenarios:scenarios||[],forecasts:forecasts||[],meetings:meetings||[],content:content||[],access:access||[]});
    }catch(e){setError(e.message||"Não foi possível carregar a carteira avançada.")}
  }
  useEffect(()=>{load()},[]);

  const clientName=id=>clients.find(c=>c.id===id)?.company_name||"Cliente";
  const daysInMonth=new Date(new Date().getFullYear(),new Date().getMonth()+1,0).getDate();
  const monthProgress=Math.max(.03,new Date().getDate()/daysInMonth);
  const portfolio=useMemo(()=>clients.map(client=>{
    const cc=campaigns.filter(c=>c.client_id===client.id);
    const spend=cc.reduce((a,c)=>a+Number(c.spend_cents||0),0);
    const budget=Number(client.monthly_ad_budget_cents||0)||cc.reduce((a,c)=>a+Number(c.budget_cents||0),0);
    const leads=cc.reduce((a,c)=>a+Number(c.leads||0),0);
    const revenue=cc.reduce((a,c)=>a+Number(c.revenue_cents||0),0);
    const paused=cc.filter(c=>String(c.status).toLowerCase()==="paused").length;
    const expected=budget*monthProgress;
    const pacing=expected?spend/expected:0;
    const account=data.accounts.find(a=>a.client_id===client.id);
    const balance=Number(account?.metadata?.balance_cents??account?.metadata?.prepaid_balance_cents??account?.metadata?.available_balance_cents??0);
    const lastAccess=data.access.find(a=>a.client_id===client.id)?.accessed_at;
    const nextMeeting=data.meetings.find(m=>m.client_id===client.id&&m.status==="scheduled"&&new Date(m.starts_at)>=new Date());
    const organicQueue=data.content.filter(p=>p.client_id===client.id&&String(p.channel).toLowerCase().includes("instagram")&&["draft","discovered","review"].includes(p.status)).length;
    return {client,spend,budget,leads,revenue,paused,pacing,balance,lastAccess,nextMeeting,organicQueue,roas:spend?revenue/spend:0};
  }),[clients,campaigns,data,monthProgress]);

  const selectedCampaigns=campaigns.filter(c=>c.client_id===sim.client_id);
  const selectedSpend=selectedCampaigns.reduce((a,c)=>a+Number(c.spend_cents||0),0);
  const selectedLeads=selectedCampaigns.reduce((a,c)=>a+Number(c.leads||0),0);
  const selectedConversions=selectedCampaigns.reduce((a,c)=>a+Number(c.conversions||0),0);
  const selectedRevenue=selectedCampaigns.reduce((a,c)=>a+Number(c.revenue_cents||0),0);
  const simAmount=cents(sim.amount);
  const cpl=selectedLeads?selectedSpend/selectedLeads:0;
  const cpa=selectedConversions?selectedSpend/selectedConversions:0;
  const roas=selectedSpend?selectedRevenue/selectedSpend:0;
  const projectedLeads=cpl?simAmount/cpl:0;
  const projectedConversions=cpa?simAmount/cpa:0;
  const projectedRevenue=roas?simAmount*roas:0;

  async function saveScenario(){
    if(!workspaceId||!sim.client_id||!simAmount)return;
    setBusy(true);setError("");
    try{
      await rest("traf_budget_scenarios",{method:"POST",body:{workspace_id:workspaceId,client_id:sim.client_id,name:sim.name||"Cenário de investimento",total_budget_cents:simAmount,horizon_days:30,allocations:[{basis:"historical_performance",current_spend_cents:selectedSpend,cpl_cents:Math.round(cpl),cpa_cents:Math.round(cpa),roas:Number(roas.toFixed(4))}],projected_leads:Number(projectedLeads.toFixed(2)),projected_conversions:Number(projectedConversions.toFixed(2)),projected_revenue_cents:Math.round(projectedRevenue),projected_profit_cents:Math.round(projectedRevenue-simAmount),risk_score:selectedSpend?15:65,status:"draft"}});
      await load();
    }catch(e){setError(e.message)}finally{setBusy(false)}
  }

  async function createMeeting(e){
    e.preventDefault();if(!workspaceId||!meeting.title||!meeting.starts_at)return;
    setBusy(true);setError("");
    try{
      await rest("traf_meetings",{method:"POST",body:{workspace_id:workspaceId,client_id:meeting.client_id||null,title:meeting.title,starts_at:new Date(meeting.starts_at).toISOString(),meeting_url:meeting.meeting_url||null,status:"scheduled"}});
      setMeeting({...meeting,title:"Reunião de performance",meeting_url:""});await load();
    }catch(e){setError(e.message)}finally{setBusy(false)}
  }

  async function decideOrganic(item,decision){
    setBusy(true);setError("");
    try{
      await rest(`traf_content_calendar?id=eq.${item.id}`,{method:"PATCH",body:{status:decision==="promote"?"approved_for_media":"rejected",updated_at:new Date().toISOString(),metadata:{...(item.metadata||{}),media_decision:decision,decided_at:new Date().toISOString()}}});
      if(decision==="promote")await rest("traf_tasks",{method:"POST",body:{workspace_id:workspaceId,client_id:item.client_id,title:`Subir criativo orgânico: ${item.title}`,description:"Conteúdo orgânico aprovado na fila de criativos para avaliação/subida em mídia paga.",priority:"medium",status:"todo"}});
      await load();
    }catch(e){setError(e.message)}finally{setBusy(false)}
  }

  const organicQueue=data.content.filter(p=>String(p.channel).toLowerCase().includes("instagram")&&["draft","discovered","review"].includes(p.status)).slice(0,8);
  const upcoming=data.meetings.filter(m=>m.status==="scheduled"&&new Date(m.starts_at)>=new Date()).slice(0,8);
  const latestAccess=data.access.slice(0,8);
  const latestSocial=clients.map(c=>data.social.find(s=>s.client_id===c.id)).filter(Boolean).slice(0,8);

  return <section className="portfolio-cockpit" data-guide="portfolio-cockpit">
    <div className="portfolio-head"><div><span>CARTEIRA PRO</span><h2>Saldo, pacing, criativos, reuniões e acesso do cliente no mesmo radar.</h2><p>Camada operacional inspirada nas melhores rotinas de gestão: antecipe conta parada, verba fora do ritmo e pendências antes do cliente perceber.</p></div><div className="portfolio-kpis"><b>{portfolio.filter(x=>x.paused>0).length}<small>clientes com campanha pausada</small></b><b>{portfolio.filter(x=>x.balance>0&&x.balance<50000).length}<small>saldos abaixo de R$ 500</small></b><b>{upcoming.length}<small>reuniões próximas</small></b></div></div>
    {error&&<div className="portfolio-error">{error}</div>}

    <div className="portfolio-clients">{portfolio.map(x=><article key={x.client.id} className="portfolio-client-card">
      <header><div><b>{x.client.company_name}</b><small>{x.client.segment||"Cliente"}</small></div><span className={`portfolio-health ${x.paused?"danger":x.pacing>1.2||x.pacing<.65?"warn":"ok"}`}>{x.paused?`${x.paused} pausada(s)`:x.pacing?`${Math.round(x.pacing*100)}% ritmo`:"sem pacing"}</span></header>
      <div className="portfolio-card-grid"><span>Investido<b>{brl(x.spend)}</b></span><span>Orçamento<b>{brl(x.budget)}</b></span><span>Leads<b>{x.leads}</b></span><span>ROAS<b>{x.roas?`${x.roas.toFixed(2)}x`:"—"}</b></span></div>
      <footer><span>Saldo <b>{x.balance?brl(x.balance):"não informado"}</b></span><span>Criativos <b>{x.organicQueue}</b></span><span>Último acesso <b>{x.lastAccess?new Date(x.lastAccess).toLocaleDateString("pt-BR"):"—"}</b></span></footer>
    </article>)}</div>

    <div className="portfolio-feature-grid">
      <section className="portfolio-panel" data-guide="simulator"><div className="portfolio-title"><div><h3>Simulador de investimento</h3><p>Projeta leads, conversões e receita usando a eficiência real da conta.</p></div></div><div className="portfolio-form"><label>Cliente<select value={sim.client_id} onChange={e=>setSim({...sim,client_id:e.target.value})}><option value="">Selecione</option>{clients.map(c=><option key={c.id} value={c.id}>{c.company_name}</option>)}</select></label><label>Investimento R$<input type="number" min="0" step="50" value={sim.amount} onChange={e=>setSim({...sim,amount:e.target.value})}/></label><label>Nome do cenário<input value={sim.name} onChange={e=>setSim({...sim,name:e.target.value})}/></label></div><div className="simulation-results"><span>Leads projetados<b>{projectedLeads?projectedLeads.toFixed(0):"—"}</b></span><span>Conversões<b>{projectedConversions?projectedConversions.toFixed(1):"—"}</b></span><span>Receita projetada<b>{projectedRevenue?brl(projectedRevenue):"—"}</b></span><span>ROAS base<b>{roas?`${roas.toFixed(2)}x`:"—"}</b></span></div><button className="portfolio-primary" disabled={busy||!sim.client_id} onClick={saveScenario}>{busy?"Salvando…":"Salvar cenário"}</button></section>

      <section className="portfolio-panel" data-guide="creative-queue"><div className="portfolio-title"><div><h3>Fila de criativos orgânicos</h3><p>Conteúdos do Instagram que podem virar mídia paga.</p></div><span>{organicQueue.length}</span></div><div className="portfolio-list">{organicQueue.length?organicQueue.map(p=><div key={p.id}><div><b>{p.title}</b><small>{clientName(p.client_id)} · {p.content_type||"post"}</small></div><aside><button disabled={busy} onClick={()=>decideOrganic(p,"promote")}>Subir</button><button disabled={busy} className="ghost" onClick={()=>decideOrganic(p,"ignore")}>Não subir</button></aside></div>):<p className="portfolio-empty">Nenhum criativo orgânico aguardando decisão.</p>}</div></section>

      <section className="portfolio-panel" data-guide="agenda"><div className="portfolio-title"><div><h3>Agenda e reuniões</h3><p>Próximos checkpoints da carteira.</p></div></div><form className="portfolio-form compact" onSubmit={createMeeting}><label>Cliente<select value={meeting.client_id} onChange={e=>setMeeting({...meeting,client_id:e.target.value})}><option value="">Operação geral</option>{clients.map(c=><option key={c.id} value={c.id}>{c.company_name}</option>)}</select></label><label>Título<input required value={meeting.title} onChange={e=>setMeeting({...meeting,title:e.target.value})}/></label><label>Data e hora<input required type="datetime-local" value={meeting.starts_at} onChange={e=>setMeeting({...meeting,starts_at:e.target.value})}/></label><label>Link<input placeholder="Meet/Zoom" value={meeting.meeting_url} onChange={e=>setMeeting({...meeting,meeting_url:e.target.value})}/></label><button className="portfolio-primary" disabled={busy}>Agendar</button></form><div className="portfolio-list slim">{upcoming.map(m=><div key={m.id}><div><b>{m.title}</b><small>{clientName(m.client_id)} · {fmtDate(m.starts_at)}</small></div>{m.meeting_url&&<a href={m.meeting_url} target="_blank">Entrar ↗</a>}</div>)}</div></section>

      <section className="portfolio-panel"><div className="portfolio-title"><div><h3>Portal do cliente</h3><p>Quem abriu o painel e quando.</p></div></div><div className="portfolio-list slim">{latestAccess.length?latestAccess.map(a=><div key={a.id}><div><b>{clientName(a.client_id)}</b><small>Acesso em {fmtDate(a.accessed_at)}</small></div><span className="status-dot ok"/></div>):<p className="portfolio-empty">Ainda não há acessos registrados.</p>}</div></section>

      <section className="portfolio-panel"><div className="portfolio-title"><div><h3>Instagram orgânico</h3><p>Último snapshot de seguidores e alcance por cliente.</p></div></div><div className="portfolio-list slim">{latestSocial.length?latestSocial.map(s=><div key={s.id}><div><b>{clientName(s.client_id)}</b><small>{new Date(s.snapshot_date+"T12:00:00").toLocaleDateString("pt-BR")}</small></div><strong>{Number(s.followers||0).toLocaleString("pt-BR")} seguidores · {Number(s.reach||0).toLocaleString("pt-BR")} alcance</strong></div>):<p className="portfolio-empty">Conecte/importações do Instagram para iniciar a série histórica.</p>}</div></section>

      <section className="portfolio-panel"><div className="portfolio-title"><div><h3>Previsões</h3><p>Metas e fechamento projetado antes do mês acabar.</p></div><span>{data.forecasts.length}</span></div><div className="portfolio-list slim">{data.forecasts.slice(0,8).map(f=><div key={f.id}><div><b>{clientName(f.client_id)} · {f.metric_key}</b><small>Atual {Number(f.current_value||0).toLocaleString("pt-BR")} → projeção {Number(f.projected_value||0).toLocaleString("pt-BR")}</small></div><strong>{f.probability_pct!=null?`${Number(f.probability_pct).toFixed(0)}% confiança`:"—"}</strong></div>)}{!data.forecasts.length&&<p className="portfolio-empty">As previsões aparecerão quando o Growth OS tiver histórico suficiente.</p>}</div></section>
    </div>
  </section>
}
