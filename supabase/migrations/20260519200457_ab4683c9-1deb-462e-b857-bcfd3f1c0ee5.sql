
-- Categories
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  emoji TEXT,
  image_url TEXT,
  ordem INT NOT NULL DEFAULT 0,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Products
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  descricao TEXT,
  image_url TEXT,
  -- sizes: jsonb array like [{"label":"P","preco":29.9},{"label":"M","preco":39.9}]
  sizes JSONB NOT NULL DEFAULT '[]'::jsonb,
  preco_base NUMERIC(10,2),
  destaque BOOLEAN NOT NULL DEFAULT false,
  ativo BOOLEAN NOT NULL DEFAULT true,
  ordem INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_products_category ON public.products(category_id);

-- Promotions
CREATE TABLE public.promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  descricao TEXT,
  image_url TEXT,
  preco NUMERIC(10,2) NOT NULL,
  preco_antigo NUMERIC(10,2),
  badge TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  ordem INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_categories_updated BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_products_updated BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_promotions_updated BEFORE UPDATE ON public.promotions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;

-- Public read (only ativo rows)
CREATE POLICY "public read active categories" ON public.categories
  FOR SELECT USING (ativo = true);
CREATE POLICY "public read active products" ON public.products
  FOR SELECT USING (ativo = true);
CREATE POLICY "public read active promotions" ON public.promotions
  FOR SELECT USING (ativo = true);

-- Authenticated users can manage (admin panel coming next phase)
CREATE POLICY "auth manage categories" ON public.categories
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth manage products" ON public.products
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth manage promotions" ON public.promotions
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
