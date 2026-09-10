import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Eye } from "lucide-react";
import type { Product } from "@/lib/products";

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: (index % 4) * 0.06 }}
      className="group"
    >
      <Link
        to="/product/$slug"
        params={{ slug: product.slug }}
        className="block"
      >
        <div className="relative overflow-hidden rounded-3xl bg-secondary aspect-[4/5]">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=600&auto=format&fit=crop&q=80";
            }}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          />
          <div className="absolute top-3 left-3 flex gap-2">
            {product.soldOut && (
              <span className="chip bg-red-600 text-white">Sold Out</span>
            )}
            {!product.soldOut && product.isNew && (
              <span className="chip bg-brand-orange text-white">New</span>
            )}
            {!product.soldOut && product.bestSeller && (
              <span className="chip bg-foreground text-cream">Best Seller</span>
            )}
          </div>
          {product.soldOut && (
            <div className="absolute inset-0 bg-white/40" />
          )}
          <div className="absolute inset-x-3 bottom-3 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
            <div className="glass-card rounded-2xl px-4 py-3 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide">Quick view</span>
              <Eye className="h-4 w-4" />
            </div>
          </div>
        </div>
        <div className="mt-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-lg leading-tight">{product.name}</h3>
            <p className="text-xs text-muted-foreground mt-1">{product.ageRange}</p>
          </div>
          <p className="font-display text-lg">₹{product.price}</p>
        </div>
        <div className="mt-2 flex gap-1.5">
          {product.colors.map((c) => (
            <span
              key={c.name}
              className="h-3.5 w-3.5 rounded-full border border-border"
              style={{ background: c.hex }}
              title={c.name}
            />
          ))}
        </div>
      </Link>
    </motion.div>
  );
}