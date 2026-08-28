"use client";

import { can, type CommunityRole } from "@komunaid/shared";
import type { Member } from "./types";
import { roleBadge } from "./types";

export function AnggotaTab({
  members,
  memberSearch,
  setMemberSearch,
  memberRoleFilter,
  setMemberRoleFilter,
  memberStatusFilter,
  setMemberStatusFilter,
  memberPage,
  setMemberPage,
  memberTotalPages,
  role,
  currentUserId,
  onChangeRole,
  onRemoveMember,
  onRestoreMember,
}: {
  members: Member[];
  memberSearch: string;
  setMemberSearch: (v: string) => void;
  memberRoleFilter: string;
  setMemberRoleFilter: (v: string) => void;
  memberStatusFilter: string;
  setMemberStatusFilter: (v: string) => void;
  memberPage: number;
  setMemberPage: (v: number) => void;
  memberTotalPages: number;
  /** The viewer's own community role. Every affordance below is derived
   * from this through can() -- never from an ownership boolean. */
  role: CommunityRole | null;
  currentUserId?: string;
  onChangeRole: (memberId: string, role: string) => void;
  onRemoveMember: (memberId: string, name: string) => void;
  onRestoreMember: (memberId: string, name: string) => void;
}) {
  const canChangeRole = can(role, "changeMemberRole");
  const canManageMembers = can(role, "manageMembers");
  return (
    <div className="space-y-4">
      <div className="flex gap-1 border-b border-gray-200 pb-px">
        {[{ value: "", label: "Anggota Aktif" }, { value: "BANNED", label: "Diblokir" }].map((f) => (
          <button
            key={f.value}
            onClick={() => { setMemberStatusFilter(f.value); setMemberPage(1); }}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${memberStatusFilter === f.value ? "border-komuna-blue text-komuna-blue" : "border-transparent text-gray-500 hover:text-gray-700"}`}
          >
            {f.label}
          </button>
        ))}
      </div>
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={memberSearch}
              onChange={(e) => { setMemberSearch(e.target.value); setMemberPage(1); }}
              placeholder="Cari anggota..."
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue outline-none"
            />
          </div>
          <select
            value={memberRoleFilter}
            onChange={(e) => { setMemberRoleFilter(e.target.value); setMemberPage(1); }}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-komuna-blue focus:border-komuna-blue outline-none"
          >
            <option value="">Semua Role</option>
            <option value="OWNER">Owner</option>
            <option value="ADMIN">Admin</option>
            <option value="EVENT_MANAGER">Event Manager</option>
            <option value="VOLUNTEER_COORDINATOR">Volunteer Coordinator</option>
            <option value="MEMBER">Member</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm divide-y divide-gray-100">
        {members.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">{memberStatusFilter === "BANNED" ? "Tidak ada anggota yang diblokir." : "Tidak ada anggota ditemukan."}</div>
        ) : (
          members.map((member) => (
            <div key={member.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors">
              {member.avatar ? (
                <img src={member.avatar} alt="" className="h-10 w-10 rounded-full object-cover flex-shrink-0" />
              ) : (
                <div className="h-10 w-10 rounded-full bg-komuna-blue flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-sm">{member.name?.[0]}</span>
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="font-medium text-komuna-navy truncate">{member.name}</p>
                <p className="text-xs text-gray-400">@{member.username}</p>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${member.status === "BANNED" ? "bg-red-100 text-red-600" : roleBadge[member.role] || ""}`}>
                {member.status === "BANNED" ? "Diblokir" : member.role}
              </span>
              {member.userId !== currentUserId && member.status !== "BANNED" && (
                <div className="flex items-center gap-2 flex-shrink-0">
                  {canChangeRole && (
                    <select
                      value={member.role}
                      onChange={(e) => onChangeRole(member.id, e.target.value)}
                      className="px-2 py-1 border border-gray-200 rounded text-xs bg-white focus:ring-1 focus:ring-komuna-blue outline-none"
                    >
                      <option value="MEMBER">Member</option>
                      <option value="ADMIN">Admin</option>
                      <option value="EVENT_MANAGER">Manajer Event</option>
                      <option value="VOLUNTEER_COORDINATOR">Koordinator Volunteer</option>
                    </select>
                  )}
                  {canManageMembers && member.role !== "OWNER" && (
                    <button
                      onClick={() => onRemoveMember(member.id, member.name)}
                      className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Keluarkan anggota"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6" />
                      </svg>
                    </button>
                  )}
                </div>
              )}
              {member.userId !== currentUserId && member.status === "BANNED" && (
                <button
                  onClick={() => onRestoreMember(member.id, member.name)}
                  className="px-3 py-1.5 text-xs font-medium text-white bg-emerald-500 rounded-lg hover:bg-emerald-600 transition-colors flex-shrink-0"
                >
                  Pulihkan
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {memberTotalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setMemberPage(Math.max(1, memberPage - 1))}
            disabled={memberPage <= 1}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
          >
            Sebelumnya
          </button>
          <span className="text-sm text-gray-500">
            {memberPage} / {memberTotalPages}
          </span>
          <button
            onClick={() => setMemberPage(Math.min(memberTotalPages, memberPage + 1))}
            disabled={memberPage >= memberTotalPages}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
          >
            Berikutnya
          </button>
        </div>
      )}
    </div>
  );
}
