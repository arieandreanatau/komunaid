import { describe, expect, it } from "vitest";
import { getCommunityNavigation } from "../../components/sidebar/navigation";
import type { CommunityRole } from "@komunaid/shared";

function allLabels(role: CommunityRole | string): string[] {
  const sections = getCommunityNavigation("cmt-1", role);
  return sections.flatMap((s) => s.items.map((i) => i.label));
}

describe("getCommunityNavigation", () => {
  const ALL_EXPECTED = [
    "Overview",
    "Profil Komunitas",
    "Permintaan",
    "Event",
    "Volunteer",
    "Pengurus",
    "Anggota",
    "Media",
    "Aktivitas",
    "Pengaturan",
  ];

  it("OWNER sees all navigation items", () => {
    const labels = allLabels("OWNER");
    for (const label of ALL_EXPECTED) {
      expect(labels).toContain(label);
    }
  });

  it("ADMIN sees all navigation items", () => {
    const labels = allLabels("ADMIN");
    for (const label of ALL_EXPECTED) {
      expect(labels).toContain(label);
    }
  });

  it("EVENT_MANAGER sees Event but NOT Volunteer, Permintaan, Pengurus, Media, Pengaturan, Aktivitas", () => {
    const labels = allLabels("EVENT_MANAGER");
    expect(labels).toContain("Event");
    expect(labels).toContain("Overview");
    expect(labels).toContain("Profil Komunitas");
    expect(labels).toContain("Anggota");
    expect(labels).not.toContain("Volunteer");
    expect(labels).not.toContain("Permintaan");
    expect(labels).not.toContain("Pengurus");
    expect(labels).not.toContain("Media");
    expect(labels).not.toContain("Pengaturan");
    expect(labels).not.toContain("Aktivitas");
  });

  it("VOLUNTEER_COORDINATOR sees Volunteer but NOT Event, Permintaan, Pengurus, Media, Pengaturan, Aktivitas", () => {
    const labels = allLabels("VOLUNTEER_COORDINATOR");
    expect(labels).toContain("Volunteer");
    expect(labels).toContain("Overview");
    expect(labels).toContain("Profil Komunitas");
    expect(labels).toContain("Anggota");
    expect(labels).not.toContain("Event");
    expect(labels).not.toContain("Permintaan");
    expect(labels).not.toContain("Pengurus");
    expect(labels).not.toContain("Media");
    expect(labels).not.toContain("Pengaturan");
    expect(labels).not.toContain("Aktivitas");
  });

  it("MEMBER only sees ungated items (Overview, Profil Komunitas, Anggota)", () => {
    const labels = allLabels("MEMBER");
    expect(labels).toContain("Overview");
    expect(labels).toContain("Profil Komunitas");
    expect(labels).toContain("Anggota");
    expect(labels).not.toContain("Event");
    expect(labels).not.toContain("Volunteer");
    expect(labels).not.toContain("Permintaan");
    expect(labels).not.toContain("Pengurus");
    expect(labels).not.toContain("Media");
    expect(labels).not.toContain("Pengaturan");
    expect(labels).not.toContain("Aktivitas");
  });
});
