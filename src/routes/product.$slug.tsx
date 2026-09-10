import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { Minus, Plus, ChevronLeft } from "lucide-react";
import { PRODUCTS, getProduct, type Product } from "@/lib/products";
import { ProductCard } from "@/components/ProductCard";
import { whatsappLink, buildOrderMessage } from "@/lib/site-config";
import { WhatsAppIcon } from "@/components/WhatsAppButton";
import { ProductReviews } from "@/components/ProductReviews";


export const Route = createFileRoute("/product/$slug")({
  loader: ({ params }) => {
    const product = getProduct(params.slug);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => ({
    meta: loaderData?.product
      ? [
          { title: `${loaderData.product.name} — Tiny.co` },
          { name: "description", content: loaderData.product.description },
          { property: "og:title", content: `${loaderData.product.name} — Tiny.co` },
          { property: "og:description", content: loaderData.product.description },
          { property: "og:image", content: loaderData.product.image },
        ]
      : [],
  }),
  notFoundComponent: () => (
    <div className="py-32 text-center">
      <h1 className="font-display text-3xl">Product not found</h1>
      <Link to="/shop" className="mt-4 inline-block text-brand-orange">Back to shop</Link>
    </div>
  ),
  component: ProductPage,
});

function ProductPage() {
  const { product } = Route.useLoaderData() as { product: Product };
  const [size, setSize] = useState(product.sizes[2] ?? product.sizes[0]);
  const [color, setColor] = useState(product.colors[0]);
  const [qty, setQty] = useState(1);
  const [zoom, setZoom] = useState(false);

  const message = buildOrderMessage({
    product: product.name,
    size,
    color: color.name,
    quantity: qty,
  });

  const related = PRODUCTS.filter((p) => p.slug !== product.slug).slice(0, 4);

  return (
    <div className="mx-auto max-w-7xl px-5 md:px-8 pt-8 pb-20">
      <Link to="/shop" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-brand-orange mb-6">
        <ChevronLeft className="h-4 w-4" /> Back to shop
      </Link>

      <div className="grid lg:grid-cols-2 gap-10">
        <div>
          <div
            className="relative overflow-hidden rounded-[2rem] aspect-[4/5] bg-secondary cursor-zoom-in"
            onClick={() => setZoom((v) => !v)}
          >
            <img
              src={product.image}
              alt={product.name}
              className={`h-full w-full object-cover transition-transform duration-500 ${zoom ? "scale-150" : "scale-100"}`}
            />
          </div>
          <div className="mt-3 grid grid-cols-4 gap-3">
            {[product.image, product.image, product.image, product.image].map((img, i) => (
              <div key={i} className="rounded-2xl overflow-hidden bg-secondary aspect-square border border-border">
                <img src={img} alt="" className="h-full w-full object-cover" loading="lazy" />
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="chip bg-secondary text-brand-orange">{product.category[0].toUpperCase() + product.category.slice(1)}</p>
          <h1 className="mt-3 text-4xl md:text-5xl font-extrabold">{product.name}</h1>
          <div className="mt-2 flex items-baseline gap-3">
            <p className="font-display text-3xl">₹{product.price}</p>
            <p className="text-sm text-muted-foreground">{product.ageRange}</p>
          </div>
          <p className="mt-5 text-muted-foreground leading-relaxed">{product.description}</p>

          <div className="mt-8">
            <Label>Color: <span className="font-normal text-muted-foreground">{color.name}</span></Label>
            <div className="mt-3 flex gap-2">
              {product.colors.map((c) => (
                <button
                  key={c.name}
                  onClick={() => setColor(c)}
                  className={`h-10 w-10 rounded-full border-2 transition-all ${color.name === c.name ? "ring-2 ring-offset-2 ring-brand-orange border-white" : "border-white"}`}
                  style={{ background: c.hex }}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          <div className="mt-6">
            <Label>Size</Label>
            <div className="mt-3 flex flex-wrap gap-2">
              {product.sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${size === s ? "bg-foreground text-cream border-foreground" : "bg-white border-border hover:border-brand-orange"}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <Label>Quantity</Label>
            <div className="mt-3 inline-flex items-center rounded-full bg-white border border-border">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-3 py-2.5"><Minus className="h-4 w-4" /></button>
              <span className="w-10 text-center font-medium">{qty}</span>
              <button onClick={() => setQty((q) => q + 1)} className="px-3 py-2.5"><Plus className="h-4 w-4" /></button>
            </div>
          </div>

          {product.soldOut ? (
            <button
              disabled
              className="mt-8 flex items-center justify-center gap-2 w-full rounded-full bg-muted text-muted-foreground py-4 font-semibold cursor-not-allowed"
            >
              Sold Out
            </button>
          ) : (
            <a
              href={whatsappLink(message)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 group flex items-center justify-center gap-2 w-full rounded-full bg-[#25D366] text-white py-4 font-semibold hover:bg-[#1ebe5b] transition-colors"
            >
              <WhatsAppIcon className="h-5 w-5" /> Order on WhatsApp
            </a>
          )}
          <p className="mt-2 text-xs text-center text-muted-foreground">{product.soldOut ? "This item is currently unavailable." : "We'll confirm availability & delivery via WhatsApp."}</p>

          <div className="mt-8 grid sm:grid-cols-2 gap-3">
            <Detail title="Fabric" body={product.fabric} />
            <Detail title="Care" body={product.care} />
          </div>
        </div>
      </div>

      <ProductReviews slug={product.slug} />

      <section className="mt-24">
        <h2 className="font-display text-3xl md:text-4xl font-extrabold mb-8">You might also love</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 md:gap-7">
          {related.map((p, i) => <ProductCard key={p.slug} product={p} index={i} />)}
        </div>
      </section>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <div className="text-xs font-semibold uppercase tracking-widest text-foreground">{children}</div>;
}

function Detail({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl bg-white border border-border p-4">
      <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{title}</div>
      <div className="mt-1 text-sm">{body}</div>
    </div>
  );
}