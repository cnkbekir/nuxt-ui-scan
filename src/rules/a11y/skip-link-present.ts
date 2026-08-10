import type { AuditContext } from '../../types/context.js';
import type { Rule, RuleResult, RuleViolation } from '../../types/rule.js';

export const skipLinkPresentRule: Rule = {
  id: 'A11Y_005',
  name: 'Skip Link Present',
  category: 'accessibility',
  weight: 5,
  description: 'Checks for skip-to-content navigation links.',
  check: (ctx: AuditContext): RuleResult => {
    const violations: RuleViolation[] = [];
    const skipLinkPattern = /(?:#main|#content|skip-to|skip-link|skipLink)/i;

    const hasSkipLink = ctx.vueFiles.some((file) => skipLinkPattern.test(file.content));

    if (!hasSkipLink) {
      const targetFile =
        ctx.vueFiles.find(
          (f) =>
            f.relativePath.includes('app.vue') ||
            f.relativePath.includes('default.vue') ||
            f.relativePath.includes('error.vue')
        ) || ctx.vueFiles[0];

      if (targetFile) {
        violations.push({
          filePath: targetFile.filePath,
          evidence: 'No skip-to-content navigation link (#main, #content, skip-link, etc.) found in project Vue templates.',
          fixSuggestion: 'Add a skip link (e.g. <a href="#main" class="sr-only focus:not-sr-only">Skip to content</a>) at the top of your layout for keyboard accessibility.'
        });
      }
    }

    return {
      ruleId: 'A11Y_005',
      passed: violations.length === 0,
      confidence: 'low',
      violations
    };
  }
};
