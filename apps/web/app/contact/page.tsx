import type { Metadata } from "next";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "Hubungi Kami",
  description: "Hubungi tim KomunaID untuk pertanyaan, masukan, atau bantuan terkait platform.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="container mx-auto px-4 py-16 flex-1">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-komuna-navy mb-4">Hubungi Kami</h1>
          <p className="text-gray-500 text-lg mb-10">Punya pertanyaan atau masukan? Silakan hubungi kami.</p>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white border rounded-xl p-6">
              <div className="h-12 w-12 bg-komuna-blue/10 rounded-lg flex items-center justify-center mb-4">
                <svg className="h-6 w-6 text-komuna-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-semibold text-komuna-navy mb-1">Email</h3>
              <a href="mailto:support@komuna.id" className="text-gray-600 hover:text-komuna-blue transition-colors">support@komuna.id</a>
            </div>
            <div className="bg-white border rounded-xl p-6">
              <div className="h-12 w-12 bg-komuna-teal/10 rounded-lg flex items-center justify-center mb-4">
                <svg className="h-6 w-6 text-komuna-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="font-semibold text-komuna-navy mb-1">Perusahaan</h3>
              <p className="text-gray-600">PT Komuna Digital Indonesia</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
