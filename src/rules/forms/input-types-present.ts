import type { AuditContext } from '../../types/context.js';
import type { Rule, RuleResult, RuleViolation } from '../../types/rule.js';

export const inputTypesPresentRule: Rule = {
  id: 'FORMS_003',
  name: 'Input Types Specified',
  category: 'forms',
  weight: 5,
  description: 'Checks that UInput components specify appropriate type attributes.',
  check: (ctx: AuditContext): RuleResult => {
    const violations: RuleViolation[] = [];

    for (const file of ctx.vueFiles) {
      if (!file.templateAst) continue;

      const inputRegex = /<(?:UInput|u-input)([^>]*)>/g;
      let match: RegExpExecArray | null;

      while ((match = inputRegex.exec(file.templateAst)) !== null) {
        const attributes = match[1];
        const hasType = attributes.includes('type=') || attributes.includes(':type=') || attributes.includes('v-bind:type=');

        if (!hasType) {
          const lines = file.templateAst.substring(0, match.index).split('\n');
          const line = lines.length;

          violations.push({
            filePath: file.filePath,
            line,
            evidence: match[0],
            fixSuggestion: 'Specify an explicit type attribute on <UInput> (e.g. type="text", type="email", type="password", type="number").'
          });
        }
      }
    }

    return {
      ruleId: 'FORMS_003',
      passed: violations.length === 0,
      confidence: 'medium',
      violations
    };
  }
};
