import type { AuditContext } from '../../types/context.js';
import type { Rule, RuleResult, RuleViolation } from '../../types/rule.js';

export const focusVisiblePresentRule: Rule = {
  id: 'A11Y_006',
  name: 'Focus Indicator Configured',
  category: 'accessibility',
  weight: 8,
  description: 'Checks for focus-visible CSS styles or Nuxt UI focus ring configuration.',
  check: (ctx: AuditContext): RuleResult => {
    const violations: RuleViolation[] = [];

    const focusPattern = /(?:focus-visible|focus:ring|:focus-visible|outline-|focus-ring)/i;
    const nuxtUiPattern = /<(?:UButton|u-button|UInput|u-input|USelect|u-select|UTextarea|u-textarea|UCheckbox|u-checkbox|URadio|u-radio|UForm|u-form)\b/;

    const hasGlobalFocusStyle = ctx.files.some((f) => focusPattern.test(f.content));
    const usesNuxtUiInteractive = ctx.vueFiles.some((f) => f.templateAst && nuxtUiPattern.test(f.templateAst));

    const hasBuiltInOrGlobalFocus = hasGlobalFocusStyle || usesNuxtUiInteractive;

    const rawInteractiveRegex = /<(?:button|a\s+[^>]*href|input|textarea|select)\b([^>]*)>/gi;

    for (const file of ctx.vueFiles) {
      if (!file.templateAst) continue;

      let match: RegExpExecArray | null;
      while ((match = rawInteractiveRegex.exec(file.templateAst)) !== null) {
        const attributes = match[1];
        const hasLocalFocusStyle = focusPattern.test(attributes) || attributes.includes('focus:');

        if (!hasLocalFocusStyle && !hasBuiltInOrGlobalFocus) {
          const lines = file.templateAst.substring(0, match.index).split('\n');
          const line = lines.length;

          violations.push({
            filePath: file.filePath,
            line,
            evidence: match[0],
            fixSuggestion: 'Add visible focus ring styles (e.g., focus-visible:ring-2 focus:outline-none) or use Nuxt UI components with built-in focus indicators.'
          });
        }
      }
    }

    if (!hasBuiltInOrGlobalFocus && violations.length === 0 && ctx.vueFiles.length > 0) {
      const targetFile = ctx.vueFiles[0];
      violations.push({
        filePath: targetFile.filePath,
        evidence: 'No focus-visible CSS styles, focus:ring utilities, or Nuxt UI components found in project files.',
        fixSuggestion: 'Configure focus-visible indicator styles or use Nuxt UI components to support clear keyboard focus indicators.'
      });
    }

    return {
      ruleId: 'A11Y_006',
      passed: violations.length === 0,
      confidence: 'medium',
      violations
    };
  }
};
