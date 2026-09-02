import "./globals.css";
import { InfotecSplash } from "../components/InfotecSplash";

export const metadata = {
  title: "Trafinexo | Gestão inteligente de tráfego e performance",
  description: "Centralize clientes, campanhas, testes A/B, contratos, criativos, metas e performance em um só lugar.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        <InfotecSplash />
        {children}
      </body>
    </html>
  );
}
