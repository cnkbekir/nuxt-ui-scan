import type { AuditContext } from '../../types/context.js';
import type { Rule, RuleResult, RuleViolation } from '../../types/rule.js';

export const modalConfirmationRule: Rule = {
  id: 'INTERACTION_005',
  name: 'Modal Confirmation Pattern',
  category: 'interaction',
  weight: 5,
  description: 'Checks for confirmation dialogs on destructive actions using UModal or UAlertDialog.',
  check: (ctx: AuditContext): RuleResult => {
    let hasDestructiveAction = false;
    let destructiveFilePath = '';

    const allFiles = [...ctx.vueFiles, ...ctx.tsFiles];
    const destructiveRegex = /(delete|remove|destroy)/i;

    for (const file of allFiles) {
      const scriptContent = file.scriptContent || file.scriptSetupContent || file.content;
      if (scriptContent && destructiveRegex.test(scriptContent)) {
        hasDestructiveAction = true;
        destructiveFilePath = file.filePath;
        break;
      }
    }

    if (!hasDestructiveAction) {
      return {
        ruleId: 'INTERACTION_005',
        passed: true,
        confidence: 'medium',
        violations: []
      };
    }

    const modalPatterns = ['UModal', 'u-modal', 'UAlertDialog', 'u-alert-dialog'];
    let hasConfirmationModal = false;

    for (const file of ctx.vueFiles) {
      const template = file.templateAst || file.content;
      if (template && modalPatterns.some(pattern => template.includes(pattern))) {
        hasConfirmationModal = true;
        break;
      }
    }

    if (!hasConfirmationModal) {
      const violations: RuleViolation[] = [
        {
          filePath: destructiveFilePath || ctx.vueFiles[0]?.filePath || 'app.vue',
          evidence: 'Project performs destructive actions (delete/remove/destroy) but no confirmation modal (UModal or UAlertDialog) was found.',
          fixSuggestion: 'Use UModal or UAlertDialog to confirm user intent before carrying out destructive actions.'
        }
      ];

      return {
        ruleId: 'INTERACTION_005',
        passed: false,
        confidence: 'medium',
        violations
      };
    }

    return {
      ruleId: 'INTERACTION_005',
      passed: true,
      confidence: 'medium',
      violations: []
    };
  }
};
