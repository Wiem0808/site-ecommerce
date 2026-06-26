import type { Metadata } from "next";
import "./globals.css";
import ClientLayout from "@/components/ClientLayout";

export const metadata: Metadata = {
  title: "WIWISHOP — Premium E-Commerce | Tech, Fashion, Beauty & More",
  description: "Discover premium products curated for the modern world. From cutting-edge tech to timeless fashion, WIWISHOP delivers worldwide with real-time tracking.",
  keywords: "WIWISHOP, e-commerce, premium shopping, tech, fashion, beauty, international delivery",
  icons: {
    icon: '/logo-wiw.png',
    apple: '/logo-wiw.png',
  },
  openGraph: {
    title: "WIWISHOP — Premium E-Commerce",
    description: "Premium shopping, redefined. Discover curated collections from around the world.",
    type: "website",
    siteName: "WIWISHOP",
    images: [{ url: '/logo-wiw.png', width: 1200, height: 400, alt: 'WIWISHOP' }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" data-theme="dark" suppressHydrationWarning>
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
