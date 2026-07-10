interface JsonLdProps {
  type: "website" | "organization" | "event" | "community";
  data?: Record<string, unknown>;
}

const BASE_URL = "https://komuna.id";

export function JsonLd({ type, data = {} }: JsonLdProps) {
  let jsonLd: Record<string, unknown> = {};

  switch (type) {
    case "website":
      jsonLd = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "KomunaID",
        alternateName: "KomunaID - Platform Komunitas Digital Indonesia",
        url: BASE_URL,
        description: "Platform digital untuk menghubungkan individu, komunitas, organisasi, event, dan ekosistem kolaborasi secara terstruktur di Indonesia.",
        inLanguage: "id",
        ...data,
      };
      break;
    case "organization":
      jsonLd = {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "PT Komuna Digital Indonesia",
        url: BASE_URL,
        logo: `${BASE_URL}/logo_komunaid.png`,
        description: "Platform komunitas digital Indonesia",
        sameAs: [],
        ...data,
      };
      break;
    case "event":
      jsonLd = {
        "@context": "https://schema.org",
        "@type": "Event",
        ...data,
      };
      break;
    case "community":
      jsonLd = {
        "@context": "https://schema.org",
        "@type": "Organization",
        ...data,
      };
      break;
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
