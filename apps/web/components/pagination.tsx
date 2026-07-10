"use client";

export function Pagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
}) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter((p) => {
      if (totalPages <= 7) return true;
      if (p === 1 || p === totalPages) return true;
      if (Math.abs(p - page) <= 1) return true;
      return false;
    })
    .reduce<(number | "...")[]>((acc, p, i, arr) => {
      if (i > 0) {
        const prev = arr[i - 1];
        if (p - prev > 1) acc.push("...");
      }
      acc.push(p);
      return acc;
    }, []);

  return (
    <div className="flex justify-center items-center gap-1 mt-10">
      <button
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="px-3 py-2 rounded-lg text-sm font-medium border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        Prev
      </button>
      {pages.map((item, i) =>
        item === "..." ? (
          <span key={`ellipsis-${i}`} className="px-2 py-2 text-sm text-gray-400">...</span>
        ) : (
          <button
            key={item}
            onClick={() => onPageChange(item)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              item === page
                ? "bg-komuna-blue text-white"
                : "bg-white border border-gray-200 hover:bg-gray-50"
            }`}
          >
            {item}
          </button>
        )
      )}
      <button
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className="px-3 py-2 rounded-lg text-sm font-medium border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        Next
      </button>
    </div>
  );
}
