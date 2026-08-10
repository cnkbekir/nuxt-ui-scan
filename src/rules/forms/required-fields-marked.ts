import type { AuditContext } from '../../types/context.js';
import type { Rule, RuleResult, RuleViolation } from '../../types/rule.js';

export const requiredFieldsMarkedRule: Rule = {
  id: 'FORMS_004',
  name: 'Required Fields Marked',
  category: 'forms',
  weight: 5,
  description: 'Checks that form fields with validation have required marking.',
  check: (ctx: AuditContext): RuleResult => {
    const violations: RuleViolation[] = [];

    for (const file of ctx.vueFiles) {
      if (!file.templateAst) continue;

      const formRegex = /<(?:UForm|u-form)([^>]*)>/g;
      let match: RegExpExecArray | null;

      while ((match = formRegex.exec(file.templateAst)) !== null) {
        const formAttributes = match[1];
        const hasSchema = formAttributes.includes(':schema=') || formAttributes.includes('schema=') || formAttributes.includes('v-bind:schema=');

        if (!hasSchema) continue;

        const hasRequiredProp = /\b:?required\b/i.test(file.templateAst);
        const hasAsteriskLabel = /label=["'][^"']*\*[^"']*["']|\*\s*<\/|>\s*\*</i.test(file.templateAst);

        if (!hasRequiredProp && !hasAsteriskLabel) {
          const lines = file.templateAst.substring(0, match.index).split('\n');
          const line = lines.length;

          violations.push({
            filePath: file.filePath,
            line,
            evidence: match[0],
            fixSuggestion: 'Add the `required` prop to <UFormField> or include visual indicators (e.g. *) on field labels for required form fields.'
          });
        }
      }
    }

    return {
      ruleId: 'FORMS_004',
      passed: violations.length === 0,
      confidence: 'medium',
      violations
    };
  }
};
