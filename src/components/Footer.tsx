import { Link } from "@tanstack/react-router";
import logo from "@/assets/logo.png";
import { useCategories } from "@/lib/catalog";
import { buildWhatsAppUrl, PHONE_DISPLAY } from "@/lib/whatsapp";

export function Footer() {
  const { data: categories = [] } = useCategories();
  const whatsUrl = buildWhatsAppUrl("Olá! Gostaria de fazer um pedido na Pizzaria Mussarela & Cia 🍕");
  
  return (
    <footer className="bg-[var(--color-cocoa)] text-cream border-t border-border">
      <div className="container mx-auto px-4 py-12 grid md:grid-cols-3 gap-10">
        <div>
          <img src={logo} alt="Pizzaria Mussarela & Cia" className="w-28 mb-4" />
          <h3 className="font-display text-xl text-primary">Pizzaria Mussarela & Cia</h3>
          <p className="text-sm text-cream/75 mt-2">Direto da Maré pro seu coração!</p>
          <p className="text-sm text-cream/75 mt-3">📍 Complexo da Maré, Rio de Janeiro - RJ</p>
          <p className="text-sm text-cream/75 mt-1">📍 Entrega: Maré, Benfica, Penha e região</p>
          <p className="text-sm text-cream/75 mt-1">⏰ Seg a Dom: 17h às 01h</p>
        </div>

        <div>
          <h4 className="font-display text-lg text-primary mb-4">Faça seu Pedido</h4>
          <div className="flex flex-col gap-3">
            <a
              href={whatsUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-whatsapp)] text-[var(--color-whatsapp-foreground)] font-bold px-4 py-3 hover:brightness-110 transition"
            >
              📱 Pedir pelo WhatsApp
            </a>
            <a
              href={`tel:+55${PHONE_DISPLAY.replace(/\D/g, "")}`}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent text-accent-foreground font-bold px-4 py-3 hover:brightness-110 transition"
            >
              📞 Ligar: {PHONE_DISPLAY}
            </a>
            <Link
              to="/carrinho"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground font-bold px-4 py-3 hover:brightness-110 transition"
            >
              🛒 Pedir pelo Site
            </Link>
          </div>
        </div>

        <div>
          <h4 className="font-display text-lg text-primary mb-4">Cardápio</h4>
          <ul className="space-y-2 text-sm">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link
                  to="/cardapio/$categoria"
                  params={{ categoria: c.slug }}
                  className="text-cream/80 hover:text-primary transition inline-flex items-center gap-2"
                >
                  <span>{c.emoji}</span> {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      <div className="border-t border-border">
        <div className="container mx-auto px-4 py-5 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-cream/60">
          <p className="text-center sm:text-left">
            © {new Date().getFullYear()} Pizzaria Mussarela & Cia · Complexo da Maré · Rio de Janeiro
          </p>
          {/* Link administrativo super secreto e camuflado */}
          <Link 
            to="/admin" 
            className="hover:text-cream text-[10px] opacity-30 hover:opacity-100 transition-all tracking-wider uppercase font-semibold"
          >
            Painel do Sistema
          </Link>
        </div>
      </div>
    </footer>
  );
}