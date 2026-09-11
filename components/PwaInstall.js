"use client";
import { useEffect, useState } from "react";

export default function PwaInstall(){
  const [promptEvent,setPromptEvent]=useState(null);
  const [installed,setInstalled]=useState(false);
  const [hint,setHint]=useState("");
  const [show,setShow]=useState(false);
  useEffect(()=>{
    const p=location.pathname;setShow(p.startsWith('/dashboard')||p.startsWith('/assinatura')||p.startsWith('/inteligencia')||p.startsWith('/operacao')||p.startsWith('/dev/integracoes'));
    const standalone=window.matchMedia?.("(display-mode: standalone)").matches || window.navigator.standalone===true;
    setInstalled(Boolean(standalone));
    if("serviceWorker" in navigator){window.addEventListener("load",()=>navigator.serviceWorker.register("/sw.js").catch(()=>{}),{once:true});}
    const before=(event)=>{event.preventDefault();setPromptEvent(event)};
    const done=()=>{setInstalled(true);setPromptEvent(null)};
    window.addEventListener("beforeinstallprompt",before);
    window.addEventListener("appinstalled",done);
    return()=>{window.removeEventListener("beforeinstallprompt",before);window.removeEventListener("appinstalled",done)};
  },[]);
  async function install(){
    if(promptEvent){await promptEvent.prompt();const choice=await promptEvent.userChoice;if(choice?.outcome==="accepted")setInstalled(true);setPromptEvent(null);return;}
    setHint("No Android, abra o menu ⋮ do Chrome e toque em ‘Instalar app’ ou ‘Adicionar à tela inicial’. O Trafinexo funciona como PWA.");
  }
  if(installed||!show)return null;
  return <><button onClick={install} type="button">Instalar aplicativo</button>{hint&&<span className="utility-hint">{hint}</span>}</>;
}
