## Pizzaria da Pizza — Delivery

Site público para o cliente comprar + painel admin para o time da pizzaria gerenciar produtos e pedidos. Pedido finaliza sempre disparando uma mensagem pronta no WhatsApp da empresa (sem gateway de pagamento por enquanto).

### Identidade visual
- Paleta do logo: marrom escuro `#2b1810`, marrom médio `#5c2e1a`, mostarda/laranja `#d97706`, creme `#fde68a`.
- Tipografia: display marcante (tipo Bebas/Archivo Black) para títulos estilo Domino's + sans-serif legível no corpo.
- Logo flutuando sobre o header/hero (canto superior esquerdo, ultrapassando a linha divisória do header).

### Páginas e rotas
- `/` — Home: header + hero carrossel + grade de categorias + promoções + footer.
- `/cardapio/$categoria` — listagem dos produtos da categoria (pizzas salgadas, doces, bebidas, salgadinhos, comidinhas, promoções).
- `/carrinho` — revisão e botão "Enviar pedido pelo WhatsApp".
- `/login` — entrada do time.
- `/admin` — painel (protegido): produtos, categorias, promoções, pedidos (preparo/saiu para entrega/entregue), usuários e papéis.

### Home — composição
1. Header preto/marrom com logo flutuante, menu de categorias e botões "WhatsApp" e "Carrinho" (badge com qtd).
2. Carrossel topo com 2 slides:
   - **Slide 1 — Foto família de produtos**: imagem com hotspots clicáveis posicionados sobre cada produto ("Pizzas", "Bebidas", "Salgadinhos", "Comidinhas", "Doces"). Hover destaca + tooltip; clique abre a categoria.
   - **Slide 2 — Promoção da semana**: banner grande com CTA "Ver Cardápio" e "Pedir pelo WhatsApp".
3. Faixa horizontal de 5 cards de categoria (estilo Domino's: ícone + nome + "A partir de R$").
4. Seção "Promoções Imperdíveis" com 4 cards (imagem, nome, preço antigo riscado, preço promo, botão "Adicionar ao carrinho").
5. Footer marrom escuro com: endereço (Complexo da Maré, RJ), horário, "Pedir pelo WhatsApp", "Ligar", lista do cardápio, copyright.

### Mobile
- Header vira menu sanduíche; carrossel mantém hotspots responsivos; categorias viram scroll horizontal.

### Backend (Lovable Cloud)
Tabelas:
- `categories` (id, slug, nome, emoji/ícone, ordem, ativo)
- `products` (id, categoria_id, nome, descrição, preço, preço_promocional, imagem_url, drive_file_id, destaque, ativo)
- `promotions` (id, título, subtítulo, imagem_url, preço, preço_antigo, produto_id opcional, ativo, ordem)
- `hero_slides` (id, tipo: "hotspots"|"promo", imagem_url, título, subtítulo, hotspots jsonb [{x,y,label,categoria_slug}], ativo, ordem)
- `orders` (id, código, cliente_nome, telefone, endereço, itens jsonb, total, status, observações, created_at)
- `profiles` (id auth.user, nome, telefone)
- `user_roles` (user_id, role) — enum: `owner`, `atendente`, `entregador`
- Função `has_role()` SECURITY DEFINER + RLS em todas as tabelas.

### Fotos no Google Drive
- Conector Google Drive já escolhido. No admin, ao cadastrar um produto, a UI lista as imagens de uma pasta configurada do Drive (ou aceita um link) e salva `drive_file_id`. O front renderiza usando o endpoint do gateway para baixar/servir a thumbnail.
- Bucket interno só como fallback de cache se necessário.

### Checkout via WhatsApp
- Carrinho persistido em `localStorage`.
- Botão "Enviar pedido" gera mensagem formatada:
  ```
  🍕 Novo pedido — Pizzaria da Pizza
  Cliente: <nome>
  Endereço: <endereço>
  Itens:
   • 1x Pizza Calabresa G — R$ 44,90
   • 1x Coca 2L — R$ 12,00
  Total: R$ 56,90
  Pagamento: <Pix/Dinheiro/Cartão na entrega>
  ```
- Abre `https://wa.me/<numero>?text=<encoded>` em nova aba e grava o pedido em `orders` com status `aguardando_confirmacao`.

### Admin
- Login email/senha + Google.
- Papéis:
  - `owner`: tudo (produtos, categorias, promoções, hero, pedidos, usuários).
  - `atendente`: vê e move status de pedidos; edita produtos/promo.
  - `entregador`: vê pedidos prontos e marca "entregue".
- Tela de pedidos com Kanban: Recebido → Em preparo → Saiu para entrega → Entregue / Cancelado.
- Editor do hero com posicionamento visual dos hotspots (clique na imagem cria ponto x/y).

### Stack técnica
- TanStack Start + Tailwind + shadcn (variantes customizadas para botões "wa", "primary-warm", "ghost-warm").
- Lovable Cloud (Supabase) com RLS.
- Conector Google Drive via gateway para imagens.
- `framer-motion` para animar hotspots e transições do carrossel.
- Server functions para: criar pedido, listar pedidos, mover status, listar/baixar imagens do Drive.

### Entrega em fases
1. **Fase 1 (este passo):** design system + home (header, hero carrossel com hotspots placeholder, categorias, promoções, footer) com dados mockados + carrinho local + checkout WhatsApp funcionando.
2. **Fase 2:** Lovable Cloud + auth + tabelas + admin de produtos/categorias/promoções/hero, troca dos mocks por dados reais.
3. **Fase 3:** Integração Google Drive para imagens e Kanban de pedidos com papéis.

Confirma para eu começar pela Fase 1?
