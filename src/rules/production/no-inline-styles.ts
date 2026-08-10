import type { AuditContext } from '../../types/context.js';
import type { Rule, RuleResult, RuleViolation } from '../../types/rule.js';

export const noInlineStylesRule: Rule = {
  id: 'PRODUCTION_005',
  name: 'No Inline Styles',
  category: 'production',
  weight: 5,
  description: 'Checks for inline style attributes in Vue templates.',
  check: (ctx: AuditContext): RuleResult => {
    const violations: RuleViolation[] = [];
    const staticStyleRegex = /(?<![:\w-])style=["']/g;

    for (const file of ctx.vueFiles) {
      if (!file.templateAst) continue;

      let match: RegExpExecArray | null;
      while ((match = staticStyleRegex.exec(file.templateAst)) !== null) {
        const lines = file.templateAst.substring(0, match.index).split('\n');
        const line = lines.length;
        const endQuoteIdx = file.templateAst.indexOf(file.templateAst[match.index + match[0].length - 1], match.index + match[0].length);
        const evidence = endQuoteIdx !== -1 ? file.templateAst.substring(match.index, endQuoteIdx + 1) : match[0];

        violations.push({
          filePath: file.filePath,
          line,
          evidence,
          fixSuggestion: 'Avoid inline style attributes (`style="..."`). Use Tailwind utility classes or dynamic `:style` bindings instead.'
        });
      }
    }

    return {
      ruleId: 'PRODUCTION_005',
      passed: violations.length === 0,
      confidence: 'medium',
      violations
    };
  }
};
