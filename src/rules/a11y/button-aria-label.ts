import type { AuditContext } from '../../types/context.js';
import type { Rule, RuleResult, RuleViolation } from '../../types/rule.js';

export const buttonAriaLabelRule: Rule = {
  id: 'A11Y_001',
  name: 'Button Accessibility Labels',
  category: 'accessibility',
  weight: 10,
  description: 'Inspects <UButton> elements with icon prop but no inner text content, verifying aria-label is set.',
  check: (ctx: AuditContext): RuleResult => {
    const violations: RuleViolation[] = [];

    for (const file of ctx.vueFiles) {
      if (!file.templateAst) continue;

      const buttonRegex = /<(?:UButton|u-button)([^>]*)(\/?)>/g;
      let match;

      while ((match = buttonRegex.exec(file.templateAst)) !== null) {
        const attributes = match[1];
        const isSelfClosing = match[2] === '/';
        
        if (attributes.includes('icon=') || attributes.includes(':icon=')) {
          let hasContent = false;
          if (!isSelfClosing) {
            const closingTagIndex = file.templateAst.indexOf('</', match.index + match[0].length);
            if (closingTagIndex !== -1) {
              const contentBetween = file.templateAst.substring(match.index + match[0].length, closingTagIndex);
              if (contentBetween.trim().length > 0) {
                hasContent = true;
              }
            }
          }

          if (!hasContent) {
            if (!attributes.includes('aria-label=') && !attributes.includes(':aria-label=') && !attributes.includes('label=') && !attributes.includes(':label=')) {
              const lines = file.templateAst.substring(0, match.index).split('\n');
              const line = lines.length;

              violations.push({
                filePath: file.filePath,
                line,
                evidence: match[0],
                fixSuggestion: 'Add an aria-label or label prop to icon-only buttons for accessibility.'
              });
            }
          }
        }
      }
    }

    return {
      ruleId: 'A11Y_001',
      passed: violations.length === 0,
      confidence: 'high',
      violations
    };
  }
};
