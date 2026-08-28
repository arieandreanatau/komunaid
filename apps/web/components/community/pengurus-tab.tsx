"use client";

import { can, type CommunityRole } from "@komunaid/shared";
import type { Member } from "./types";
import { roleBadge } from "./types";

export function PengurusTab({
  officers,
  loading,
  role,
  currentUserId,
  onChangeRole,
  onRemoveMember,
}: {
  officers: Member[];
  loading: boolean;
  /** The viewer's own community role. Every affordance below is derived
   * from this through can() -- never from an ownership boolean. */
  role: CommunityRole | null;
  currentUserId?: string;
  onChangeRole: (memberId: string, role: string) => void;
  onRemoveMember: (memberId: string, name: string) => void;
}) {
  const canChangeRole = can(role, "changeMemberRole");
  const canManagePengurus = can(role, "managePengurus");
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4">
        <p className="text-sm text-gray-500">
          Pengurus komunitas adalah anggota dengan peran governance dan operasional. Owner memiliki kewenangan tertinggi.
        </p>
        {role === "OWNER" && <span className="whitespace-nowrap rounded-full bg-purple-100 px-2.5 py-1 text-xs font-bold text-purple-700">Owner access</span>}
      </div>

      {loading ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <div className="h-8 w-8 border-4 border-komuna-blue border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : officers.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-400 text-sm">
          Belum ada pengurus selain owner. Gunakan tab Anggota untuk menetapkan peran.
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm divide-y divide-gray-100">
          {officers.map((member) => (
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
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${roleBadge[member.role] || ""}`}>
                {member.role === "OWNER" ? "Owner" : member.role === "ADMIN" ? "Admin" : member.role === "EVENT_MANAGER" ? "Officer · Event" : member.role === "VOLUNTEER_COORDINATOR" ? "Officer · Volunteer" : member.role}
              </span>
              {member.userId !== currentUserId && (
                <div className="flex items-center gap-2 flex-shrink-0">
                  {canChangeRole && member.role !== "OWNER" && (
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
                  {canManagePengurus && member.role !== "OWNER" && (
                    <button
                      onClick={() => onRemoveMember(member.id, member.name)}
                      className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Keluarkan pengurus"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6" />
                      </svg>
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
