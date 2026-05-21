import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import {
  useCategoryBySlug,
  useProductsByCategory,
  usePromotions,
  type Product,
  type ProductSize,
} from "@/lib/catalog";
import { useCart } from "@/lib/cart";
import { formatBRL } from "@/lib/whatsapp";

export const Route = createFileRoute("/cardapio/$categoria")({
  component: CategoryPage,
  head: ({ params }) => {
    const title = `Cardápio — Pizzaria da Pizza (${params.categoria})`;
    return {
      meta: [
        { title },
        { name: "description", content: `Cardápio da Pizzaria da Pizza, direto da Maré.` },
        { property: "og:title", content: title },
      ],
    };
  },
});

function CategoryPage() {
  const { categoria } = Route.useParams();
  const isPromo = categoria === "promocoes";
  const { data: cat, isLoading: catLoading } = useCategoryBySlug(isPromo ? undefined : categoria);
  const { data: products = [], isLoading: prodLoading } = useProductsByCategory(cat?.id);
  const { data: promotions = [], isLoading: promoLoading } = usePromotions();

  const loading = isPromo ? promoLoading : catLoading || prodLoading;
  const title = isPromo ? "Promoções 🔥" : cat ? `${cat.emoji ?? "🍕"} ${cat.name}` : "Cardápio";

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-10 md:py-14">
        <div className="mb-8">
          <Link to="/" className="text-sm text-muted-foreground hover:text-primary">← Voltar</Link>
          <h1 className="font-display text-4xl md:text-5xl mt-2">{title}</h1>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-80 rounded-2xl border border-border bg-card animate-pulse" />
            ))}
          </div>
        ) : isPromo ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {promotions.map((p) => (
              <PromoCard
                key={p.id}
                id={p.id}
                nome={p.nome}
                descricao={p.descricao}
                image_url={p.image_url}
                preco={p.preco}
                preco_antigo={p.preco_antigo}
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
            {products.length === 0 && (
              <p className="text-muted-foreground col-span-full">Nenhum produto cadastrado nesta categoria ainda.</p>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();
  const hasSizes = product.sizes.length > 0;
  const [size, setSize] = useState<ProductSize | null>(hasSizes ? product.sizes[0] : null);
  const preco = size?.preco ?? product.preco_base ?? 0;

  return (
    <article className="rounded-2xl border border-border bg-card overflow-hidden flex flex-col hover:-translate-y-1 transition shadow-[var(--shadow-warm)]">
      <div className="aspect-[4/3] bg-secondary/40 overflow-hidden relative">
        {product.image_url && (
          <img src={product.image_url} alt={product.nome} loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
        )}
      </div>
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="font-display text-lg">{product.nome}</h3>
        {product.descricao && <p className="text-sm text-muted-foreground mt-1 flex-1">{product.descricao}</p>}

        {hasSizes && (
          <div className="mt-3 flex gap-2">
            {product.sizes.map((s) => (
              <button
                key={s.label}
                type="button"
                onClick={() => setSize(s)}
                className={`flex-1 rounded-lg border px-2 py-1.5 text-xs font-bold uppercase tracking-wide transition ${
                  size?.label === s.label
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/50"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        )}

        <div className="mt-4 flex items-center justify-between gap-3">
          <span className="font-display text-2xl text-primary">{formatBRL(preco)}</span>
          <button
            type="button"
            onClick={() =>
              add({
                id: hasSizes ? `${product.id}-${size?.label}` : product.id,
                nome: hasSizes ? `${product.nome} ${size?.label}` : product.nome,
                preco,
              })
            }
            className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground font-semibold px-4 py-2 hover:brightness-110 transition"
          >
            <Plus className="size-4" /> Adicionar
          </button>
        </div>
      </div>
    </article>
  );
}

function PromoCard(props: {
  id: string;
  nome: string;
  descricao: string | null;
  image_url: string | null;
  preco: number;
  preco_antigo: number | null;
}) {
  const { add } = useCart();
  return (
    <article className="rounded-2xl border border-border bg-card overflow-hidden flex flex-col hover:-translate-y-1 transition shadow-[var(--shadow-warm)]">
      <div className="aspect-[4/3] bg-secondary/40 overflow-hidden relative">
        {props.image_url && (
          <img src={props.image_url} alt={props.nome} loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
        )}
      </div>
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="font-display text-lg">{props.nome}</h3>
        {props.descricao && <p className="text-sm text-muted-foreground mt-1 flex-1">{props.descricao}</p>}
        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-2xl text-primary">{formatBRL(props.preco)}</span>
            {props.preco_antigo && (
              <span className="text-xs line-through text-muted-foreground">{formatBRL(props.preco_antigo)}</span>
            )}
          </div>
          <button
            type="button"
            onClick={() => add({ id: props.id, nome: props.nome, preco: props.preco })}
            className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground font-semibold px-4 py-2 hover:brightness-110 transition"
          >
            <Plus className="size-4" /> Adicionar
          </button>
        </div>
      </div>
    </article>
  );
}