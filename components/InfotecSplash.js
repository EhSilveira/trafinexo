"use client";

import { useEffect, useState } from "react";

export function InfotecSplash() {
  const [phase, setPhase] = useState("visible");

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const leaveTimer = window.setTimeout(() => setPhase("leaving"), reduceMotion ? 250 : 1150);
    const hideTimer = window.setTimeout(() => setPhase("hidden"), reduceMotion ? 450 : 1550);

    return () => {
      window.clearTimeout(leaveTimer);
      window.clearTimeout(hideTimer);
    };
  }, []);

  if (phase === "hidden") return null;

  return (
    <div className={`infotec-splash ${phase === "leaving" ? "is-leaving" : ""}`} role="status" aria-label="Carregando Trafinexo">
      <div className="splash-orbit splash-orbit-one" />
      <div className="splash-orbit splash-orbit-two" />
      <div className="splash-content">
        <div className="splash-product-mark" aria-hidden="true">
          <span className="splash-node" />
          <span className="splash-node" />
          <span className="splash-node" />
          <span className="splash-core">T</span>
        </div>
        <strong className="splash-product">TRAFINEXO</strong>
        <span className="splash-tagline">Gestão inteligente de tráfego e performance</span>
        <div className="splash-divider" />
        <span className="splash-by">Uma solução desenvolvida pela</span>
        <div className="infotec-lockup">
          <strong>INFOTEC</strong>
          <small>Sistemas Inteligentes</small>
        </div>
      </div>
    </div>
  );
}
