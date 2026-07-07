export default function AboutPage() {
  return (
    <div className="container-komuna py-16">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-6 text-4xl font-bold text-gray-900">Tentang KomunaID</h1>

        <section className="mb-12">
          <h2 className="mb-4 text-2xl font-semibold text-navy">Misi Kami</h2>
          <p className="text-gray-600 leading-relaxed">
            KomunaID hadir untuk menjadi jembatan digital yang menghubungkan individu, komunitas,
            organisasi, dan ekosistem kolaborasi di seluruh Indonesia. Kami percaya bahwa setiap
            komunitas memiliki potensi besar untuk menciptakan dampak positif bagi masyarakat.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="mb-4 text-2xl font-semibold text-navy">Visi Kami</h2>
          <p className="text-gray-600 leading-relaxed">
            Menjadi platform digital terdepan di Indonesia yang memberdayakan komunitas untuk
            tumbuh, terhubung, dan berkolaborasi secara efektif. Kami ingin membangun ekosistem di
            mana setiap orang dapat menemukan komunitas yang sesuai, berpartisipasi dalam event yang
            bermakna, dan berkontribusi untuk perubahan sosial.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="mb-4 text-2xl font-semibold text-navy">Nilai-Nilai Kami</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {[
              {
                title: 'Terhubung',
                desc: 'Membangun jaringan yang kuat antar komunitas dan individu.',
              },
              {
                title: 'Berdaya',
                desc: 'Memberdayakan komunitas dengan tools dan resources yang dibutuhkan.',
              },
              {
                title: 'Berdampak',
                desc: 'Menciptakan dampak positif yang nyata bagi masyarakat.',
              },
              { title: 'Inklusif', desc: 'Menjadi platform yang terbuka untuk semua kalangan.' },
            ].map((value) => (
              <div key={value.title} className="card">
                <h3 className="mb-2 text-lg font-semibold text-teal">{value.title}</h3>
                <p className="text-sm text-gray-500">{value.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="mb-4 text-2xl font-semibold text-navy">Tim Kami</h2>
          <p className="mb-6 text-gray-600">
            KomunaID dibangun oleh tim yang berdedikasi dan passionate dalam membangun teknologi
            untuk kebaikan.
          </p>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {['Product', 'Engineering', 'Design', 'Community'].map((dept) => (
              <div key={dept} className="text-center">
                <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-royal/10 text-lg font-bold text-royal">
                  {dept.charAt(0)}
                </div>
                <p className="text-sm font-medium text-gray-900">{dept}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold text-navy">PT Komuna Digital Indonesia</h2>
          <p className="text-gray-600 leading-relaxed">
            KomunaID adalah produk dari PT Komuna Digital Indonesia, sebuah perusahaan teknologi
            yang berfokus pada pembangunan platform digital untuk pemberdayaan komunitas di
            Indonesia.
          </p>
        </section>
      </div>
    </div>
  );
}
