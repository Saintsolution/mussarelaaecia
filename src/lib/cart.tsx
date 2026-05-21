import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export interface CartItem {
  id: string;
  nome: string;
  preco: number;
  quantidade: number;
  // --- SUPORTE AOS SABORES SELECIONADOS NO COMBO ---
  detalhes?: string[]; 
}

// Estrutura simplificada que o modal envia para o carrinho
interface NewPromoComboInput {
  id: string;
  nome: string;
  badge: string;
  preco: number;
  detalhes: string[];
}

interface CartContextValue {
  items: CartItem[];
  count: number;
  total: number;
  add: (item: Omit<CartItem, "quantidade">, qty?: number) => void;
  // --- NOVA FUNÇÃO DECLARADA NO CONTEXTO ---
  addPromoCombo: (combo: NewPromoComboInput) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "pizzaria-cart-v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const add: CartContextValue["add"] = useCallback((item, qty = 1) => {
    setItems((prev) => {
      const found = prev.find((i) => i.id === item.id);
      if (found) {
        return prev.map((i) => (i.id === item.id ? { ...i, quantidade: i.quantidade + qty } : i));
      }
      return [...prev, { ...item, quantidade: qty }];
    });
  }, []);

  // --- IMPLEMENTAÇÃO DA FUNÇÃO ADICIONAR COMBO ---
  const addPromoCombo = useCallback((combo: NewPromoComboInput) => {
    setItems((prev) => {
      // Como o cliente pode adicionar duas vezes o mesmo combo mas com SABORES DIFERENTES,
      // nós criamos uma chave única combinando o ID da promoção com a string dos sabores escolhidos.
      // Assim, se ele pedir um combo idêntico com sabores iguais, soma a quantidade. Se mudar o sabor, cria uma linha nova!
      const uniqueComboId = `${combo.id}-${combo.detalhes.join("-")}`;

      const found = prev.find((i) => i.id === uniqueComboId);
      if (found) {
        return prev.map((i) => (i.id === uniqueComboId ? { ...i, quantidade: i.quantidade + 1 } : i));
      }

      return [
        ...prev,
        {
          id: uniqueComboId,
          nome: `${combo.badge}: ${combo.nome}`,
          preco: combo.preco,
          quantidade: 1,
          detalhes: combo.detalhes, // Injeta o array de sabores no carrinho!
        },
      ];
    });
  }, []);

  const remove = useCallback((id: string) => setItems((p) => p.filter((i) => i.id !== id)), []);
  const setQty = useCallback((id: string, qty: number) => {
    setItems((p) => (qty <= 0 ? p.filter((i) => i.id !== id) : p.map((i) => (i.id === id ? { ...i, quantidade: qty } : i))));
  }, []);
  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<CartContextValue>(() => {
    const count = items.reduce((s, i) => s + i.quantidade, 0);
    const total = items.reduce((s, i) => s + i.preco * i.quantidade, 0);
    // Adicionado o addPromoCombo no retorno do hook
    return { items, count, total, add, addPromoCombo, remove, setQty, clear };
  }, [items, add, addPromoCombo, remove, setQty, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}