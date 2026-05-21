import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Category {
  id: string;
  slug: string;
  name: string;
  emoji: string | null;
  image_url: string | null;
  ordem: number;
}

export interface ProductSize {
  label: string;
  preco: number;
}

export interface Product {
  id: string;
  category_id: string;
  nome: string;
  descricao: string | null;
  image_url: string | null;
  sizes: ProductSize[];
  preco_base: number | null;
  destaque: boolean;
  ordem: number;
}

export interface Promotion {
  id: string;
  nome: string;
  descricao: string | null;
  image_url: string | null;
  preco: number;
  preco_antigo: number | null;
  badge: string | null;
  ordem: number;
}

function normalizeSizes(raw: unknown): ProductSize[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((s) => {
      if (!s || typeof s !== "object") return null;
      const obj = s as Record<string, unknown>;
      const label = typeof obj.label === "string" ? obj.label : null;
      const preco = Number(obj.preco);
      if (!label || Number.isNaN(preco)) return null;
      return { label, preco };
    })
    .filter((x): x is ProductSize => x !== null);
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async (): Promise<Category[]> => {
      const { data, error } = await supabase
        .from("categories")
        .select("id, slug, name, emoji, image_url, ordem")
        .order("ordem", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Category[];
    },
  });
}

export function useCategoryStartingPrices() {
  return useQuery({
    queryKey: ["category-starting-prices"],
    queryFn: async (): Promise<Record<string, number>> => {
      const { data, error } = await supabase
        .from("products")
        .select("category_id, preco_base");
      if (error) throw error;
      const map: Record<string, number> = {};
      for (const row of data ?? []) {
        const price = Number((row as { preco_base: number | null }).preco_base);
        const cat = (row as { category_id: string }).category_id;
        if (!cat || Number.isNaN(price)) continue;
        if (map[cat] === undefined || price < map[cat]) map[cat] = price;
      }
      return map;
    },
  });
}

export function useCategoryBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: ["category", slug],
    enabled: !!slug,
    queryFn: async (): Promise<Category | null> => {
      const { data, error } = await supabase
        .from("categories")
        .select("id, slug, name, emoji, image_url, ordem")
        .eq("slug", slug!)
        .maybeSingle();
      if (error) throw error;
      return (data as Category | null) ?? null;
    },
  });
}

export function useProductsByCategory(categoryId: string | undefined) {
  return useQuery({
    queryKey: ["products", categoryId],
    enabled: !!categoryId,
    queryFn: async (): Promise<Product[]> => {
      const { data, error } = await supabase
        .from("products")
        .select("id, category_id, nome, descricao, image_url, sizes, preco_base, destaque, ordem")
        .eq("category_id", categoryId!)
        .order("ordem", { ascending: true });
      if (error) throw error;
      return (data ?? []).map((p) => ({
        ...(p as Omit<Product, "sizes"> & { sizes: unknown }),
        sizes: normalizeSizes((p as { sizes: unknown }).sizes),
      })) as Product[];
    },
  });
}

export function usePromotions() {
  return useQuery({
    queryKey: ["promotions"],
    queryFn: async (): Promise<Promotion[]> => {
      const { data, error } = await supabase
        .from("promotions")
        .select("id, nome, descricao, image_url, preco, preco_antigo, badge, ordem")
        .order("ordem", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Promotion[];
    },
  });
}