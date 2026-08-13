import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "UXORA TICKETING DEMO — Vive más. Descubre más.",
  description: "Eventos y experiencias que vale la pena vivir.",
  icons: { icon: "/favicon.svg" },
  openGraph: {
    title: "UXORA TICKETING DEMO — Vive más. Descubre más.",
    description: "Eventos y experiencias que vale la pena vivir.",
    type: "website",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "UXORA TICKETING DEMO — Vive más. Descubre más." }],
  },
  twitter: {
    card: "summary_large_image",
    title: "UXORA TICKETING DEMO — Vive más. Descubre más.",
    description: "Eventos y experiencias que vale la pena vivir.",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es"><body className={inter.variable}>{children}</body></html>;
}
