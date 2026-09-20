import { supabase } from "@/integrations/supabase/client";
import { PRODUCTS as STATIC_PRODUCTS } from "@/lib/products";

export type AdminProduct = {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  original_price?: number | null;
  category: string;
  gender?: string | null;
  images: string[];
  sizes: string[];
  colors: { name: string; hex: string }[];
  is_new: boolean;
  is_sold_out: boolean;
  created_at: string;
  updated_at?: string | null;
};

export type AdminProductInput = {
  name: string;
  slug: string;
  description: string;
  price: number;
  original_price?: number | null;
  category: string;
  gender: string;
  images: string[];
  sizes: string[];
  colors: { name: string; hex: string }[];
  is_new: boolean;
  is_sold_out: boolean;
};

/**
 * Checks if the current authenticated user is an authorized admin.
 */
export async function checkIsAdmin(): Promise<boolean> {
  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session?.user) return false;

  const { data, error } = await supabase
    .from("admin_users")
    .select("id")
    .eq("id", sessionData.session.user.id)
    .maybeSingle();

  if (error || !data) {
    // Fallback check RPC
    const { data: rpcIsAdmin } = await supabase.rpc("is_admin");
    return !!rpcIsAdmin;
  }

  return true;
}

/**
 * Fetches all products from Supabase.
 */
export async function fetchAdminProducts(): Promise<AdminProduct[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching products from Supabase:", error);
    throw new Error(error.message);
  }

  return (data || []).map((row) => ({
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description || "",
    price: Number(row.price),
    original_price: row.original_price ? Number(row.original_price) : null,
    category: row.category,
    gender: (row as any).gender || "Unisex",
    images: Array.isArray(row.images) ? (row.images as string[]) : [],
    sizes: Array.isArray(row.sizes) ? (row.sizes as string[]) : [],
    colors: Array.isArray(row.colors)
      ? (row.colors as { name: string; hex: string }[])
      : [],
    is_new: !!row.is_new,
    is_sold_out: !!row.is_sold_out,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }));
}

/**
 * Creates a new product in Supabase.
 */
export async function createAdminProduct(input: AdminProductInput): Promise<AdminProduct> {
  const { data, error } = await supabase
    .from("products")
    .insert([
      {
        slug: input.slug,
        name: input.name,
        description: input.description,
        price: input.price,
        original_price: input.original_price || null,
        category: input.category,
        images: input.images,
        sizes: input.sizes,
        colors: input.colors,
        is_new: input.is_new,
        is_sold_out: input.is_sold_out,
      },
    ])
    .select("*")
    .single();

  if (error) {
    console.error("Error creating product:", error);
    throw new Error(error.message);
  }

  return {
    id: data.id,
    slug: data.slug,
    name: data.name,
    description: data.description || "",
    price: Number(data.price),
    original_price: data.original_price ? Number(data.original_price) : null,
    category: data.category,
    gender: input.gender || "Unisex",
    images: Array.isArray(data.images) ? (data.images as string[]) : [],
    sizes: Array.isArray(data.sizes) ? (data.sizes as string[]) : [],
    colors: Array.isArray(data.colors)
      ? (data.colors as { name: string; hex: string }[])
      : [],
    is_new: !!data.is_new,
    is_sold_out: !!data.is_sold_out,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
}

/**
 * Updates an existing product in Supabase.
 */
export async function updateAdminProduct(
  id: string,
  input: Partial<AdminProductInput>
): Promise<AdminProduct> {
  const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (input.name !== undefined) payload.name = input.name;
  if (input.slug !== undefined) payload.slug = input.slug;
  if (input.description !== undefined) payload.description = input.description;
  if (input.price !== undefined) payload.price = input.price;
  if (input.original_price !== undefined) payload.original_price = input.original_price;
  if (input.category !== undefined) payload.category = input.category;
  if (input.images !== undefined) payload.images = input.images;
  if (input.sizes !== undefined) payload.sizes = input.sizes;
  if (input.colors !== undefined) payload.colors = input.colors;
  if (input.is_new !== undefined) payload.is_new = input.is_new;
  if (input.is_sold_out !== undefined) payload.is_sold_out = input.is_sold_out;

  const { data, error } = await supabase
    .from("products")
    .update(payload)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    console.error("Error updating product:", error);
    throw new Error(error.message);
  }

  return {
    id: data.id,
    slug: data.slug,
    name: data.name,
    description: data.description || "",
    price: Number(data.price),
    original_price: data.original_price ? Number(data.original_price) : null,
    category: data.category,
    gender: input.gender || "Unisex",
    images: Array.isArray(data.images) ? (data.images as string[]) : [],
    sizes: Array.isArray(data.sizes) ? (data.sizes as string[]) : [],
    colors: Array.isArray(data.colors)
      ? (data.colors as { name: string; hex: string }[])
      : [],
    is_new: !!data.is_new,
    is_sold_out: !!data.is_sold_out,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
}

/**
 * Deletes a product from Supabase.
 */
export async function deleteAdminProduct(id: string): Promise<void> {
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) {
    console.error("Error deleting product:", error);
    throw new Error(error.message);
  }
}

/**
 * Uploads a file to Supabase Storage 'product-images' bucket and returns its public URL.
 */
export async function uploadProductImage(file: File): Promise<string> {
  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
  const filePath = `products/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from("product-images")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    console.error("Error uploading image:", uploadError);
    throw new Error(uploadError.message);
  }

  const { data } = supabase.storage.from("product-images").getPublicUrl(filePath);
  return data.publicUrl;
}

/**
 * Optional helper for owner/client to seed initial catalog from products.ts into empty Supabase table.
 */
export async function seedProductsFromStaticCatalog(): Promise<number> {
  const itemsToInsert = STATIC_PRODUCTS.map((p) => ({
    slug: p.slug,
    name: p.name,
    description: p.description,
    price: p.price,
    category: p.category,
    images: [p.image],
    sizes: p.sizes,
    colors: p.colors,
    is_new: !!p.isNew,
    is_sold_out: !!p.soldOut,
  }));

  const { data, error } = await supabase.from("products").insert(itemsToInsert).select("id");
  if (error) {
    console.error("Error seeding products:", error);
    throw new Error(error.message);
  }
  return data ? data.length : 0;
}
