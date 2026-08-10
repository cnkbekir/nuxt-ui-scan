import type { AuditContext } from '../../types/context.js';
import type { Rule, RuleResult } from '../../types/rule.js';

export const colorModeConfiguredRule: Rule = {
  id: 'FOUNDATION_007',
  name: 'Color Mode Configured',
  category: 'foundation',
  weight: 5,
  description: 'Checks for color mode support using Nuxt UI ColorMode components or useColorMode composable.',
  check: (ctx: AuditContext): RuleResult => {
    const colorModeComponents = [
      'UColorModeButton',
      'u-color-mode-button',
      'UColorModeSelect',
      'u-color-mode-select',
      'UColorModeSwitch',
      'u-color-mode-switch'
    ];

    const hasColorModeComponent = ctx.vueFiles.some(f =>
      colorModeComponents.some(comp => f.content.includes(comp))
    );

    const hasUseColorMode = [...ctx.vueFiles, ...ctx.tsFiles].some(f => {
      const script = (f.scriptSetupContent || '') + (f.scriptContent || '') + f.content;
      return script.includes('useColorMode');
    });

    const passed = hasColorModeComponent || hasUseColorMode;

    if (!passed) {
      return {
        ruleId: 'FOUNDATION_007',
        passed: false,
        confidence: 'medium',
        violations: [
          {
            filePath: 'app.vue',
            evidence: 'No Nuxt UI ColorMode components (UColorModeButton, UColorModeSelect, UColorModeSwitch) or useColorMode composable found.',
            fixSuggestion: 'Add color mode support using Nuxt UI components like <UColorModeButton /> or <UColorModeSelect />, or use the useColorMode() composable.'
          }
        ]
      };
    }

    return {
      ruleId: 'FOUNDATION_007',
      passed: true,
      confidence: 'medium',
      violations: []
    };
  }
};
