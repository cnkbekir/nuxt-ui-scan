import { describe, it, expect } from 'vitest';
import { createContext } from '../src/core/context.js';
import { runAudit } from '../src/core/runner.js';
import type { AuditContext } from '../src/types/context.js';
import { nuxtImageUsedRule } from '../src/rules/production/nuxt-image-used.js';

describe('Framework Auto-Detection and Rule Filtering', () => {
  it('detects nuxt framework when nuxt.config exists or nuxt dependency present', async () => {
    const ctx = await createContext('.', 'nuxt');
    expect(ctx.framework).toBe('nuxt');
    expect(ctx.isNuxt).toBe(true);
  });

  it('detects vue-spa framework when overridden or package has vue without nuxt', async () => {
    const ctx = await createContext('.', 'vue-spa');
    expect(ctx.framework).toBe('vue-spa');
    expect(ctx.isNuxt).toBe(false);
  });

  it('filters out nuxt-only rules when running audit on a vue-spa context', async () => {
    const mockCtx: AuditContext = {
      root: '/mock',
      files: [],
      vueFiles: [
        {
          filePath: '/mock/App.vue',
          relativePath: 'App.vue',
          content: '<template><img src="/logo.png" /></template>',
          templateAst: '<template><img src="/logo.png" /></template>'
        }
      ],
      tsFiles: [],
      framework: 'vue-spa',
      isNuxt: false,
      getFilesByPattern: () => []
    };

    const summary = await runAudit(mockCtx, {
      ruleSet: [nuxtImageUsedRule]
    });

    // nuxtImageUsedRule has framework: 'nuxt', so it should be filtered out on vue-spa
    expect(summary.results).toHaveLength(0);
  });

  it('ignores explicitly specified rules in runAudit', async () => {
    const mockCtx: AuditContext = {
      root: '/mock',
      files: [],
      vueFiles: [
        {
          filePath: '/mock/App.vue',
          relativePath: 'App.vue',
          content: '<template><img src="/logo.png" /></template>',
          templateAst: '<template><img src="/logo.png" /></template>'
        }
      ],
      tsFiles: [],
      framework: 'nuxt',
      isNuxt: true,
      getFilesByPattern: () => []
    };

    const summary = await runAudit(mockCtx, {
      ruleSet: [nuxtImageUsedRule],
      ignoreRules: ['PRODUCTION_004']
    });

    expect(summary.results).toHaveLength(0);
  });
});
