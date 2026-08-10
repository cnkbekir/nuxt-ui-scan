import type { AuditContext } from '../../types/context.js';
import type { Rule, RuleResult, RuleViolation } from '../../types/rule.js';

export const headingHierarchyRule: Rule = {
  id: 'A11Y_004',
  name: 'Heading Hierarchy Valid',
  category: 'accessibility',
  weight: 5,
  description: 'Checks that heading tags follow proper hierarchy without skipping levels.',
  check: (ctx: AuditContext): RuleResult => {
    const violations: RuleViolation[] = [];

    for (const file of ctx.vueFiles) {
      if (!file.templateAst) continue;

      const headingRegex = /<h([1-6])\b([^>]*)>/gi;
      let match: RegExpExecArray | null;
      let previousLevel: number | null = null;

      while ((match = headingRegex.exec(file.templateAst)) !== null) {
        const currentLevel = parseInt(match[1], 10);

        if (previousLevel !== null && currentLevel > previousLevel + 1) {
          const lines = file.templateAst.substring(0, match.index).split('\n');
          const line = lines.length;

          violations.push({
            filePath: file.filePath,
            line,
            evidence: match[0],
            fixSuggestion: `Adjust heading tag <h${currentLevel}> to <h${previousLevel + 1}> or insert intermediate heading levels to maintain sequential heading hierarchy.`
          });
        }

        previousLevel = currentLevel;
      }
    }

    return {
      ruleId: 'A11Y_004',
      passed: violations.length === 0,
      confidence: 'medium',
      violations
    };
  }
};
