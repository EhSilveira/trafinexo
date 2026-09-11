"use client";
import {useEffect,useState} from "react";

const steps=[
 {selector:'[data-guide="command-hero"]',title:"Central de comando",text:"Comece aqui: prioridades, performance consolidada e atalhos para a operação."},
 {selector:'[data-guide="priority-list"]',title:"Fila de decisão",text:"Alertas, integrações, tarefas vencidas e recomendações aparecem em ordem de impacto."},
 {selector:'[data-guide="portfolio-cockpit"]',title:"Carteira Pro",text:"Veja saldo, pacing, campanhas pausadas, criativos, reuniões e acessos do cliente em um radar único."},
 {selector:'[data-guide="simulator"]',title:"Simulador",text:"Teste novos níveis de investimento usando CPL, CPA e ROAS reais da conta."},
 {selector:'[data-guide="creative-queue"]',title:"Criativos orgânicos",text:"Decida rapidamente quais conteúdos do Instagram merecem virar mídia paga."},
 {selector:'[data-guide="agenda"]',title:"Agenda",text:"Centralize reuniões e checkpoints por cliente sem sair da plataforma."},
 {selector:'.internal-utility-footer',title:"Plano e aplicativo",text:"Plano, assinatura e instalação do aplicativo ficam no fim das páginas internas e não cobrem mais o conteúdo."}
];

export default function ProductGuide(){
 const[open,setOpen]=useState(false),[index,setIndex]=useState(0),[rect,setRect]=useState(null);
 useEffect(()=>{const seen=localStorage.getItem("trafinexo_product_guide_v3");if(!seen){const t=setTimeout(()=>setOpen(true),800);return()=>clearTimeout(t)}},[]);
 useEffect(()=>{
  if(!open)return;
  const update=()=>{const el=document.querySelector(steps[index]?.selector);if(!el){setRect(null);return}const r=el.getBoundingClientRect();setRect({top:r.top,left:r.left,width:r.width,height:r.height})};
  update();window.addEventListener("resize",update);window.addEventListener("scroll",update,true);
  const el=document.querySelector(steps[index]?.selector);el?.scrollIntoView({behavior:"smooth",block:"center"});
  const t=setTimeout(update,350);return()=>{clearTimeout(t);window.removeEventListener("resize",update);window.removeEventListener("scroll",update,true)}
 },[open,index]);
 function close(){localStorage.setItem("trafinexo_product_guide_v3","1");setOpen(false);setIndex(0)}
 function next(){if(index>=steps.length-1)close();else setIndex(index+1)}
 return <>
  <button className="product-guide-trigger" onClick={()=>{setIndex(0);setOpen(true)}}>Guia rápido</button>
  {open&&<div className="product-guide-layer" role="dialog" aria-modal="true" aria-label="Guia do Trafinexo">
    <div className="product-guide-shade" onClick={close}/>
    {rect&&<div className="product-guide-focus" style={{top:Math.max(6,rect.top-6),left:Math.max(6,rect.left-6),width:Math.max(40,rect.width+12),height:Math.max(40,rect.height+12)}}/>}
    <div className="product-guide-card"><small>{index+1} de {steps.length}</small><h3>{steps[index].title}</h3><p>{steps[index].text}</p><div><button className="ghost" onClick={close}>Fechar</button>{index>0&&<button className="ghost" onClick={()=>setIndex(index-1)}>Voltar</button>}<button onClick={next}>{index===steps.length-1?"Concluir":"Próximo"}</button></div></div>
  </div>}
  <style jsx>{`
   .product-guide-layer{position:fixed;inset:0;z-index:10020;pointer-events:none}.product-guide-shade{position:absolute;inset:0;background:#071a338c;pointer-events:auto}.product-guide-focus{position:fixed;border:2px solid #38cfff;border-radius:16px;box-shadow:0 0 0 9999px #071a3340;pointer-events:none;transition:.2s ease}.product-guide-card{position:fixed;right:18px;bottom:22px;width:min(390px,calc(100vw - 36px));background:#fff;border-radius:18px;padding:18px;box-shadow:0 20px 60px #071a3350;pointer-events:auto;color:#0a1b30}.product-guide-card small{color:#147dff;font-weight:900}.product-guide-card h3{margin:6px 0}.product-guide-card p{margin:0 0 14px;color:#617286;line-height:1.5}.product-guide-card>div{display:flex;justify-content:flex-end;gap:8px;flex-wrap:wrap}.product-guide-card button{border:0;border-radius:10px;background:#147dff;color:#fff;padding:9px 12px;font-weight:800;cursor:pointer}.product-guide-card button.ghost{background:#edf3f8;color:#30445d}@media(max-width:720px){.product-guide-card{bottom:18px}}
  `}</style>
 </>
}
