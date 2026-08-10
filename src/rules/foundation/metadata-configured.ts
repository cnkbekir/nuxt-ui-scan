import type { AuditContext } from '../../types/context.js';
import type { Rule, RuleResult } from '../../types/rule.js';

export const metadataConfiguredRule: Rule = {
  id: 'FOUNDATION_006',
  name: 'Metadata Configured',
  category: 'foundation',
  weight: 8,
  description: 'Checks for proper metadata configuration using useHead, useSeoMeta, or nuxt.config app.head.',
  check: (ctx: AuditContext): RuleResult => {
    const hasMetadataInFiles = [...ctx.vueFiles, ...ctx.tsFiles].some(f =>
      f.content.includes('useHead') || f.content.includes('useSeoMeta')
    );

    const nuxtConfigFile = ctx.tsFiles.find(f =>
      f.relativePath.toLowerCase().includes('nuxt.config')
    ) || ctx.files.find(f =>
      f.relativePath.toLowerCase().includes('nuxt.config')
    );

    const hasMetadataInNuxtConfig = nuxtConfigFile ? (
      /app\s*:\s*\{[\s\S]*?head\s*:/m.test(nuxtConfigFile.content) ||
      (nuxtConfigFile.content.includes('app:') && nuxtConfigFile.content.includes('head:')) ||
      nuxtConfigFile.content.includes('useHead') ||
      nuxtConfigFile.content.includes('useSeoMeta')
    ) : false;

    const passed = hasMetadataInFiles || hasMetadataInNuxtConfig;

    if (!passed) {
      return {
        ruleId: 'FOUNDATION_006',
        passed: false,
        confidence: 'high',
        violations: [
          {
            filePath: 'app.vue',
            evidence: 'No page metadata configuration detected using useHead, useSeoMeta, or nuxt.config app.head.',
            fixSuggestion: 'Configure page metadata using useHead() or useSeoMeta() in pages/layouts, or set app.head in nuxt.config.ts.'
          }
        ]
      };
    }

    return {
      ruleId: 'FOUNDATION_006',
      passed: true,
      confidence: 'high',
      violations: []
    };
  }
};
