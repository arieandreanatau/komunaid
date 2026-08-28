// Shared helper for the community dashboard's fire-and-forget mutations
// (approve/reject a request, change a role, remove/restore a member, save a
// settings form, create/update/delete media...). Every one of those call sites
// used to hand-roll the same `try { await api.X } catch (err) { alert/setError }`
// shape — this collapses them into one place instead of copying the pattern
// into each new tab module.
//
// Deliberately NOT in scope here: switching these calls to TanStack Query
// mutations, or reworking the `res.data.data` envelope unwrapping. Both are a
// later pass — this only extracts the existing error-handling shape.

export interface RunMutationOptions {
  /** window.confirm() prompt shown before the action runs; abort if declined. */
  confirmMessage?: string;
  /** Message used when the error has no response body message. */
  fallbackMessage?: string;
  /** Called after the action resolves successfully. */
  onSuccess?: () => void;
  /**
   * Called with the resolved error message instead of the default
   * `alert(message)`. Use this for tabs (e.g. Pengaturan) that surface errors
   * inline rather than via a blocking alert.
   */
  onError?: (message: string) => void;
}

/**
 * Runs `action`, surfacing failures the way this dashboard already does
 * (a blocking `alert` by default, or `onError` for inline error state), and
 * invoking `onSuccess` when it settles without error.
 *
 * Returns whether the action succeeded, so callers that need to do extra work
 * only on success (e.g. showing a transient success message) still can.
 */
export async function runMutation(action: () => Promise<unknown>, options: RunMutationOptions = {}): Promise<boolean> {
  if (options.confirmMessage && !confirm(options.confirmMessage)) return false;

  try {
    await action();
    options.onSuccess?.();
    return true;
  } catch (err: any) {
    const message = err?.response?.data?.message || options.fallbackMessage || "Terjadi kesalahan.";
    if (options.onError) {
      options.onError(message);
    } else {
      alert(message);
    }
    return false;
  }
}
