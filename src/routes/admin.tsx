import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin")({
  component: AdminPanel,
});

interface ProductSize {
  label: string;
  preco: number;
}

interface Product {
  id: string;
  nome: string;
  descricao: string | null;
  preco_base: number | null;
  image_url: string | null;
  category_id: string;
  ativo: boolean;
  sizes?: ProductSize[]; 
}

interface Category {
  id: string;
  name: string;
}

interface Promotion {
  id: string;
  nome: string;
  badge: string | null;
  descricao: string | null;
  preco: number;
  preco_antigo: number | null;
  image_url: string | null;
}

const TOP_BANNER_UUID = "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d";

function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [activeTab, setActiveTab] = useState<"CARDAPIO" | "PROMO">("CARDAPIO");

  // Estados do formulário de Produtos Normais
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [precoBase, setPrecoBase] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [ativo, setAtivo] = useState(true);

  const [precoBrotinho, setPrecoBrotinho] = useState("");
  const [precoMedia, setPrecoMedia] = useState("");
  const [precoGrande, setPrecoGrande] = useState("");

  // --- CENTRAL DE PROMOÇÕES (4 CARDS DE BAIXO) ---
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [selectedPromoId, setSelectedPromoId] = useState("");
  const [promoNomeExibido, setPromoNomeExibido] = useState(""); 
  const [promoBadgeFixa, setPromoBadgeFixa] = useState(""); 
  const [promoDescricaoTexto, setPromoDescricaoTexto] = useState("");
  const [promoPreco, setPromoPreco] = useState("");
  const [promoPrecoAntigo, setPromoPrecoAntigo] = useState("");
  
  // LIMITES NUMÉRICOS EXCLUSIVOS DOS CARDS DE BAIXO
  const [cardQtdeSalgadas, setCardQtdeSalgadas] = useState("0");
  const [cardQtdeDoces, setCardQtdeDoces] = useState("0");
  const [cardQtdeBebidas, setCardQtdeBebidas] = useState("0");
  const [cardQtdeOutros, setCardQtdeOutros] = useState("0");
  
  // --- CENTRAL DA PROMOÇÃO DO DIA (BANNER DO TOPO) ---
  const [topBannerNome, setTopBannerNome] = useState("");
  const [topBannerPreco, setTopBannerPreco] = useState("");
  const [topBannerPrecoAntigo, setTopBannerPrecoAntigo] = useState("");
  const [bannerCarrosselUrl, setBannerCarrosselUrl] = useState("");
  const [bannerValidTo, setBannerValidTo] = useState("");

  // LIMITES NUMÉRICOS EXCLUSIVOS DA PROMOÇÃO DO DIA (TOPO)
  const [qtdeSalgadas, setQtdeSalgadas] = useState("0");
  const [qtdeDoces, setQtdeDoces] = useState("0");
  const [qtdeBebidas, setQtdeBebidas] = useState("0");
  const [qtdeOutros, setQtdeOutros] = useState("0");
  const [textoInformativo, setTextoInformativo] = useState("");

  const ADMIN_PASSWORD = "mare"; 

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      fetchData();
    } else {
      alert("Senha incorreta!");
    }
  };

  const fetchData = async () => {
    setLoading(true);
    const { data: catData } = await supabase.from("categories").select("id, name").order("ordem");
    if (catData) {
      setCategories(catData);
      if (catData.length > 0 && !categoryId) setCategoryId(catData[0].id);
    }

    const { data: prodData } = await supabase.from("products").select("*").order("nome");
    if (prodData) setProducts(prodData as unknown as Product[]);

    const { data: promoData } = await supabase.from("promotions").select("*");
    if (promoData && promoData.length > 0) {
      const regulares = promoData.filter(p => p.id !== TOP_BANNER_UUID);
      setPromotions(regulares as Promotion[]);
      if (regulares.length > 0) carregarDadosPromocao(regulares[0] as Promotion);

      const topoInfo = promoData.find(p => p.id === TOP_BANNER_UUID);
      if (topoInfo) {
        setTopBannerNome(topoInfo.nome || "");
        setTopBannerPreco(topoInfo.preco?.toString() || "");
        setTopBannerPrecoAntigo(topoInfo.preco_antigo?.toString() || "");
        setBannerCarrosselUrl(topoInfo.image_url || "");

        try {
          if (topoInfo.descricao && topoInfo.descricao.startsWith("{")) {
            const parsed = JSON.parse(topoInfo.descricao);
            setQtdeSalgadas(String(parsed.salgadas || 0));
            setQtdeDoces(String(parsed.doces || 0));
            setQtdeBebidas(String(parsed.bebidas || 0));
            setQtdeOutros(String(parsed.outros || 0));
            setTextoInformativo(parsed.textoExibido || "");
          } else {
            setTextoInformativo(topoInfo.descricao || "");
          }
        } catch {
          setTextoInformativo(topoInfo.descricao || "");
        }
      }
    }
    
    const localValidTo = localStorage.getItem("pizzaria_banner_valid_to");
    if (localValidTo) setBannerValidTo(localValidTo);

    setLoading(false);
  };

  const carregarDadosPromocao = (promo: Promotion) => {
    setSelectedPromoId(promo.id);
    setPromoNomeExibido(promo.nome || "");
    setPromoBadgeFixa(promo.badge || "");
    setPromoPreco(promo.preco.toString());
    setPromoPrecoAntigo(promo.preco_antigo?.toString() || "");
    
    // Tenta decodificar se o card de baixo já possuir estrutura JSON salva
    try {
      if (promo.descricao && promo.descricao.startsWith("{")) {
        const parsed = JSON.parse(promo.descricao);
        setCardQtdeSalgadas(String(parsed.salgadas || 0));
        setCardQtdeDoces(String(parsed.doces || 0));
        setCardQtdeBebidas(String(parsed.bebidas || 0));
        setCardQtdeOutros(String(parsed.outros || 0));
        setPromoDescricaoTexto(parsed.textoExibido || "");
      } else {
        setPromoDescricaoTexto(promo.descricao || "");
        setCardQtdeSalgadas("0");
        setCardQtdeDoces("0");
        setCardQtdeBebidas("0");
        setCardQtdeOutros("0");
      }
    } catch {
      setPromoDescricaoTexto(promo.descricao || "");
    }
  };

  const handlePromoChange = (id: string) => {
    const p = promotions.find(item => item.id === id);
    if (p) carregarDadosPromocao(p);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: "ITEM" | "CARROSSEL") => {
    try {
      if (!e.target.files || e.target.files.length === 0) return;
      setUploading(true);

      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${target}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('produtos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('produtos').getPublicUrl(filePath);
      
      if (target === "CARROSSEL") {
        setBannerCarrosselUrl(data.publicUrl);
        alert("Arte do carrossel carregada! Não esqueça de clicar em 'Salvar Promoção do Dia'.");
      } else {
        setImageUrl(data.publicUrl);
        alert("Foto carregada com sucesso!");
      }
    } catch (error: any) {
      alert("Erro ao subir imagem: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleClearForm = () => {
    setEditingProduct(null);
    setNome("");
    setDescricao("");
    setPrecoBase("");
    setCategoryId(categories[0]?.id || "");
    setImageUrl("");
    setAtivo(true);
    setPrecoBrotinho("");
    setPrecoMedia("");
    setPrecoGrande("");
  };

  const handleSaveTopBanner = async () => {
    setLoading(true);

    const descricaoEstruturada = JSON.stringify({
      salgadas: parseInt(qtdeSalgadas) || 0,
      doces: parseInt(qtdeDoces) || 0,
      bebidas: parseInt(qtdeBebidas) || 0,
      outros: parseInt(qtdeOutros) || 0,
      textoExibido: textoInformativo
    });

    const { error } = await supabase
      .from("promotions")
      .upsert({
        id: TOP_BANNER_UUID,
        nome: topBannerNome,
        badge: "PROMO DO DIA",
        descricao: descricaoEstruturada,
        preco: parseFloat(topBannerPreco) || 0,
        preco_antigo: topBannerPrecoAntigo ? parseFloat(topBannerPrecoAntigo) : null,
        image_url: bannerCarrosselUrl || null
      });

    setLoading(false);
    if (error) {
      alert("Erro ao salvar dados do topo: " + error.message);
    } else {
      localStorage.setItem("pizzaria_banner_carrossel", bannerCarrosselUrl);
      localStorage.setItem("pizzaria_banner_target_id", TOP_BANNER_UUID);
      alert("🔥 Campanha e limites estruturados salvos com sucesso!");
      fetchData();
    }
  };

  const handleSaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (activeTab === "PROMO") {
      if (!selectedPromoId) return;
      setLoading(true);

      // Empacota de forma estruturada as regras do card de baixo antes de subir pro Supabase
      const cardDescricaoEstruturada = JSON.stringify({
        salgadas: parseInt(cardQtdeSalgadas) || 0,
        doces: parseInt(cardQtdeDoces) || 0,
        bebidas: parseInt(cardQtdeBebidas) || 0,
        outros: parseInt(cardQtdeOutros) || 0,
        textoExibido: promoDescricaoTexto
      });

      const { error } = await supabase
        .from("promotions")
        .update({
          nome: promoNomeExibido,
          descricao: cardDescricaoEstruturada,
          preco: parseFloat(promoPreco) || 0,
          preco_antigo: promoPrecoAntigo ? parseFloat(promoPrecoAntigo) : null,
          image_url: imageUrl || null
        })
        .eq("id", selectedPromoId);

      setLoading(false);
      if (error) alert("Erro ao salvar card: " + error.message);
      else {
        alert("Card regular e limites salvos com sucesso!");
        fetchData();
      }
      return;
    }

    if (!nome || !categoryId) return alert("Nome e Categoria são obrigatórios!");

    const sizesArray: ProductSize[] = [];
    if (precoBrotinho) sizesArray.push({ label: "Brotinho", preco: parseFloat(precoBrotinho) });
    if (precoMedia) sizesArray.push({ label: "Média", preco: parseFloat(precoMedia) });
    if (precoGrande) sizesArray.push({ label: "Grande", preco: parseFloat(precoGrande) });

    const productData = {
      nome,
      descricao: descricao || null,
      preco_base: precoBase ? parseFloat(precoBase) : null,
      category_id: categoryId,
      image_url: imageUrl || null,
      ativo,
      sizes: sizesArray as any, 
    };

    if (editingProduct) {
      const { error } = await supabase
        .from("products")
        .update(productData)
        .eq("id", editingProduct.id);
      
      if (error) alert("Erro ao modificar: " + error.message);
      else {
        alert("Produto modificado!");
        handleClearForm();
        fetchData();
      }
    } else {
      const { error } = await supabase.from("products").insert([productData]);
      if (error) alert("Erro ao inserir: " + error.message);
      else {
        alert("Produto inserido!");
        handleClearForm();
        fetchData();
      }
    }
  };

  const handleEditClick = (product: Product) => {
    setActiveTab("CARDAPIO");
    setEditingProduct(product);
    setNome(product.nome);
    setDescricao(product.descricao || "");
    setPrecoBase(product.preco_base?.toString() || "");
    setCategoryId(product.category_id);
    setImageUrl(product.image_url || "");
    setAtivo(product.ativo);

    const sizes = product.sizes as ProductSize[] | undefined;
    if (sizes && sizes.length > 0) {
      const brotinho = sizes.find(s => s.label === "Brotinho");
      const media = sizes.find(s => s.label === "Média");
      const grande = sizes.find(s => s.label === "Grande");

      setPrecoBrotinho(brotinho ? brotinho.preco.toString() : "");
      setPrecoMedia(media ? media.preco.toString() : "");
      setPrecoGrande(grande ? grande.preco.toString() : "");
    } else {
      setPrecoBrotinho("");
      setPrecoMedia("");
      setPrecoGrande("");
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm("Deseja mesmo retirar este produto do cardápio?")) {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) alert("Erro ao remover: " + error.message);
      else {
        alert("Produto removido!");
        fetchData();
      }
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-[var(--color-cream)] px-4">
        <form onSubmit={handleLogin} className="w-full max-w-sm bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
          <h2 className="font-display text-2xl text-[#3d2b1f] font-black text-center mb-6 uppercase tracking-wide">
            Acesso Restrito Admin
          </h2>
          <div className="space-y-4">
            <input
              type="password"
              placeholder="Digite a senha administrativa"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#E33B19] font-medium text-slate-800"
            />
            <button
              type="submit"
              className="w-full bg-[#E33B19] text-white font-black py-3 rounded-xl border-2 border-[#FFD166] hover:scale-[1.02] transition-transform uppercase tracking-wider text-sm"
            >
              Entrar no Painel
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* CABEÇALHO DO PAINEL */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b pb-4 gap-4">
        <h1 className="font-display text-2xl md:text-3xl text-[#3d2b1f] font-black uppercase">
          Gerenciador de Dados • Mussarela & Cia
        </h1>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link 
            to="/" 
            className="flex-1 sm:flex-none text-center text-xs font-black uppercase tracking-wider bg-[#3d2b1f] text-white border border-[#3d2b1f] px-4 py-2.5 rounded-lg hover:bg-opacity-90 transition-all shadow-sm"
          >
            🏠 Voltar para o Site
          </Link>
          <button 
            onClick={() => setIsAuthenticated(false)}
            className="flex-1 sm:flex-none text-xs font-black uppercase tracking-wider bg-gray-200 text-slate-700 px-4 py-2.5 rounded-lg hover:bg-gray-300 transition-all"
          >
            Sair do Painel
          </button>
        </div>
      </div>

      {/* NAVEGAÇÃO POR ABAS CRISTALINAS */}
      <div className="flex gap-2 mb-6 border-b pb-px">
        <button
          onClick={() => { setActiveTab("CARDAPIO"); handleClearForm(); }}
          className={`px-5 py-3 rounded-t-xl font-display text-xs md:text-sm font-black uppercase tracking-wider border-t border-x transition-all ${
            activeTab === "CARDAPIO" 
              ? "bg-white border-gray-200 text-[#E33B19] -mb-px shadow-[0_-2px_6px_rgba(0,0,0,0.03)]" 
              : "bg-gray-50 border-transparent text-slate-500 hover:bg-gray-100"
          }`}
        >
          🍕 Cardápio Regular
        </button>
        <button
          onClick={() => { setActiveTab("PROMO"); }}
          className={`px-5 py-3 rounded-t-xl font-display text-xs md:text-sm font-black uppercase tracking-wider border-t border-x transition-all ${
            activeTab === "PROMO" 
              ? "bg-white border-gray-200 text-red-600 -mb-px shadow-[0_-2px_6px_rgba(0,0,0,0.03)]" 
              : "bg-gray-50 border-transparent text-slate-500 hover:bg-gray-100"
          }`}
        >
          🔥 Central de Promoções e Banners
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* COLUNA ESQUERDA: FORMULÁRIO DINÂMICO */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-fit">
          <h2 className="font-display text-xl text-[#3d2b1f] font-black mb-4 uppercase">
            {activeTab === "PROMO" ? "Configurar Campanhas" : editingProduct ? "Modificar Item" : "Novo Item do Cardápio"}
          </h2>
          
          {/* CONTEXTO DA ABA DE PROMOÇÕES */}
          {activeTab === "PROMO" ? (
            <div className="space-y-6">
              
              {/* ─── QUADRO EXCLUSIVO E INDEPENDENTE: PROMOÇÃO DO DIA / CARROSSEL ─── */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50/30 p-4 rounded-2xl border-2 border-dashed border-amber-200 space-y-3 shadow-sm">
                <div className="flex items-center gap-2 border-b border-amber-100 pb-1.5">
                  <span className="text-lg">🎯</span>
                  <h3 className="font-display text-xs font-black uppercase text-amber-950 tracking-wide">
                    1. Arte do Topo (Promoção do Dia)
                  </h3>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-700 mb-1">Subir Imagem da Arte da Campanha</label>
                  <input
                    type="file" accept="image/*"
                    onChange={(e) => handleFileUpload(e, "CARROSSEL")}
                    disabled={uploading}
                    className="text-[11px] text-slate-700 w-full file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border file:border-gray-300 file:bg-white file:text-slate-800 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-600 mb-1">Nome Inventado para a Promoção</label>
                  <input
                    type="text" value={topBannerNome}
                    onChange={(e) => setTopBannerNome(e.target.value)}
                    className="w-full px-2 py-1.5 text-xs rounded-lg border border-gray-300 text-slate-800 font-medium"
                    placeholder="Ex: Super Combo da Maré, Combo da Copa..."
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-600 mb-1">Texto de Descrição Comercial</label>
                  <textarea
                    value={textoInformativo}
                    onChange={(e) => setTextoInformativo(e.target.value)}
                    className="w-full px-2 py-1.5 text-xs rounded-lg border border-gray-300 h-12 resize-none text-slate-800 font-medium"
                    placeholder="Ex: Leve nossa seleção campeã com preço reduzido por tempo limitado!"
                  />
                </div>

                {/* PAINEL DINÂMICO DE LIMITES POR TIPOS DE PRODUTOS (TOPO) */}
                <div className="bg-white p-2.5 rounded-xl border border-amber-200 space-y-2">
                  <span className="block text-[9px] font-black uppercase text-amber-900 tracking-wider">
                    🔢 Quantidades Liberadas no Modal:
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[9px] font-bold text-slate-600 mb-0.5">Pizzas Salgadas</label>
                      <input
                        type="number" min="0" value={qtdeSalgadas}
                        onChange={(e) => setQtdeSalgadas(e.target.value)}
                        className="w-full px-2 py-1 text-xs rounded border text-center font-bold text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-600 mb-0.5">Pizzas Doces</label>
                      <input
                        type="number" min="0" value={qtdeDoces}
                        onChange={(e) => setQtdeDoces(e.target.value)}
                        className="w-full px-2 py-1 text-xs rounded border text-center font-bold text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-600 mb-0.5">Bebidas / Refri</label>
                      <input
                        type="number" min="0" value={qtdeBebidas}
                        onChange={(e) => setQtdeBebidas(e.target.value)}
                        className="w-full px-2 py-1 text-xs rounded border text-center font-bold text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-600 mb-0.5">Salgados / Comidinhas</label>
                      <input
                        type="number" min="0" value={qtdeOutros}
                        onChange={(e) => setQtdeOutros(e.target.value)}
                        className="w-full px-2 py-1 text-xs rounded border text-center font-bold text-slate-800"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-600 mb-0.5">Preço Combo (R$)</label>
                    <input
                      type="number" step="0.01" value={topBannerPreco}
                      onChange={(e) => setTopBannerPreco(e.target.value)}
                      className="w-full px-2 py-1 text-xs rounded-lg border border-gray-300 text-slate-800 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-600 mb-0.5">Preço Antigo (R$)</label>
                    <input
                      type="number" step="0.01" value={topBannerPrecoAntigo}
                      onChange={(e) => setTopBannerPrecoAntigo(e.target.value)}
                      className="w-full px-2 py-1 text-xs rounded-lg border border-gray-300 text-slate-800 font-medium"
                      placeholder="Opcional"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-600 mb-1">Validade (Data e Hora que some do site)</label>
                  <input
                    type="datetime-local" value={bannerValidTo}
                    onChange={(e) => {
                      setBannerValidTo(e.target.value);
                      localStorage.setItem("pizzaria_banner_valid_to", e.target.value);
                    }}
                    className="w-full px-2 py-1 text-xs rounded-lg border border-gray-300 bg-white text-slate-800 font-medium"
                  />
                </div>

                <button
                  type="button" onClick={handleSaveTopBanner} disabled={loading || uploading}
                  className="w-full bg-amber-600 text-white font-black py-2 rounded-xl text-xs uppercase border-2 border-amber-400 tracking-wider shadow-sm"
                >
                  Salvar Promoção do Dia (Carrossel)
                </button>
              </div>

              {/* ─── QUADRO SEPARADO: EDITAR COMPOSIÇÃO DOS 4 CARDS DE BAIXO ENGENHARADO ─── */}
              <form onSubmit={handleSaveSubmit} className="space-y-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 pb-1">
                  <span className="text-lg">🔥</span>
                  <h3 className="font-display text-xs font-black uppercase text-slate-800 tracking-wide">
                    2. Configurar os 4 Cards de Baixo
                  </h3>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-slate-600 mb-1">Qual Card deseja atualizar?</label>
                  <select
                    value={selectedPromoId}
                    onChange={(e) => handlePromoChange(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-slate-800 font-bold"
                  >
                    {promotions.map(p => (
                      <option key={p.id} value={p.id}>{p.badge}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-slate-400 mb-1">Etiqueta de Subtítulo (Fixo no Banco)</label>
                  <input
                    type="text" value={promoBadgeFixa} disabled
                    className="w-full px-3 py-2 rounded-lg bg-gray-100 border border-gray-200 text-gray-500 font-black cursor-not-allowed uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-slate-600 mb-1">Título do que é Oferecido</label>
                  <input
                    type="text" value={promoNomeExibido}
                    onChange={(e) => setPromoNomeExibido(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 text-slate-800 font-medium"
                    placeholder="Ex: Kit da Maré, 2 Pizzas G"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-slate-600 mb-1">Texto de Descrição Comercial</label>
                  <textarea
                    value={promoDescricaoTexto}
                    onChange={(e) => setPromoDescricaoTexto(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 h-16 resize-none text-slate-800 font-medium"
                    placeholder="Descreva a oferta de forma atraente..."
                  />
                </div>

                {/* PAINEL DINÂMICO DE LIMITES INJETADO TAMBÉM NOS CARDS DE BAIXO! */}
                <div className="bg-slate-50 p-2.5 rounded-xl border border-gray-200 space-y-2">
                  <span className="block text-[9px] font-black uppercase text-slate-700 tracking-wider">
                    🔢 Limites de Itens para este Card:
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[9px] font-bold text-slate-600 mb-0.5">Pizzas Salgadas</label>
                      <input
                        type="number" min="0" value={cardQtdeSalgadas}
                        onChange={(e) => setCardQtdeSalgadas(e.target.value)}
                        className="w-full px-2 py-1 text-xs rounded border text-center font-bold text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-600 mb-0.5">Pizzas Doces</label>
                      <input
                        type="number" min="0" value={cardQtdeDoces}
                        onChange={(e) => setCardQtdeDoces(e.target.value)}
                        className="w-full px-2 py-1 text-xs rounded border text-center font-bold text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-600 mb-0.5">Bebidas / Refri</label>
                      <input
                        type="number" min="0" value={cardQtdeBebidas}
                        onChange={(e) => setCardQtdeBebidas(e.target.value)}
                        className="w-full px-2 py-1 text-xs rounded border text-center font-bold text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-600 mb-0.5">Salgados / Comidinhas</label>
                      <input
                        type="number" min="0" value={cardQtdeOutros}
                        onChange={(e) => setCardQtdeOutros(e.target.value)}
                        className="w-full px-2 py-1 text-xs rounded border text-center font-bold text-slate-800"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black uppercase text-slate-600 mb-1">Preço Atual (R$)</label>
                    <input
                      type="number" step="0.01" value={promoPreco}
                      onChange={(e) => setPromoPreco(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 text-slate-800 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase text-slate-600 mb-1">Preço Antigo Riscado</label>
                    <input
                      type="number" step="0.01" value={promoPrecoAntigo}
                      onChange={(e) => setPromoPrecoAntigo(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 text-slate-800 font-medium"
                      placeholder="Opcional"
                    />
                  </div>
                </div>

                <button
                  type="submit" disabled={uploading || loading}
                  className="w-full bg-[#E33B19] text-white font-black py-2.5 rounded-xl border-2 border-[#FFD166] uppercase text-xs tracking-wider"
                >
                  Salvar Alterações do Card
                </button>
              </form>
            </div>
          ) : (
            // ABA CARDÁPIO REGULAR (PRODUTOS NORMAIS)
            <form onSubmit={handleSaveSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase text-slate-600 mb-1">Nome do Produto</label>
                <input
                  type="text" value={nome} onChange={(e) => setNome(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 text-slate-800 font-medium"
                  placeholder="Ex: Pizza de Calabresa"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-slate-600 mb-1">Descrição / Detalhes</label>
                <textarea
                  value={descricao} onChange={(e) => setDescricao(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 h-16 resize-none text-slate-800 font-medium"
                  placeholder="Ingredientes..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase text-slate-600 mb-1">Preço Padrão (R$)</label>
                  <input
                    type="number" step="0.01" value={precoBase} onChange={(e) => setPrecoBase(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 text-slate-800 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase text-slate-600 mb-1">Categoria do Site</label>
                  <select
                    value={categoryId} onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-slate-800 font-bold"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="bg-gray-50 p-3 rounded-xl border border-dashed border-gray-200 space-y-2">
                <span className="block text-[10px] font-black uppercase text-gray-500 tracking-wider">Tamanhos Adicionais (Opcional)</span>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[9px] font-black uppercase text-slate-600 mb-0.5">Brotinho</label>
                    <input
                      type="number" step="0.01" value={precoBrotinho} onChange={(e) => setPrecoBrotinho(e.target.value)}
                      className="w-full px-2 py-1 text-xs rounded border border-gray-300 text-slate-800 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-black uppercase text-slate-600 mb-0.5">Média</label>
                    <input
                      type="number" step="0.01" value={precoMedia} onChange={(e) => setPrecoMedia(e.target.value)}
                      className="w-full px-2 py-1 text-xs rounded border border-gray-300 text-slate-800 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-black uppercase text-slate-600 mb-0.5">Grande</label>
                    <input
                      type="number" step="0.01" value={precoGrande} onChange={(e) => setPrecoGrande(e.target.value)}
                      className="w-full px-2 py-1 text-xs rounded border border-gray-300 text-slate-800 font-bold"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 py-1">
                <input
                  type="checkbox" id="ativo" checked={ativo} onChange={(e) => setAtivo(e.target.checked)}
                  className="size-4 accent-[#E33B19]"
                />
                <label htmlFor="ativo" className="text-sm font-bold text-slate-800 cursor-pointer">Disponível no Site</label>
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-slate-600 mb-1">Foto do Produto</label>
                <input
                  type="file" accept="image/*"
                  onChange={(e) => handleFileUpload(e, "ITEM")}
                  disabled={uploading}
                  className="text-xs text-slate-700 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border file:border-gray-300 file:bg-gray-50 file:text-slate-800 hover:file:bg-gray-100 cursor-pointer w-full"
                />
                {imageUrl && (
                  <div className="mt-2 text-center border p-2 rounded-xl bg-gray-50">
                    <img src={imageUrl} alt="Preview" className="h-16 mx-auto object-cover rounded-lg border shadow-inner" />
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="submit" disabled={uploading || loading}
                  className="flex-1 bg-[#E33B19] text-white font-black py-2.5 rounded-xl border-2 border-[#FFD166] uppercase text-xs tracking-wider"
                >
                  {editingProduct ? "Salvar Alterações" : "Inserir Produto"}
                </button>
                {editingProduct && (
                  <button
                    type="button" onClick={handleClearForm}
                    className="bg-gray-100 hover:bg-gray-200 text-slate-700 font-bold px-4 py-2.5 rounded-xl text-xs uppercase"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </form>
          )}
        </div>

        {/* COLUNA DIREITA: LISTA DE PRODUTOS VINDOS DO SUPABASE */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h2 className="font-display text-xl text-[#3d2b1f] font-black mb-4 uppercase">
            Cardápio Ativo no Supabase ({products.length} itens)
          </h2>

          {loading ? (
            <p className="text-sm font-bold text-slate-500 animate-pulse">Carregando dados do Supabase...</p>
          ) : (
            <div className="overflow-y-auto max-h-[580px] space-y-3 pr-2">
              {products.map((p) => {
                const currentSizes = p.sizes as ProductSize[] | undefined;

                return (
                  <div key={p.id} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-gray-50 hover:bg-gray-100/70 transition">
                    <div className="flex items-center gap-3">
                      {p.image_url ? (
                        <img src={p.image_url} alt={p.nome} className="size-12 rounded-lg object-cover bg-gray-200 border shadow-sm" />
                      ) : (
                        <div className="size-12 rounded-lg bg-gray-200 flex items-center justify-center text-lg">🍕</div>
                      )}
                      <div>
                        <h4 className="font-bold text-sm text-[#3d2b1f]">{p.nome}</h4>
                        <p className="text-xs text-slate-600 line-clamp-1 max-w-sm font-medium">{p.descricao || "Sem descrição cadastrada."}</p>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mt-0.5">
                          <span className="text-xs font-black text-[#E33B19]">
                            Base: {p.preco_base ? `R$ ${p.preco_base.toFixed(2)}` : "Não def."}
                          </span>
                          {currentSizes && currentSizes.length > 0 && (
                            <div className="flex gap-1.5 text-[10px] bg-amber-50 text-amber-800 px-1.5 py-0.5 rounded border border-amber-100 font-bold">
                              {currentSizes.map(s => (
                                <span key={s.label}>{s.label[0]}: R${s.preco.toFixed(1)}</span>
                              ))}
                            </div>
                          )}
                        </div>
                        {!p.ativo && (
                          <span className="inline-block mt-1 bg-red-100 text-red-700 text-[9px] font-black uppercase px-2 py-0.5 rounded">Pausado</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditClick(p)}
                        className="bg-white hover:bg-gray-200 border text-slate-700 text-xs font-bold px-3 py-1.5 rounded-lg transition"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(p.id)}
                        className="bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold px-3 py-1.5 rounded-lg transition"
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}