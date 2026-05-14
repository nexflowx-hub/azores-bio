import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import MariaChat from "@/components/MariaChat";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "AZORES.BIO — Produtos Premium dos Açores",
  description:
    "Produtos premium das 9 ilhas dos Açores, selecionados com rigor e entregues em todo o mundo. Queijos DOP, vinhos, conservas, chás e muito mais.",
  keywords: [
    "Açores",
    "Azores",
    "produtos açorianos",
    "queijo São Jorge",
    "vinho do Pico",
    "chá Gorreana",
    "DOP",
    "gourmet",
    "Portugal",
    "bio",
  ],
  authors: [{ name: "Azores Meet, Lda" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "AZORES.BIO — Produtos Premium dos Açores",
    description:
      "Produtos premium das 9 ilhas dos Açores, selecionados com rigor e entregues em todo o mundo.",
    url: "https://azores.bio",
    siteName: "AZORES.BIO",
    type: "website",
    locale: "pt_PT",
    alternateLocale: ["en_GB", "fr_FR", "de_DE"],
  },
  twitter: {
    card: "summary_large_image",
    title: "AZORES.BIO — Produtos Premium dos Açores",
    description:
      "Produtos premium das 9 ilhas dos Açores, selecionados com rigor e entregues em todo o mundo.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt" suppressHydrationWarning>
      <body className="antialiased bg-background text-foreground">
        <Providers>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <CartDrawer />
          <MariaChat />
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
