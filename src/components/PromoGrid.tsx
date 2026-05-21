import { useState } from "react";
import { Plus } from "lucide-react";
import { usePromotions } from "@/lib/catalog";
import { formatBRL } from "@/lib/whatsapp";
import { PromoModal } from "@/components/ProModal"; // Injetamos o modal aqui!

export function PromoGrid() {
  const { data: promotions = [], isLoading } = usePromotions();
  
  // Estados para gerenciar qual promoção abrir no configurador passo a passo
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPromo, setSelectedPromo] = useState<any>(null);

  if (isLoading && promotions.length === 0) return null;
  if (!promotions.length) return null;

  // Garante a ordenação exata das 4 promoções na tela conforme você pediu
  const ordemDesejada = ["Da Casa", "Mais Pedida", "Combo", "Festa"];
  
  // Filtramos para garantir que a promoção interna do Topo (Banner) não duplique no grid de baixo
  const TOP_BANNER_UUID = "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d";
  const filtradasERegulares = promotions.filter(p => p.id !== TOP_BANNER_UUID);

  const sortedPromotions = [...filtradasERegulares].sort((a, b) => {
    return ordemDesejada.indexOf(a.nome) - ordemDesejada.indexOf(b.nome);
  });

  // Handler para interceptar o clique e chamar a montagem do combo
  const handleOpenComboConfig = (promo: any) => {
    setSelectedPromo(promo);
    setIsModalOpen(true);
  };

  return (
    <section className="py-12 md:py-16 bg-[var(--color-cream)]/95 text-[var(--color-cocoa)]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="font-display text-3xl md:text-5xl text-[var(--color-cocoa)]">
            Promoções Imperdíveis 🔥
          </h2>
          <div className="mx-auto mt-3 h-1 w-24 rounded-full bg-primary" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {sortedPromotions.map((p) => (
            <article
              key={p.id}
              className="group rounded-2xl bg-[var(--color-cocoa)] text-cream overflow-hidden border border-[var(--color-cocoa)]/20 shadow-[var(--shadow-warm)] hover:-translate-y-1 transition flex flex-col"
            >
              <div className="relative aspect-[4/3] bg-secondary/40 overflow-hidden">
                {p.image_url && (
                  <img 
                    src={p.image_url} 
                    alt={p.nome} 
                    loading="lazy" 
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-500" 
                  />
                )}
                {p.badge && (
                  <span className="absolute top-3 left-3 bg-accent text-accent-foreground text-[10px] font-bold uppercase px-2.5 py-1 rounded-full shadow-sm">
                    {p.badge}
                  </span>
                )}
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-display text-lg leading-tight text-white">{p.nome}</h3>
                
                {/* ─── TRATAMENTO DO VISUAL EXPLICATIVO DO SITE ─── */}
                <p className="text-sm text-cream/70 mt-1 flex-1 line-clamp-3">
                  {(() => {
                    try {
                      // Se a descrição for o JSON estruturado do Admin, descompacta e limpa a tela!
                      if (p.descricao && p.descricao.startsWith("{")) {
                        const parsed = JSON.parse(p.descricao);
                        return parsed.textoExibido || "";
                      }
                      // Caso contrário, mostra o texto legível regular antigo
                      return p.descricao || "";
                    } catch {
                      return p.descricao || "";
                    }
                  })()}
                </p>
                
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="font-display text-2xl text-primary">
                    {formatBRL(p.preco)}
                  </span>
                  {p.preco_antigo && (
                    <span className="text-xs line-through text-cream/50">
                      {formatBRL(p.preco_antigo)}
                    </span>
                  )}
                </div>
                
                {/* O Botão agora não injeta direto, ele chama o Modal Guiado! */}
                <button
                  type="button"
                  onClick={() => handleOpenComboConfig(p)}
                  className="mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-accent text-accent-foreground font-semibold px-4 py-3 hover:brightness-110 transition cursor-pointer select-none uppercase tracking-wide text-xs"
                >
                  <Plus className="size-4" /> Montar meu combo
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* ─── MODAL GLOBAL DE CONFIGURAÇÃO DE COMBOS INJETADO NO GRID ─── */}
      <PromoModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        promotion={selectedPromo} 
      />
    </section>
  );
}