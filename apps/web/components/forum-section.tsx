"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { useAuth } from "@/components/auth-provider";

interface ForumThread {
  id: string;
  title: string;
  content: string;
  imageUrl: string | null;
  createdBy: { id: string; name: string; avatar: string | null };
  createdAt: string;
}

interface ForumReply {
  id: string;
  content: string;
  createdBy: { id: string; name: string; avatar: string | null };
  createdAt: string;
}

export function ForumSection({ communityId, isMember }: { communityId: string; isMember: boolean }) {
  const { user } = useAuth();
  const [threads, setThreads] = useState<ForumThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [replies, setReplies] = useState<ForumReply[]>([]);
  const [replyLoading, setReplyLoading] = useState(false);
  const [newReply, setNewReply] = useState("");
  const [newThreadOpen, setNewThreadOpen] = useState(false);
  const [newThreadTitle, setNewThreadTitle] = useState("");
  const [newThreadContent, setNewThreadContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get(`/communities/${communityId}/media`, {
          params: { type: "FORUM_POST", limit: 20, published: "true" },
        });
        setThreads(data.data || []);
      } catch {}
      finally { setLoading(false); }
    };
    fetch();
  }, [communityId]);

  useEffect(() => {
    if (!selectedThread) return;
    setReplyLoading(true);
    api.get(`/communities/${communityId}/media/${selectedThread}/replies`)
      .then((res) => setReplies(res.data.data || []))
      .catch(() => setReplies([]))
      .finally(() => setReplyLoading(false));
  }, [selectedThread, communityId]);

  const handleReply = async () => {
    if (!selectedThread || !newReply.trim()) return;
    try {
      const { data } = await api.post(`/communities/${communityId}/media/${selectedThread}/replies`, { content: newReply });
      setReplies((prev) => [...prev, data.data]);
      setNewReply("");
    } catch (err: any) {
      alert(err?.response?.data?.message || "Gagal mengirim balasan");
    }
  };

  const handleNewThread = async () => {
    if (!newThreadTitle.trim() || !newThreadContent.trim()) return;
    setSubmitting(true);
    try {
      const { data } = await api.post(`/communities/${communityId}/media`, {
        title: newThreadTitle,
        content: newThreadContent,
        type: "FORUM_POST",
        isPublished: true,
      });
      setThreads((prev) => [data.data || data, ...prev]);
      setNewThreadOpen(false);
      setNewThreadTitle("");
      setNewThreadContent("");
    } catch (err: any) {
      alert(err?.response?.data?.message || "Gagal membuat thread");
    } finally { setSubmitting(false); }
  };

  if (loading) return <div className="h-32 bg-gray-100 rounded-xl animate-pulse" />;

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-komuna-navy">Forum Diskusi</h2>
        {isMember && !selectedThread && (
          <button onClick={() => setNewThreadOpen(true)}
            className="px-3 py-1.5 text-xs font-medium text-white bg-komuna-blue rounded-lg hover:bg-komuna-navy transition-colors">
            Buat Thread
          </button>
        )}
      </div>

      {selectedThread ? (
        <div>
          <button onClick={() => { setSelectedThread(null); setReplies([]); }}
            className="flex items-center gap-1 text-sm text-komuna-blue hover:underline mb-4">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Kembali ke Forum
          </button>

          <div className="space-y-4">
            {replies.map((reply) => (
              <div key={reply.id} className="flex gap-3 p-3 rounded-lg bg-gray-50">
                {reply.createdBy.avatar ? (
                  <img src={reply.createdBy.avatar} alt={reply.createdBy.name} className="h-8 w-8 rounded-full object-cover shrink-0" />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-komuna-blue/10 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-komuna-blue">{reply.createdBy.name[0]}</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-komuna-navy">{reply.createdBy.name}</p>
                  <p className="text-sm text-gray-600 mt-0.5 whitespace-pre-line">{reply.content}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(reply.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            ))}
            {replyLoading && <div className="text-center text-sm text-gray-400">Memuat balasan...</div>}
          </div>

          {isMember && (
            <div className="mt-4 flex gap-2">
              <textarea value={newReply} onChange={(e) => setNewReply(e.target.value)}
                placeholder="Tulis balasan..." rows={2}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-komuna-blue resize-none" />
              <button onClick={handleReply}
                className="px-4 py-2 bg-komuna-blue text-white text-sm rounded-lg hover:bg-komuna-navy transition-colors shrink-0">
                Kirim
              </button>
            </div>
          )}
        </div>
      ) : (
        <>
          {newThreadOpen && (
            <div className="mb-4 p-4 border border-gray-200 rounded-lg space-y-3">
              <input value={newThreadTitle} onChange={(e) => setNewThreadTitle(e.target.value)}
                placeholder="Judul thread..." maxLength={200}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-komuna-blue" />
              <textarea value={newThreadContent} onChange={(e) => setNewThreadContent(e.target.value)}
                placeholder="Isi thread..." rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-komuna-blue resize-none" />
              <div className="flex gap-2 justify-end">
                <button onClick={() => setNewThreadOpen(false)}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Batal</button>
                <button onClick={handleNewThread} disabled={submitting}
                  className="px-3 py-1.5 text-sm text-white bg-komuna-blue rounded-lg hover:bg-komuna-navy disabled:opacity-50">
                  {submitting ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </div>
          )}

          {threads.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <svg className="h-10 w-10 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="text-sm">Belum ada diskusi</p>
            </div>
          ) : (
            <div className="space-y-2">
              {threads.map((thread) => (
                <button key={thread.id} onClick={() => setSelectedThread(thread.id)}
                  className="w-full text-left p-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-3">
                    {thread.createdBy.avatar ? (
                      <img src={thread.createdBy.avatar} alt={thread.createdBy.name} className="h-8 w-8 rounded-full object-cover shrink-0" />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-komuna-teal/10 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-komuna-teal">{thread.createdBy.name[0]}</span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-komuna-navy text-sm">{thread.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{thread.content}</p>
                      <p className="text-xs text-gray-400 mt-1">{thread.createdBy.name} · {new Date(thread.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}</p>
                    </div>
                    <svg className="h-5 w-5 text-gray-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
