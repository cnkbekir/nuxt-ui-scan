import type { AuditContext } from '../../types/context.js';
import type { Rule, RuleResult, RuleViolation } from '../../types/rule.js';

export const darkModeSupportRule: Rule = {
  id: 'PRODUCTION_006',
  name: 'Dark Mode Support',
  category: 'production',
  weight: 5,
  description: 'Checks for dark mode CSS classes or color mode components.',
  check: (ctx: AuditContext): RuleResult => {
    const violations: RuleViolation[] = [];
    const darkModePatterns = [
      'dark:',
      'useColorMode',
      'UColorModeButton',
      'u-color-mode-button',
      'UColorModeSelect',
      'u-color-mode-select',
      'color-mode',
      'colorMode'
    ];

    const allFiles = [...ctx.vueFiles, ...ctx.tsFiles];
    const hasDarkModeSupport = allFiles.some(file =>
      darkModePatterns.some(pattern => file.content.includes(pattern))
    );

    if (!hasDarkModeSupport) {
      const targetPath = ctx.vueFiles[0]?.filePath ?? 'app.vue';
      violations.push({
        filePath: targetPath,
        evidence: 'No dark mode support detected (missing dark: classes, useColorMode, or UColorMode components).',
        fixSuggestion: 'Add dark mode support using Tailwind `dark:` variant classes or Nuxt UI color mode components (<UColorModeButton>).'
      });
    }

    return {
      ruleId: 'PRODUCTION_006',
      passed: violations.length === 0,
      confidence: 'low',
      violations
    };
  }
};
