import EmailVerificationBanner from "../components/EmailVerificationBanner";

export default function DashboardLayout({children}){
  return <><EmailVerificationBanner productSlug="trafinexo"/>{children}</>;
}
