import ResponsiveHeroBanner from "@/components/ui/responsive-hero-banner";

export default function Home() {
  return (
    <ResponsiveHeroBanner
      navLinks={[{ label: "Log in", href: "/login" }]}
      ctaButtonText="Get Started"
      ctaButtonHref="/register"
      badgeLabel="Live"
      badgeText="Persistent wallet monitoring, not just pre-signature checks"
      title="Guard Your Wallet"
      titleLine2="Around The Clock"
      description="Tutela watches your registered wallets for risky token approvals, drainer contracts, and anomalous transactions in real time — then alerts you and prepares revocation before funds are at risk."
      primaryButtonText="Get Started"
      primaryButtonHref="/register"
      secondaryButtonText="Log In"
      secondaryButtonHref="/login"
    />
  );
}
