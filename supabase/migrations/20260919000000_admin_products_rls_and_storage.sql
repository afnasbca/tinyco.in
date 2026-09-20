-- ============================================================================
-- 1. Create Admin Allowlist Table & Secure Helper Function
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own admin record" ON public.admin_users;
CREATE POLICY "Users can view their own admin record" 
ON public.admin_users FOR SELECT 
TO authenticated 
USING (auth.uid() = id);

-- Secure function to check if current user is an authorized admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public, auth
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.admin_users 
    WHERE id = auth.uid()
  );
$$;

-- ============================================================================
-- 2. Drop All Legacy / Permissive Policies on public.products
-- ============================================================================

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Products are publicly viewable" ON public.products;
DROP POLICY IF EXISTS "Anyone can view products" ON public.products;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.products;

DROP POLICY IF EXISTS "Authenticated users can add products" ON public.products;
DROP POLICY IF EXISTS "Authenticated users can insert products" ON public.products;
DROP POLICY IF EXISTS "Authenticated users can update products" ON public.products;
DROP POLICY IF EXISTS "Authenticated users can delete products" ON public.products;
DROP POLICY IF EXISTS "Admins can insert products" ON public.products;
DROP POLICY IF EXISTS "Admins can update products" ON public.products;
DROP POLICY IF EXISTS "Admins can delete products" ON public.products;
DROP POLICY IF EXISTS "Anyone can insert products" ON public.products;
DROP POLICY IF EXISTS "Anyone can update products" ON public.products;
DROP POLICY IF EXISTS "Anyone can delete products" ON public.products;
DROP POLICY IF EXISTS "Only authorized admins can insert products" ON public.products;
DROP POLICY IF EXISTS "Only authorized admins can update products" ON public.products;
DROP POLICY IF EXISTS "Only authorized admins can delete products" ON public.products;

-- ============================================================================
-- 3. Create Strict RLS Policies on public.products
-- ============================================================================

-- Public Read Access for Storefront
CREATE POLICY "Products are publicly viewable" 
ON public.products FOR SELECT 
USING (true);

-- ONLY Authorized Admins can Insert Products
CREATE POLICY "Only authorized admins can insert products" 
ON public.products FOR INSERT 
TO authenticated 
WITH CHECK (public.is_admin());

-- ONLY Authorized Admins can Update Products
CREATE POLICY "Only authorized admins can update products" 
ON public.products FOR UPDATE 
TO authenticated 
USING (public.is_admin()) 
WITH CHECK (public.is_admin());

-- ONLY Authorized Admins can Delete Products
CREATE POLICY "Only authorized admins can delete products" 
ON public.products FOR DELETE 
TO authenticated 
USING (public.is_admin());

-- ============================================================================
-- 4. Drop Legacy Policies & Create Strict Storage Policies for product-images
-- ============================================================================

INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public access to product images" ON storage.objects;
DROP POLICY IF EXISTS "Give public access to product-images" ON storage.objects;

DROP POLICY IF EXISTS "Authenticated users can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete product images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update product images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete product images" ON storage.objects;
DROP POLICY IF EXISTS "Only authorized admins can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Only authorized admins can update product images" ON storage.objects;
DROP POLICY IF EXISTS "Only authorized admins can delete product images" ON storage.objects;

-- Public read access to product images
CREATE POLICY "Public access to product images" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'product-images');

-- ONLY Authorized Admins can Upload Images
CREATE POLICY "Only authorized admins can upload product images" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'product-images' AND public.is_admin());

-- ONLY Authorized Admins can Update Images
CREATE POLICY "Only authorized admins can update product images" 
ON storage.objects FOR UPDATE 
TO authenticated 
USING (bucket_id = 'product-images' AND public.is_admin());

-- ONLY Authorized Admins can Delete Images
CREATE POLICY "Only authorized admins can delete product images" 
ON storage.objects FOR DELETE 
TO authenticated 
USING (bucket_id = 'product-images' AND public.is_admin());
