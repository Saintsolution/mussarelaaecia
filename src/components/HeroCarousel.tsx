import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { heroSlides as staticSlides } from "@/lib/data";
import { usePromotions } from "@/lib/catalog";
import { PromoModal } from "@/components/ProModal";

// O SEU UUID FIXO DA PROMOÇÃO DO DIA — IDENTICO AO DO ADMIN
const TOP_BANNER_UUID = "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d";

export function HeroCarousel() {
  const [idx, setIdx] = useState(0);
  const { data: promotions = [] } = usePromotions();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPromo, setSelectedPromo] = useState<any>(null);

  // Estados locais para guardar as informações do localStorage apenas no cliente
  const [bannerImg, setBannerImg] = useState<string | null>(null);
  const [expirationDate, setExpirationDate] = useState<string | null>(null);

  // Esse hook roda APENAS no navegador do cliente, protegendo o app contra estouro de SSR
  useEffect(() => {
    if (typeof window !== "undefined") {
      setBannerImg(localStorage.getItem("pizzaria_banner_carrossel"));
      setExpirationDate(localStorage.getItem("pizzaria_banner_valid_to"));
    }
  }, [promotions]); // Reavalia sempre que o catálogo recarregar

  // Checa se a data final expirou baseando-se no relógio atual do cliente
  const isExpired = useMemo(() => {
    if (!expirationDate) return false;
    return new Date() > new Date(expirationDate);
  }, [expirationDate]);

  // --- MONTAGEM COMPOSITA DA LISTA DE SLIDES ---
  const slides = useMemo(() => {
    const base = [staticSlides[0]];

    // Se houver uma arte válida no cliente e não estiver expirada, injetamos ela
    if (bannerImg && !isExpired) {
      const linkedCombo = promotions.find((p) => p.id === TOP_BANNER_UUID);

      base.push({
        id: TOP_BANNER_UUID,
        tipo: "promo",
        image: bannerImg,
        comboData: linkedCombo || null
      } as any);
    }

    return base;
  }, [bannerImg, isExpired, promotions]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % slides.length), 7000);
    return () => clearInterval(t);
  }, [slides]);

  const handlePromoAction = (slideData: any) => {
    if (slideData.comboData) {
      setSelectedPromo(slideData.comboData);
      setIsModalOpen(true);
    } else {
      const combo = promotions.find((p) => p.id === TOP_BANNER_UUID);
      if (combo) {
        setSelectedPromo(combo);
        setIsModalOpen(true);
      }
    }
  };

  return (
    <section className="relative z-10 w-full bg-card">
      <div className="relative">
        <div className="relative aspect-[16/11] md:aspect-[21/9] w-full overflow-hidden">
          {slides.map((s: any, i: number) => (
            <div
              key={s.id}
              className={`absolute inset-0 transition-opacity duration-700 ${i === idx ? "opacity-100" : "opacity-0 pointer-events-none"}`}
              aria-hidden={i !== idx}
            >
              {/* Imagem clicável de ponta a ponta se for a promoção */}
              <img
                src={s.image}
                alt="Pizzaria Mussarela & Cia"
                className={`absolute inset-0 w-full h-full object-cover ${s.tipo === "promo" ? "cursor-pointer hover:brightness-95 transition" : ""}`}
                onClick={() => s.tipo === "promo" && handlePromoAction(s)}
                {...(i === 0 ? {} : { loading: "lazy" as const })}
              />
              <div className="absolute inset-0 bg-black/10 pointer-events-none" />

              {/* SLIDE 1: HOTSPOTS INTERATIVOS */}
              {s.tipo === "hotspots" && s.hotspots && (
                <>
                  {s.hotspots.map((h: any) => (
                    <Link
                      key={h.slug}
                      to="/cardapio/$categoria"
                      params={{ categoria: h.slug }}
                      className="group absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer"
                      style={{ left: `${h.x}%`, top: `${h.y}%` }}
                    >
                      <span className="block size-3.5 md:size-5 rounded-full bg-[#E33B19] ring-2 md:ring-4 ring-[#FFD166] animate-pulse" />
                      <span className="absolute left-1/2 top-full mt-1.5 -translate-x-1/2 whitespace-nowrap rounded-lg bg-[#FFD166] border border-[#E33B19] px-2 py-0.5 md:px-3 md:py-1 text-[9px] md:text-xs font-bold uppercase tracking-wider text-[#3d2b1f] shadow-lg md:opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-200">
                        {h.label}
                      </span>
                    </Link>
                  ))}
                  
                  <div className="absolute left-1/2 bottom-2 md:bottom-8 -translate-x-1/2 z-30 text-center w-full max-w-xl px-4 pointer-events-none">
                    <h2 className="font-display text-sm md:text-2xl text-cream font-medium tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] uppercase">
                      Direto da Maré pro seu coração
                    </h2>
                    <p className="text-[#FFD166] text-[8px] md:text-xs font-semibold tracking-widest uppercase mt-0.5 drop-shadow-md">
                      Toque nos produtos para abrir o cardápio
                    </p>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        {/* CONTROLES LATERAIS */}
        {slides.length > 1 && (
          <>
            <button
              onClick={() => setIdx((i) => (i - 1 + slides.length) % slides.length)}
              className="absolute left-1 md:left-4 top-1/2 -translate-y-1/2 size-7 md:size-10 grid place-items-center rounded-full bg-black/30 hover:bg-[#E33B19] text-cream z-30 transition-all cursor-pointer"
              aria-label="Anterior"
            >
              <ChevronLeft className="size-3.5 md:size-5" />
            </button>
            <button
              onClick={() => setIdx((i) => (i + 1) % slides.length)}
              className="absolute right-1 md:right-4 top-1/2 -translate-y-1/2 size-7 md:size-10 grid place-items-center rounded-full bg-black/30 hover:bg-[#E33B19] text-cream z-30 transition-all cursor-pointer"
              aria-label="Próximo"
            >
              <ChevronRight className="size-3.5 md:size-5" />
            </button>

            <div className="absolute bottom-2 right-4 flex gap-1 z-30">
              {slides.map((s: any, i: number) => (
                <button
                  key={s.id}
                  onClick={() => setIdx(i)}
                  aria-label={`Slide ${i + 1}`}
                  className={`h-1 transition-all rounded-full ${i === idx ? "w-4 bg-[#E33B19]" : "w-1.5 bg-white/20"}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <PromoModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        promotion={selectedPromo} 
      />
    </section>
  );
}