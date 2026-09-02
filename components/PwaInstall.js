"use client";
import { useEffect, useState } from "react";

export default function PwaInstall(){
  const [promptEvent,setPromptEvent]=useState(null);
  const [installed,setInstalled]=useState(false);
  const [hint,setHint]=useState("");
  useEffect(()=>{
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
    setHint("No Android, abra o menu ⋮ do Chrome e toque em ‘Instalar app’ ou ‘Adicionar à tela inicial’.");
  }
  if(installed)return null;
  return <div className="infotec-pwa-install" role="region" aria-label="Instalar aplicativo">
    <button onClick={install} type="button">📲 Instalar no Android</button>
    {hint&&<span>{hint}</span>}
    <style jsx>{`
      .infotec-pwa-install{position:fixed;right:16px;bottom:18px;z-index:9998;display:flex;max-width:min(360px,calc(100vw - 32px));flex-direction:column;align-items:flex-end;gap:7px;padding-bottom:env(safe-area-inset-bottom)}
      button{border:1px solid #38cfff55;background:#071a33;color:#fff;border-radius:999px;padding:11px 15px;font-weight:800;box-shadow:0 12px 35px #071a3340;cursor:pointer;min-height:44px}
      span{background:#fff;color:#0a1b30;border:1px solid #dce6f0;border-radius:12px;padding:9px 11px;font-size:12px;line-height:1.4;box-shadow:0 10px 25px #071a3320}
      @media(max-width:720px){.infotec-pwa-install{bottom:78px}button{padding:10px 13px;font-size:13px}}
    `}</style>
  </div>
}
