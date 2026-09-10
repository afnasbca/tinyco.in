// Site-wide configuration. Update the WhatsApp number here.
export const SITE = {
  name: "Tiny.co",
  tagline: "Tiny Styles, Big Smiles.",
  // International format, digits only. Replace with the real store number.
  whatsappNumber: "919605635672",
  email: "hello@tiny.co",
  instagram: "https://www.instagram.com/tiny._co?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==",
  instagramHandle: "@tiny._co",
  address: "221 Linen Lane, Suite 4 — Brooklyn, NY",
  hours: "Mon – Sat · 9am – 7pm",
};

export function whatsappLink(message: string) {
  return `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

export function buildOrderMessage(args: {
  product: string;
  size?: string;
  color?: string;
  quantity?: number;
}) {
  return [
    `Hi ${SITE.name}!`,
    "",
    "I would like to order:",
    `Product: ${args.product}`,
    args.size ? `Size: ${args.size}` : null,
    args.color ? `Color: ${args.color}` : null,
    args.quantity ? `Quantity: ${args.quantity}` : null,
    "",
    "Please share availability and delivery details.",
  ]
    .filter(Boolean)
    .join("\n");
}