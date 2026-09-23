"use client";
import {useCallback,useEffect,useState} from "react";

const SHARED_URL="https://vvjngcsftiffdsjwpjct.supabase.co";
const SHARED_KEY="sb_publishable_KtLXC6mYAt4lTqrJvpl7jA_sgN1Spec";
const PEDIDOS_URL="https://nuavvzbgjyaarenwheoo.supabase.co";
const PEDIDOS_KEY="sb_publishable_10UciQlh333S1FkdVCgGtw_O2dFIr62";

const directTokenKey={
  cadeirapro:"cadeirapro_access_token",
  "ginga-hub":"gingahub_access_token",
  movibemsus:"movibemsus_access_token",
  infoteclavagem:"infoteclavagem_access_token",
  trafinexo:"trafinexo_access_token",
  infoclinic:"infoclinic_access_token",
  infoclima:"infoclima_token",
  infonota:"infonota_token",
  inforetorno:"inforetorno_token",
  infoservico:"infoservico_token",
};

function project(product){
  return product==="pedidospro"
    ? {url:PEDIDOS_URL,key:PEDIDOS_KEY,ref:"nuavvzbgjyaarenwheoo"}
    : {url:SHARED_URL,key:SHARED_KEY,ref:"vvjngcsftiffdsjwpjct"};
}

function readToken(product){
  if(typeof window==="undefined")return "";
  const direct=directTokenKey[product];
  if(direct){
    const value=localStorage.getItem(direct);
    if(value)return value;
  }
  const {ref}=project(product);
  const raw=localStorage.getItem(`sb-${ref}-auth-token`);
  if(!raw)return "";
  try{
    const parsed=JSON.parse(raw);
    return String(parsed?.access_token||parsed?.currentSession?.access_token||"");
  }catch{return ""}
}

function subject(token){
  try{
    const part=token.split(".")[1];
    if(!part)return "";
    const normalized=part.replace(/-/g,"+").replace(/_/g,"/");
    const padded=normalized+"=".repeat((4-normalized.length%4)%4);
    return String(JSON.parse(atob(padded))?.sub||"");
  }catch{return ""}
}

export default function EmailVerificationBanner({productSlug}:{productSlug}){
  const[verified,setVerified]=useState<boolean|>();
  const[busy,setBusy]=useState(false);
  const[message,setMessage]=useState("");

  const load=useCallback(async()=>{
    const token=readToken(productSlug);
    const userId=subject(token);
    if(!token||!userId){setVerified();return}
    const {url,key}=project(productSlug);
    try{
      const r=await fetch(`${url}/rest/v1/useinfotec_email_verification_status?select=verified_at&user_id=eq.${encodeURIComponent(userId)}&limit=1`,{
        headers:{apikey:key,Authorization:`Bearer ${token}`},
        cache:"no-store"
      });
      if(!r.ok){setVerified();return}
      const rows=await r.json();
      setVerified(Boolean(rows?.[0]?.verified_at));
    }catch{setVerified()}
  },[productSlug]);

  useEffect(()=>{
    void load();
    const onFocus=()=>void load();
    window.addEventListener("focus",onFocus);
    return()=>window.removeEventListener("focus",onFocus);
  },[load]);

  async function requestVerification(){
    const token=readToken(productSlug);
    if(!token)return;
    const {url,key}=project(productSlug);
    setBusy(true);setMessage("");
    try{
      const r=await fetch(`${url}/functions/v1/useinfotec-request-email-verification`,{
        method:"POST",
        headers:{apikey:key,Authorization:`Bearer ${token}`,"Content-Type":"application/json"},
        body:JSON.stringify({product_slug:productSlug})
      });
      const data=await r.json().catch(()=>({}));
      if(r.status===429){setMessage("Você já solicitou alguns links. Aguarde alguns minutos e tente novamente.");return}
      if(!r.ok)throw new Error(String(data?.error||"verification_email_failed"));
      if(data?.verified){setVerified(true);return}
      setMessage("Enviamos o link de confirmação. Você pode continuar usando o sistema normalmente.");
    }catch{
      setMessage("Não foi possível enviar o link agora. Seu acesso continua liberado.");
    }finally{setBusy(false)}
  }

  if(verified!==false)return ;

  return <aside style={{margin:"12px 0 18px",padding:"14px 16px",border:"1px solid #cbdcf0",borderRadius:14,background:"#f4f8fc",display:"flex",gap:14,alignItems:"center",justifyContent:"space-between",flexWrap:"wrap"}}>
    <div style={{minWidth:220,flex:"1 1 360px"}}>
      <strong style={{display:"block",color:"#071A33",marginBottom:4}}>Confirme seu e-mail</strong>
      <span style={{fontSize:13,lineHeight:1.5,color:"#526b82"}}>Sua conta já está liberada. Confirme o endereço para concluir a validação de segurança e liberar ações protegidas.</span>
      {message&&<div style={{fontSize:12,marginTop:6,color:"#526b82"}}>{message}</div>}
    </div>
    <button type="button" onClick={requestVerification} disabled={busy} style={{border:0,borderRadius:999,padding:"10px 15px",background:"#071A33",color:"#fff",fontWeight:800,cursor:busy?"wait":"pointer"}}>
      {busy?"Enviando...":"Enviar confirmação"}
    </button>
  </aside>
}
