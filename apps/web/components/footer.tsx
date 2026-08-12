import Link from "next/link";

const platformLinks = [
  { href: "/about", label: "Tentang" },
  { href: "/communities", label: "Komunitas" },
  { href: "/events", label: "Event" },
  { href: "/volunteer", label: "Volunteer" },
];

const helpLinks = [
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Kontak" },
  { href: "/privacy", label: "Kebijakan Privasi" },
  { href: "/terms", label: "Syarat & Ketentuan" },
];

export function Footer() {
  return (
    <footer className="bg-komuna-dark px-4 py-14 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_.8fr]">
          <div>
            <Link href="/" className="flex items-center gap-2">
              <img src="/icon_komuna.png" alt="KomunaID" className="h-9 w-9" />
              <span className="font-display text-2xl font-semibold">KomunaID</span>
            </Link>
            <p className="mt-5 max-w-xs font-display text-2xl leading-snug text-white/90">Hubungkan Komunitasmu, Bangun Gerakanmu, Bertumbuh Bersama.</p>
          </div>
          <FooterColumn title="KomunaID" links={platformLinks} />
          <FooterColumn title="Bantuan" links={helpLinks} />
          <div>
            <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-komuna-coral">Administrasi</h2>
            <Link href="/admin/login" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-white/75 transition hover:text-white">
              <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              Login Admin
            </Link>
          </div>
        </div>
        <div className="mt-12 flex flex-col gap-4 border-t border-white/15 pt-7 text-sm text-white/55 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} PT Komuna Digital Indonesia.</p>
          <div className="flex gap-5">
            <a href="https://instagram.com/komunaid" target="_blank" rel="noopener noreferrer" className="hover:text-white">Instagram</a>
            <a href="https://www.linkedin.com/company/komunaid" target="_blank" rel="noopener noreferrer" className="hover:text-white">LinkedIn</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-komuna-coral">{title}</h2>
      <nav className="mt-4 flex flex-col gap-3" aria-label={title}>
        {links.map((link) => <Link key={link.href} href={link.href} className="text-sm text-white/75 transition hover:text-white">{link.label}</Link>)}
      </nav>
    </div>
  );
}
