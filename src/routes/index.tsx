import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Heart, Leaf, ShieldCheck, Star, Quote } from "lucide-react";

import hero from "@/assets/hero.jpg";
import boys from "@/assets/cat-boys.jpg";
import girls from "@/assets/cat-girls.jpg";
import baby from "@/assets/cat-baby.jpg";
import accessories from "@/assets/cat-accessories.jpg";
import footwear from "@/assets/cat-footwear.jpg";
import insta1 from "@/assets/insta1.jpg";
import insta2 from "@/assets/insta2.jpg";
import insta3 from "@/assets/insta3.jpg";
import insta4 from "@/assets/insta4.jpg";
import { PRODUCTS } from "@/lib/products";
import { ProductCard } from "@/components/ProductCard";
import { Blobs } from "@/components/Blobs";
import { SITE } from "@/lib/site-config";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Tiny.co — Tiny Styles, Big Smiles" },
      { name: "description", content: "Premium, playful kids fashion designed for every tiny adventure. Shop the Tiny.co collection." },
      { property: "og:title", content: "Tiny.co — Tiny Styles, Big Smiles" },
      { property: "og:description", content: "Premium, playful kids fashion designed for every tiny adventure." },
    ],
  }),
  component: Index,
});

const CATEGORIES = [
  { slug: "boys", title: "Baby Boys", subtitle: "Cool, comfy, ready for adventure", image: boys, tint: "var(--brand-blue)" },
  { slug: "girls", title: "Baby Girls", subtitle: "Twirl, play, repeat", image: girls, tint: "var(--brand-pink)" },
  { slug: "accessories", title: "Accessories", subtitle: "Little finishing touches", image: accessories, tint: "var(--brand-green)" },
  { slug: "footwear", title: "Footwear", subtitle: "Tiny steps, big style", image: footwear, tint: "var(--brand-orange)" },
] as const;

const FEATURES = [
  { icon: Leaf, title: "Premium Fabric", body: "GOTS-certified organic cottons and responsibly sourced knits." },
  { icon: Heart, title: "Kid-Friendly Comfort", body: "Tag-free, soft elastics and seams that move with little bodies." },
  { icon: Sparkles, title: "Trendy Designs", body: "Editorial silhouettes & playful prints, refreshed every season." },
  { icon: ShieldCheck, title: "Trusted Quality", body: "Built to be worn, washed and passed down to the next little one." },
];

const TESTIMONIALS = [
  { name: "Amelia R.", role: "Mom of two", text: "The quality is unreal — my daughter has worn the Meadow dress all summer and it still looks new.", color: "var(--brand-pink)" },
  { name: "Daniel K.", role: "Dad of one", text: "Finally, kids clothes that don't look like cartoons. Tiny.co nails the modern look without losing the fun.", color: "var(--brand-blue)" },
  { name: "Priya S.", role: "Mom of three", text: "Soft fabrics, gorgeous colors, easy WhatsApp ordering. They've become our go-to.", color: "var(--brand-orange)" },
];

function Index() {
  const newArrivals = PRODUCTS.filter((p) => p.isNew).slice(0, 4);
  const bestSellers = PRODUCTS.filter((p) => p.bestSeller);

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <Blobs />
        <div className="mx-auto max-w-7xl px-5 md:px-8 pt-10 md:pt-16 pb-20 grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="relative"
          >
            <span className="chip bg-white text-brand-orange border border-brand-orange/20">
              <Sparkles className="h-3.5 w-3.5" /> Spring / Summer Collection
            </span>
            <h1 className="mt-5 text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.02]">
              Dress Their <br />
              <span className="text-brand-orange">Little</span>{" "}
              <span className="text-brand-pink">Adventures</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-lg">
              Comfortable, playful and stylish clothing made for every tiny moment — from sunny play dates to dreamy bedtimes.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/shop"
                className="group inline-flex items-center gap-2 rounded-full bg-foreground text-cream px-7 py-3.5 text-sm font-semibold hover:bg-brand-orange transition-colors"
              >
                Shop Collection
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/new-arrivals"
                className="inline-flex items-center gap-2 rounded-full bg-white border border-border px-7 py-3.5 text-sm font-semibold hover:border-brand-orange hover:text-brand-orange transition-colors"
              >
                New Arrivals
              </Link>
            </div>

            <div className="mt-10 flex items-center gap-6 text-sm text-muted-foreground">
              <div>
                <div className="font-display text-2xl text-foreground">12k+</div>
                Happy families
              </div>
              <div className="h-10 w-px bg-border" />
              <div>
                <div className="font-display text-2xl text-foreground">4.9 ★</div>
                Parent reviews
              </div>
              <div className="h-10 w-px bg-border hidden sm:block" />
              <div className="hidden sm:block">
                <div className="font-display text-2xl text-foreground">100%</div>
                Organic cotton
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="relative"
          >
            <div className="relative rounded-[2.5rem] overflow-hidden aspect-[4/5] bg-secondary shadow-[0_30px_80px_-30px_rgba(224,87,45,0.45)]">
              <img
                src={hero}
                alt="Children wearing trendy Tiny.co outfits"
                className="h-full w-full object-cover"
                width={1920}
                height={1080}
              />
            </div>
            {/* Floating cards */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -left-4 top-10 glass-card rounded-2xl p-3 pr-5 flex items-center gap-3"
            >
              <div className="h-10 w-10 rounded-xl bg-brand-yellow flex items-center justify-center text-white">
                <Star className="h-5 w-5" />
              </div>
              <div className="text-xs">
                <div className="font-semibold">Best Seller</div>
                <div className="text-muted-foreground">Sunny Cable Knit</div>
              </div>
            </motion.div>
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -right-4 bottom-12 glass-card rounded-2xl px-4 py-3"
            >
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  <div className="h-6 w-6 rounded-full bg-brand-pink border-2 border-white" />
                  <div className="h-6 w-6 rounded-full bg-brand-blue border-2 border-white" />
                  <div className="h-6 w-6 rounded-full bg-brand-green border-2 border-white" />
                </div>
                <span className="text-xs font-medium">5 new colors</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="mx-auto max-w-7xl px-5 md:px-8 py-16">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="chip bg-secondary text-brand-orange">Shop by category</p>
            <h2 className="mt-3 text-4xl md:text-5xl font-extrabold">Find their <span className="text-brand-pink">perfect fit</span></h2>
          </div>
          <Link to="/shop" className="hidden md:inline-flex items-center gap-1 text-sm font-semibold hover:text-brand-orange">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {CATEGORIES.map((cat, i) => (
            <motion.div
              key={cat.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            >
              <Link to="/shop" search={{ category: cat.slug }} className="group block">
                <div className="relative overflow-hidden rounded-3xl aspect-[3/4] bg-secondary">
                  <img src={cat.image} alt={cat.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/0 to-transparent" />
                  <div className="absolute inset-x-4 bottom-4">
                    <div className="glass-card rounded-2xl px-4 py-3 flex items-center justify-between">
                      <div>
                        <h3 className="font-display text-lg leading-tight">{cat.title}</h3>
                        <p className="text-[11px] text-muted-foreground leading-tight">{cat.subtitle}</p>
                      </div>
                      <div className="h-8 w-8 rounded-full flex items-center justify-center text-white" style={{ background: cat.tint }}>
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* NEW ARRIVALS */}
      <section className="mx-auto max-w-7xl px-5 md:px-8 py-16">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="chip bg-secondary text-brand-orange">Just landed</p>
            <h2 className="mt-3 text-4xl md:text-5xl font-extrabold">New <span className="text-brand-blue">arrivals</span></h2>
          </div>
          <Link to="/new-arrivals" className="hidden md:inline-flex items-center gap-1 text-sm font-semibold hover:text-brand-orange">
            See all new <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 md:gap-7">
          {newArrivals.map((p, i) => <ProductCard key={p.slug} product={p} index={i} />)}
        </div>
      </section>

      {/* BEST SELLERS — carousel-style */}
      <section className="py-16 bg-gradient-to-b from-transparent to-secondary/60">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="chip bg-white text-brand-orange">Loved by tiny humans</p>
              <h2 className="mt-3 text-4xl md:text-5xl font-extrabold">Best <span className="text-brand-green">sellers</span></h2>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto scrollbar-hide">
          <div className="mx-auto max-w-7xl px-5 md:px-8">
            <div className="flex gap-6 pb-4 snap-x snap-mandatory">
              {bestSellers.map((p) => (
                <div key={p.slug} className="snap-start shrink-0 w-[78%] sm:w-[48%] lg:w-[31%]">
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* WHY */}
      <section className="mx-auto max-w-7xl px-5 md:px-8 py-20">
        <div className="text-center max-w-2xl mx-auto">
          <p className="chip bg-secondary text-brand-orange">Why Tiny.co</p>
          <h2 className="mt-3 text-4xl md:text-5xl font-extrabold">Premium care, in <span className="text-brand-orange">every stitch</span></h2>
          <p className="mt-4 text-muted-foreground">We design every piece to feel like a hug — beautiful enough for the photo, comfy enough for the playground.</p>
        </div>
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            const tints = ["var(--brand-orange)", "var(--brand-pink)", "var(--brand-blue)", "var(--brand-green)"];
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="rounded-3xl bg-white border border-border p-6 hover:-translate-y-1 transition-transform"
              >
                <div className="h-12 w-12 rounded-2xl flex items-center justify-center text-white mb-4" style={{ background: tints[i] }}>
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-display text-xl">{f.title}</h3>
                <p className="text-sm text-muted-foreground mt-2">{f.body}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="mx-auto max-w-7xl px-5 md:px-8 py-16">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="chip bg-secondary text-brand-orange">Parent reviews</p>
          <h2 className="mt-3 text-4xl md:text-5xl font-extrabold">Tiny styles, <span className="text-brand-yellow">big smiles</span></h2>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="rounded-3xl bg-white border border-border p-7 relative"
            >
              <Quote className="h-8 w-8 text-brand-orange/30 mb-3" />
              <p className="text-foreground/90 leading-relaxed">"{t.text}"</p>
              <div className="mt-5 flex items-center gap-3">
                <div className="h-11 w-11 rounded-full flex items-center justify-center text-white font-display text-lg" style={{ background: t.color }}>
                  {t.name[0]}
                </div>
                <div>
                  <div className="font-semibold">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
                <div className="ml-auto flex gap-0.5 text-brand-yellow">
                  {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-current" />)}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* INSTAGRAM */}
      <section className="mx-auto max-w-7xl px-5 md:px-8 py-16">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <a
            href={SITE.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="chip bg-secondary text-brand-orange hover:bg-brand-orange/10 transition-colors inline-block"
          >
            {SITE.instagramHandle} on Instagram
          </a>
          <h2 className="mt-3 text-4xl md:text-5xl font-extrabold">Tagged with <span className="text-brand-pink">#tinystyles</span></h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {[insta1, insta2, insta3, insta4].map((img, i) => (
            <a
              key={i}
              href={SITE.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className={`group relative overflow-hidden rounded-3xl ${i % 2 === 0 ? "aspect-[4/5]" : "aspect-square md:aspect-[4/5]"}`}
            >
              <img src={img} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}