"use client";
import {useEffect,useState} from "react";
import OperationsSuite from "../../components/OperationsSuite";
import {InfotecFooter} from "../../components/InfotecFooter";
import {clearSession,currentUser,rest} from "../../lib/infotecApi";
import "../dashboard/pro.css";

export default function Operacao(){
 const[loading,setLoading]=useState(true),[user,setUser]=useState(null),[workspace,setWorkspace]=useState(null),[clients,setClients]=useState([]),[error,setError]=useState("");
 async function load(){setLoading(true);setError("");try{const u=await currentUser();if(!u){window.location.href="/login";return}setUser(u);const m=await rest("traf_workspace_members?select=workspace_id,role&limit=1");if(!m?.length)throw new Error("Workspace não encontrado");const wid=m[0].workspace_id;const [w,c]=await Promise.all([rest(`traf_workspaces?id=eq.${wid}&select=*&limit=1`),rest(`traf_clients?workspace_id=eq.${wid}&select=*&order=company_name.asc`)]);setWorkspace(w?.[0]||null);setClients(c||[])}catch(e){setError(e.message)}finally{setLoading(false)}}
 useEffect(()=>{load()},[]);
 if(loading)return <main className="pro-loading"><div className="auth-brand"><span>T</span><div><strong>TRAFINEXO</strong><small>Carregando Operação 360…</small></div></div><div className="loading-line"/></main>;
 if(!workspace)return <main className="pro-loading"><p>{error||"Não foi possível carregar a operação."}</p><a className="btn" href="/dashboard">Voltar</a></main>;
 return <main className="pro-main" style={{minHeight:"100vh"}}><header className="pro-topbar"><div><span className="breadcrumb">TRAFINEXO / OPERAÇÃO 360</span><h1>Operação 360</h1><p>Projetos, equipe, atendimento, aprovação, planejamento, conteúdo, conhecimento, IA e evolução.</p></div><div className="top-actions"><a className="sync-button" href="/dashboard">← Central de comando</a><div className="pro-user"><span>{(user?.user_metadata?.full_name||user?.email||"U").slice(0,1).toUpperCase()}</span><div><b>{user?.user_metadata?.full_name||"Gestor"}</b><small>Operação</small></div></div><button className="sync-button" onClick={()=>{clearSession();window.location.href="/login"}}>Sair</button></div></header><div className="pro-content"><OperationsSuite workspace={workspace} clients={clients} user={user} onChanged={load}/></div><InfotecFooter/></main>
}
