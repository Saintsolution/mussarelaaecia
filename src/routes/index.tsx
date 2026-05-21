import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { HeroCarousel } from "@/components/HeroCarousel";
import { CategoryRail } from "@/components/CategoryRail";
import { PromoGrid } from "@/components/PromoGrid";
import { PromoBanner } from "@/components/PromoBanner"; // <-- 1. IMPORTAÇÃO DO BANNER

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <HeroCarousel />
        <CategoryRail />
        
        {/* <-- 2. O BANNER ENTRA AQUI COMPACTO E ANIMADO --> */}
        <PromoBanner />
        
        <PromoGrid />
      </main>
      <Footer />
    </div>
  );
}