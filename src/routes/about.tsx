import { createFileRoute } from "@tanstack/react-router";
import about from "@/assets/about.jpg";
import { Heart, Leaf, Sparkles, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Tiny.co" },
      { name: "description", content: "Made for little adventures. The story, mission and quality promise behind Tiny.co." },
      { property: "og:title", content: "About Tiny.co — Made for Little Adventures" },
      { property: "og:description", content: "Premium kids fashion designed and crafted with care." },
    ],
  }),
  component: AboutPage,
});

const SECTIONS = [
  { icon: Heart, title: "Our Story", body: "Tiny.co was born in a tiny studio with a big idea: kids' clothes that look as good as they feel. What started as gifts for our nieces and nephews became a brand worn by families across the world." },
  { icon: Sparkles, title: "Our Mission", body: "To design playful, premium pieces that celebrate childhood without sacrificing style — clothes parents love as much as kids do." },
  { icon: Leaf, title: "Our Vision", body: "A wardrobe where every piece is made to be loved, worn-in, washed, and passed down — never thrown away." },
  { icon: ShieldCheck, title: "Quality Promise", body: "Certified organic fibers, ethical partners, and a fit-team of real toddlers (the toughest critics) approving every silhouette." },
];

function AboutPage() {
  return (
    <div>
      <section className="mx-auto max-w-7xl px-5 md:px-8 pt-10 pb-20 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <p className="chip bg-secondary text-brand-orange">About Tiny.co</p>
          <h1 className="mt-3 text-5xl md:text-6xl font-extrabold leading-tight">Made for <span className="text-brand-orange">Little</span> <span className="text-brand-pink">Adventures</span></h1>
          <p className="mt-5 text-lg text-muted-foreground">We believe childhood should be lived in colour. Tiny.co designs premium, playful clothing that lets kids be kids — comfy, confident, and ready for anything.</p>
        </div>
        <div className="rounded-[2.5rem] overflow-hidden aspect-[5/4] shadow-[0_30px_80px_-30px_rgba(224,87,45,0.4)]">
          <img src={about} alt="Children running in a field" className="h-full w-full object-cover" loading="lazy" />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 md:px-8 py-10 grid sm:grid-cols-2 gap-5">
        {SECTIONS.map((s, i) => {
          const Icon = s.icon;
          const tints = ["var(--brand-orange)", "var(--brand-pink)", "var(--brand-blue)", "var(--brand-green)"];
          return (
            <div key={s.title} className="rounded-3xl bg-white border border-border p-8">
              <div className="h-12 w-12 rounded-2xl flex items-center justify-center text-white mb-4" style={{ background: tints[i] }}>
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="font-display text-2xl">{s.title}</h2>
              <p className="mt-3 text-muted-foreground">{s.body}</p>
            </div>
          );
        })}
      </section>

      <section className="mx-auto max-w-4xl px-5 md:px-8 py-20 text-center">
        <h2 className="font-display text-4xl md:text-5xl font-extrabold">"Tiny styles, big smiles."</h2>
        <p className="mt-5 text-muted-foreground">That's our promise — and the only KPI we really care about.</p>
      </section>
    </div>
  );
}