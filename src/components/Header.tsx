import { Link } from "@tanstack/react-router";
import { Menu, ShoppingCart, X } from "lucide-react";
import { useState, useEffect } from "react";
import logo from "@/assets/logo.png";
import { useCart } from "@/lib/cart";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { useCategories } from "@/lib/catalog";

export function Header() {
  const { count } = useCart();
  const [open, setOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { data: categories = [] } = useCategories();

  const whatsUrl = buildWhatsAppUrl("Olá! Gostaria de fazer um pedido na Pizzaria Mussarela & Cia 🍕");

  // Monitora o scroll para encolher o logo dinamicamente
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-[var(--color-cocoa)]/95 backdrop-blur supports-[backdrop-filter]:bg-[var(--color-cocoa)]/80 border-b border-border transition-all duration-300">
      <div className="container mx-auto px-4 h-16 md:h-20 flex items-center justify-between gap-4 relative">
        
        {/* LOGO GIGANTE, FLUTUANTE E REAJUSTADO */}
        <Link to="/" className="relative shrink-0 z-50">
          <img
            src={logo}
            alt="Pizzaria Mussarela & Cia"
            style={{ transformOrigin: 'top left' }}
            className={`absolute left-0 top-0 transition-all duration-300 ease-out select-none
              ${isScrolled 
                ? "w-28 md:w-40 drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)] translate-y-[-10px]" 
                : "w-64 md:w-[460px] drop-shadow-[0_16px_32px_rgba(0,0,0,0.7)] translate-y-[-4px]"
              }
            `}
          />
          {/* Espaçador invisível aumentado para dar sustentação ao layout */}
          <div className="w-28 md:w-56 h-12 transition-all duration-300" aria-hidden />
        </Link>

        {/* Desktop nav - Empurrado mais para a direita para dar espaço ao logo massivo */}
        <nav className="hidden lg:flex items-center gap-1 text-sm font-semibold uppercase tracking-wide ml-32 md:ml-48">
          {categories.map((c) => (
            <Link
              key={c.slug}
              to="/cardapio/$categoria"
              params={{ categoria: c.slug }}
              activeProps={{ className: "text-primary" }}
              className="px-3 py-2 rounded-md text-foreground/85 hover:text-primary transition-colors"
            >
              <span className="mr-1">{c.emoji}</span>
              {c.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={whatsUrl}
            target="_blank"
            rel="noreferrer"
            className="hidden sm:inline-flex items-center gap-2 rounded-full bg-[var(--color-whatsapp)] text-[var(--color-whatsapp-foreground)] font-semibold px-4 py-2 text-sm hover:brightness-110 transition"
          >
            <span>📱</span> WhatsApp
          </a>
          <Link
            to="/carrinho"
            className="relative inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-2 text-sm font-semibold hover:bg-card transition"
          >
            <ShoppingCart className="size-4" />
            <span className="hidden sm:inline">Carrinho</span>
            {count > 0 && (
              <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs font-bold rounded-full size-5 grid place-items-center shadow-[var(--shadow-pop)]">
                {count}
              </span>
            )}
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="lg:hidden p-2 rounded-md text-foreground/80 hover:text-foreground"
            aria-label="Menu"
          >
            {open ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
      </div>

      {/* Mobile sheet */}
      {open && (
        <div className="lg:hidden border-t border-border bg-[var(--color-cocoa)]">
          <nav className="container mx-auto px-4 py-4 grid gap-1">
            {categories.map((c) => (
              <Link
                key={c.slug}
                to="/cardapio/$categoria"
                params={{ categoria: c.slug }}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-card text-base font-semibold"
              >
                <span className="text-xl">{c.emoji}</span>
                {c.name}
              </Link>
            ))}
            <a
              href={whatsUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex justify-center items-center gap-2 rounded-full bg-[var(--color-whatsapp)] text-[var(--color-whatsapp-foreground)] font-bold px-4 py-3"
            >
              📱 Pedir pelo WhatsApp
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}