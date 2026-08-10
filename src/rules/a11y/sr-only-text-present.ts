import type { AuditContext } from '../../types/context.js';
import type { Rule, RuleResult, RuleViolation } from '../../types/rule.js';

export const srOnlyTextPresentRule: Rule = {
  id: 'A11Y_008',
  name: 'Screen Reader Text Present',
  category: 'accessibility',
  weight: 5,
  description: 'Checks for sr-only or visually-hidden CSS patterns for screen readers.',
  check: (ctx: AuditContext): RuleResult => {
    const violations: RuleViolation[] = [];
    const srPattern = /(?:sr-only|visually-hidden|screen-reader|aria-label|aria-labelledby|aria-describedby)/i;

    const hasSrText = ctx.vueFiles.some((file) => srPattern.test(file.content));

    if (!hasSrText && ctx.vueFiles.length > 0) {
      const targetFile = ctx.vueFiles[0];
      violations.push({
        filePath: targetFile.filePath,
        evidence: 'No screen reader utility classes (sr-only, visually-hidden) or ARIA accessibility attributes found in Vue templates.',
        fixSuggestion: 'Use Tailwind\'s sr-only class or ARIA attributes (aria-label, aria-labelledby) to provide essential context for screen reader users.'
      });
    }

    return {
      ruleId: 'A11Y_008',
      passed: violations.length === 0,
      confidence: 'low',
      violations
    };
  }
};
