export function InfotecFooter() {
  return (
    <footer className="infotec-footer">
      <div className="container footer-inner">
        <div>
          <strong className="footer-product">Trafinexo</strong>
          <p>Gestão inteligente de tráfego e performance.</p>
        </div>

        <a
          className="footer-infotec"
          href="https://useinfotec.com.br"
          target="_blank"
          rel="noreferrer"
          aria-label="Conhecer a INFOTEC Sistemas Inteligentes"
        >
          <span>Desenvolvido por</span>
          <span className="footer-infotec-brand">
            <strong>INFOTEC</strong>
            <small>Sistemas Inteligentes</small>
          </span>
        </a>
      </div>

      <div className="footer-bottom">
        <div className="container">
          © {new Date().getFullYear()} Trafinexo · Produto INFOTEC Sistemas Inteligentes
        </div>
      </div>
    </footer>
  );
}
