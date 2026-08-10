import type { AuditContext } from '../../types/context.js';
import type { Rule, RuleResult, RuleViolation } from '../../types/rule.js';

export const noConsoleLogsRule: Rule = {
  id: 'PRODUCTION_001',
  name: 'No Console Logs',
  category: 'production',
  weight: 8,
  description: 'Checks for console.log statements left in production code.',
  check: (ctx: AuditContext): RuleResult => {
    const violations: RuleViolation[] = [];
    const allFiles = [...ctx.vueFiles, ...ctx.tsFiles];

    for (const file of allFiles) {
      const lines = file.content.split('\n');

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        if (line.includes('console.log')) {
          const startLine = Math.max(0, i - 5);
          const precedingLines = lines.slice(startLine, i + 1);
          const inCatchBlock = precedingLines.some(l => l.includes('catch'));

          if (!inCatchBlock) {
            violations.push({
              filePath: file.filePath,
              line: i + 1,
              evidence: line.trim(),
              fixSuggestion: 'Remove console.log statements before deploying to production.'
            });
          }
        }
      }
    }

    return {
      ruleId: 'PRODUCTION_001',
      passed: violations.length === 0,
      confidence: 'high',
      violations
    };
  }
};
