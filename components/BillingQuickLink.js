"use client";
import {useEffect,useState} from "react";

export default function BillingQuickLink(){
  const[show,setShow]=useState(false);
  useEffect(()=>{const p=location.pathname;setShow(p.startsWith('/dashboard')||p.startsWith('/assinatura')||p.startsWith('/inteligencia')||p.startsWith('/operacao')||p.startsWith('/dev/integracoes'))},[]);
  if(!show)return null;
  return <a href="/assinatura" className="utility-primary">Plano e assinatura</a>;
}
