import type { AuditContext } from '../../types/context.js';
import type { Rule, RuleResult } from '../../types/rule.js';

export const errorBoundaryRule: Rule = {
  id: 'FOUNDATION_002',
  name: 'Error Boundary',
  category: 'foundation',
  weight: 5,
  description: 'Checks if an error boundary file (error.vue, ErrorBoundary.vue) or onErrorCaptured hook exists.',
  check: (ctx: AuditContext): RuleResult => {
    const hasErrorFile = ctx.files.some(f => {
      const lower = f.relativePath.replace(/\\/g, '/').toLowerCase();
      return (
        lower === 'error.vue' ||
        lower === 'src/error.vue' ||
        lower.endsWith('/error.vue') ||
        lower.endsWith('/errorboundary.vue')
      );
    });

    const hasErrorHook = ctx.files.some(f =>
      f.content.includes('onErrorCaptured') || f.content.includes('NuxtErrorBoundary')
    );

    const passed = hasErrorFile || hasErrorHook;

    if (!passed) {
      return {
        ruleId: 'FOUNDATION_002',
        passed: false,
        confidence: 'high',
        violations: [
          {
            filePath: 'error.vue',
            evidence: 'No error boundary file (error.vue / ErrorBoundary.vue) or onErrorCaptured hook found.',
            fixSuggestion: 'Create an error.vue file or implement onErrorCaptured to handle application runtime errors gracefully.'
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

