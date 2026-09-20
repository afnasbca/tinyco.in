import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, MapPin, Clock, Instagram } from "lucide-react";
import { SITE, whatsappLink } from "@/lib/site-config";
import { WhatsAppIcon } from "@/components/WhatsAppButton";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Tiny.co" },
      { name: "description", content: "Get in touch with Tiny.co. Order on WhatsApp, send a message or visit our studio." },
      { property: "og:title", content: "Contact Tiny.co" },
      { property: "og:description", content: "We'd love to hear from you." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [sent, setSent] = useState(false);

  return (
    <div className="mx-auto max-w-7xl px-5 md:px-8 pt-10 pb-20">
      <div className="text-center max-w-2xl mx-auto mb-14">
        <p className="chip bg-secondary text-brand-orange">Say hi</p>
        <h1 className="mt-3 text-5xl md:text-6xl font-extrabold">We'd <span className="text-brand-pink">love</span> to hear from you</h1>
        <p className="mt-4 text-muted-foreground">Questions about sizing, drops, or wholesale? Our tiny team usually replies within a few hours.</p>
      </div>

      <div className="grid lg:grid-cols-[1fr_1.2fr] gap-8">
        <div className="space-y-4">
          <a
            href={whatsappLink(`Hi ${SITE.name}! I have a question.`)}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-3xl bg-foreground text-cream p-6 hover:bg-brand-orange transition-colors"
          >
            <WhatsAppIcon className="h-6 w-6 mb-3" />
            <h3 className="font-display text-xl">Order on WhatsApp</h3>
            <p className="text-sm opacity-80 mt-1">Fastest way to reach us — chat directly with the studio.</p>
          </a>
          <InfoCard icon={Mail} title="Email" value={SITE.email} tint="var(--brand-blue)" />
          <InfoCard icon={Instagram} title="Instagram" value={SITE.instagramHandle} tint="var(--brand-pink)" />
          <InfoCard icon={MapPin} title="Studio" value={SITE.address} tint="var(--brand-green)" />
          <InfoCard icon={Clock} title="Hours" value={SITE.hours} tint="var(--brand-yellow)" />
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSent(true);
          }}
          className="rounded-3xl bg-white border border-border p-8"
        >
          <h2 className="font-display text-2xl mb-6">Send a message</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="First name" name="first" />
            <Field label="Last name" name="last" />
          </div>
          <Field label="Email" type="email" name="email" className="mt-4" />
          <Field label="Subject" name="subject" className="mt-4" />
          <div className="mt-4">
            <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Message</label>
            <textarea rows={5} className="mt-2 w-full rounded-2xl bg-secondary/50 border border-border px-4 py-3 focus:outline-none focus:border-brand-orange" />
          </div>
          <button className="mt-6 w-full rounded-full bg-foreground text-cream py-3.5 font-semibold hover:bg-brand-orange transition-colors">
            {sent ? "Thanks — we'll be in touch ✨" : "Send message"}
          </button>
        </form>
      </div>

      <div className="mt-12 rounded-3xl overflow-hidden border border-border aspect-[16/7] bg-secondary">
        <iframe
          title="Map"
          src="https://www.openstreetmap.org/export/embed.html?bbox=-74.01%2C40.69%2C-73.95%2C40.73&amp;layer=mapnik"
          className="w-full h-full"
        />
      </div>
    </div>
  );
}

function InfoCard({ icon: Icon, title, value, tint }: { icon: any; title: string; value: string; tint: string }) {
  return (
    <div className="rounded-3xl bg-white border border-border p-5 flex items-center gap-4">
      <div className="h-11 w-11 rounded-2xl flex items-center justify-center text-white" style={{ background: tint }}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <div className="text-xs uppercase tracking-widest text-muted-foreground">{title}</div>
        <div className="font-medium">{value}</div>
      </div>
    </div>
  );
}

function Field({ label, name, type = "text", className = "" }: { label: string; name: string; type?: string; className?: string }) {
  return (
    <div className={className}>
      <label htmlFor={name} className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{label}</label>
      <input id={name} name={name} type={type} className="mt-2 w-full rounded-full bg-secondary/50 border border-border px-4 py-3 focus:outline-none focus:border-brand-orange" />
    </div>
  );
}