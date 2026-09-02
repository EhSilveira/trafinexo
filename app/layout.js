import "./globals.css";
import "./responsive.css";
import { InfotecSplash } from "../components/InfotecSplash";
import PwaInstall from "../components/PwaInstall";

export const metadata = {
  title: "Trafinexo | Gestão inteligente de tráfego e performance",
  description: "Sistema operacional para gestores de tráfego: clientes, campanhas, criativos, testes A/B, contratos, metas, diagnóstico 360, IA e automações em um só lugar.",
  applicationName: "Trafinexo",
  manifest: "/manifest.webmanifest",
  keywords: ["gestor de tráfego", "gestão de campanhas", "Meta Ads", "Google Ads", "testes A/B", "performance", "INFOTEC"],
  icons: { icon: "/pwa-192.svg", apple: "/pwa-192.svg" },
  appleWebApp: { capable: true, title: "Trafinexo", statusBarStyle: "black-translucent" },
  openGraph: {
    title: "Trafinexo | O centro de comando da sua operação de tráfego",
    description: "Centralize clientes, campanhas, criativos, contratos, metas, resultados e IA. Teste grátis por 15 dias.",
    type: "website",
    siteName: "Trafinexo by INFOTEC"
  }
};

export const viewport = { themeColor: "#071A33", width: "device-width", initialScale: 1, viewportFit: "cover" };

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        <InfotecSplash />
        {children}
        <PwaInstall />
      </body>
    </html>
  );
}
