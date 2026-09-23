"use client";
import {useEffect,useState} from "react";
import {createClient} from "@supabase/supabase-js";
import {SUPABASE_KEY,SUPABASE_URL,USING_DEDICATED_SUPABASE,getRefreshToken,getToken} from "../lib/infotecApi";

const authClient=createClient(SUPABASE_URL,SUPABASE_KEY,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});

export default function AccountEmailCard(){
 const[user,setUser]=useState(null),[email,setEmail]=useState(""),[busy,setBusy]=useState(false),[message,setMessage]=useState("");
 useEffect(()=>{if(!USING_DEDICATED_SUPABASE)return;const access=getToken(),refresh=getRefreshToken();if(!access||!refresh)return;void authClient.auth.setSession({access_token:access,refresh_token:refresh}).then(()=>authClient.auth.getUser()).then(({data})=>setUser(data.user||null)).catch(()=>undefined)},[]);
 if(!USING_DEDICATED_SUPABASE||!user)return null;
 async function link(){
  const value=email.trim().toLowerCase();
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)){setMessage("Informe um e-mail válido.");return}
  setBusy(true);setMessage("");
  const {error}=await authClient.auth.updateUser({email:value},{emailRedirectTo:"https://trafinexo.useinfotec.com.br/dashboard?email=confirmed"});
  if(error)setMessage(error.message);else{setMessage("Enviamos a confirmação. Seu workspace e histórico permanecem na mesma conta.");setEmail("");const {data}=await authClient.auth.getUser();setUser(data.user||null)}
  setBusy(false);
 }
 if(user.email&&user.email_confirmed_at)return null;
 return <section style={{margin:"0 0 18px",padding:16,border:"1px solid #dbe7f1",borderRadius:16,background:"#fff"}}>
  <b>Conta e e-mail</b><p style={{fontSize:13,color:"#607487"}}>{user.email?"Confirme seu e-mail para recuperação e ações protegidas.":"Seu acesso funciona sem e-mail. Vincule um endereço para recuperar a conta e liberar ações sensíveis."}</p>
  {!user.email&&<div style={{display:"flex",gap:8,flexWrap:"wrap"}}><input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="voce@empresa.com" style={{flex:"1 1 240px",padding:10}}/><button type="button" onClick={link} disabled={busy||!email.trim()}>{busy?"Enviando...":"Vincular e-mail"}</button></div>}
  {message&&<small>{message}</small>}
 </section>
}