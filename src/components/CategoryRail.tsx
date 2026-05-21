import { Link } from "@tanstack/react-router";
import { useCategories, useCategoryStartingPrices } from "@/lib/catalog";
import { formatBRL } from "@/lib/whatsapp";

export function CategoryRail() {
  const { data: categories = [], isLoading } = useCategories();
  const { data: startingAt = {} } = useCategoryStartingPrices();

  if (isLoading && categories.length === 0) {
    return (
      <section className="py-10 md:py-14">
        <div className="container mx-auto px-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-36 rounded-2xl border border-border bg-card/60 animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="py-10 md:py-14">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
          {categories.map((c) => (
            <Link
              key={c.slug}
              to="/cardapio/$categoria"
              params={{ categoria: c.slug }}
              className="group relative rounded-2xl border border-border bg-card/60 hover:bg-card transition p-5 md:p-6 text-center hover:-translate-y-1 hover:shadow-[var(--shadow-warm)] hover:border-primary/50"
            >
              <div className="text-5xl md:text-6xl mb-3 transition-transform group-hover:scale-110">{c.emoji ?? "🍕"}</div>
              <h3 className="font-display text-sm md:text-base uppercase tracking-wide text-cream">{c.name}</h3>
              {startingAt[c.id] !== undefined && (
                <p className="text-xs text-muted-foreground mt-1">A partir de {formatBRL(startingAt[c.id])}</p>
              )}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}