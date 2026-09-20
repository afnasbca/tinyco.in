import { Link } from "@tanstack/react-router";
import { Instagram, Facebook, Mail } from "lucide-react";
import logo from "@/assets/logo.png";
import { SITE } from "@/lib/site-config";

export function Footer() {
  return (
    <footer className="mt-24 bg-foreground text-cream">
      <div className="mx-auto max-w-7xl px-5 md:px-8 py-16 grid gap-12 md:grid-cols-4">
        <div className="md:col-span-1">
          <img src={logo} alt="Tiny.co" className="h-10 w-auto brightness-[1.05] mb-4" />
          <p className="text-sm text-cream/70 max-w-xs">
            {SITE.tagline} Premium kids fashion designed for the small humans who run the world.
          </p>
          <div className="mt-5 flex gap-3">
            <a href={SITE.instagram} aria-label="Instagram" className="rounded-full bg-cream/10 p-2.5 hover:bg-brand-pink transition-colors">
              <Instagram className="h-4 w-4" />
            </a>
            <a href="#" aria-label="Facebook" className="rounded-full bg-cream/10 p-2.5 hover:bg-brand-blue transition-colors">
              <Facebook className="h-4 w-4" />
            </a>
            <a href={`mailto:${SITE.email}`} aria-label="Email" className="rounded-full bg-cream/10 p-2.5 hover:bg-brand-yellow transition-colors">
              <Mail className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-widest text-cream/60 mb-4">Shop</h4>
          <ul className="space-y-2.5 text-sm">
            <li><Link to="/shop" className="hover:text-brand-yellow">All Products</Link></li>
            <li><Link to="/new-arrivals" className="hover:text-brand-yellow">New Arrivals</Link></li>
            <li><Link to="/shop" className="hover:text-brand-yellow">Boys</Link></li>
            <li><Link to="/shop" className="hover:text-brand-yellow">Girls</Link></li>
            <li><Link to="/shop" className="hover:text-brand-yellow">kids</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-widest text-cream/60 mb-4">Company</h4>
          <ul className="space-y-2.5 text-sm">
            <li><Link to="/about" className="hover:text-brand-yellow">Our Story</Link></li>
            <li><Link to="/contact" className="hover:text-brand-yellow">Contact</Link></li>
            <li><a href="#" className="hover:text-brand-yellow">Sizing Guide</a></li>
            <li><a href="#" className="hover:text-brand-yellow">Shipping</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-widest text-cream/60 mb-4">Stay in the loop</h4>
          <p className="text-sm text-cream/70 mb-3">Tiny news, drops & 10% off your first order.</p>
          <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="you@email.com"
              className="flex-1 rounded-full bg-cream/10 border border-cream/15 px-4 py-2.5 text-sm placeholder:text-cream/40 focus:outline-none focus:border-brand-yellow"
            />
            <button className="rounded-full bg-brand-orange px-4 py-2.5 text-sm font-semibold hover:bg-brand-yellow hover:text-foreground transition-colors">
              Join
            </button>
          </form>
        </div>
      </div>
      <div className="border-t border-cream/10">
        <div className="mx-auto max-w-7xl px-5 md:px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-cream/50">
          <p>© {new Date().getFullYear()} Tiny.co — All tiny rights reserved.</p>
          <p>Made with little hands & big hearts.</p>
        </div>
      </div>
    </footer>
  );
}