"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import api from "@/lib/api";

interface StructureMember {
  id: string;
  name: string;
  position: string;
  email: string | null;
  phone: string | null;
  avatar: string | null;
  bio: string | null;
  order: number;
}

interface StructureNode {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  position: number;
  members: StructureMember[];
  children: StructureNode[];
}

export default function OrganizationStructurePage() {
  const [structures, setStructures] = useState<StructureNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchStructure();
  }, []);

  const fetchStructure = async () => {
    try {
      const { data } = await api.get("/organization-structure");
      setStructures(data.data || []);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Gagal memuat data struktur organisasi.");
    } finally {
      setLoading(false);
    }
  };

  const renderNode = (node: StructureNode, level: number = 0) => (
    <div key={node.id} className={`${level > 0 ? "ml-6 md:ml-10 border-l-2 border-komuna-blue/20 pl-6" : ""}`}>
      <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
        <div className="flex items-start gap-4">
          {node.imageUrl ? (
            <img src={node.imageUrl} alt={node.title} className="h-16 w-16 rounded-xl object-cover shrink-0" />
          ) : (
            <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-komuna-blue to-komuna-navy flex items-center justify-center shrink-0">
              <span className="text-white text-2xl font-bold">{node.title[0]}</span>
            </div>
          )}
          <div className="flex-1">
            <h3 className="text-lg font-bold text-komuna-navy">{node.title}</h3>
            {node.description && (
              <p className="text-sm text-gray-600 mt-1">{node.description}</p>
            )}
          </div>
        </div>

        {node.members.length > 0 && (
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {node.members.map((member) => (
              <div key={member.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                {member.avatar ? (
                  <img src={member.avatar} alt={member.name} className="h-12 w-12 rounded-full object-cover shrink-0" />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-komuna-teal/10 flex items-center justify-center shrink-0">
                    <span className="text-komuna-teal font-bold text-sm">{member.name[0]}</span>
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-komuna-navy truncate">{member.name}</p>
                  <p className="text-xs text-komuna-blue font-medium">{member.position}</p>
                  {member.email && (
                    <p className="text-xs text-gray-500 truncate">{member.email}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {node.children.length > 0 && (
        <div className="space-y-4">
          {node.children.map((child) => renderNode(child, level + 1))}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-komuna-cream">
      <Header />
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <h1 className="text-3xl font-bold text-komuna-navy mb-3">Struktur Organisasi</h1>
              <p className="text-gray-600 max-w-xl mx-auto">
                Kenali tim di balik KomunaID â€” PT Komuna Digital Indonesia
              </p>
            </div>

            {loading && (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="h-12 w-12 border-4 border-komuna-blue border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-gray-500">Memuat struktur organisasi...</p>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
                <p className="text-red-600">{error}</p>
              </div>
            )}

            {!loading && !error && structures.length === 0 && (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Belum Ada Data</h3>
                <p className="text-sm text-gray-500">Struktur organisasi belum tersedia saat ini.</p>
              </div>
            )}

            {!loading && !error && structures.length > 0 && (
              <div className="space-y-6">
                {structures.map((node) => renderNode(node))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
