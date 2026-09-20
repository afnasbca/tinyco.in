export function Blobs() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
      <div className="blob h-72 w-72 -top-10 -left-10" style={{ background: "var(--brand-orange)" }} />
      <div className="blob h-80 w-80 top-1/3 -right-16" style={{ background: "var(--brand-pink)" }} />
      <div className="blob h-64 w-64 bottom-0 left-1/3" style={{ background: "var(--brand-yellow)" }} />
    </div>
  );
}