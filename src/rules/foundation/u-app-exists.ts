import type { AuditContext } from '../../types/context.js';
import type { Rule, RuleResult } from '../../types/rule.js';

export const uAppExistsRule: Rule = {
  id: 'FOUNDATION_001',
  name: 'UApp Wrapper',
  category: 'foundation',
  weight: 15,
  description: 'Checks if <UApp> wrapper is present in app.vue or layouts/default.vue.',
  check: (ctx: AuditContext): RuleResult => {
    // Check candidate app/layout files (case-insensitive, supporting src/ directory)
    const appFileCandidates = ctx.vueFiles.filter(f => {
      const lower = f.relativePath.toLowerCase();
      return (
        lower === 'app.vue' ||
        lower === 'src/app.vue' ||
        lower.endsWith('/app.vue') ||
        lower.endsWith('layouts/default.vue')
      );
    });

    // Check if any vue file (or candidate file) contains <UApp> or <u-app>
    const hasUAppInAnyFile = ctx.vueFiles.some(f => 
      f.content.includes('<UApp') || f.content.includes('<u-app')
    );

    if (!hasUAppInAnyFile) {
      const targetPath = appFileCandidates[0]?.filePath ?? 'app.vue or src/App.vue';
      return {
        ruleId: 'FOUNDATION_001',
        passed: false,
        confidence: 'high',
        violations: [
          {
            filePath: targetPath,
            evidence: 'No <UApp> or <u-app> wrapper component found in application layout or root files.',
            fixSuggestion: 'Wrap your root application template in a <UApp> component to enable Nuxt UI toasts, modals, and global styling.'
          }
        ]
      };
    }

    return {
      ruleId: 'FOUNDATION_001',
      passed: true,
      confidence: 'high',
      violations: []
    };
  }
};
