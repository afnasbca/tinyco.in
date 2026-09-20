import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  LogOut,
  Upload,
  ShieldAlert,
  ExternalLink,
  Loader2,
  Sparkles,
  RefreshCw,
  Check,
  X,
  Store,
  Tag,
  Package,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  checkIsAdmin,
  fetchAdminProducts,
  createAdminProduct,
  updateAdminProduct,
  deleteAdminProduct,
  uploadProductImage,
  seedProductsFromStaticCatalog,
  type AdminProduct,
  type AdminProductInput,
} from "@/lib/api/products";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Panel — Tiny.co" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPage,
});

const AVAILABLE_SIZES = [
  "0-3 Months",
  "3-6 Months",
  "6-9 Months",
  "9-12 Months",
  "1-2 Years",
  "2-3 Years",
  "3-4 Years",
  "One Size",
];

const CATEGORIES = [
  { id: "boys", label: "Baby Boys" },
  { id: "girls", label: "Baby Girls" },
  { id: "accessories", label: "Accessories" },
  { id: "footwear", label: "Footwear" },
];

const DEFAULT_COLORS = [
  { name: "Cream", hex: "#FFF8F0" },
  { name: "Sunny Yellow", hex: "#F69E1C" },
  { name: "Soft Pink", hex: "#F28FA3" },
  { name: "Cocoa", hex: "#5B3A29" },
  { name: "Mint", hex: "#BFE0DA" },
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function AdminPage() {
  // Auth state
  const [session, setSession] = useState<any>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [submittingAuth, setSubmittingAuth] = useState(false);

  // Products state
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);
  const [saving, setSaving] = useState(false);

  // Form Fields
  const [formData, setFormData] = useState<AdminProductInput>({
    name: "",
    slug: "",
    description: "",
    price: 499,
    original_price: undefined,
    category: "boys",
    gender: "Boys",
    images: [],
    sizes: ["3-6 Months"],
    colors: [{ name: "Cream", hex: "#FFF8F0" }],
    is_new: true,
    is_sold_out: false,
  });

  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [newColorName, setNewColorName] = useState("");
  const [newColorHex, setNewColorHex] = useState("#F69E1C");

  // Delete state
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Initial Auth check
  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data }) => {
        setSession(data?.session ?? null);
        if (data?.session) {
          verifyAdminStatus();
        } else {
          setLoadingAuth(false);
        }
      })
      .catch((err) => {
        console.error("Auth session error:", err);
        setSession(null);
        setLoadingAuth(false);
      });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        verifyAdminStatus();
      } else {
        setIsAdmin(false);
        setLoadingAuth(false);
      }
    });

    return () => {
      data?.subscription?.unsubscribe();
    };
  }, []);

  async function verifyAdminStatus() {
    setLoadingAuth(true);
    try {
      const authorized = await checkIsAdmin();
      setIsAdmin(authorized);
      if (authorized) {
        loadProducts();
      }
    } catch (err) {
      console.error("Error checking admin status:", err);
      setIsAdmin(false);
    } finally {
      setLoadingAuth(false);
    }
  }

  async function loadProducts() {
    setLoadingProducts(true);
    try {
      const data = await fetchAdminProducts();
      setProducts(data);
    } catch (err: any) {
      toast.error(`Failed to load products: ${err.message || err}`);
    } finally {
      setLoadingProducts(false);
    }
  }

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter email and password.");
      return;
    }

    setSubmittingAuth(true);
    try {
      if (isSigningUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        toast.success("Account created! Please check your email or ask store owner to authorize you.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Signed in successfully!");
      }
    } catch (err: any) {
      toast.error(err.message || "Authentication failed");
    } finally {
      setSubmittingAuth(false);
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    toast.info("Signed out");
  }

  function openAddModal() {
    setEditingProduct(null);
    setFormData({
      name: "",
      slug: "",
      description: "",
      price: 499,
      original_price: undefined,
      category: "boys",
      gender: "Boys",
      images: [],
      sizes: ["3-6 Months"],
      colors: [{ name: "Cream", hex: "#FFF8F0" }],
      is_new: true,
      is_sold_out: false,
    });
    setImageUrlInput("");
    setIsModalOpen(true);
  }

  function openEditModal(product: AdminProduct) {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: product.price,
      original_price: product.original_price ?? undefined,
      category: product.category,
      gender: product.gender || "Unisex",
      images: product.images.length > 0 ? product.images : [],
      sizes: product.sizes,
      colors: product.colors.length > 0 ? product.colors : [{ name: "Cream", hex: "#FFF8F0" }],
      is_new: product.is_new,
      is_sold_out: product.is_sold_out,
    });
    setImageUrlInput("");
    setIsModalOpen(true);
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const publicUrl = await uploadProductImage(file);
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, publicUrl],
      }));
      toast.success("Image uploaded successfully!");
    } catch (err: any) {
      toast.error(`Image upload failed: ${err.message || err}`);
    } finally {
      setUploadingImage(false);
    }
  }

  function handleAddImageUrl() {
    if (!imageUrlInput.trim()) return;
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, imageUrlInput.trim()],
    }));
    setImageUrlInput("");
  }

  function handleRemoveImage(index: number) {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  }

  function toggleSize(size: string) {
    setFormData((prev) => {
      const exists = prev.sizes.includes(size);
      const updated = exists ? prev.sizes.filter((s) => s !== size) : [...prev.sizes, size];
      return { ...prev, sizes: updated };
    });
  }

  function handleAddColor() {
    if (!newColorName.trim()) return;
    setFormData((prev) => ({
      ...prev,
      colors: [...prev.colors, { name: newColorName.trim(), hex: newColorHex }],
    }));
    setNewColorName("");
  }

  function handleRemoveColor(index: number) {
    setFormData((prev) => ({
      ...prev,
      colors: prev.colors.filter((_, i) => i !== index),
    }));
  }

  async function handleSaveProduct(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Product name is required.");
      return;
    }

    setSaving(true);
    try {
      const slug = formData.slug.trim() || slugify(formData.name);

      if (editingProduct) {
        const updated = await updateAdminProduct(editingProduct.id, {
          ...formData,
          slug,
        });
        setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
        toast.success("Product updated successfully!");
      } else {
        const created = await createAdminProduct({
          ...formData,
          slug,
        });
        setProducts((prev) => [created, ...prev]);
        toast.success("Product created successfully!");
      }

      setIsModalOpen(false);
    } catch (err: any) {
      toast.error(`Error saving product: ${err.message || err}`);
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleSoldOut(product: AdminProduct) {
    try {
      const updated = await updateAdminProduct(product.id, {
        is_sold_out: !product.is_sold_out,
      });
      setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      toast.success(
        `${product.name} marked as ${updated.is_sold_out ? "Sold Out" : "Available"}`
      );
    } catch (err: any) {
      toast.error(`Failed to update status: ${err.message || err}`);
    }
  }

  async function confirmDelete() {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      await deleteAdminProduct(deletingId);
      setProducts((prev) => prev.filter((p) => p.id !== deletingId));
      toast.success("Product deleted successfully.");
      setDeletingId(null);
    } catch (err: any) {
      toast.error(`Delete failed: ${err.message || err}`);
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleSeedCatalog() {
    if (
      !confirm(
        "Import static products from products.ts into your empty Supabase database?"
      )
    ) {
      return;
    }
    setLoadingProducts(true);
    try {
      const count = await seedProductsFromStaticCatalog();
      toast.success(`Successfully imported ${count} products into Supabase!`);
      loadProducts();
    } catch (err: any) {
      toast.error(`Seeding failed: ${err.message || err}`);
      setLoadingProducts(false);
    }
  }

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase()) ||
        p.slug.toLowerCase().includes(search.toLowerCase());
      const matchesCat =
        categoryFilter === "all" || p.category.toLowerCase() === categoryFilter.toLowerCase();
      return matchesSearch && matchesCat;
    });
  }, [products, search, categoryFilter]);

  // Loading spinner
  if (loadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-brand-orange mx-auto" />
          <p className="text-sm font-medium text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Unauthenticated or Unauthorized view
  if (!session || !isAdmin) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center p-5">
        <div className="max-w-md w-full bg-white rounded-3xl border border-border p-8 shadow-sm">
          <div className="text-center mb-8">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary text-brand-orange text-xs font-semibold uppercase tracking-wider">
              Tiny.co Store Admin
            </span>
            <h1 className="mt-3 text-3xl font-extrabold">Admin Login</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Sign in with your authorized admin account to manage products.
            </p>
          </div>

          {session && !isAdmin && (
            <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-sm space-y-2">
              <div className="flex items-center gap-2 font-semibold">
                <ShieldAlert className="h-5 w-5 text-amber-600" />
                Access Pending Authorization
              </div>
              <p>
                Logged in as <strong className="font-mono">{session.user.email}</strong>, but this
                account is not yet added to <code className="bg-amber-100 px-1 rounded">public.admin_users</code>.
              </p>
              <p className="text-xs text-amber-700">
                Ask the store owner to add your email to the admin allowlist in Supabase.
              </p>
              <button
                onClick={handleSignOut}
                className="mt-2 text-xs text-amber-900 underline font-medium hover:text-black"
              >
                Sign out and switch account
              </button>
            </div>
          )}

          {(!session || (session && !isAdmin)) && (
            <form onSubmit={handleAuth} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@tinyco.in"
                  className="w-full rounded-2xl border border-border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-2xl border border-border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange"
                />
              </div>

              <button
                type="submit"
                disabled={submittingAuth}
                className="w-full rounded-full bg-foreground text-cream py-3.5 text-sm font-semibold hover:bg-brand-orange transition-colors flex items-center justify-center gap-2"
              >
                {submittingAuth ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isSigningUp ? (
                  "Create Admin Account"
                ) : (
                  "Sign In to Dashboard"
                )}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setIsSigningUp(!isSigningUp)}
                  className="text-xs text-muted-foreground hover:text-brand-orange underline"
                >
                  {isSigningUp
                    ? "Already have an account? Sign in"
                    : "Need a new account? Register here"}
                </button>
              </div>
            </form>
          )}

          <div className="mt-8 pt-6 border-t border-border text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-brand-orange font-medium"
            >
              <Store className="h-3.5 w-3.5" /> Return to Customer Storefront
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Main Authorized Admin Dashboard View
  return (
    <div className="min-h-screen bg-cream text-foreground">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-border">
        <div className="mx-auto max-w-7xl px-5 md:px-8 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-brand-orange text-white flex items-center justify-center font-black text-lg">
              T
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-lg leading-none">Tiny.co Admin</h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider">
                  Authorized Admin
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Logged in as <span className="font-medium text-foreground">{session.user.email}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-border px-3.5 py-2 text-xs font-semibold hover:border-brand-orange transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" /> View Storefront
            </Link>

            <button
              onClick={handleSignOut}
              className="inline-flex items-center gap-1.5 rounded-full bg-secondary text-foreground hover:bg-red-50 hover:text-red-600 border border-border px-3.5 py-2 text-xs font-semibold transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" /> Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-5 md:px-8 py-8">
        {/* Actions & Filters Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold">Product Inventory</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your store items, prices, stock availability, and images live in Supabase.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={loadProducts}
              title="Refresh product list"
              className="p-2.5 rounded-full border border-border bg-white hover:border-brand-orange transition-colors"
            >
              <RefreshCw className={`h-4 w-4 ${loadingProducts ? "animate-spin" : ""}`} />
            </button>

            {products.length === 0 && !loadingProducts && (
              <button
                onClick={handleSeedCatalog}
                className="inline-flex items-center gap-2 rounded-full border border-brand-orange text-brand-orange bg-white px-4 py-2.5 text-xs font-bold hover:bg-brand-orange hover:text-white transition-colors"
              >
                <Sparkles className="h-4 w-4" /> Import Static Products
              </button>
            )}

            <button
              onClick={openAddModal}
              className="inline-flex items-center gap-2 rounded-full bg-brand-orange text-white px-5 py-2.5 text-sm font-semibold hover:bg-foreground transition-colors shadow-sm"
            >
              <Plus className="h-4 w-4" /> Add New Product
            </button>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="bg-white rounded-3xl border border-border p-4 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search products by name or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm rounded-full border border-border focus:outline-none focus:ring-2 focus:ring-brand-orange bg-secondary/50"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            <button
              onClick={() => setCategoryFilter("all")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                categoryFilter === "all"
                  ? "bg-foreground text-cream"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              All Products ({products.length})
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                  categoryFilter === cat.id
                    ? "bg-foreground text-cream"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Product Inventory Table / Grid */}
        {loadingProducts ? (
          <div className="bg-white rounded-3xl border border-border p-16 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-brand-orange mx-auto mb-3" />
            <p className="text-sm font-medium text-muted-foreground">Loading inventory from Supabase...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white rounded-3xl border border-border p-16 text-center">
            <Package className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-40" />
            <h3 className="text-lg font-bold">No products found</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto mt-1 mb-6">
              {products.length === 0
                ? "Your Supabase product table is currently empty. Click 'Import Static Products' to seed items or create your first product."
                : "No items match your current filter or search criteria."}
            </p>
            {products.length === 0 ? (
              <button
                onClick={handleSeedCatalog}
                className="inline-flex items-center gap-2 rounded-full bg-brand-orange text-white px-5 py-2.5 text-sm font-semibold"
              >
                <Sparkles className="h-4 w-4" /> Import Static Catalog (50+ Items)
              </button>
            ) : (
              <button
                onClick={() => {
                  setSearch("");
                  setCategoryFilter("all");
                }}
                className="text-xs text-brand-orange underline font-semibold"
              >
                Clear search filters
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-border overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-border bg-secondary/40 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <th className="py-3.5 px-5">Product</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Price</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Sizes</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredProducts.map((p) => {
                    const displayImage =
                      p.images && p.images.length > 0 ? p.images[0] : undefined;

                    return (
                      <tr key={p.id} className="hover:bg-secondary/20 transition-colors">
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3">
                            <div className="h-14 w-14 rounded-2xl bg-secondary border border-border overflow-hidden shrink-0">
                              {displayImage ? (
                                <img
                                  src={displayImage}
                                  alt={p.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center text-xs text-muted-foreground">
                                  No image
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="font-bold text-foreground leading-snug">{p.name}</div>
                              <div className="text-xs text-muted-foreground font-mono mt-0.5">
                                /{p.slug}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-4 capitalize">
                          <span className="inline-block px-2.5 py-1 rounded-full bg-secondary text-xs font-medium">
                            {p.category}
                          </span>
                        </td>

                        <td className="py-4 px-4 font-semibold">
                          ₹{p.price}
                          {p.original_price && (
                            <span className="ml-1.5 text-xs text-muted-foreground line-through font-normal">
                              ₹{p.original_price}
                            </span>
                          )}
                        </td>

                        <td className="py-4 px-4">
                          <button
                            onClick={() => handleToggleSoldOut(p)}
                            title="Click to toggle sold out status"
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-transform active:scale-95 ${
                              p.is_sold_out
                                ? "bg-red-100 text-red-700 hover:bg-red-200"
                                : "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                            }`}
                          >
                            {p.is_sold_out ? (
                              <>
                                <X className="h-3 w-3" /> Sold Out
                              </>
                            ) : (
                              <>
                                <Check className="h-3 w-3" /> In Stock
                              </>
                            )}
                          </button>
                        </td>

                        <td className="py-4 px-4">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {p.sizes.slice(0, 3).map((s) => (
                              <span
                                key={s}
                                className="px-2 py-0.5 rounded-md bg-secondary text-[10px] font-medium"
                              >
                                {s}
                              </span>
                            ))}
                            {p.sizes.length > 3 && (
                              <span className="text-[10px] text-muted-foreground">
                                +{p.sizes.length - 3} more
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-4 px-5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEditModal(p)}
                              className="p-2 rounded-xl border border-border hover:bg-secondary text-foreground transition-colors"
                              title="Edit Product"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setDeletingId(p.id)}
                              className="p-2 rounded-xl border border-border hover:bg-red-50 hover:border-red-200 text-red-600 transition-colors"
                              title="Delete Product"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl border border-border max-w-2xl w-full p-6 md:p-8 my-8 shadow-xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
              <div>
                <h3 className="text-xl font-extrabold">
                  {editingProduct ? "Edit Product" : "Add New Product"}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {editingProduct
                    ? `Updating details for ${editingProduct.name}`
                    : "Fill in the product details to publish to your storefront."}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-6">
              {/* Name & Slug */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData((prev) => ({
                        ...prev,
                        name: val,
                        slug: editingProduct ? prev.slug : slugify(val),
                      }));
                    }}
                    placeholder="Yellow Daisy Tulle Romper"
                    className="w-full rounded-2xl border border-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                    placeholder="yellow-daisy-tulle-romper"
                    className="w-full rounded-2xl border border-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange font-mono text-xs"
                  />
                </div>
              </div>

              {/* Price & Category */}
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, price: Number(e.target.value) }))
                    }
                    className="w-full rounded-2xl border border-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Original Price (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.original_price ?? ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        original_price: e.target.value ? Number(e.target.value) : undefined,
                      }))
                    }
                    placeholder="Optional for sales"
                    className="w-full rounded-2xl border border-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                    className="w-full rounded-2xl border border-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange bg-white"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="A dreamy yellow daisy-print romper with tulle puff sleeves..."
                  className="w-full rounded-2xl border border-border p-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange"
                />
              </div>

              {/* Sizes Selection */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Available Sizes / Ages
                </label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_SIZES.map((size) => {
                    const active = formData.sizes.includes(size);
                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => toggleSize(size)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                          active
                            ? "bg-foreground text-cream border-foreground"
                            : "bg-white border-border text-muted-foreground hover:border-brand-orange"
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Image Upload / URLs */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Product Images
                </label>
                <div className="grid grid-cols-4 gap-3 mb-3">
                  {formData.images.map((img, idx) => (
                    <div
                      key={idx}
                      className="relative rounded-2xl overflow-hidden bg-secondary border border-border aspect-square group"
                    >
                      <img src={img} alt="" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove image"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <label className="inline-flex items-center justify-center gap-2 rounded-2xl border border-dashed border-border hover:border-brand-orange bg-secondary/30 px-4 py-3 text-xs font-semibold cursor-pointer transition-colors flex-1">
                    {uploadingImage ? (
                      <Loader2 className="h-4 w-4 animate-spin text-brand-orange" />
                    ) : (
                      <Upload className="h-4 w-4 text-brand-orange" />
                    )}
                    <span>{uploadingImage ? "Uploading to Supabase..." : "Upload Image File"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                  </label>

                  <div className="flex gap-2 flex-1">
                    <input
                      type="url"
                      placeholder="Or paste image URL"
                      value={imageUrlInput}
                      onChange={(e) => setImageUrlInput(e.target.value)}
                      className="w-full rounded-2xl border border-border px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-brand-orange"
                    />
                    <button
                      type="button"
                      onClick={handleAddImageUrl}
                      className="px-4 py-2 rounded-2xl bg-secondary hover:bg-border text-xs font-semibold"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>

              {/* Switches */}
              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold">
                  <input
                    type="checkbox"
                    checked={formData.is_sold_out}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, is_sold_out: e.target.checked }))
                    }
                    className="h-4 w-4 rounded border-border text-brand-orange focus:ring-brand-orange"
                  />
                  <span>Mark as Sold Out</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold">
                  <input
                    type="checkbox"
                    checked={formData.is_new}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, is_new: e.target.checked }))
                    }
                    className="h-4 w-4 rounded border-border text-brand-orange focus:ring-brand-orange"
                  />
                  <span>Badge as New Arrival</span>
                </label>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-3 border-t border-border pt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-full px-5 py-2.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-full bg-brand-orange text-white px-6 py-2.5 text-sm font-semibold hover:bg-foreground transition-colors flex items-center gap-2"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-border max-w-md w-full p-6 text-center shadow-xl">
            <div className="h-12 w-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-extrabold">Delete Product?</h3>
            <p className="text-sm text-muted-foreground mt-2 mb-6">
              Are you sure you want to delete this product? This action will permanently remove it from your database.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setDeletingId(null)}
                disabled={isDeleting}
                className="rounded-full px-5 py-2.5 text-xs font-semibold border border-border hover:bg-secondary"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="rounded-full bg-red-600 text-white px-5 py-2.5 text-xs font-semibold hover:bg-red-700 flex items-center gap-2"
              >
                {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete Permanently"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
