import type { AuditContext } from '../../types/context.js';
import type { Rule, RuleResult, RuleViolation } from '../../types/rule.js';

export const formErrorHandlingRule: Rule = {
  id: 'FORMS_002',
  name: 'Form Error Handling',
  category: 'forms',
  weight: 10,
  description: 'Checks if UForm uses @error event handler or UFormField displays errors.',
  check: (ctx: AuditContext): RuleResult => {
    const violations: RuleViolation[] = [];

    for (const file of ctx.vueFiles) {
      if (!file.templateAst) continue;

      const formRegex = /<(?:UForm|u-form)([^>]*)>/g;
      let match: RegExpExecArray | null;

      const hasFormField = /<(?:UFormField|u-form-field)[\s/>]/i.test(file.templateAst);

      while ((match = formRegex.exec(file.templateAst)) !== null) {
        const attributes = match[1];
        const hasErrorEvent = attributes.includes('@error=') || attributes.includes('v-on:error=');

        if (!hasErrorEvent && !hasFormField) {
          const lines = file.templateAst.substring(0, match.index).split('\n');
          const line = lines.length;

          violations.push({
            filePath: file.filePath,
            line,
            evidence: match[0],
            fixSuggestion: 'Add an @error event handler to <UForm> or wrap input fields in <UFormField> to handle and display validation errors.'
          });
        }
      }
    }

    return {
      ruleId: 'FORMS_002',
      passed: violations.length === 0,
      confidence: 'high',
      violations
    };
  }
};
