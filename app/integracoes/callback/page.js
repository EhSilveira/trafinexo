"use client";
import {useEffect,useState} from "react";
import {invoke} from "../../../lib/infotecApi";
import "../../dashboard/pro.css";

export default function IntegrationCallback(){
 const[state,setState]=useState("processing"),[message,setMessage]=useState("Concluindo conexão com segurança…");
 useEffect(()=>{(async()=>{try{const p=new URLSearchParams(window.location.search);const code=p.get("code")||p.get("auth_code");const oauthState=p.get("state");const denied=p.get("error")||p.get("error_description");if(denied)throw new Error("A autorização foi cancelada ou recusada pela plataforma.");if(!code||!oauthState)throw new Error("O retorno da plataforma não contém os dados de autorização esperados.");await invoke("traf-integration-hub",{action:"oauth_complete",code,auth_code:code,state:oauthState});setState("success");setMessage("Conta conectada. O Trafinexo já pode sincronizar os dados autorizados.");setTimeout(()=>window.location.href="/dashboard?tab=integracoes",1400)}catch(e){setState("error");setMessage(e.message||"Não foi possível concluir a integração.")}})()},[]);
 return <main className="oauth-callback"><section><div className="auth-brand"><span>T</span><div><strong>TRAFINEXO</strong><small>by INFOTEC</small></div></div><div className={`oauth-state ${state}`}>{state==="processing"?"↻":state==="success"?"✓":"!"}</div><h1>{state==="processing"?"Conectando sua conta":state==="success"?"Integração concluída":"Não foi possível conectar"}</h1><p>{message}</p>{state==="error"&&<a className="btn" href="/dashboard?tab=integracoes">Voltar para Integrações</a>}</section></main>
}
