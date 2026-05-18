import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Strukly — Indonesian Receipt Scanner with MiMo VL",
  description:
    "Snap a struk, get structured spending data. Built with Xiaomi MiMo VL for Indonesian UMKM owners and freelancers.",
  openGraph: {
    title: "Strukly",
    description:
      "Indonesian receipt scanner powered by MiMo VL multimodal reasoning.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
