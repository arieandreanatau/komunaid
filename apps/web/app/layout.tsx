import type { Metadata, Viewport } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-plus-jakarta",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-fraunces",
});

export const metadata: Metadata = {
  title: {
    default: "KomunaID - Platform Komunitas Digital Indonesia",
    template: "%s | KomunaID",
  },
  description:
    "Platform digital untuk menghubungkan individu, komunitas, event, dan volunteer secara terstruktur di Indonesia.",
  keywords: [
    "komunitas",
    "digital",
    "indonesia",
    "event",
    "volunteer",
    "komuna",
  ],
  authors: [{ name: "PT Komuna Digital Indonesia" }],
  creator: "PT Komuna Digital Indonesia",
  metadataBase: new URL("https://komuna.id"),
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: "/favicon.png",
    apple: "/icon_komuna.png",
  },
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://komuna.id",
    siteName: "KomunaID",
    title: "KomunaID - Platform Komunitas Digital Indonesia",
    description: "Terhubung. Berdaya. Berdampak. Platform komunitas digital Indonesia.",
    images: [
      {
        url: "/logo_komunaid.png",
        width: 1200,
        height: 630,
        alt: "KomunaID",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "KomunaID - Platform Komunitas Digital Indonesia",
    description: "Terhubung. Berdaya. Berdampak. Platform komunitas digital Indonesia.",
    images: ["/logo_komunaid.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#0F5B52",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${plusJakarta.variable} ${fraunces.variable}`}>
      <head>
        <link rel="icon" href="/favicon.png" sizes="any" />
        <link rel="apple-touch-icon" href="/icon_komuna.png" />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
