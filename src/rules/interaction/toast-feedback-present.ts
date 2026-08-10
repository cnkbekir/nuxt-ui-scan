import type { AuditContext } from '../../types/context.js';
import type { Rule, RuleResult, RuleViolation } from '../../types/rule.js';

export const toastFeedbackPresentRule: Rule = {
  id: 'INTERACTION_002',
  name: 'Toast Feedback Present',
  category: 'interaction',
  weight: 8,
  description: 'Checks if useToast composable is used for user action feedback.',
  check: (ctx: AuditContext): RuleResult => {
    const allFiles = [...ctx.vueFiles, ...ctx.tsFiles];
    let usesToast = false;

    for (const file of allFiles) {
      const content = file.scriptContent || file.scriptSetupContent || file.content;
      if (content && content.includes('useToast')) {
        usesToast = true;
        break;
      }
    }

    if (!usesToast) {
      const targetPath = ctx.vueFiles[0]?.filePath || ctx.tsFiles[0]?.filePath || 'app.vue';
      const violations: RuleViolation[] = [
        {
          filePath: targetPath,
          evidence: 'useToast composable is not used anywhere in the project for feedback.',
          fixSuggestion: 'Use useToast() from Nuxt UI to provide feedback for user actions.'
        }
      ];

      return {
        ruleId: 'INTERACTION_002',
        passed: false,
        confidence: 'medium',
        violations
      };
    }

    return {
      ruleId: 'INTERACTION_002',
      passed: true,
      confidence: 'medium',
      violations: []
    };
  }
};
