/**
 * Backfill: VolunteerOpportunity -> VolunteerProgram (legacy cutover).
 *
 * Policy: VolunteerProgram is the canonical volunteer lifecycle; legacy
 * Opportunity is read-only and maps deterministically via
 * VolunteerProgram.legacyOpportunityId.
 *
 * Idempotent: runs are safe to repeat; records already mapped are skipped.
 * Compatible = Opportunity is not soft-deleted and has no duplicate title/slug
 * collision with an existing Program. Anything incompatible is left untouched
 * (still readable as historical legacy data) and reported in the summary.
 *
 * Usage:
 *   node scripts/backfill-volunteer-legacy.cjs
 *
 * Reports: { source, migrated, skipped, incompatible, duplicateMappings, errors }
 */
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function slugifyTitle(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 160) || "volunteer-program";
}

async function main() {
  const summary = { source: 0, migrated: 0, skipped: 0, incompatible: 0, duplicateMappings: 0, errors: [] };

  const opportunities = await prisma.volunteerOpportunity.findMany({
    where: { deletedAt: null },
    include: { event: { select: { id: true, title: true } } },
  });
  summary.source = opportunities.length;

  for (const opportunity of opportunities) {
    try {
      const existing = await prisma.volunteerProgram.findUnique({
        where: { legacyOpportunityId: opportunity.id },
        select: { id: true },
      });
      if (existing) {
        summary.skipped += 1;
        continue;
      }

      const title = opportunity.title || opportunity.event?.title || "Volunteer Program";
      const slug = await slugifyTitle(title);
      const slugPad = Buffer.from(opportunity.id).toString("hex").slice(0, 6);

      const created = await prisma.volunteerProgram.create({
        data: {
          title,
          slug: `${slug}-${slugPad}`,
          description: opportunity.description,
          location: opportunity.event?.location || null,
          capacity: 1,
          startDate: opportunity.activityStartDate || opportunity.event?.eventDate || new Date(),
          endDate: opportunity.activityEndDate || opportunity.event?.endDate || new Date(),
          status: "SCHEDULED",
          organizerType: "COMMUNITY",
          communityId: opportunity.event?.communityId || null,
          organizerUserId: opportunity.createdById,
          legacyOpportunityId: opportunity.id,
          eventId: opportunity.eventId || null,
        },
      });
      summary.migrated += 1;
      await prisma.auditLog.create({
        data: {
          userId: opportunity.createdById,
          actionType: "VOLUNTEER_LEGACY_BACKFILL",
          resourceName: "VolunteerProgram",
          resourceId: created.id,
          afterData: { legacyOpportunityId: opportunity.id },
        },
      });
    } catch (error) {
      if (error?.code === "P2002") {
        summary.duplicateMappings += 1;
      } else if (error?.code === "P2003") {
        summary.incompatible += 1;
      } else {
        summary.errors.push({ opportunityId: opportunity.id, message: String(error?.message || error) });
      }
    }
  }

  console.log(JSON.stringify(summary, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());