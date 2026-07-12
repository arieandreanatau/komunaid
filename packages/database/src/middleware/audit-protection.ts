/**
 * Audit Log Protection
 *
 * NOTE: The actual enforcement is handled via Prisma $extends in index.ts.
 * This file is retained for backward compatibility.
 *
 * The $extends middleware blocks: update, delete, updateMany, deleteMany, upsert
 * on the AuditLog model. Direct $executeRaw bypasses this protection.
 */

export function auditLogProtection() {
  return async (params: { action: string; model?: string }, next: (params: any) => Promise<any>) => {
    const { action, model } = params;

    if (model === "AuditLog") {
      if (
        action === "update" ||
        action === "delete" ||
        action === "updateMany" ||
        action === "deleteMany" ||
        action === "upsert"
      ) {
        throw new Error("Audit log immutability violation: update/delete/upsert is not allowed");
      }
    }

    return next(params);
  };
}
