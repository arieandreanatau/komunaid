export function auditLogProtection() {
  return async (params: { action: string; model?: string | null }, next: (params: any) => Promise<any>) => {
    const { action, model } = params;

    if (model === "AuditLog") {
      if (
        action === "update" ||
        action === "delete" ||
        action === "updateMany" ||
        action === "deleteMany"
      ) {
        throw new Error("Audit log immutability violation: update/delete is not allowed");
      }
    }

    return next(params);
  };
}
