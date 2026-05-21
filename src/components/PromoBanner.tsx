import { useState, useEffect, useMemo } from "react";
import { usePromotions } from "@/lib/catalog";
import { PromoModal } from "@/components/ProModal";

// O UUID DA PROMOÇÃO DO DIA — EXATAMENTE IGUAL AO ADMIN E CARROSSEL
const TOP_BANNER_UUID = "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d";

export function PromoBanner() {
  const { data: promotions = [], isLoading } = usePromotions();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [validadeTexto, setValidadeTexto] = useState("");

  // --- BUSCA E DECODIFICAÇÃO DOS DADOS DO BANCO ---
  const dadosPromo = useMemo(() => {
    const promoDoBanco = promotions.find(p => p.id === TOP_BANNER_UUID);
    
    if (!promoDoBanco) {
      return {
        existe: false,
        descricao: "Na compra de duas pizzas salgadas grandes ganhe uma doce brotinho!",
        validTo: null,
        promoData: null
      };
    }

    let descricaoComercial = "";

    try {
      if (promoDoBanco.descricao && promoDoBanco.descricao.startsWith("{")) {
        const parsed = JSON.parse(promoDoBanco.descricao);
        descricaoComercial = parsed.textoExibido || "";
      } else {
        descricaoComercial = promoDoBanco.descricao || "";
      }
    } catch {
      descricaoComercial = promoDoBanco.descricao || "";
    }

    return {
      existe: true,
      promoData: promoDoBanco,
      descricao: descricaoComercial,
      // Se você criar no futuro uma coluna na tabela para a data, use aqui. 
      // Por enquanto, como o Admin salvava o validTo apenas no localStorage, mantemos segurança.
      validTo: null 
    };
  }, [promotions]);

  // Se a promoção tiver expirado (caso trate por data vinda do banco no futuro) ou se ainda estiver carregando
  if (isLoading || !dadosPromo.descricao) return null;

  return (
    <div className="container mx-auto px-4 my-8 md:my-12">
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className="w-full text-left group relative flex flex-col items-center justify-center text-center p-6 md:p-8 rounded-[40px] bg-gradient-to-r from-[var(--color-accent)] to-[var(--background)] text-white shadow-[var(--shadow-warm)] hover:-translate-y-0.5 transition-all duration-300 overflow-hidden border border-[var(--color-primary)] animate-pulse-subtle cursor-pointer"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shimmer" />

        <div className="z-10 flex flex-col items-center gap-1">
          <span className="text-white/60 font-sans text-[11px] md:text-xs uppercase tracking-[0.2em] font-medium">
            Oferta Exclusiva
          </span>

          <h2 className="font-display text-2xl md:text-4xl lg:text-5xl font-black uppercase tracking-wider text-white drop-shadow-sm mt-0.5">
            PROMOÇÃO DO DIA
          </h2>
          
          <p className="font-sans text-xl md:text-3xl lg:text-4xl font-light text-amber-100/90 tracking-wide max-w-4xl px-4 mt-2 leading-tight text-center">
            {dadosPromo.descricao}
          </p>
          
          {/* Tarja amigável e limpa para não depender do localStorage bugado */}
          <div className="mt-3 text-[10px] md:text-xs text-amber-300 font-bold tracking-wider uppercase opacity-90 flex items-center gap-1">
            <span>Aproveite! Peça direto pelo site</span>
          </div>
        </div>
      </button>

      <PromoModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        promotion={dadosPromo.promoData || null} 
      />
    </div>
  );
}