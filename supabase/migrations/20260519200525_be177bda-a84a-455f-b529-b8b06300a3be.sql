
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP POLICY IF EXISTS "auth manage categories" ON public.categories;
DROP POLICY IF EXISTS "auth manage products"   ON public.products;
DROP POLICY IF EXISTS "auth manage promotions" ON public.promotions;
