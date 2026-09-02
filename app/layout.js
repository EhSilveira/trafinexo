import "./globals.css";
import { InfotecSplash } from "../components/InfotecSplash";

export const metadata = {
  title: "Trafinexo | Gestão inteligente de tráfego e performance",
  description: "Sistema operacional para gestores de tráfego: clientes, campanhas, criativos, testes A/B, contratos, metas, diagnóstico 360, IA e automações em um só lugar.",
  applicationName: "Trafinexo",
  keywords: ["gestor de tráfego", "gestão de campanhas", "Meta Ads", "Google Ads", "testes A/B", "performance", "INFOTEC"],
  openGraph: {
    title: "Trafinexo | O centro de comando da sua operação de tráfego",
    description: "Centralize clientes, campanhas, criativos, contratos, metas, resultados e IA. Teste grátis por 15 dias.",
    type: "website",
    siteName: "Trafinexo by INFOTEC"
  }
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
