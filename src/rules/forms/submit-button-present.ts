import type { AuditContext } from '../../types/context.js';
import type { Rule, RuleResult, RuleViolation } from '../../types/rule.js';

export const submitButtonPresentRule: Rule = {
  id: 'FORMS_005',
  name: 'Submit Button Present',
  category: 'forms',
  weight: 8,
  description: 'Checks that forms have a submit button with proper type attribute.',
  check: (ctx: AuditContext): RuleResult => {
    const violations: RuleViolation[] = [];

    for (const file of ctx.vueFiles) {
      if (!file.templateAst) continue;

      const formRegex = /<(?:UForm|u-form)([^>]*)>/g;
      let match: RegExpExecArray | null;

      while ((match = formRegex.exec(file.templateAst)) !== null) {
        const formAttributes = match[1];

        const hasSubmitButton = /<(?:UButton|u-button|button)[^>]*\b(?:v-bind:type|:type|type)=["'](?:['"])?submit/i.test(file.templateAst);
        const hasSubmitHandler = formAttributes.includes('@submit=') || formAttributes.includes('v-on:submit=');

        if (!hasSubmitButton || !hasSubmitHandler) {
          const lines = file.templateAst.substring(0, match.index).split('\n');
          const line = lines.length;

          const missing: string[] = [];
          if (!hasSubmitButton) missing.push('a submit button with type="submit"');
          if (!hasSubmitHandler) missing.push('a @submit event handler on <UForm>');

          violations.push({
            filePath: file.filePath,
            line,
            evidence: match[0],
            fixSuggestion: `Ensure the form has ${missing.join(' and ')}.`
          });
        }
      }
    }

    return {
      ruleId: 'FORMS_005',
      passed: violations.length === 0,
      confidence: 'high',
      violations
    };
  }
};
