"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { useAuth } from "@/components/auth-provider";

interface GalleryItem {
  id: string;
  title: string;
  content: string;
  imageUrl: string | null;
  type: string;
  createdBy: { id: string; name: string; avatar: string | null };
  createdAt: string;
}

export function GallerySection({ communityId, isMember }: { communityId: string; isMember: boolean }) {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get(`/communities/${communityId}/media`, {
          params: { type: "GALLERY", limit: 50, published: "true" },
        });
        setItems(data.data || []);
      } catch {}
      finally { setLoading(false); }
    };
    fetch();
  }, [communityId]);

  if (loading) return <div className="h-32 bg-gray-100 rounded-xl animate-pulse" />;
  if (items.length === 0) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-lg font-semibold text-komuna-navy mb-4">Galeri Foto</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => setSelectedImage(item.imageUrl)}
            className="group relative aspect-square rounded-lg overflow-hidden bg-gray-100 hover:ring-2 hover:ring-komuna-blue transition-all"
          >
            {item.imageUrl ? (
              <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <p className="text-white text-xs font-medium truncate">{item.title}</p>
            </div>
          </button>
        ))}
      </div>

      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={() => setSelectedImage(null)}>
          <button onClick={() => setSelectedImage(null)} className="absolute top-4 right-4 text-white/80 hover:text-white">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <img src={selectedImage} alt="Gallery" className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain" />
        </div>
      )}
    </div>
  );
}
