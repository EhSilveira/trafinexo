"use client";
import {useEffect,useState} from "react";
import {currentUser,invoke} from "../../../lib/infotecApi";

export default function DevIntegracoes(){
 const[loading,setLoading]=useState(true),[error,setError]=useState(""),[data,setData]=useState(null);
 async function run(){setLoading(true);setError("");try{const u=await currentUser();if(!u){location.href="/login";return}const r=await invoke("traf-integration-diagnostics-dev",{});setData(r)}catch(e){setError(e.message)}finally{setLoading(false)}}
 useEffect(()=>{run()},[]);
 return <main style={{maxWidth:1100,margin:"0 auto",padding:24,fontFamily:"Arial,sans-serif"}}><h1>Diagnóstico de integrações · DEV</h1><p>Somente leitura. Não cria, pausa, edita ou publica campanhas.</p><button onClick={run} disabled={loading}>{loading?"Testando…":"Executar novamente"}</button>{error&&<p style={{color:"crimson"}}>{error}</p>}{data?.results&&<div style={{display:"grid",gap:12,marginTop:24}}>{data.results.map(x=><section key={x.provider} style={{border:"1px solid #ddd",borderRadius:12,padding:16}}><strong>{x.provider}</strong><p>Credenciais: {x.credentials_ready?"OK":"PENDENTE"}</p><p>Rede: {x.network?.ok?`OK${x.network.status?` (${x.network.status})`:""}`:"FALHA"}</p>{x.missing_env?.length>0&&<small>Variáveis ausentes: {x.missing_env.join(", ")}</small>}</section>)}</div>}<p style={{marginTop:28}}><a href="/dashboard?tab=integracoes">Voltar para Integrações</a></p></main>
}
