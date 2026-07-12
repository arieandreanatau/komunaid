"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import api from "@/lib/api";

interface ContactData {
  companyName: string;
  phone: string | null;
  address: string | null;
  email: string | null;
  instagram: string | null;
  facebook: string | null;
  twitter: string | null;
  threads: string | null;
  website: string | null;
  mapsUrl: string | null;
}

export default function ContactPage() {
  const [contact, setContact] = useState<ContactData>({
    companyName: "PT Komuna Digital Indonesia",
    phone: null,
    address: null,
    email: "info@komuna.id",
    instagram: null,
    facebook: null,
    twitter: null,
    threads: null,
    website: null,
    mapsUrl: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContact();
  }, []);

  const fetchContact = async () => {
    try {
      const { data } = await api.get("/admin/cms/contact");
      if (data.data) {
        setContact(data.data);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const socialLinks = [
    { key: "instagram", label: "Instagram", url: contact.instagram, icon: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" },
    { key: "facebook", label: "Facebook", url: contact.facebook, icon: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" },
    { key: "twitter", label: "Twitter / X", url: contact.twitter, icon: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" },
    { key: "threads", label: "Threads", url: contact.threads, icon: "M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.59 12c.025 3.086.718 5.496 2.057 7.164 1.432 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.34-.776-.963-1.394-1.81-1.806-.128 2.754-1.19 5.07-3.988 5.07h-.02c-2.028-.013-3.468-1.352-3.493-3.236.013-1.887 1.476-3.243 3.518-3.243h.07c1.488.028 2.693.503 3.576 1.393l1.478-1.478c-1.225-1.14-2.858-1.758-4.746-1.794h-.056c-3.254.055-5.722 1.964-6.388 4.777-.396 1.678-.166 3.144.682 4.344.885 1.245 2.392 2.084 4.475 2.498 1.612.32 3.118.267 4.346-.148 1.555-.525 2.747-1.507 3.42-2.81.535-1.037.781-2.247.745-3.648-.065-2.537-1.294-4.544-3.33-5.63-.395-.212-.816-.36-1.257-.441-.286-.052-.58-.075-.878-.072-2.737.024-4.77 1.507-5.548 3.91l-1.96-.524c.965-3.001 3.454-4.845 6.836-4.876h.07c.332 0 .66.013.983.038 2.823.225 5.06 1.525 6.302 3.68 1.014 1.76 1.178 3.757.476 5.828-.606 1.791-1.92 3.218-3.736 4.105-1.387.68-2.965.95-4.627.828z" },
  ].filter((s) => s.url);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <h1 className="text-3xl font-bold text-komuna-navy mb-3">Hubungi Kami</h1>
              <p className="text-gray-600">
                Punya pertanyaan atau masukan? Silakan hubungi kami.
              </p>
            </div>

            {/* Company Info Cards */}
            <div className="grid md:grid-cols-2 gap-6 mb-10">
              <div className="bg-white border rounded-xl p-6">
                <div className="h-12 w-12 bg-komuna-blue/10 rounded-lg flex items-center justify-center mb-4">
                  <svg className="h-6 w-6 text-komuna-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="font-semibold text-komuna-navy mb-1">Perusahaan</h3>
                <p className="text-gray-600">{contact.companyName}</p>
              </div>

              {contact.email && (
                <div className="bg-white border rounded-xl p-6">
                  <div className="h-12 w-12 bg-komuna-teal/10 rounded-lg flex items-center justify-center mb-4">
                    <svg className="h-6 w-6 text-komuna-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-komuna-navy mb-1">Email</h3>
                  <a href={`mailto:${contact.email}`} className="text-gray-600 hover:text-komuna-blue transition-colors">{contact.email}</a>
                </div>
              )}

              {contact.phone && (
                <div className="bg-white border rounded-xl p-6">
                  <div className="h-12 w-12 bg-komuna-aqua/10 rounded-lg flex items-center justify-center mb-4">
                    <svg className="h-6 w-6 text-komuna-aqua" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-komuna-navy mb-1">Telepon</h3>
                  <a href={`tel:${contact.phone}`} className="text-gray-600 hover:text-komuna-blue transition-colors">{contact.phone}</a>
                </div>
              )}

              {contact.address && (
                <div className="bg-white border rounded-xl p-6">
                  <div className="h-12 w-12 bg-komuna-navy/10 rounded-lg flex items-center justify-center mb-4">
                    <svg className="h-6 w-6 text-komuna-navy" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-komuna-navy mb-1">Alamat</h3>
                  <p className="text-gray-600 whitespace-pre-line">{contact.address}</p>
                  {contact.mapsUrl && (
                    <a href={contact.mapsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-komuna-blue hover:underline mt-2">
                      Lihat di Maps
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Social Media */}
            {socialLinks.length > 0 && (
              <div className="bg-white border rounded-xl p-6">
                <h3 className="font-semibold text-komuna-navy mb-4">Sosial Media</h3>
                <div className="flex flex-wrap gap-4">
                  {socialLinks.map((social) => (
                    <a
                      key={social.key}
                      href={social.url!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 rounded-lg hover:bg-komuna-blue/5 hover:text-komuna-blue transition-colors text-sm text-gray-700"
                    >
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d={social.icon} /></svg>
                      {social.label}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
