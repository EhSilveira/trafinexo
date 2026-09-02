import { InfotecFooter } from "../components/InfotecFooter";

export default function Home() {
  return (
    <main className="site-shell">
      <section className="hero">
        <div className="hero-glow hero-glow-one" />
        <div className="hero-glow hero-glow-two" />
        <div className="container hero-content">
          <div className="eyebrow">Produto INFOTEC</div>
          <h1>Trafinexo</h1>
          <p className="hero-subtitle">Gestão inteligente de tráfego e performance.</p>
          <p className="hero-copy">
            Centralize clientes, campanhas, criativos, testes A/B, contratos, metas,
            alertas e resultados em uma única operação.
          </p>
          <div className="hero-status">
            <span className="status-dot" />
            Plataforma em preparação
          </div>
        </div>
      </section>
      <InfotecFooter />
    </main>
  );
}
