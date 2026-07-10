import Link from "next/link";

const platformLinks = [
  { href: "/communities", label: "Komunitas" },
  { href: "/events", label: "Event" },
  { href: "/organizations", label: "Organisasi" },
  { href: "/volunteer", label: "Volunteer" },
];

const legalLinks = [
  { href: "/terms", label: "Syarat & Ketentuan" },
  { href: "/privacy", label: "Kebijakan Privasi" },
  { href: "/community-guidelines", label: "Panduan Komunitas" },
  { href: "/event-guidelines", label: "Panduan Event" },
  { href: "/volunteer-guidelines", label: "Panduan Volunteer" },
];

const aboutLinks = [
  { href: "/about", label: "Tentang Kami" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Kontak" },
];

export function Footer() {
  return (
    <footer className="bg-komuna-navy text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <img src="/icon_komuna.png" alt="KomunaID" className="h-8 w-8" />
              <span className="font-bold text-lg">KomunaID</span>
            </Link>
            <p className="text-sm text-white/70 mb-4">Terhubung. Berdaya. Berdampak.</p>
            <p className="text-xs text-white/50">
              Platform komunitas digital Indonesia yang menghubungkan individu, komunitas, organisasi, dan ekosistem kolaborasi.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-sm">Platform</h4>
            <div className="flex flex-col gap-2 text-sm text-white/70">
              {platformLinks.map((link) => (
                <Link key={link.href} href={link.href} className="hover:text-komuna-aqua transition-colors">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-sm">Legal</h4>
            <div className="flex flex-col gap-2 text-sm text-white/70">
              {legalLinks.map((link) => (
                <Link key={link.href} href={link.href} className="hover:text-komuna-aqua transition-colors">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-sm">Tentang</h4>
            <div className="flex flex-col gap-2 text-sm text-white/70">
              {aboutLinks.map((link) => (
                <Link key={link.href} href={link.href} className="hover:text-komuna-aqua transition-colors">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 mt-8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-white/50">
          <p>&copy; {new Date().getFullYear()} PT Komuna Digital Indonesia. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="https://instagram.com/komunaid" target="_blank" rel="noopener noreferrer" className="hover:text-komuna-aqua transition-colors" aria-label="Instagram">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
            </a>
            <a href="mailto:info@komuna.id" className="hover:text-komuna-aqua transition-colors" aria-label="Email">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
