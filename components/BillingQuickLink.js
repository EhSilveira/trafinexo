"use client";
import {useEffect,useState} from "react";
export default function BillingQuickLink(){const[show,setShow]=useState(false);useEffect(()=>setShow(location.pathname.startsWith('/dashboard')||location.pathname.startsWith('/assinatura')),[]);if(!show)return null;return <a href="/assinatura" style={{position:'fixed',right:18,bottom:78,zIndex:90,padding:'11px 15px',borderRadius:999,background:'#071A33',color:'#fff',fontWeight:800,textDecoration:'none',boxShadow:'0 12px 30px rgba(7,26,51,.22)'}}>Plano / Assinatura</a>}
