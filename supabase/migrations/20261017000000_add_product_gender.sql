-- The admin form and storefront filters use gender; persist it for products.
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS gender TEXT;
