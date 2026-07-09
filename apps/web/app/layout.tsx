import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";

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
    <html lang="id">
      <body className="min-h-screen bg-background font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
