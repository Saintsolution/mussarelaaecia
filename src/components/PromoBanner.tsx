import { useState, useEffect, useMemo } from "react";
import { usePromotions } from "@/lib/catalog";
import { PromoModal } from "@/components/ProModal";

// O UUID DA PROMOÇÃO DO DIA — EXATAMENTE IGUAL AO ADMIN E CARROSSEL
const TOP_BANNER_UUID = "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d";

export function PromoBanner() {
  const { data: promotions = [], isLoading } = usePromotions();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [validadeTexto, setValidadeTexto] = useState("");

  // Pega o registro temporal salvo pelo Admin para controlar o relógio local
  const expirationDate = typeof window !== "undefined" ? localStorage.getItem("pizzaria_banner_valid_to") : null;
  const isExpired = expirationDate ? new Date() > new Date(expirationDate) : false;

  // --- BUSCA E DECODIFICAÇÃO DOS DADOS DO BANCO ---
  const dadosPromo = useMemo(() => {
    const promoDoBanco = promotions.find(p => p.id === TOP_BANNER_UUID);
    
    if (!promoDoBanco) {
      return {
        existe: false,
        descricao: "Na compra de duas pizzas salgadas grandes ganhe uma doce brotinho!" // Fallback padrão seu
      };
    }

    let descricaoComercial = "";

    try {
      // Se a descrição for o JSON estruturado do Admin, descompacta o texto comercial
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
      descricao: descricaoComercial
    };
  }, [promotions]);

  // Formata a data de encerramento de forma amigável na tarja inferior
  useEffect(() => {
    if (expirationDate) {
      const dataObj = new Date(expirationDate);
      const dataFormatada = dataObj.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit" });
      const horaFormatada = dataObj.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
      setValidadeTexto(`encerra em: ${dataFormatada} às ${horaFormatada}`);
    } else {
      setValidadeTexto("encerra em: hoje às 23:30"); // Fallback padrão seu
    }
  }, [expirationDate]);

  // Se a promoção tiver expirado no relógio do cliente, o banner oculta-se sozinho
  if (isExpired || isLoading || !dadosPromo.descricao) return null;

  return (
    <div className="container mx-auto px-4 my-8 md:my-12">
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className="w-full text-left group relative flex flex-col items-center justify-center text-center p-6 md:p-8 rounded-[40px] bg-gradient-to-r from-[var(--color-accent)] to-[var(--background)] text-white shadow-[var(--shadow-warm)] hover:-translate-y-0.5 transition-all duration-300 overflow-hidden border border-[var(--color-primary)] animate-pulse-subtle cursor-pointer"
      >
        {/* Efeito de brilho reflexivo fino no hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shimmer" />

        <div className="z-10 flex flex-col items-center gap-1">
          <span className="text-white/60 font-sans text-[11px] md:text-xs uppercase tracking-[0.2em] font-medium">
            Oferta Exclusiva
          </span>

          <h2 className="font-display text-2xl md:text-4xl lg:text-5xl font-black uppercase tracking-wider text-white drop-shadow-sm mt-0.5">
            PROMOÇÃO DO DIA
          </h2>
          
          {/* TEXTO DINÂMICO ATUALIZADO PELO ADMIN */}
          <p className="font-sans text-xl md:text-3xl lg:text-4xl font-light text-amber-100/90 tracking-wide max-w-4xl px-4 mt-2 leading-tight text-center">
            {dadosPromo.descricao}
          </p>
          
          {/* DATA/HORA DINÂMICA SALVA NO EVENTO DE VALIDADE */}
          <div className="mt-3 text-[10px] md:text-xs text-blue-400 font-medium tracking-wider uppercase opacity-90 flex items-center gap-1">
            <span className="font-semibold">{validadeTexto}</span>
          </div>
        </div>
      </button>

      {/* O CONFIGURADOR ABRE DIRETAMENTE AQUI AO CLICAR NO BANNER */}
      <PromoModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        promotion={dadosPromo.promoData || null} 
      />
    </div>
  );
}