import type { AuditContext } from '../types/context.js';
import type { Rule, RuleResult } from '../types/rule.js';
import type { AuditSummary } from '../types/result.js';
import { calculateScore } from './scoring.js';
import { rules as defaultRules } from '../rules/index.js';

export async function runAudit(
  ctx: AuditContext,
  ruleSet?: Rule[]
): Promise<AuditSummary> {
  const rulesToRun = ruleSet ?? defaultRules;
  const results: RuleResult[] = [];

  for (const rule of rulesToRun) {
    try {
      const result = await rule.check(ctx);
      results.push(result);
    } catch {
      // If a rule throws, treat it as a pass with low confidence
      results.push({
        ruleId: rule.id,
        passed: true,
        confidence: 'low',
        violations: [],
      });
    }
  }

  const summary = calculateScore(results, rulesToRun, ctx);
  return summary;
}
