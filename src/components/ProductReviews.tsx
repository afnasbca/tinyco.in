import { useState } from "react";
import { Star, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type Review = {
  id: string;
  name: string;
  rating: number;
  comment: string;
  created_at: string;
};

const COLORS = [
  "var(--brand-orange)",
  "var(--brand-pink)",
  "var(--brand-blue)",
  "var(--brand-green)",
];

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const day = 86400000;
  if (diff < day) return "Today";
  const d = Math.floor(diff / day);
  if (d < 7) return `${d} day${d > 1 ? "s" : ""} ago`;
  if (d < 30) return `${Math.floor(d / 7)} week${d >= 14 ? "s" : ""} ago`;
  const m = Math.floor(d / 30);
  return `${m} month${m > 1 ? "s" : ""} ago`;
}

function Stars({ value, className = "h-4 w-4" }: { value: number; className?: string }) {
  return (
    <div className="flex gap-0.5 text-brand-yellow">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`${className} ${i < value ? "fill-current" : "opacity-30"}`} />
      ))}
    </div>
  );
}

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  const active = hover || value;
  return (
    <div className="flex gap-1 text-brand-yellow" onMouseLeave={() => setHover(0)}>
      {Array.from({ length: 5 }).map((_, i) => (
        <button
          key={i}
          type="button"
          aria-label={`Rate ${i + 1} star${i ? "s" : ""}`}
          onMouseEnter={() => setHover(i + 1)}
          onClick={() => onChange(i + 1)}
          className="transition-transform hover:scale-110"
        >
          <Star className={`h-6 w-6 ${i < active ? "fill-current" : "opacity-30"}`} />
        </button>
      ))}
    </div>
  );
}

export function ProductReviews({ slug }: { slug: string }) {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["reviews", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_reviews")
        .select("id,name,rating,comment,created_at")
        .eq("product_slug", slug)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Review[];
    },
  });

  const submit = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("product_reviews").insert({
        product_slug: slug,
        name: name.trim(),
        rating,
        comment: comment.trim(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Thanks for your review!");
      setName("");
      setComment("");
      setRating(5);
      queryClient.invalidateQueries({ queryKey: ["reviews", slug] });
    },
    onError: () => toast.error("Could not post your review. Please try again."),
  });

  const avg = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;

  return (
    <section className="mt-24">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <h2 className="font-display text-3xl md:text-4xl font-extrabold">Parent reviews</h2>
          <div className="mt-3 flex items-center gap-3">
            <Stars value={Math.round(avg)} className="h-5 w-5" />
            <span className="text-sm text-muted-foreground">
              {reviews.length
                ? `${avg.toFixed(1)} out of 5 · ${reviews.length} review${reviews.length > 1 ? "s" : ""}`
                : "No reviews yet — be the first!"}
            </span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Write a review */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!name.trim() || !comment.trim()) {
              toast.error("Please add your name and a short review.");
              return;
            }
            submit.mutate();
          }}
          className="rounded-3xl bg-white border border-border p-6 h-fit"
        >
          <h3 className="font-display text-xl font-bold">Write a review</h3>
          <div className="mt-4 space-y-4">
            <StarPicker value={rating} onChange={setRating} />
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={60}
              placeholder="Your name"
              className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
            />
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={1000}
              rows={4}
              placeholder="How was the fit, fabric and quality?"
              className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            />
            <button
              type="submit"
              disabled={submit.isPending}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:brightness-105 disabled:opacity-60"
            >
              {submit.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Post review
            </button>
          </div>
        </form>

        {/* Review list */}
        <div className="lg:col-span-2 grid sm:grid-cols-2 gap-5 content-start">
          {isLoading && (
            <p className="text-sm text-muted-foreground">Loading reviews…</p>
          )}
          {!isLoading && reviews.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No reviews for this piece yet. Share your experience!
            </p>
          )}
          {reviews.map((r, i) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.45, delay: Math.min(i, 4) * 0.06 }}
              className="rounded-3xl bg-white border border-border p-6"
            >
              <div className="flex items-center gap-3">
                <div
                  className="h-10 w-10 rounded-full flex items-center justify-center text-white font-display text-base"
                  style={{ background: COLORS[i % COLORS.length] }}
                >
                  {r.name[0]?.toUpperCase()}
                </div>
                <div>
                  <div className="font-semibold text-sm">{r.name}</div>
                  <div className="text-xs text-muted-foreground">{timeAgo(r.created_at)}</div>
                </div>
              </div>
              <div className="mt-4">
                <Stars value={r.rating} />
              </div>
              <p className="mt-3 text-sm leading-relaxed text-foreground/90 whitespace-pre-line">
                {r.comment}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
