import type { AuditContext } from '../../types/context.js';
import type { Rule, RuleResult, RuleViolation } from '../../types/rule.js';

export const formFieldLabelingRule: Rule = {
  id: 'A11Y_003',
  name: 'Form Field Labeling',
  category: 'accessibility',
  weight: 10,
  description: 'Checks that form inputs are wrapped in UFormField or have aria-label.',
  check: (ctx: AuditContext): RuleResult => {
    const violations: RuleViolation[] = [];

    for (const file of ctx.vueFiles) {
      if (!file.templateAst) continue;

      const hasFormField = /<(?:UFormField|u-form-field)\b/.test(file.templateAst);
      const inputRegex = /<(?:UInput|u-input|USelect|u-select|UTextarea|u-textarea|URadioGroup|u-radio-group)\b([^>]*)>/g;
      let match: RegExpExecArray | null;

      while ((match = inputRegex.exec(file.templateAst)) !== null) {
        const attributes = match[1];

        const hasAriaLabel = attributes.includes('aria-label=') || attributes.includes(':aria-label=');

        if (!hasFormField && !hasAriaLabel) {
          const lines = file.templateAst.substring(0, match.index).split('\n');
          const line = lines.length;

          violations.push({
            filePath: file.filePath,
            line,
            evidence: match[0],
            fixSuggestion: 'Wrap form input with <UFormField label="..."> or add an aria-label attribute to provide an accessible name.'
          });
        }
      }
    }

    return {
      ruleId: 'A11Y_003',
      passed: violations.length === 0,
      confidence: 'high',
      violations
    };
  }
};
