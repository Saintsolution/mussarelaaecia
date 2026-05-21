import heroSpread from "@/assets/hero-spread.jpg";
import heroPromo from "@/assets/hero-promo.jpg";

export type CategorySlug =
  | "pizzas-salgadas"
  | "pizzas-doces"
  | "bebidas"
  | "salgadinhos"
  | "comidinhas"
  | "promocoes";

export interface Category {
  slug: CategorySlug;
  name: string;
  emoji: string;
  startingAt: number;
  blurb: string;
}

export const categories: Category[] = [
  { slug: "pizzas-salgadas", name: "Pizzas Salgadas", emoji: "🍕", startingAt: 32, blurb: "Massa fina, queijo derretendo" },
  { slug: "pizzas-doces", name: "Pizzas Doces", emoji: "🍫", startingAt: 28, blurb: "Sobremesa em formato de pizza" },
  { slug: "bebidas", name: "Bebidas", emoji: "🥤", startingAt: 5, blurb: "Geladinhas pra acompanhar" },
  { slug: "comidinhas", name: "Comidinhas", emoji: "🍟", startingAt: 8, blurb: "Pra petiscar com a galera" },
  { slug: "salgadinhos", name: "Salgadinhos", emoji: "🥟", startingAt: 2, blurb: "Coxinha, kibe, enroladinho" },
];

export interface Product {
  id: string;
  categoria: CategorySlug;
  nome: string;
  descricao: string;
  preco: number;
  precoPromocional?: number;
  emoji: string;
}

export const products: Product[] = [
  { id: "p1", categoria: "pizzas-salgadas", nome: "Pizza Calabresa G", descricao: "Calabresa fatiada, cebola e azeitona", preco: 49.9, emoji: "🍕" },
  { id: "p2", categoria: "pizzas-salgadas", nome: "Pizza Quatro Queijos G", descricao: "Mussarela, provolone, parmesão e gorgonzola", preco: 56.9, emoji: "🧀" },
  { id: "p3", categoria: "pizzas-salgadas", nome: "Pizza Portuguesa G", descricao: "Presunto, ovos, cebola, ervilha e azeitona", preco: 54.9, emoji: "🍕" },
  { id: "p4", categoria: "pizzas-doces", nome: "Pizza Chocolate com Morango", descricao: "Chocolate ao leite e morangos frescos", preco: 38.9, emoji: "🍫" },
  { id: "p5", categoria: "pizzas-doces", nome: "Pizza Romeu e Julieta", descricao: "Queijo com goiabada cremosa", preco: 34.9, emoji: "🍓" },
  { id: "b1", categoria: "bebidas", nome: "Coca-Cola 2L", descricao: "Gelada", preco: 14.0, emoji: "🥤" },
  { id: "b2", categoria: "bebidas", nome: "Guaraná Antarctica 2L", descricao: "Gelada", preco: 12.0, emoji: "🥤" },
  { id: "b3", categoria: "bebidas", nome: "Suco de Maracujá 500ml", descricao: "Natural da casa", preco: 8.0, emoji: "🧃" },
  { id: "c1", categoria: "comidinhas", nome: "Batata Frita Grande", descricao: "Crocante com cheddar e bacon", preco: 24.9, emoji: "🍟" },
  { id: "c2", categoria: "comidinhas", nome: "Frango à Passarinho", descricao: "300g com alho frito", preco: 28.9, emoji: "🍗" },
  { id: "s1", categoria: "salgadinhos", nome: "10 Coxinhas", descricao: "Recheio de frango com catupiry", preco: 22.0, emoji: "🥟" },
  { id: "s2", categoria: "salgadinhos", nome: "10 Kibes", descricao: "Carne temperada da Maré", preco: 22.0, emoji: "🥟" },
  { id: "s3", categoria: "salgadinhos", nome: "10 Enroladinhos", descricao: "Salsicha empanada", preco: 18.0, emoji: "🌯" },
];

export interface Promotion {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  precoAntigo: number;
  badge?: string;
  emoji: string;
}

export const promotions: Promotion[] = [
  { id: "promo1", nome: "Kit Especial da Maré", descricao: "Brotinho + mini sobremesa + bebida", preco: 36.9, precoAntigo: 48, emoji: "🎁", badge: "Da casa" },
  { id: "promo2", nome: "2 Pizzas Grandes", descricao: "Escolha os sabores que quiser", preco: 79.9, precoAntigo: 99, emoji: "🍕", badge: "+ Pedida" },
  { id: "promo3", nome: "Pizza Grande + Refri 2L", descricao: "Pizza 2 sabores + refrigerante 2L", preco: 66.9, precoAntigo: 85, emoji: "🥤" },
  { id: "promo4", nome: "20 Salgadinhos Sortidos", descricao: "Coxinha, kibe, enroladinho à escolha", preco: 32.0, precoAntigo: 44, emoji: "🥟", badge: "Festa" },
];

export interface HeroHotspot {
  x: number; // %
  y: number;
  label: string;
  slug: CategorySlug;
}

export interface HeroSlide {
  id: string;
  image: string;
  tipo: "hotspots" | "promo";
  titulo?: string;
  subtitulo?: string;
  ctaLabel?: string;
  ctaSlug?: CategorySlug;
  hotspots?: HeroHotspot[];
}

export const heroSlides: HeroSlide[] = [
  {
    id: "h1",
    image: heroSpread,
    tipo: "hotspots",
    titulo: "Direto da Maré pro seu coração",
    subtitulo: "Passe o mouse sobre os produtos pra abrir o cardápio",
    hotspots: [
      { x: 18, y: 30, label: "Bebidas", slug: "bebidas" },
      { x: 50, y: 26, label: "Pizzas Salgadas", slug: "pizzas-salgadas" },
      { x: 86, y: 22, label: "Comidinhas", slug: "comidinhas" },
      { x: 15, y: 76, label: "Salgadinhos", slug: "salgadinhos" },
      { x: 88, y: 78, label: "Pizzas Doces", slug: "pizzas-doces" },
    ],
  },
  {
    id: "h2",
    image: heroPromo,
    tipo: "promo",
    titulo: "Combo da Maré",
    subtitulo: "2 pizzas grandes + refri 2L a partir de R$ 66,90",
    ctaLabel: "Ver Promoções",
    ctaSlug: "promocoes",
  },
];