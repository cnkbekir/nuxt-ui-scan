import type { AuditContext } from '../../types/context.js';
import type { Rule, RuleResult } from '../../types/rule.js';

export const nuxtConfigModulesRule: Rule = {
  id: 'FOUNDATION_003',
  name: 'Nuxt UI Package Configured',
  category: 'foundation',
  weight: 10,
  description: 'Checks if @nuxt/ui package is configured in nuxt.config, vite.config, main.ts, or package.json.',
  check: (ctx: AuditContext): RuleResult => {
    const allFiles = [...ctx.files, ...ctx.tsFiles.filter(tf => !ctx.files.some(f => f.filePath === tf.filePath))];

    // 1. Check package.json for @nuxt/ui dependency
    const pkgFile = allFiles.find(f => f.relativePath === 'package.json');
    const hasPkgDependency = pkgFile ? (
      pkgFile.content.includes('"@nuxt/ui"') ||
      pkgFile.content.includes('"@nuxt/ui-vue"') ||
      pkgFile.content.includes('"@nuxt/ui-v3"')
    ) : false;

    // 2. Check config / entry files (nuxt.config, vite.config, main.ts, main.js)
    const configOrEntryFiles = allFiles.filter(f => {
      const lower = f.relativePath.toLowerCase();
      return (
        lower.includes('nuxt.config') ||
        lower.includes('vite.config') ||
        lower.endsWith('main.ts') ||
        lower.endsWith('main.js')
      );
    });

    const hasConfiguredInCode = configOrEntryFiles.some(f =>
      f.content.includes('@nuxt/ui') || f.content.includes('ui()')
    );

    // If no config file and no package.json exists in context (e.g. partial scan context), pass with low confidence
    if (configOrEntryFiles.length === 0 && !pkgFile) {
      return {
        ruleId: 'FOUNDATION_003',
        passed: true,
        confidence: 'low',
        violations: []
      };
    }

    const passed = hasPkgDependency || hasConfiguredInCode;

    if (!passed) {
      const targetFile = configOrEntryFiles[0]?.filePath ?? pkgFile?.filePath ?? 'package.json';
      return {
        ruleId: 'FOUNDATION_003',
        passed: false,
        confidence: 'high',
        violations: [
          {
            filePath: targetFile,
            evidence: '@nuxt/ui dependency or module plugin is not configured in project.',
            fixSuggestion: "Install '@nuxt/ui' and configure it in your nuxt.config.ts, vite.config.ts, or main.ts."
          }
        ]
      };
    }

    return {
      ruleId: 'FOUNDATION_003',
      passed: true,
      confidence: 'high',
      violations: []
    };
  }
};


