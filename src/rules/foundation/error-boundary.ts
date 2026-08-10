import type { AuditContext } from '../../types/context.js';
import type { Rule, RuleResult } from '../../types/rule.js';

export const errorBoundaryRule: Rule = {
  id: 'FOUNDATION_002',
  name: 'Error Boundary',
  category: 'foundation',
  weight: 5,
  description: 'Checks if an error.vue file exists in the project root.',
  check: (ctx: AuditContext): RuleResult => {
    const errorFile = ctx.files.find(f => f.relativePath === 'error.vue');

    if (!errorFile) {
      return {
        ruleId: 'FOUNDATION_002',
        passed: false,
        confidence: 'high',
        violations: [
          {
            filePath: 'error.vue',
            evidence: 'error.vue not found in project root.',
            fixSuggestion: 'Create an error.vue file in the project root to handle application errors gracefully.'
          }
        ]
      };
    }

    return {
      ruleId: 'FOUNDATION_002',
      passed: true,
      confidence: 'high',
      violations: []
    };
  }
};
