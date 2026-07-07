import Link from 'next/link';

const footerLinks = {
  platform: [
    { label: 'Tentang', href: '/about' },
    { label: 'FAQ', href: '/faq' },
    { label: 'Kontak', href: '/contact' },
    { label: 'Pedoman', href: '/guidelines' },
  ],
  explore: [
    { label: 'Komunitas', href: '/communities' },
    { label: 'Event', href: '/events' },
  ],
  legal: [
    { label: 'Syarat & Ketentuan', href: '/terms' },
    { label: 'Kebijakan Privasi', href: '/privacy' },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50">
      <div className="container-komuna py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="md:col-span-1">
            <Link href="/" className="text-xl font-bold text-navy">
              KomunaID
            </Link>
            <p className="mt-3 text-sm text-gray-500">
              Platform digital untuk menghubungkan individu, komunitas, organisasi, event, dan
              ekosistem kolaborasi.
            </p>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold text-gray-900">Platform</h3>
            <ul className="space-y-2">
              {footerLinks.platform.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-gray-500 hover:text-gray-700">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold text-gray-900">Jelajahi</h3>
            <ul className="space-y-2">
              {footerLinks.explore.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-gray-500 hover:text-gray-700">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold text-gray-900">Legal</h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-gray-500 hover:text-gray-700">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-200 pt-8">
          <p className="text-center text-sm text-gray-400">
            &copy; {new Date().getFullYear()} KomunaID. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
