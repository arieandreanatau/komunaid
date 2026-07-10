import Link from "next/link";

export function VolunteerCTA() {
  return (
    <div className="bg-gradient-to-r from-komuna-teal to-komuna-aqua rounded-xl p-6 mt-8">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 bg-white/20 rounded-lg flex items-center justify-center shrink-0">
            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Ingin jadi relawan?</h2>
            <p className="text-white/80 mt-0.5">Temukan peluang volunteer dari komunitas dan organisasi di seluruh Indonesia.</p>
          </div>
        </div>
        <Link
          href="/volunteer"
          className="px-6 py-3 bg-white text-komuna-teal rounded-lg font-semibold hover:bg-gray-100 transition-colors whitespace-nowrap"
        >
          Lihat Peluang Volunteer
        </Link>
      </div>
    </div>
  );
}
