import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-plus-jakarta",
});

export const metadata: Metadata = {
  title: "KomunaID - Platform Komunitas Digital Indonesia",
  description:
    "Platform digital untuk menghubungkan individu, komunitas, organisasi, event, dan ekosistem kolaborasi secara terstruktur.",
  keywords: [
    "komunitas",
    "digital",
    "indonesia",
    "event",
    "organisasi",
    "komuna",
  ],
  icons: {
    icon: "/favicon.png",
  },
  other: {
    "theme-color": "#0A1D4D",
  },
  openGraph: {
    title: "KomunaID",
    description: "Terhubung. Berdaya. Berdampak.",
    url: "https://komuna.id",
    siteName: "KomunaID",
    locale: "id_ID",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={plusJakarta.variable}>
      <body className="min-h-screen bg-background font-sans antialiased" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
