"use client";
import {useEffect,useMemo,useState} from "react";

const groups=[
 {label:"OPERAR",items:[
  {label:"Comando",href:"/dashboard",icon:"⌁",match:p=>p==="/dashboard"},
  {label:"Clientes",href:"/dashboard?tab=clientes",icon:"◎"},
  {label:"Mídia",href:"/dashboard?tab=midia",icon:"↗"},
  {label:"Testes A/B",href:"/dashboard?tab=testes",icon:"A/B"},
  {label:"Criativos",href:"/dashboard?tab=criativos",icon:"◇"}
 ]},
 {label:"INTELIGÊNCIA",items:[
  {label:"Performance",href:"/inteligencia",icon:"◈",match:p=>p==="/inteligencia"},
  {label:"Growth OS",href:"/inteligencia/lab",icon:"✦",match:p=>p.startsWith("/inteligencia/lab")},
  {label:"Operação 360",href:"/operacao",icon:"◫",match:p=>p.startsWith("/operacao")}
 ]},
 {label:"DECIDIR",items:[
  {label:"Central de ação",href:"/dashboard?tab=acoes",icon:"!"},
  {label:"Atribuição",href:"/dashboard?tab=atribuicao",icon:"∞"},
  {label:"Metas",href:"/dashboard?tab=metas",icon:"◉"},
  {label:"Relatórios",href:"/dashboard?tab=relatorios",icon:"▤"}
 ]},
 {label:"GESTÃO",items:[
  {label:"Tarefas",href:"/dashboard?tab=tarefas",icon:"✓"},
  {label:"Contratos",href:"/dashboard?tab=contratos",icon:"▣"},
  {label:"Integrações",href:"/dashboard?tab=integracoes",icon:"⛓"},
  {label:"Plano e assinatura",href:"/assinatura",icon:"$",match:p=>p.startsWith("/assinatura")}
 ]}
];
const internalPrefixes=["/dashboard","/inteligencia","/operacao","/assinatura"];
const tabMap={clientes:"Clientes",midia:"Mídia",testes:"Testes A/B",criativos:"Criativos",acoes:"Central de ação",atribuicao:"Atribuição",metas:"Metas",relatorios:"Relatórios",tarefas:"Tarefas",contratos:"Contratos",integracoes:"Integrações"};
function normalizeTab(v=""){return v.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase()}
function dashboardKey(label=""){const n=normalizeTab(label);return n==="testes a/b"?"testes":n==="central de acao"?"acoes":n}

export default function ProductNavigation(){
 const[open,setOpen]=useState(false),[path,setPath]=useState(""),[query,setQuery]=useState("");
 useEffect(()=>{
  const sync=()=>{setPath(location.pathname);setQuery(new URLSearchParams(location.search).get("tab")||"")};
  sync();window.addEventListener("popstate",sync);
  if(location.pathname.startsWith("/dashboard")){
   const pending=localStorage.getItem("trafinexo_pending_tab");
   if(pending){localStorage.removeItem("trafinexo_pending_tab");setTimeout(()=>activateDashboardTab(pending,true),80)}
  }
  return()=>window.removeEventListener("popstate",sync)
 },[]);
 const internal=internalPrefixes.some(p=>path.startsWith(p));
 const current=useMemo(()=>dashboardKey(query),[query]);
 if(!internal)return null;
 const active=item=>item.match?item.match(path):path.startsWith("/dashboard")&&current===dashboardKey(item.label);
 function activateDashboardTab(label,replaceUrl=false){
  const buttons=[...document.querySelectorAll(".pro-sidebar .nav-group button")];
  const target=buttons.find(b=>b.textContent?.trim().includes(label));
  target?.click();setQuery(label);
  if(replaceUrl)history.replaceState(null,"",label==="Comando"?"/dashboard":`/dashboard?tab=${encodeURIComponent(label)}`);
  return Boolean(target)
 }
 function go(item){
  setOpen(false);
  if(item.href.startsWith("/dashboard?tab=")){
   const key=item.href.split("=")[1],label=tabMap[key]||item.label;
   if(path.startsWith("/dashboard")&&activateDashboardTab(label,true))return;
   localStorage.setItem("trafinexo_pending_tab",label);location.href="/dashboard";return
  }
  if(item.href==="/dashboard"){
   if(path.startsWith("/dashboard")&&activateDashboardTab("Comando",true))return;
   location.href="/dashboard";return
  }
  location.href=item.href
 }
 return <>
  <aside className={`product-nav ${open?"open":""}`} aria-label="Navegação principal do TrafiNexo">
   <div className="product-nav-brand"><a href="/dashboard"><span>T</span><div><b>TRAFINEXO</b><small>Performance OS</small></div></a><button onClick={()=>setOpen(false)} aria-label="Fechar menu">×</button></div>
   <div className="product-nav-body">{groups.map(g=><section key={g.label}><small>{g.label}</small>{g.items.map(item=><button key={item.label} className={active(item)?"active":""} onClick={()=>go(item)}><span>{item.icon}</span><b>{item.label}</b></button>)}</section>)}</div>
   <div className="product-nav-foot"><button onClick={()=>go({label:"Integrações",href:"/dashboard?tab=integracoes"})}>● <span>Fontes e dados</span></button><a href="/assinatura">Plano · R$ 29,90/mês</a></div>
  </aside>
  {open&&<button className="product-nav-backdrop" onClick={()=>setOpen(false)} aria-label="Fechar menu"/>}
  <nav className="product-nav-mobile" aria-label="Navegação rápida">
   {[{label:"Comando",href:"/dashboard",icon:"⌁"},{label:"Clientes",href:"/dashboard?tab=clientes",icon:"◎"},{label:"Mídia",href:"/dashboard?tab=midia",icon:"↗"},{label:"Performance",href:"/inteligencia",icon:"◈"},{label:"Mais",href:"#",icon:"☰"}].map(item=><button key={item.label} className={item.label!=="Mais"&&active(item)?"active":""} onClick={()=>item.label==="Mais"?setOpen(true):go(item)}><span>{item.icon}</span><small>{item.label==="Performance"?"Inteligência":item.label}</small></button>)}
  </nav>
 </>
}
