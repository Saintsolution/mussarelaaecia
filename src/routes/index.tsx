import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { HeroCarousel } from "@/components/HeroCarousel";
import { CategoryRail } from "@/components/CategoryRail";
import { PromoBanner } from "@/components/PromoBanner";
import { PromoGrid } from "@/components/PromoGrid";
import { Footer } from "@/components/Footer";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-[var(--color-cream)] text-[var(--color-cocoa)] flex flex-col antialiased selection:bg-primary selection:text-primary-foreground">
      {/* 1. CABEÇALHO DO SITE (LOGO, CARRINHO, CONTATO) */}
      <Header />

      <main className="flex-1 pb-16">
        {/* 2. CARROSSEL DE ARTE DO TOPO (IMPACTO VISUAL) */}
        <HeroCarousel />

        {/* 3. TRILHO DE CATEGORIAS PARA NAVEGAÇÃO RÁPIDA */}
        <div className="mt-6 md:mt-8">
          <CategoryRail />
        </div>

        {/* 4. O NOSSO BANNER DINÂMICO DA PROMOÇÃO DO DIA (COMBO DA MARÉ) */}
        <PromoBanner />

        {/* 5. GRID DOS 4 CARDS PROMOCIONAIS DE BAIXO */}
        <PromoGrid />
      </main>

      {/* 6. RODAPÉ INSTITUCIONAL */}
      <Footer />
    </div>
  );
}