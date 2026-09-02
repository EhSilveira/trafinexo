import "./globals.css";
import { InfotecSplash } from "../components/InfotecSplash";
import PwaInstall from "../components/PwaInstall";

export const metadata = {
  title: "Trafinexo | Central de comando para gestores de tráfego",
  description: "Plataforma operacional para gestores de tráfego e agências: conecte Meta, Google, TikTok, analytics e CRM; monitore campanhas, testes A/B, atribuição, criativos, alertas, metas e relatórios em um só lugar.",
  applicationName: "Trafinexo",
  manifest: "/manifest.webmanifest",
  keywords: ["gestor de tráfego", "gestão de campanhas", "Meta Ads", "Google Ads", "TikTok Ads", "testes A/B", "atribuição", "performance", "INFOTEC"],
  icons: { icon: "/pwa-192.svg", apple: "/pwa-192.svg" },
  appleWebApp: { capable: true, title: "Trafinexo", statusBarStyle: "black-translucent" },
  openGraph: {
    title: "Trafinexo | Central de comando da operação de tráfego",
    description: "Conecte suas contas, sincronize mídia, monitore testes, compare receita real e transforme sinais em ações. 15 dias grátis.",
    type: "website", siteName: "Trafinexo by INFOTEC"
  }
};
export const viewport = { themeColor: "#071A33", width: "device-width", initialScale: 1, viewportFit: "cover" };
export default function RootLayout({ children }) { return <html lang="pt-BR"><body><InfotecSplash/>{children}<PwaInstall/></body></html>; }
