import { useState, useEffect, useMemo } from "react";
import { X, Plus, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatBRL } from "@/lib/whatsapp";
import { useCart } from "@/lib/cart";

interface PromoModalProps {
  isOpen: boolean;
  onClose: () => void;
  promotion: {
    id: string;
    nome: string;
    badge: string | null;
    descricao: string | null;
    preco: number;
  } | null;
}

interface ProductOption {
  id: string;
  nome: string;
  category_name: string;
}

export function PromoModal({ isOpen, onClose, promotion }: PromoModalProps) {
  const { addPromoCombo } = useCart();
  
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [loading, setLoading] = useState(false);

  // Estados de escolhas divididas do combo
  const [salgadas, setSalgadas] = useState<string[]>([]);
  const [doces, setDoces] = useState<string[]>([]);
  const [bebidas, setBebidas] = useState<string[]>([]);
  const [outros, setOutros] = useState<string[]>([]);

  // --- 1. DECODIFICAÇÃO INTELIGENTE DO BANCO DE DADOS ---
  const dadosDecodificados = useMemo(() => {
    if (!promotion) return { nome: "", descricao: "", salgadas: 1, doces: 0, bebidas: 0, outros: 0 };

    let nomeFinal = promotion.nome || "";
    let descricaoFinal = "";
    let limitesFinais = { salgadas: 1, doces: 0, bebidas: 0, outros: 0 };

    try {
      if (promotion.descricao && promotion.descricao.startsWith("{")) {
        const parsed = JSON.parse(promotion.descricao);
        descricaoFinal = parsed.textoExibido || "";
        limitesFinais = {
          salgadas: parsed.salgadas || 0,
          doces: parsed.doces || 0,
          bebidas: parsed.bebidas || 0,
          outros: parsed.outros || 0
        };
      } else {
        descricaoFinal = promotion.descricao || "";
        const textoLower = `${nomeFinal} ${descricaoFinal}`.toLowerCase();
        if (textoLower.includes("2 pizzas") || promotion.badge === "2 Pizzas G") {
          limitesFinais.salgadas = 2;
        }
      }
    } catch (e) {
      descricaoFinal = promotion.descricao || "";
    }

    return {
      nome: nomeFinal,
      descricao: descricaoFinal,
      ...limitesFinais
    };
  }, [promotion]);

  useEffect(() => {
    if (isOpen) {
      fetchProducts();
      setSalgadas([]);
      setDoces([]);
      setBebidas([]);
      setOutros([]);
    }
  }, [isOpen, promotion]);

  async function fetchProducts() {
    setLoading(true);
    const { data } = await supabase
      .from("products")
      .select(`
        id, 
        nome,
        categories ( name )
      `)
      .eq("ativo", true)
      .order("nome");
    
    if (data) {
      const mapped = data.map((item: any) => ({
        id: item.id,
        nome: item.nome,
        category_name: item.categories?.name?.toLowerCase() || ""
      }));
      setProducts(mapped);
    }
    setLoading(false);
  }

  // Filtros de categoria aprimorados para evitar sobreposição de nomes parecidos
  const listasFiltradas = useMemo(() => {
    return {
      salgadas: products.filter(p => p.category_name.includes("salgada") || p.category_name === "pizzas" || p.category_name === "pizza"),
      doces: products.filter(p => p.category_name.includes("doce")),
      bebidas: products.filter(p => p.category_name.includes("bebida") || p.category_name.includes("refrigerante") || p.category_name.includes("suco")),
      outros: products.filter(p => p.category_name.includes("salgadinho") || p.category_name === "salgados" || p.category_name.includes("porção") || p.category_name.includes("comida"))
    };
  }, [products]);

  if (!isOpen || !promotion) return null;

  const handleSelect = (nomeItem: string, grupo: "salgadas" | "doces" | "bebidas" | "outros") => {
    const selecionados = grupo === "salgadas" ? salgadas : grupo === "doces" ? doces : grupo === "bebidas" ? bebidas : outros;
    const setGrupo = grupo === "salgadas" ? setSalgadas : grupo === "doces" ? setDoces : grupo === "bebidas" ? setBebidas : setOutros;
    const max = dadosDecodificados[grupo];

    if (selecionados.includes(nomeItem)) {
      setGrupo(selecionados.filter(s => s !== nomeItem));
    } else {
      if (selecionados.length < max) {
        setGrupo([...selecionados, nomeItem]);
      } else if (max === 1) {
        setGrupo([nomeItem]);
      }
    }
  };

  const comboEstaCompleto = 
    salgadas.length === dadosDecodificados.salgadas &&
    doces.length === dadosDecodificados.doces &&
    bebidas.length === dadosDecodificados.bebidas &&
    outros.length === dadosDecodificados.outros;

  const handleConfirmar = () => {
    if (!comboEstaCompleto) return;

    const todosDetalhes = [
      ...salgadas.map(s => `🍕 Salgada: ${s}`),
      ...doces.map(d => `🍫 Doce: ${d}`),
      ...bebidas.map(b => `🥤 Bebida: ${b}`),
      ...outros.map(o => `🍟 Acompanhamento: ${o}`)
    ];

    addPromoCombo({
      id: promotion.id,
      nome: dadosDecodificados.nome,
      badge: promotion.badge || "PROMO DO DIA",
      preco: promotion.preco,
      detalhes: todosDetalhes
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-gray-100 flex flex-col max-h-[85vh]">
        
        {/* Cabeçalho Comercial Dinâmico */}
        <div className="p-5 bg-[var(--color-cocoa)] text-cream relative shrink-0">
          <button onClick={onClose} className="absolute top-4 right-4 text-cream/70 hover:text-white transition">
            <X className="size-6" />
          </button>
          
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="inline-block bg-[#E33B19] text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border border-[#FFD166]">
              {promotion.badge || "PROMO DO DIA"}
            </span>
            <span className="inline-flex items-center bg-amber-500/20 text-[#FFD166] text-[10px] font-bold px-2 py-0.5 rounded-md">
              Aproveite no site!
            </span>
          </div>
          <h3 className="font-display text-xl md:text-2xl leading-tight text-white mt-1">{dadosDecodificados.nome}</h3>
          <p className="text-xs text-cream/80 mt-1">{dadosDecodificados.descricao}</p>
        </div>

        {/* Lista de Sabores Filtrada pelos limites do Admin */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5 bg-slate-50/50">
          {loading ? (
            <p className="text-sm text-center text-slate-500 animate-pulse py-8">Buscando opções no forno...</p>
          ) : (
            <>
              {/* COMPONENTE: SALGADAS */}
              {dadosDecodificados.salgadas > 0 && (
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center bg-white p-2.5 rounded-xl border">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-700">🍕 Pizzas Salgadas</span>
                    <span className="text-[11px] font-bold bg-red-50 text-[#E33B19] px-2 py-0.5 rounded-md">
                      {salgadas.length} de {dadosDecodificados.salgadas}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 gap-1 pl-1">
                    {listasFiltradas.salgadas.map(p => (
                      <button
                        key={p.id} type="button" onClick={() => handleSelect(p.nome, "salgadas")}
                        className={`flex items-center justify-between p-2 rounded-xl border text-xs transition-all ${
                          salgadas.includes(p.nome) ? "border-[#E33B19] bg-red-50/30 text-[#E33B19] font-bold" : "border-gray-200 bg-white text-slate-700"
                        }`}
                      >
                        {p.nome}
                        {salgadas.includes(p.nome) && <Check className="size-4 text-[#E33B19] stroke-[3]" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* COMPONENTE: DOCES */}
              {dadosDecodificados.doces > 0 && (
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center bg-white p-2.5 rounded-xl border">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-700">🍫 Pizzas Doces</span>
                    <span className="text-[11px] font-bold bg-red-50 text-[#E33B19] px-2 py-0.5 rounded-md">
                      {doces.length} de {dadosDecodificados.doces}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 gap-1 pl-1">
                    {listasFiltradas.doces.map(p => (
                      <button
                        key={p.id} type="button" onClick={() => handleSelect(p.nome, "doces")}
                        className={`flex items-center justify-between p-2 rounded-xl border text-xs transition-all ${
                          doces.includes(p.nome) ? "border-[#E33B19] bg-red-50/30 text-[#E33B19] font-bold" : "border-gray-200 bg-white text-slate-700"
                        }`}
                      >
                        {p.nome}
                        {doces.includes(p.nome) && <Check className="size-4 text-[#E33B19] stroke-[3]" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* COMPONENTE: BEBIDAS */}
              {dadosDecodificados.bebidas > 0 && (
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center bg-white p-2.5 rounded-xl border">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-700">🥤 Bebidas</span>
                    <span className="text-[11px] font-bold bg-red-50 text-[#E33B19] px-2 py-0.5 rounded-md">
                      {bebidas.length} de {dadosDecodificados.bebidas}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 gap-1 pl-1">
                    {listasFiltradas.bebidas.map(p => (
                      <button
                        key={p.id} type="button" onClick={() => handleSelect(p.nome, "bebidas")}
                        className={`flex items-center justify-between p-2 rounded-xl border text-xs transition-all ${
                          bebidas.includes(p.nome) ? "border-[#E33B19] bg-red-50/30 text-[#E33B19] font-bold" : "border-gray-200 bg-white text-slate-700"
                        }`}
                      >
                        {p.nome}
                        {bebidas.includes(p.nome) && <Check className="size-4 text-[#E33B19] stroke-[3]" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* COMPONENTE: SALGADOS / OUTROS */}
              {dadosDecodificados.outros > 0 && (
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center bg-white p-2.5 rounded-xl border">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-700">🍟 Salgadinhos & Comidinhas</span>
                    <span className="text-[11px] font-bold bg-red-50 text-[#E33B19] px-2 py-0.5 rounded-md">
                      {outros.length} de {dadosDecodificados.outros}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 gap-1 pl-1">
                    {listasFiltradas.outros.map(p => (
                      <button
                        key={p.id} type="button" onClick={() => handleSelect(p.nome, "outros")}
                        className={`flex items-center justify-between p-2 rounded-xl border text-xs transition-all ${
                          outros.includes(p.nome) ? "border-[#E33B19] bg-red-50/30 text-[#E33B19] font-bold" : "border-gray-200 bg-white text-slate-700"
                        }`}
                      >
                        {p.nome}
                        {outros.includes(p.nome) && <Check className="size-4 text-[#E33B19] stroke-[3]" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Rodapé Comercial */}
        <div className="p-5 border-t bg-gray-50 flex items-center justify-between shrink-0">
          <div>
            <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">Valor do Combo</span>
            <span className="text-2xl font-display font-black text-[#E33B19]">{formatBRL(promotion.preco)}</span>
          </div>
          <button
            type="button" onClick={handleConfirmar} disabled={!comboEstaCompleto}
            className="inline-flex items-center gap-2 bg-[#E33B19] text-white font-black text-xs px-5 py-3 rounded-full hover:brightness-110 border-2 border-[#FFD166] transition disabled:opacity-40 disabled:cursor-not-allowed shadow-md uppercase tracking-wide"
          >
            Adicionar Combo <Plus className="size-4" />
          </button>
        </div>

      </div>
    </div>
  );
}