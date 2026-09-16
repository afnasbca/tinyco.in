import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { PRODUCTS } from "@/lib/products";
import { ProductCard } from "@/components/ProductCard";

type CategoryKey = "boys" | "girls" | "accessories" | "footwear";
const CATS = ["boys", "girls", "accessories", "footwear"] as const;
const CAT_LABELS: Record<CategoryKey, string> = {
  boys: "Baby Boys",
  girls: "Baby Girls",
  accessories: "Accessories",
  footwear: "Footwear",
};

export const Route = createFileRoute("/shop")({
  validateSearch: (search: Record<string, unknown>) => {
    const raw = typeof search.category === "string" ? search.category : undefined;
    const category = raw && (CATS as readonly string[]).includes(raw) ? (raw as CategoryKey) : undefined;
    return { category } as { category?: CategoryKey };
  },
  head: ({ match }) => {
    const cat = (match.search as { category?: CategoryKey }).category;
    const label = cat ? CAT_LABELS[cat] : null;
    const title = label ? `${label} — Tiny.co` : "Shop — Tiny.co";
    const description = label
      ? `Browse ${label} at Tiny.co: premium kids clothing curated for little ones.`
      : "Browse the full Tiny.co collection: premium kids clothing for baby boys, girls, baby and accessories.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: ShopPage,
});


const AGES = [
  "0-3 Months",
  "3-6 Months",
  "6-9 Months",
  "9-12 Months",
  "1-2 Years",
  "2-3 Years",
  "3-4 Years"
];
const GENDERS = ["Boys", "Girls", "Unisex"] as const;
const COLOR_FILTERS = [
  { name: "Orange", hex: "#E0572D" },
  { name: "Pink", hex: "#F28FA3" },
  { name: "Green", hex: "#31A363" },
  { name: "Blue", hex: "#207CD8" },
  { name: "Yellow", hex: "#F69E1C" },
  { name: "Cream", hex: "#FFF8F0" },
];

type Filters = {
  cats: Set<string>;
  genders: Set<string>;
  ages: Set<string>;
  colors: Set<string>;
};

function ShopPage() {
  const { category } = Route.useSearch();
  const [filters, setFilters] = useState<Filters>({
    cats: new Set<string>(category ? [category] : []),
    genders: new Set(),
    ages: new Set(),
    colors: new Set(),
  });

  useEffect(() => {
    setFilters((f) => {
      const next = new Set<string>(category ? [category] : []);
      return { ...f, cats: next };
    });
  }, [category]);

  const [sort, setSort] = useState<"featured" | "low" | "high">("featured");
  const [mobileOpen, setMobileOpen] = useState(false);

  const filtered = useMemo(() => {
    let list = PRODUCTS.filter((p) => {
      if (filters.cats.size && !filters.cats.has(p.category)) return false;
      if (filters.genders.size && !filters.genders.has(p.gender)) return false;
      if (filters.colors.size && !p.colors.some((c) => filters.colors.has(c.hex))) return false;
      if (filters.ages.size && !p.sizes.some((s) => filters.ages.has(s))) return false;
      return true;
    });
    if (sort === "low") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "high") list = [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [filters, sort]);

  const toggle = (key: keyof Filters, value: string) => {
    setFilters((f) => {
      const next = new Set(f[key]);
      next.has(value) ? next.delete(value) : next.add(value);
      return { ...f, [key]: next };
    });
  };

  const SidebarContent = (
    <div className="space-y-8">
      <FilterGroup title="Category">
        {CATS.map((c) => (
          <Check key={c} label={CAT_LABELS[c]} checked={filters.cats.has(c)} onChange={() => toggle("cats", c)} />
        ))}
      </FilterGroup>
      <FilterGroup title="Gender">
        {GENDERS.map((g) => (
          <Check key={g} label={g} checked={filters.genders.has(g)} onChange={() => toggle("genders", g)} />
        ))}
      </FilterGroup>
      <FilterGroup title="Age / Size">
        {AGES.map((a) => (
          <Check key={a} label={a} checked={filters.ages.has(a)} onChange={() => toggle("ages", a)} />
        ))}
      </FilterGroup>
      <FilterGroup title="Color">
        <div className="flex flex-wrap gap-2 pt-1">
          {COLOR_FILTERS.map((c) => {
            const active = filters.colors.has(c.hex);
            return (
              <button
                key={c.name}
                onClick={() => toggle("colors", c.hex)}
                title={c.name}
                className={`h-8 w-8 rounded-full border-2 transition-all ${active ? "ring-2 ring-offset-2 ring-brand-orange border-white" : "border-white"}`}
                style={{ background: c.hex }}
              />
            );
          })}
        </div>
      </FilterGroup>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-5 md:px-8 pt-10 pb-20">
      <div className="mb-10">
        <p className="chip bg-secondary text-brand-orange">Shop everything</p>
        <h1 className="mt-3 text-4xl md:text-5xl font-extrabold">The Tiny.co <span className="text-brand-orange">collection</span></h1>
        <p className="mt-3 text-muted-foreground max-w-xl">Premium kids fashion designed in-house and made to be lived in.</p>
      </div>

      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => setMobileOpen(true)}
          className="md:hidden inline-flex items-center gap-2 rounded-full bg-white border border-border px-4 py-2 text-sm font-semibold"
        >
          <SlidersHorizontal className="h-4 w-4" /> Filters
        </button>
        <p className="text-sm text-muted-foreground hidden md:block">{filtered.length} products</p>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as typeof sort)}
          className="rounded-full bg-white border border-border px-4 py-2 text-sm font-medium"
        >
          <option value="featured">Featured</option>
          <option value="low">Price: Low to High</option>
          <option value="high">Price: High to Low</option>
        </select>
      </div>

      <div className="grid md:grid-cols-[260px_1fr] gap-10">
        <aside className="hidden md:block sticky top-28 self-start rounded-3xl bg-white border border-border p-6">
          {SidebarContent}
        </aside>

        {mobileOpen && (
          <div className="fixed inset-0 z-50 bg-black/40 md:hidden" onClick={() => setMobileOpen(false)}>
            <div className="absolute inset-y-0 left-0 w-[85%] max-w-sm bg-cream p-6 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-display text-xl">Filters</h3>
                <button onClick={() => setMobileOpen(false)} className="text-sm">Close</button>
              </div>
              {SidebarContent}
            </div>
          </div>
        )}

        <div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-5 md:gap-7">
            {filtered.map((p, i) => <ProductCard key={p.slug} product={p} index={i} />)}
          </div>
          {filtered.length === 0 && (
            <p className="text-center py-20 text-muted-foreground">No products match these filters.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">{title}</h4>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer text-sm">
      <span
        onClick={onChange}
        className={`h-4 w-4 rounded border-2 flex items-center justify-center transition-colors ${checked ? "bg-brand-orange border-brand-orange" : "border-border"}`}
      >
        {checked && <span className="h-1.5 w-1.5 rounded-sm bg-white" />}
      </span>
      <span>{label}</span>
    </label>
  );
}