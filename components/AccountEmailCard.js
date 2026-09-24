"use client";
import {useEffect,useState} from "react";
import {createClient} from "@supabase/supabase-js";
import {SUPABASE_KEY,SUPABASE_URL,USING_DEDICATED_SUPABASE,getRefreshToken,getToken} from "../lib/infotecApi";

const authClient=createClient(SUPABASE_URL,SUPABASE_KEY,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});

export default function AccountEmailCard(){
 const[user,setUser]=useState(null),[verified,setVerified]=useState(false),[verifiedEmail,setVerifiedEmail]=useState(""),[email,setEmail]=useState(""),[busy,setBusy]=useState(false),[message,setMessage]=useState("");
 async function load(){
  if(!USING_DEDICATED_SUPABASE)return;
  const access=getToken(),refresh=getRefreshToken();if(!access||!refresh)return;
  try{
   await authClient.auth.setSession({access_token:access,refresh_token:refresh});
   const {data}=await authClient.auth.getUser();const next=data.user||null;setUser(next);
   if(!next)return;
   const r=await fetch(`${SUPABASE_URL}/rest/v1/useinfotec_email_verification_status?user_id=eq.${encodeURIComponent(next.id)}&select=current_email,verified_at&limit=1`,{headers:{apikey:SUPABASE_KEY,Authorization:`Bearer ${access}`}});
   const rows=r.ok?await r.json():[];setVerified(Boolean(rows?.[0]?.verified_at));setVerifiedEmail(rows?.[0]?.verified_at?String(rows[0].current_email||""):"");
  }catch{}
 }
 useEffect(()=>{void load()},[]);
 if(!USING_DEDICATED_SUPABASE||!user)return null;
 async function link(){
  const value=email.trim().toLowerCase();
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)){setMessage("Informe um e-mail válido.");return}
  setBusy(true);setMessage("");
  const access=getToken();
  try{
   const r=await fetch(`${SUPABASE_URL}/functions/v1/useinfotec-request-email-verification`,{method:"POST",headers:{apikey:SUPABASE_KEY,Authorization:`Bearer ${access}`,"Content-Type":"application/json"},body:JSON.stringify({product_slug:"trafinexo",email:value})});
   const data=await r.json().catch(()=>({}));
   if(!r.ok)throw new Error(data?.error||"request_failed");
   setMessage("Enviamos a confirmação. Seu workspace e histórico permanecem na mesma conta.");setEmail("");
  }catch(e){setMessage(String(e?.message||"").includes("rate_limited")?"Muitas solicitações em pouco tempo. Tente novamente mais tarde.":"Não foi possível enviar a confirmação agora.")}
  setBusy(false);
 }
 const guest=user.user_metadata?.useinfotec_guest===true;
 const currentEmail=verifiedEmail||(!guest&&!String(user.email||"").endsWith("@guest.useinfotec.invalid")?String(user.email||""):"");
 if(verified)return null;
 return <section style={{margin:"0 0 18px",padding:16,border:"1px solid #dbe7f1",borderRadius:16,background:"#fff"}}>
  <b>Conta e e-mail</b><p style={{fontSize:13,color:"#607487"}}>{currentEmail?"Confirme seu e-mail para recuperação e ações protegidas.":"Seu acesso funciona sem e-mail. Vincule um endereço para recuperar a conta e liberar ações sensíveis."}</p>
  <div style={{display:"flex",gap:8,flexWrap:"wrap"}}><input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder={currentEmail||"voce@empresa.com"} style={{flex:"1 1 240px",padding:10}}/><button type="button" onClick={link} disabled={busy||!email.trim()}>{busy?"Enviando...":"Enviar confirmação"}</button></div>
  {message&&<small>{message}</small>}
 </section>
}
