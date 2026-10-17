import { supabase } from "@/integrations/supabase/client";
import { PRODUCTS as STATIC_PRODUCTS } from "@/lib/products";
import type { Product } from "@/lib/products";
import type { Database, Json } from "@/integrations/supabase/types";

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

const DEFAULT_FABRIC = "100% Cotton";
const DEFAULT_CARE = "Machine wash cold · Tumble dry low · Do not bleach";

function stringArray(value: Json | null): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function colorArray(value: Json | null): Product["colors"] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (item === null || Array.isArray(item) || typeof item !== "object") return [];
    const name = item.name;
    const hex = item.hex;
    return typeof name === "string" && typeof hex === "string" ? [{ name, hex }] : [];
  });
}

function mapDbRowToProduct(
  row: Database["public"]["Tables"]["products"]["Row"],
): Product {
  const fallback = STATIC_PRODUCTS.find((product) => product.slug === row.slug);
  const sizes = stringArray(row.sizes);
  const dbImages = stringArray(row.images);
  const images = dbImages.length > 0 ? dbImages : fallback ? [fallback.image] : [];
  const colors = colorArray(row.colors);
  const rawCategory = row.category.toLowerCase();
  const category: Product["category"] =
    rawCategory === "girls" || rawCategory === "accessories" || rawCategory === "footwear" || rawCategory === "boys"
      ? rawCategory
      : fallback?.category ?? "boys";
  const rawGender = row.gender;
  const gender: Product["gender"] =
    rawGender === "Boys" || rawGender === "Girls" || rawGender === "Unisex"
      ? rawGender
      : fallback?.gender ?? (category === "girls" ? "Girls" : category === "boys" ? "Boys" : "Unisex");

  return {
    slug: row.slug,
    name: row.name,
    price: Number(row.price),
    ageRange:
      fallback?.ageRange ??
      (sizes.length > 1 ? `${sizes[0]} – ${sizes[sizes.length - 1]}` : sizes[0] ?? "0-3 Years"),
    category,
    gender,
    colors: colors.length > 0 ? colors : fallback?.colors ?? [],
    sizes: sizes.length > 0 ? sizes : fallback?.sizes ?? ["Standard"],
    image: images[0] ?? "",
    images,
    isNew: row.is_new ?? fallback?.isNew ?? false,
    bestSeller: fallback?.bestSeller ?? false,
    soldOut: row.is_sold_out ?? fallback?.soldOut ?? false,
    fabric: fallback?.fabric ?? DEFAULT_FABRIC,
    care: fallback?.care ?? DEFAULT_CARE,
    description: row.description ?? fallback?.description ?? "",
  };
}

function mapDbRowToAdminProduct(
  row: Database["public"]["Tables"]["products"]["Row"],
): AdminProduct {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description ?? "",
    price: Number(row.price),
    original_price: row.original_price,
    category: row.category,
    gender: mapDbRowToProduct(row).gender,
    images: stringArray(row.images),
    sizes: stringArray(row.sizes),
    colors: colorArray(row.colors),
    is_new: row.is_new ?? false,
    is_sold_out: row.is_sold_out ?? false,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

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

  return (data || []).map(mapDbRowToAdminProduct);
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
        original_price: input.original_price ?? null,
        category: input.category,
        gender: input.gender,
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

  return mapDbRowToAdminProduct(data);
}

/**
 * Updates an existing product in Supabase.
 */
export async function updateAdminProduct(
  id: string,
  input: Partial<AdminProductInput>
): Promise<AdminProduct> {
  const payload: Database["public"]["Tables"]["products"]["Update"] = {
    updated_at: new Date().toISOString(),
  };
  if (input.name !== undefined) payload.name = input.name;
  if (input.slug !== undefined) payload.slug = input.slug;
  if (input.description !== undefined) payload.description = input.description;
  if (input.price !== undefined) payload.price = input.price;
  if (input.original_price !== undefined) payload.original_price = input.original_price;
  if (input.category !== undefined) payload.category = input.category;
  if (input.gender !== undefined) payload.gender = input.gender;
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

  return mapDbRowToAdminProduct(data);
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
    gender: p.gender,
    images: [p.image],
    sizes: p.sizes,
    colors: p.colors,
    is_new: !!p.isNew,
    is_sold_out: !!p.soldOut,
  }));

  const { data, error } = await supabase
    .from("products")
    .insert(itemsToInsert)
    .select("id");

  if (error) {
    console.error("Error seeding products:", error);
    throw new Error(error.message);
  }

  return data ? data.length : 0;
}

/**
 * Fetches products for the public storefront from Supabase.
 */
export async function fetchStorefrontProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Unable to fetch storefront products from Supabase: ${error.message}`);
  }

  return data.map(mapDbRowToProduct);
}

/** Fetches one storefront product; query failures are surfaced to the route. */
export async function fetchStorefrontProductBySlug(slug: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to fetch storefront product "${slug}" from Supabase: ${error.message}`);
  }

  return data ? mapDbRowToProduct(data) : null;
}
