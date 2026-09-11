"use client";
import {useEffect,useMemo,useState} from "react";

const groups=[
 {label:"OPERAR",items:[
  {label:"Comando",href:"/dashboard",icon:"⌁",match:p=>p==="/dashboard"||p.startsWith("/dashboard?")},
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
function normalizeTab(v=""){return v.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase()}

export default function ProductNavigation(){
 const[open,setOpen]=useState(false),[path,setPath]=useState(""),[query,setQuery]=useState("");
 useEffect(()=>{const sync=()=>{setPath(location.pathname);setQuery(new URLSearchParams(location.search).get("tab")||"")};sync();window.addEventListener("popstate",sync);return()=>window.removeEventListener("popstate",sync)},[]);
 const internal=internalPrefixes.some(p=>path.startsWith(p));
 const current=useMemo(()=>normalizeTab(query),[query]);
 if(!internal)return null;
 const active=item=>item.match?item.match(path):path.startsWith("/dashboard")&&current===normalizeTab(item.label).replace("testes a/b","testes").replace("central de acao","acoes");
 const go=item=>{setOpen(false);if(item.href.startsWith("/dashboard?tab=")){const tabMap={clientes:"Clientes",midia:"Mídia",testes:"Testes A/B",criativos:"Criativos",acoes:"Central de ação",atribuicao:"Atribuição",metas:"Metas",relatorios:"Relatórios",tarefas:"Tarefas",contratos:"Contratos",integracoes:"Integrações"};const key=item.href.split("=")[1];location.href=`/dashboard?tab=${encodeURIComponent(tabMap[key]||key)}`}else location.href=item.href};
 return <>
  <aside className={`product-nav ${open?"open":""}`} aria-label="Navegação principal do TrafiNexo">
   <div className="product-nav-brand"><a href="/dashboard"><span>T</span><div><b>TRAFINEXO</b><small>Performance OS</small></div></a><button onClick={()=>setOpen(false)} aria-label="Fechar menu">×</button></div>
   <div className="product-nav-body">{groups.map(g=><section key={g.label}><small>{g.label}</small>{g.items.map(item=><button key={item.label} className={active(item)?"active":""} onClick={()=>go(item)}><span>{item.icon}</span><b>{item.label}</b></button>)}</section>)}</div>
   <div className="product-nav-foot"><a href="/dashboard?tab=Integrações">● <span>Fontes e dados</span></a><a href="/assinatura">Plano · R$ 29,90/mês</a></div>
  </aside>
  <button className="product-nav-mobile-trigger" onClick={()=>setOpen(true)} aria-label="Abrir menu"><span>☰</span><b>Menu</b></button>
  {open&&<button className="product-nav-backdrop" onClick={()=>setOpen(false)} aria-label="Fechar menu"/>}
  <nav className="product-nav-mobile" aria-label="Navegação rápida">
   {[{label:"Comando",href:"/dashboard",icon:"⌁"},{label:"Clientes",href:"/dashboard?tab=clientes",icon:"◎"},{label:"Mídia",href:"/dashboard?tab=midia",icon:"↗"},{label:"Inteligência",href:"/inteligencia",icon:"◈"},{label:"Mais",href:"#",icon:"☰"}].map(item=><button key={item.label} className={item.label!=="Mais"&&active(item)?"active":""} onClick={()=>item.label==="Mais"?setOpen(true):go(item)}><span>{item.icon}</span><small>{item.label}</small></button>)}
  </nav>
 </>
}
