import type { AuditContext } from '../../types/context.js';
import type { Rule, RuleResult, RuleViolation } from '../../types/rule.js';

export const emptyStatePresentRule: Rule = {
  id: 'STATES_003',
  name: 'Empty State Present',
  category: 'states',
  weight: 8,
  description: 'Checks that data lists/tables handle empty state rendering.',
  check: (ctx: AuditContext): RuleResult => {
    const violations: RuleViolation[] = [];

    for (const file of ctx.vueFiles) {
      if (!file.templateAst || !file.templateAst.includes('v-for')) {
        continue;
      }

      const template = file.templateAst;

      const hasLengthCheck = /\.length/.test(template);
      const hasElsePattern = /\bv-(else|else-if)\b/.test(template);
      const hasEmptyComponent =
        template.includes('empty-state') ||
        template.includes('EmptyState') ||
        template.includes('<UEmptyState') ||
        template.includes('<u-empty-state') ||
        template.includes('<UAlert') ||
        template.includes('<u-alert') ||
        template.includes('#empty');

      const hasEmptyStatePattern = hasLengthCheck || hasElsePattern || hasEmptyComponent;

      if (!hasEmptyStatePattern) {
        const lines = file.content.split('\n');
        const vForLineIndex = lines.findIndex(l => l.includes('v-for'));

        violations.push({
          filePath: file.filePath,
          line: vForLineIndex !== -1 ? vForLineIndex + 1 : undefined,
          evidence: vForLineIndex !== -1 ? lines[vForLineIndex].trim() : 'v-for used without an empty state check',
          fixSuggestion: 'Provide empty state UI (e.g. `v-if="items.length"` with `v-else`, `<UEmptyState>`, or `<UAlert>`) when rendering lists with `v-for`.'
        });
      }
    }

    return {
      ruleId: 'STATES_003',
      passed: violations.length === 0,
      confidence: 'medium',
      violations
    };
  }
};
