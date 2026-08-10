import type { AuditContext } from '../../types/context.js';
import type { Rule, RuleResult, RuleViolation } from '../../types/rule.js';

export const keyboardNavAvailableRule: Rule = {
  id: 'A11Y_007',
  name: 'Keyboard Navigation Available',
  category: 'accessibility',
  weight: 8,
  description: 'Checks for keyboard event handlers or defineShortcuts usage.',
  check: (ctx: AuditContext): RuleResult => {
    const violations: RuleViolation[] = [];
    const keyboardPattern = /(?:@keydown|@keyup|@keypress|v-on:keydown|v-on:keyup|v-on:keypress|defineShortcuts|onKeydown|onKeyup)/i;

    const hasKeyboardNav = ctx.files.some((file) => keyboardPattern.test(file.content));

    if (!hasKeyboardNav && ctx.vueFiles.length > 0) {
      const targetFile = ctx.vueFiles[0];
      violations.push({
        filePath: targetFile.filePath,
        evidence: 'No keyboard event handlers (@keydown, @keyup, @keypress) or defineShortcuts() found in project code.',
        fixSuggestion: 'Implement keyboard navigation event handlers (@keydown, @keyup) or use Nuxt UI\'s defineShortcuts() composable for accessible keyboard shortcuts.'
      });
    }

    return {
      ruleId: 'A11Y_007',
      passed: violations.length === 0,
      confidence: 'medium',
      violations
    };
  }
};
