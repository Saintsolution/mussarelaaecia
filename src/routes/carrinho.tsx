import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useCart } from "@/lib/cart";
import { buildWhatsAppUrl, formatBRL } from "@/lib/whatsapp";

const TAXA_ENTREGA = 8.00;

export const Route = createFileRoute("/carrinho")({
  component: CartPage,
  head: () => ({ meta: [{ title: "Carrinho — Pizzaria Mussarela & Cia" }] }),
});

function CartPage() {
  const { items, total, setQty, remove, clear } = useCart();
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [endereco, setEndereco] = useState("");
  const [pagamento, setPagamento] = useState("Pix");
  const [obs, setObs] = useState("");

  const totalGeral = total + TAXA_ENTREGA;

  // --- MONTAGEM DA MENSAGEM DO WHATSAPP COM DETALHES DE COMBOS ---
  const message = [
    "🍕 *Novo pedido — Pizzaria Mussarela & Cia*",
    "",
    `*Cliente:* ${nome || "(informar)"}`,
    `*Telefone:* ${telefone || "(informar)"}`,
    `*Endereço:* ${endereco || "(informar)"}`,
    "",
    "*Itens:*",
    ...items.map((i) => {
      // Se o item for um combo com sub-itens, monta a lista de sabores recuada
      const detalhesCombo = i.detalhes && i.detalhes.length > 0
        ? i.detalhes.map((sabor, index) => `   └ Sabor ${index + 1}: ${sabor}`).join("\n")
        : "";
        
      return ` • ${i.quantidade}x ${i.nome} — ${formatBRL(i.preco * i.quantidade)}${detalhesCombo ? `\n${detalhesCombo}` : ""}`;
    }),
    "",
    `*Subtotal:* ${formatBRL(total)}`,
    `*Taxa de Entrega (Motoboy):* ${formatBRL(TAXA_ENTREGA)}`,
    `*Total Geral:* ${formatBRL(totalGeral)}`,
    "",
    `*Pagamento:* ${pagamento}`,
    obs ? `*Observações:* ${obs}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const canSend = items.length > 0 && nome && telefone && endereco;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-10 md:py-14">
        <h1 className="font-display text-4xl md:text-5xl mb-8">Seu Carrinho</h1>

        {items.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-10 text-center">
            <p className="text-muted-foreground mb-4">Seu carrinho está vazio.</p>
            <Link to="/" className="inline-block rounded-full bg-primary text-primary-foreground font-bold px-5 py-3">
              Ver cardápio
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-[1fr_380px] gap-8">
            <div className="space-y-3">
              {items.map((i) => (
                <div key={i.id} className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{i.nome}</h3>
                      <p className="text-sm text-muted-foreground">{formatBRL(i.preco)} cada</p>
                      
                      {/* --- EXIBIÇÃO VISUAL DOS SABORES NA TELA DO CARRINHO --- */}
                      {i.detalhes && i.detalhes.length > 0 && (
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          {i.detalhes.map((sabor, index) => (
                            <span key={index} className="text-[11px] font-bold bg-amber-50 text-amber-900 border border-amber-100 px-2 py-0.5 rounded-md">
                              Sabor {index + 1}: {sabor}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setQty(i.id, i.quantidade - 1)} className="size-8 grid place-items-center rounded-full border border-border hover:bg-secondary"><Minus className="size-4" /></button>
                      <span className="w-8 text-center font-bold">{i.quantidade}</span>
                      <button onClick={() => setQty(i.id, i.quantidade + 1)} className="size-8 grid place-items-center rounded-full border border-border hover:bg-secondary"><Plus className="size-4" /></button>
                    </div>
                    <div className="w-24 text-right font-display text-lg text-primary">{formatBRL(i.preco * i.quantidade)}</div>
                    <button onClick={() => remove(i.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="size-4" /></button>
                  </div>
                </div>
              ))}
              <button onClick={clear} className="text-sm text-muted-foreground hover:text-destructive mt-2">Esvaziar carrinho</button>
            </div>

            <aside className="rounded-2xl border border-border bg-card p-6 space-y-4 h-fit lg:sticky lg:top-24">
              <h2 className="font-display text-xl text-cream font-bold">Dados de entrega</h2>
              
              <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Seu nome" className="w-full rounded-lg bg-background/50 border border-border px-4 py-3 text-white placeholder:text-cream/50 font-medium" />
              <input value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="Telefone / WhatsApp" className="w-full rounded-lg bg-background/50 border border-border px-4 py-3 text-white placeholder:text-cream/50 font-medium" />
              <textarea value={endereco} onChange={(e) => setEndereco(e.target.value)} placeholder="Endereço completo" rows={3} className="w-full rounded-lg bg-background/50 border border-border px-4 py-3 text-white placeholder:text-cream/50 font-medium" />
              
              <select value={pagamento} onChange={(e) => setPagamento(e.target.value)} className="w-full rounded-lg bg-[var(--color-cocoa)] border border-border px-4 py-3 text-white font-bold cursor-pointer">
                <option value="Pix" className="text-slate-900 bg-white">Pix</option>
                <option value="Dinheiro" className="text-slate-900 bg-white">Dinheiro</option>
                <option value="Cartão na entrega" className="text-slate-900 bg-white">Cartão na entrega</option>
              </select>
              
              <textarea value={obs} onChange={(e) => setObs(e.target.value)} placeholder="Observações (opcional)" rows={2} className="w-full rounded-lg bg-background/50 border border-border px-4 py-3 text-white placeholder:text-cream/50 font-medium" />

              <div className="space-y-2 border-t border-border pt-4 text-sm font-medium">
                <div className="flex justify-between text-cream/70">
                  <span>Produtos:</span>
                  <span>{formatBRL(total)}</span>
                </div>
                <div className="flex justify-between text-cream/70">
                  <span>Entrega (Motoboy):</span>
                  <span>{formatBRL(TAXA_ENTREGA)}</span>
                </div>
                <div className="flex items-center justify-between border-t border-dashed border-border pt-2">
                  <span className="text-cream font-bold">Total Geral:</span>
                  <span className="font-display text-3xl text-primary font-black drop-shadow-sm">{formatBRL(totalGeral)}</span>
                </div>
              </div>

              <a
                href={canSend ? buildWhatsAppUrl(message) : undefined}
                target="_blank"
                rel="noreferrer"
                aria-disabled={!canSend}
                className={`w-full inline-flex items-center justify-center gap-2 rounded-full font-bold px-5 py-4 transition ${canSend ? "bg-[var(--color-whatsapp)] text-[var(--color-whatsapp-foreground)] hover:brightness-110 shadow-lg" : "bg-muted text-muted-foreground pointer-events-none"}`}
              >
                📱 Enviar pedido pelo WhatsApp
              </a>
              {!canSend && items.length > 0 && (
                <p className="text-xs text-cream/60 text-center">Preencha nome, telefone e endereço para enviar.</p>
              )}
            </aside>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}