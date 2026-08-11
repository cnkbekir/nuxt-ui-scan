import type { AuditContext } from '../types/context.js';
import type { Rule, RuleResult } from '../types/rule.js';
import type { AuditSummary } from '../types/result.js';
import { calculateScore } from './scoring.js';
import { rules as defaultRules } from '../rules/index.js';

export interface RunAuditOptions {
  ruleSet?: Rule[];
  ignoreRules?: string[];
}

export async function runAudit(
  ctx: AuditContext,
  options?: RunAuditOptions | Rule[]
): Promise<AuditSummary> {
  const opts: RunAuditOptions = Array.isArray(options) ? { ruleSet: options } : (options ?? {});
  const baseRules = opts.ruleSet ?? defaultRules;
  const ignoreSet = new Set(opts.ignoreRules ?? []);

  const rulesToRun = baseRules.filter((rule) => {
    if (ignoreSet.has(rule.id)) return false;
    if (rule.framework && rule.framework !== 'all' && rule.framework === 'nuxt' && !ctx.isNuxt) {
      return false;
    }
    return true;
  });

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
