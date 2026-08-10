import type { AuditSummary } from '../types/result.js';

export function reportJSON(summary: AuditSummary): string {
  return JSON.stringify(summary, null, 2);
}
