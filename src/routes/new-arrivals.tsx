import { createFileRoute } from "@tanstack/react-router";
import { PRODUCTS } from "@/lib/products";
import { ProductCard } from "@/components/ProductCard";
import { Blobs } from "@/components/Blobs";

export const Route = createFileRoute("/new-arrivals")({
  head: () => ({
    meta: [
      { title: "New Arrivals — Tiny.co" },
      { name: "description", content: "The latest drops from Tiny.co — fresh styles for baby boys, girls and kids." },
      { property: "og:title", content: "New Arrivals — Tiny.co" },
      { property: "og:description", content: "The latest drops from Tiny.co." },
    ],
  }),
  component: NewArrivals,
});

function NewArrivals() {
  const items = PRODUCTS.filter((p) => p.isNew);
  return (
    <div className="mx-auto max-w-7xl px-5 md:px-8 pt-10 pb-20">
      <section className="relative overflow-hidden rounded-[2.5rem] bg-white border border-border p-10 md:p-16 mb-14">
        <Blobs />
        <p className="chip bg-secondary text-brand-orange">Fresh off the rack</p>
        <h1 className="mt-3 text-5xl md:text-6xl font-extrabold max-w-3xl">New <span className="text-brand-orange">arrivals</span> for the season</h1>
        <p className="mt-4 text-muted-foreground max-w-xl">Hand-picked, just-landed pieces designed in-house and made in small batches.</p>
      </section>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 md:gap-7">
        {items.map((p, i) => <ProductCard key={p.slug} product={p} index={i} />)}
      </div>
    </div>
  );
}