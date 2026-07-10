import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sedang Dalam Pemeliharaan",
  description: "KomunaID sedang dalam pemeliharaan sistem. Kami akan segera kembali.",
};

export default function MaintenancePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-komuna-navy via-komuna-blue to-komuna-teal">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="h-20 w-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="h-10 w-10 text-komuna-aqua" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-white mb-3">
          Sedang Dalam Pemeliharaan
        </h1>
        <p className="text-white/80 mb-2">
          Kami sedang melakukan pemeliharaan sistem untuk meningkatkan kualitas layanan.
        </p>
        <p className="text-white/60 text-sm mb-8">
          Estimasi pemeliharaan: beberapa jam ke depan. Terima kasih atas kesabaran Anda.
        </p>
        <div className="bg-white/10 rounded-xl p-4 mb-8">
          <p className="text-white/80 text-sm">
            Butuh bantuan segera? Hubungi kami di{" "}
            <a href="mailto:info@komuna.id" className="text-komuna-aqua hover:underline">
              info@komuna.id
            </a>
          </p>
        </div>
        <a
          href="https://komuna.id"
          className="inline-block px-6 py-3 bg-komuna-aqua text-komuna-navy rounded-lg font-semibold hover:bg-white transition-colors"
        >
          Coba Lagi Nanti
        </a>
      </div>
    </div>
  );
}
