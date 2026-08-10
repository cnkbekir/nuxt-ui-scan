import { describe, it, expect } from 'vitest';
import { getGrade, calculateScore } from '../src/core/scoring.js';
import type { Rule, RuleResult } from '../src/types/rule.js';
import type { AuditContext } from '../src/types/context.js';

// ─── getGrade ───────────────────────────────────────────────────

describe('getGrade', () => {
  it('returns A for scores >= 90', () => {
    expect(getGrade(90)).toBe('A');
    expect(getGrade(95)).toBe('A');
    expect(getGrade(100)).toBe('A');
  });

  it('returns B for scores 80-89', () => {
    expect(getGrade(80)).toBe('B');
    expect(getGrade(85)).toBe('B');
    expect(getGrade(89)).toBe('B');
  });

  it('returns C for scores 70-79', () => {
    expect(getGrade(70)).toBe('C');
    expect(getGrade(75)).toBe('C');
    expect(getGrade(79)).toBe('C');
  });

  it('returns D for scores 60-69', () => {
    expect(getGrade(60)).toBe('D');
    expect(getGrade(65)).toBe('D');
    expect(getGrade(69)).toBe('D');
  });

  it('returns F for scores < 60', () => {
    expect(getGrade(59)).toBe('F');
    expect(getGrade(0)).toBe('F');
    expect(getGrade(30)).toBe('F');
  });
});

// ─── calculateScore ─────────────────────────────────────────────

describe('calculateScore', () => {
  const mockContext: AuditContext = {
    root: '/test-project',
    files: [],
    vueFiles: [],
    tsFiles: [],
    getFilesByPattern: () => [],
  };

  it('awards full marks (100) when all rules pass', () => {
    const rules: Rule[] = [
      { id: 'F1', name: 'Test', category: 'foundation', weight: 10, description: '', check: () => ({ ruleId: 'F1', passed: true, confidence: 'high', violations: [] }) },
      { id: 'I1', name: 'Test', category: 'interaction', weight: 10, description: '', check: () => ({ ruleId: 'I1', passed: true, confidence: 'high', violations: [] }) },
      { id: 'S1', name: 'Test', category: 'states', weight: 10, description: '', check: () => ({ ruleId: 'S1', passed: true, confidence: 'high', violations: [] }) },
      { id: 'A1', name: 'Test', category: 'accessibility', weight: 10, description: '', check: () => ({ ruleId: 'A1', passed: true, confidence: 'high', violations: [] }) },
      { id: 'FO1', name: 'Test', category: 'forms', weight: 10, description: '', check: () => ({ ruleId: 'FO1', passed: true, confidence: 'high', violations: [] }) },
      { id: 'P1', name: 'Test', category: 'production', weight: 10, description: '', check: () => ({ ruleId: 'P1', passed: true, confidence: 'high', violations: [] }) },
    ];

    const results: RuleResult[] = rules.map((r) => ({
      ruleId: r.id,
      passed: true,
      confidence: 'high' as const,
      violations: [],
    }));

    const summary = calculateScore(results, rules, mockContext);
    expect(summary.totalScore).toBe(100);
    expect(summary.grade).toBe('A');
  });

  it('scores 0 when all rules fail', () => {
    const rules: Rule[] = [
      { id: 'F1', name: 'Test', category: 'foundation', weight: 10, description: '', check: () => ({ ruleId: 'F1', passed: false, confidence: 'high', violations: [] }) },
      { id: 'I1', name: 'Test', category: 'interaction', weight: 10, description: '', check: () => ({ ruleId: 'I1', passed: false, confidence: 'high', violations: [] }) },
      { id: 'S1', name: 'Test', category: 'states', weight: 10, description: '', check: () => ({ ruleId: 'S1', passed: false, confidence: 'high', violations: [] }) },
      { id: 'A1', name: 'Test', category: 'accessibility', weight: 10, description: '', check: () => ({ ruleId: 'A1', passed: false, confidence: 'high', violations: [] }) },
      { id: 'FO1', name: 'Test', category: 'forms', weight: 10, description: '', check: () => ({ ruleId: 'FO1', passed: false, confidence: 'high', violations: [] }) },
      { id: 'P1', name: 'Test', category: 'production', weight: 10, description: '', check: () => ({ ruleId: 'P1', passed: false, confidence: 'high', violations: [] }) },
    ];

    const results: RuleResult[] = rules.map((r) => ({
      ruleId: r.id,
      passed: false,
      confidence: 'high' as const,
      violations: [],
    }));

    const summary = calculateScore(results, rules, mockContext);
    expect(summary.totalScore).toBe(0);
    expect(summary.grade).toBe('F');
  });

  it('computes partial scores correctly', () => {
    // Foundation has max weight 20. One rule with weight 10 passes, one with weight 10 fails.
    // So foundation normalized = (10/20) * 20 = 10
    const rules: Rule[] = [
      { id: 'F1', name: 'Pass', category: 'foundation', weight: 10, description: '', check: () => ({ ruleId: 'F1', passed: true, confidence: 'high', violations: [] }) },
      { id: 'F2', name: 'Fail', category: 'foundation', weight: 10, description: '', check: () => ({ ruleId: 'F2', passed: false, confidence: 'high', violations: [] }) },
    ];

    const results: RuleResult[] = [
      { ruleId: 'F1', passed: true, confidence: 'high', violations: [] },
      { ruleId: 'F2', passed: false, confidence: 'high', violations: [] },
    ];

    const summary = calculateScore(results, rules, mockContext);

    // Foundation: 10/20 * 20 = 10
    // All other categories have no rules → full marks
    // interaction: 20, states: 20, accessibility: 20, forms: 10, production: 10 = 80
    // Total = 10 + 80 = 90
    expect(summary.totalScore).toBe(90);
    expect(summary.grade).toBe('A');
  });

  it('includes correct metadata in summary', () => {
    const summary = calculateScore([], [], mockContext);
    expect(summary.projectRoot).toBe('/test-project');
    expect(summary.filesScanned).toBe(0);
    expect(summary.timestamp).toBeDefined();
    expect(summary.categoryScores).toHaveLength(6);
  });
});

// ─── Rule unit tests ────────────────────────────────────────────

describe('rules', () => {
  describe('FOUNDATION_001 - UApp Exists', async () => {
    const { uAppExistsRule } = await import('../src/rules/foundation/u-app-exists.js');

    it('passes when <UApp> is in app.vue', () => {
      const ctx: AuditContext = {
        root: '/test',
        files: [
          {
            filePath: '/test/app.vue',
            relativePath: 'app.vue',
            content: '<template><UApp><NuxtPage /></UApp></template>',
            templateAst: '<UApp><NuxtPage /></UApp>',
          },
        ],
        vueFiles: [
          {
            filePath: '/test/app.vue',
            relativePath: 'app.vue',
            content: '<template><UApp><NuxtPage /></UApp></template>',
            templateAst: '<UApp><NuxtPage /></UApp>',
          },
        ],
        tsFiles: [],
        getFilesByPattern: () => [],
      };

      const result = uAppExistsRule.check(ctx);
      expect(result.passed).toBe(true);
    });

    it('fails when no UApp wrapper exists', () => {
      const ctx: AuditContext = {
        root: '/test',
        files: [
          {
            filePath: '/test/app.vue',
            relativePath: 'app.vue',
            content: '<template><NuxtPage /></template>',
            templateAst: '<NuxtPage />',
          },
        ],
        vueFiles: [
          {
            filePath: '/test/app.vue',
            relativePath: 'app.vue',
            content: '<template><NuxtPage /></template>',
            templateAst: '<NuxtPage />',
          },
        ],
        tsFiles: [],
        getFilesByPattern: () => [],
      };

      const result = uAppExistsRule.check(ctx);
      expect(result.passed).toBe(false);
      expect(result.violations.length).toBeGreaterThan(0);
    });
  });

  describe('FOUNDATION_002 - Error Boundary', async () => {
    const { errorBoundaryRule } = await import('../src/rules/foundation/error-boundary.js');

    it('passes when error.vue exists', () => {
      const ctx: AuditContext = {
        root: '/test',
        files: [
          { filePath: '/test/error.vue', relativePath: 'error.vue', content: '<template>Error</template>' },
        ],
        vueFiles: [
          { filePath: '/test/error.vue', relativePath: 'error.vue', content: '<template>Error</template>' },
        ],
        tsFiles: [],
        getFilesByPattern: () => [],
      };

      const result = errorBoundaryRule.check(ctx);
      expect(result.passed).toBe(true);
    });

    it('fails when error.vue is missing', () => {
      const ctx: AuditContext = {
        root: '/test',
        files: [],
        vueFiles: [],
        tsFiles: [],
        getFilesByPattern: () => [],
      };

      const result = errorBoundaryRule.check(ctx);
      expect(result.passed).toBe(false);
    });
  });

  describe('FOUNDATION_003 - Nuxt UI Module Configured', async () => {
    const { nuxtConfigModulesRule } = await import('../src/rules/foundation/nuxt-config-modules.js');

    it('passes when @nuxt/ui is configured in nuxt.config.ts', () => {
      const ctx: AuditContext = {
        root: '/test',
        files: [],
        vueFiles: [],
        tsFiles: [
          {
            filePath: '/test/nuxt.config.ts',
            relativePath: 'nuxt.config.ts',
            content: "export default defineNuxtConfig({ modules: ['@nuxt/ui'] })",
          },
        ],
        getFilesByPattern: () => [],
      };
      const result = nuxtConfigModulesRule.check(ctx);
      expect(result.passed).toBe(true);
      expect(result.confidence).toBe('high');
    });

    it('fails when @nuxt/ui is missing in nuxt.config.ts', () => {
      const ctx: AuditContext = {
        root: '/test',
        files: [],
        vueFiles: [],
        tsFiles: [
          {
            filePath: '/test/nuxt.config.ts',
            relativePath: 'nuxt.config.ts',
            content: "export default defineNuxtConfig({ modules: [] })",
          },
        ],
        getFilesByPattern: () => [],
      };
      const result = nuxtConfigModulesRule.check(ctx);
      expect(result.passed).toBe(false);
      expect(result.violations).toHaveLength(1);
    });

    it('returns passed: true with low confidence when nuxt.config is missing', () => {
      const ctx: AuditContext = {
        root: '/test',
        files: [],
        vueFiles: [],
        tsFiles: [],
        getFilesByPattern: () => [],
      };
      const result = nuxtConfigModulesRule.check(ctx);
      expect(result.passed).toBe(true);
      expect(result.confidence).toBe('low');
    });
  });

  describe('FOUNDATION_004 - Favicon Present', async () => {
    const { faviconPresentRule } = await import('../src/rules/foundation/favicon-present.js');

    it('passes when favicon file exists in public/', () => {
      const ctx: AuditContext = {
        root: '/test',
        files: [
          { filePath: '/test/public/favicon.ico', relativePath: 'public/favicon.ico', content: '' }
        ],
        vueFiles: [],
        tsFiles: [],
        getFilesByPattern: () => [],
      };
      const result = faviconPresentRule.check(ctx);
      expect(result.passed).toBe(true);
    });

    it('passes when useHead configures icon link in Vue file', () => {
      const ctx: AuditContext = {
        root: '/test',
        files: [],
        vueFiles: [
          {
            filePath: '/test/app.vue',
            relativePath: 'app.vue',
            content: "<script setup>useHead({ link: [{ rel: 'icon', href: '/favicon.ico' }] })</script>",
          }
        ],
        tsFiles: [],
        getFilesByPattern: () => [],
      };
      const result = faviconPresentRule.check(ctx);
      expect(result.passed).toBe(true);
    });

    it('fails when no favicon is found', () => {
      const ctx: AuditContext = {
        root: '/test',
        files: [],
        vueFiles: [],
        tsFiles: [],
        getFilesByPattern: () => [],
      };
      const result = faviconPresentRule.check(ctx);
      expect(result.passed).toBe(false);
    });
  });

  describe('FOUNDATION_005 - 404 Not Found Page', async () => {
    const { notFoundPageRule } = await import('../src/rules/foundation/not-found-page.js');

    it('passes when catch-all route exists', () => {
      const ctx: AuditContext = {
        root: '/test',
        files: [],
        vueFiles: [
          { filePath: '/test/pages/[...slug].vue', relativePath: 'pages/[...slug].vue', content: '' }
        ],
        tsFiles: [],
        getFilesByPattern: () => [],
      };
      const result = notFoundPageRule.check(ctx);
      expect(result.passed).toBe(true);
    });

    it('passes when error.vue handles 404', () => {
      const ctx: AuditContext = {
        root: '/test',
        files: [],
        vueFiles: [
          { filePath: '/test/error.vue', relativePath: 'error.vue', content: 'template <div v-if="error.statusCode === 404">404</div>' }
        ],
        tsFiles: [],
        getFilesByPattern: () => [],
      };
      const result = notFoundPageRule.check(ctx);
      expect(result.passed).toBe(true);
    });

    it('fails when neither catch-all nor 404 handling in error.vue exists', () => {
      const ctx: AuditContext = {
        root: '/test',
        files: [],
        vueFiles: [],
        tsFiles: [],
        getFilesByPattern: () => [],
      };
      const result = notFoundPageRule.check(ctx);
      expect(result.passed).toBe(false);
    });
  });

  describe('FOUNDATION_006 - Metadata Configured', async () => {
    const { metadataConfiguredRule } = await import('../src/rules/foundation/metadata-configured.js');

    it('passes when useSeoMeta is used', () => {
      const ctx: AuditContext = {
        root: '/test',
        files: [],
        vueFiles: [
          { filePath: '/test/app.vue', relativePath: 'app.vue', content: "useSeoMeta({ title: 'My App' })" }
        ],
        tsFiles: [],
        getFilesByPattern: () => [],
      };
      const result = metadataConfiguredRule.check(ctx);
      expect(result.passed).toBe(true);
    });

    it('fails when no metadata composable or head config is found', () => {
      const ctx: AuditContext = {
        root: '/test',
        files: [],
        vueFiles: [],
        tsFiles: [],
        getFilesByPattern: () => [],
      };
      const result = metadataConfiguredRule.check(ctx);
      expect(result.passed).toBe(false);
    });
  });

  describe('FOUNDATION_007 - Color Mode Configured', async () => {
    const { colorModeConfiguredRule } = await import('../src/rules/foundation/color-mode-configured.js');

    it('passes when UColorModeButton is used', () => {
      const ctx: AuditContext = {
        root: '/test',
        files: [],
        vueFiles: [
          { filePath: '/test/app.vue', relativePath: 'app.vue', content: '<UColorModeButton />' }
        ],
        tsFiles: [],
        getFilesByPattern: () => [],
      };
      const result = colorModeConfiguredRule.check(ctx);
      expect(result.passed).toBe(true);
      expect(result.confidence).toBe('medium');
    });

    it('passes when useColorMode composable is used', () => {
      const ctx: AuditContext = {
        root: '/test',
        files: [],
        vueFiles: [
          { filePath: '/test/app.vue', relativePath: 'app.vue', content: 'const mode = useColorMode()' }
        ],
        tsFiles: [],
        getFilesByPattern: () => [],
      };
      const result = colorModeConfiguredRule.check(ctx);
      expect(result.passed).toBe(true);
      expect(result.confidence).toBe('medium');
    });

    it('fails when no color mode components or composables are used', () => {
      const ctx: AuditContext = {
        root: '/test',
        files: [],
        vueFiles: [],
        tsFiles: [],
        getFilesByPattern: () => [],
      };
      const result = colorModeConfiguredRule.check(ctx);
      expect(result.passed).toBe(false);
      expect(result.confidence).toBe('medium');
    });
  });

  describe('FORMS_001 - UForm Schema', async () => {
    const { uFormSchemaRule } = await import('../src/rules/forms/u-form-schema.js');

    it('passes when <UForm> has :schema prop', () => {
      const ctx: AuditContext = {
        root: '/test',
        files: [],
        vueFiles: [
          {
            filePath: '/test/form.vue',
            relativePath: 'form.vue',
            content: '',
            templateAst: '<UForm :schema="schema" :state="state">',
          },
        ],
        tsFiles: [],
        getFilesByPattern: () => [],
      };

      const result = uFormSchemaRule.check(ctx);
      expect(result.passed).toBe(true);
    });

    it('fails when <UForm> has no schema prop', () => {
      const ctx: AuditContext = {
        root: '/test',
        files: [],
        vueFiles: [
          {
            filePath: '/test/form.vue',
            relativePath: 'form.vue',
            content: '',
            templateAst: '<UForm :state="state">',
          },
        ],
        tsFiles: [],
        getFilesByPattern: () => [],
      };

      const result = uFormSchemaRule.check(ctx);
      expect(result.passed).toBe(false);
      expect(result.violations).toHaveLength(1);
    });

    it('passes when no UForm is used', () => {
      const ctx: AuditContext = {
        root: '/test',
        files: [],
        vueFiles: [
          {
            filePath: '/test/page.vue',
            relativePath: 'page.vue',
            content: '',
            templateAst: '<div>No forms here</div>',
          },
        ],
        tsFiles: [],
        getFilesByPattern: () => [],
      };

      const result = uFormSchemaRule.check(ctx);
      expect(result.passed).toBe(true);
    });
  });

  describe('A11Y_001 - Button Aria Label', async () => {
    const { buttonAriaLabelRule } = await import('../src/rules/a11y/button-aria-label.js');

    it('fails for icon-only button without aria-label', () => {
      const ctx: AuditContext = {
        root: '/test',
        files: [],
        vueFiles: [
          {
            filePath: '/test/comp.vue',
            relativePath: 'comp.vue',
            content: '',
            templateAst: '<UButton icon="i-heroicons-trash" />',
          },
        ],
        tsFiles: [],
        getFilesByPattern: () => [],
      };

      const result = buttonAriaLabelRule.check(ctx);
      expect(result.passed).toBe(false);
      expect(result.violations).toHaveLength(1);
    });

    it('passes for icon button with aria-label', () => {
      const ctx: AuditContext = {
        root: '/test',
        files: [],
        vueFiles: [
          {
            filePath: '/test/comp.vue',
            relativePath: 'comp.vue',
            content: '',
            templateAst: '<UButton icon="i-heroicons-trash" aria-label="Delete" />',
          },
        ],
        tsFiles: [],
        getFilesByPattern: () => [],
      };

      const result = buttonAriaLabelRule.check(ctx);
      expect(result.passed).toBe(true);
    });

    it('passes for icon button with label prop', () => {
      const ctx: AuditContext = {
        root: '/test',
        files: [],
        vueFiles: [
          {
            filePath: '/test/comp.vue',
            relativePath: 'comp.vue',
            content: '',
            templateAst: '<UButton icon="i-heroicons-trash" label="Delete" />',
          },
        ],
        tsFiles: [],
        getFilesByPattern: () => [],
      };

      const result = buttonAriaLabelRule.check(ctx);
      expect(result.passed).toBe(true);
    });
  });

  describe('A11Y_002 - Image Alt Text', async () => {
    const { imageAltPresentRule } = await import('../src/rules/a11y/image-alt-present.js');

    it('passes when img and UAvatar elements have alt attributes', () => {
      const ctx: AuditContext = {
        root: '/test',
        files: [],
        vueFiles: [
          {
            filePath: '/test/comp.vue',
            relativePath: 'comp.vue',
            content: '',
            templateAst: '<img src="logo.png" alt="Logo" /><UAvatar src="avatar.jpg" alt="User avatar" />',
          },
        ],
        tsFiles: [],
        getFilesByPattern: () => [],
      };

      const result = imageAltPresentRule.check(ctx);
      expect(result.passed).toBe(true);
      expect(result.violations).toHaveLength(0);
    });

    it('fails when img or NuxtImg lacks alt attribute', () => {
      const ctx: AuditContext = {
        root: '/test',
        files: [],
        vueFiles: [
          {
            filePath: '/test/comp.vue',
            relativePath: 'comp.vue',
            content: '',
            templateAst: '<NuxtImg src="hero.jpg" />',
          },
        ],
        tsFiles: [],
        getFilesByPattern: () => [],
      };

      const result = imageAltPresentRule.check(ctx);
      expect(result.passed).toBe(false);
      expect(result.violations).toHaveLength(1);
    });
  });

  describe('A11Y_003 - Form Field Labeling', async () => {
    const { formFieldLabelingRule } = await import('../src/rules/a11y/form-field-labeling.js');

    it('passes when input is wrapped in UFormField or has aria-label', () => {
      const ctx: AuditContext = {
        root: '/test',
        files: [],
        vueFiles: [
          {
            filePath: '/test/form.vue',
            relativePath: 'form.vue',
            content: '',
            templateAst: '<UFormField label="Username"><UInput v-model="username" /></UFormField>',
          },
        ],
        tsFiles: [],
        getFilesByPattern: () => [],
      };

      const result = formFieldLabelingRule.check(ctx);
      expect(result.passed).toBe(true);
    });

    it('fails when standalone form input has no UFormField and no aria-label', () => {
      const ctx: AuditContext = {
        root: '/test',
        files: [],
        vueFiles: [
          {
            filePath: '/test/form.vue',
            relativePath: 'form.vue',
            content: '',
            templateAst: '<UInput v-model="email" />',
          },
        ],
        tsFiles: [],
        getFilesByPattern: () => [],
      };

      const result = formFieldLabelingRule.check(ctx);
      expect(result.passed).toBe(false);
      expect(result.violations).toHaveLength(1);
    });
  });

  describe('A11Y_004 - Heading Hierarchy', async () => {
    const { headingHierarchyRule } = await import('../src/rules/a11y/heading-hierarchy.js');

    it('passes for sequential heading levels', () => {
      const ctx: AuditContext = {
        root: '/test',
        files: [],
        vueFiles: [
          {
            filePath: '/test/page.vue',
            relativePath: 'page.vue',
            content: '',
            templateAst: '<h1>Title</h1><h2>Subtitle</h2><h3>Section</h3>',
          },
        ],
        tsFiles: [],
        getFilesByPattern: () => [],
      };

      const result = headingHierarchyRule.check(ctx);
      expect(result.passed).toBe(true);
    });

    it('fails when heading levels skip (e.g. h1 to h3)', () => {
      const ctx: AuditContext = {
        root: '/test',
        files: [],
        vueFiles: [
          {
            filePath: '/test/page.vue',
            relativePath: 'page.vue',
            content: '',
            templateAst: '<h1>Main Header</h1><h3>Skipped H2 Subheader</h3>',
          },
        ],
        tsFiles: [],
        getFilesByPattern: () => [],
      };

      const result = headingHierarchyRule.check(ctx);
      expect(result.passed).toBe(false);
      expect(result.violations).toHaveLength(1);
    });
  });

  describe('A11Y_005 - Skip Link Present', async () => {
    const { skipLinkPresentRule } = await import('../src/rules/a11y/skip-link-present.js');

    it('passes when a skip link is present in templates', () => {
      const ctx: AuditContext = {
        root: '/test',
        files: [],
        vueFiles: [
          {
            filePath: '/test/app.vue',
            relativePath: 'app.vue',
            content: '<template><a href="#main" class="skip-link">Skip to main content</a></template>',
          },
        ],
        tsFiles: [],
        getFilesByPattern: () => [],
      };

      const result = skipLinkPresentRule.check(ctx);
      expect(result.passed).toBe(true);
    });

    it('fails when no skip link is present', () => {
      const ctx: AuditContext = {
        root: '/test',
        files: [],
        vueFiles: [
          {
            filePath: '/test/app.vue',
            relativePath: 'app.vue',
            content: '<template><div>No skip link here</div></template>',
          },
        ],
        tsFiles: [],
        getFilesByPattern: () => [],
      };

      const result = skipLinkPresentRule.check(ctx);
      expect(result.passed).toBe(false);
      expect(result.violations).toHaveLength(1);
    });
  });

  describe('A11Y_006 - Focus Indicator Configured', async () => {
    const { focusVisiblePresentRule } = await import('../src/rules/a11y/focus-visible-present.js');

    it('passes when focus-visible or Nuxt UI components exist', () => {
      const ctx: AuditContext = {
        root: '/test',
        files: [
          {
            filePath: '/test/app.vue',
            relativePath: 'app.vue',
            content: '<template><UButton focus-visible:ring-2>Click</UButton></template>',
          },
        ],
        vueFiles: [
          {
            filePath: '/test/app.vue',
            relativePath: 'app.vue',
            content: '<template><UButton focus-visible:ring-2>Click</UButton></template>',
            templateAst: '<UButton focus-visible:ring-2>Click</UButton>',
          },
        ],
        tsFiles: [],
        getFilesByPattern: () => [],
      };

      const result = focusVisiblePresentRule.check(ctx);
      expect(result.passed).toBe(true);
    });

    it('fails when custom button has no focus styling and no global focus config exists', () => {
      const ctx: AuditContext = {
        root: '/test',
        files: [
          {
            filePath: '/test/page.vue',
            relativePath: 'page.vue',
            content: '<template><button class="btn">Click me</button></template>',
          },
        ],
        vueFiles: [
          {
            filePath: '/test/page.vue',
            relativePath: 'page.vue',
            content: '<template><button class="btn">Click me</button></template>',
            templateAst: '<button class="btn">Click me</button>',
          },
        ],
        tsFiles: [],
        getFilesByPattern: () => [],
      };

      const result = focusVisiblePresentRule.check(ctx);
      expect(result.passed).toBe(false);
      expect(result.violations.length).toBeGreaterThan(0);
    });
  });

  describe('A11Y_007 - Keyboard Navigation Available', async () => {
    const { keyboardNavAvailableRule } = await import('../src/rules/a11y/keyboard-nav-available.js');

    it('passes when keyboard event handlers or defineShortcuts are used', () => {
      const ctx: AuditContext = {
        root: '/test',
        files: [
          {
            filePath: '/test/app.vue',
            relativePath: 'app.vue',
            content: '<script setup>defineShortcuts({ meta_k: () => {} })</script>',
          },
        ],
        vueFiles: [
          {
            filePath: '/test/app.vue',
            relativePath: 'app.vue',
            content: '<script setup>defineShortcuts({ meta_k: () => {} })</script>',
          },
        ],
        tsFiles: [],
        getFilesByPattern: () => [],
      };

      const result = keyboardNavAvailableRule.check(ctx);
      expect(result.passed).toBe(true);
    });

    it('fails when no keyboard handlers exist in project', () => {
      const ctx: AuditContext = {
        root: '/test',
        files: [
          {
            filePath: '/test/app.vue',
            relativePath: 'app.vue',
            content: '<template><div>Static page</div></template>',
          },
        ],
        vueFiles: [
          {
            filePath: '/test/app.vue',
            relativePath: 'app.vue',
            content: '<template><div>Static page</div></template>',
          },
        ],
        tsFiles: [],
        getFilesByPattern: () => [],
      };

      const result = keyboardNavAvailableRule.check(ctx);
      expect(result.passed).toBe(false);
      expect(result.violations).toHaveLength(1);
    });
  });

  describe('A11Y_008 - Screen Reader Text Present', async () => {
    const { srOnlyTextPresentRule } = await import('../src/rules/a11y/sr-only-text-present.js');

    it('passes when sr-only or aria-label is present', () => {
      const ctx: AuditContext = {
        root: '/test',
        files: [],
        vueFiles: [
          {
            filePath: '/test/app.vue',
            relativePath: 'app.vue',
            content: '<template><span class="sr-only">Close</span></template>',
          },
        ],
        tsFiles: [],
        getFilesByPattern: () => [],
      };

      const result = srOnlyTextPresentRule.check(ctx);
      expect(result.passed).toBe(true);
    });

    it('fails when no screen reader text or ARIA labels exist', () => {
      const ctx: AuditContext = {
        root: '/test',
        files: [],
        vueFiles: [
          {
            filePath: '/test/app.vue',
            relativePath: 'app.vue',
            content: '<template><div>Plain text</div></template>',
          },
        ],
        tsFiles: [],
        getFilesByPattern: () => [],
      };

      const result = srOnlyTextPresentRule.check(ctx);
      expect(result.passed).toBe(false);
      expect(result.violations).toHaveLength(1);
    });
  });

  describe('FORMS_002 - Form Error Handling', async () => {
    const { formErrorHandlingRule } = await import('../src/rules/forms/form-error-handling.js');

    it('passes when UForm has @error event handler', () => {
      const ctx: AuditContext = {
        root: '/test',
        files: [],
        vueFiles: [
          {
            filePath: '/test/form.vue',
            relativePath: 'form.vue',
            content: '',
            templateAst: '<UForm @error="onError"><UInput type="text" /></UForm>',
          },
        ],
        tsFiles: [],
        getFilesByPattern: () => [],
      };
      const result = formErrorHandlingRule.check(ctx);
      expect(result.passed).toBe(true);
    });

    it('passes when UFormField is used in file', () => {
      const ctx: AuditContext = {
        root: '/test',
        files: [],
        vueFiles: [
          {
            filePath: '/test/form.vue',
            relativePath: 'form.vue',
            content: '',
            templateAst: '<UForm><UFormField label="Name"><UInput type="text" /></UFormField></UForm>',
          },
        ],
        tsFiles: [],
        getFilesByPattern: () => [],
      };
      const result = formErrorHandlingRule.check(ctx);
      expect(result.passed).toBe(true);
    });

    it('fails when UForm has no @error handler and no UFormField in file', () => {
      const ctx: AuditContext = {
        root: '/test',
        files: [],
        vueFiles: [
          {
            filePath: '/test/form.vue',
            relativePath: 'form.vue',
            content: '',
            templateAst: '<UForm><UInput type="text" /></UForm>',
          },
        ],
        tsFiles: [],
        getFilesByPattern: () => [],
      };
      const result = formErrorHandlingRule.check(ctx);
      expect(result.passed).toBe(false);
      expect(result.violations).toHaveLength(1);
    });
  });

  describe('FORMS_003 - Input Types Specified', async () => {
    const { inputTypesPresentRule } = await import('../src/rules/forms/input-types-present.js');

    it('passes when UInput has explicit type attribute', () => {
      const ctx: AuditContext = {
        root: '/test',
        files: [],
        vueFiles: [
          {
            filePath: '/test/form.vue',
            relativePath: 'form.vue',
            content: '',
            templateAst: '<UInput type="text" /><u-input :type="inputType" />',
          },
        ],
        tsFiles: [],
        getFilesByPattern: () => [],
      };
      const result = inputTypesPresentRule.check(ctx);
      expect(result.passed).toBe(true);
    });

    it('fails when UInput is missing type attribute', () => {
      const ctx: AuditContext = {
        root: '/test',
        files: [],
        vueFiles: [
          {
            filePath: '/test/form.vue',
            relativePath: 'form.vue',
            content: '',
            templateAst: '<UInput placeholder="Name" />',
          },
        ],
        tsFiles: [],
        getFilesByPattern: () => [],
      };
      const result = inputTypesPresentRule.check(ctx);
      expect(result.passed).toBe(false);
      expect(result.violations).toHaveLength(1);
    });
  });

  describe('FORMS_004 - Required Fields Marked', async () => {
    const { requiredFieldsMarkedRule } = await import('../src/rules/forms/required-fields-marked.js');

    it('passes when schema form has required prop or asterisk marking', () => {
      const ctx: AuditContext = {
        root: '/test',
        files: [],
        vueFiles: [
          {
            filePath: '/test/form.vue',
            relativePath: 'form.vue',
            content: '',
            templateAst: '<UForm :schema="schema"><UFormField label="Email *" required></UFormField></UForm>',
          },
        ],
        tsFiles: [],
        getFilesByPattern: () => [],
      };
      const result = requiredFieldsMarkedRule.check(ctx);
      expect(result.passed).toBe(true);
    });

    it('fails when schema form lacks required prop and asterisk markings', () => {
      const ctx: AuditContext = {
        root: '/test',
        files: [],
        vueFiles: [
          {
            filePath: '/test/form.vue',
            relativePath: 'form.vue',
            content: '',
            templateAst: '<UForm :schema="schema"><UFormField label="Email"></UFormField></UForm>',
          },
        ],
        tsFiles: [],
        getFilesByPattern: () => [],
      };
      const result = requiredFieldsMarkedRule.check(ctx);
      expect(result.passed).toBe(false);
      expect(result.violations).toHaveLength(1);
    });
  });

  describe('FORMS_005 - Submit Button Present', async () => {
    const { submitButtonPresentRule } = await import('../src/rules/forms/submit-button-present.js');

    it('passes when form has submit button with type="submit" and @submit handler', () => {
      const ctx: AuditContext = {
        root: '/test',
        files: [],
        vueFiles: [
          {
            filePath: '/test/form.vue',
            relativePath: 'form.vue',
            content: '',
            templateAst: '<UForm @submit="onSubmit"><UButton type="submit">Submit</UButton></UForm>',
          },
        ],
        tsFiles: [],
        getFilesByPattern: () => [],
      };
      const result = submitButtonPresentRule.check(ctx);
      expect(result.passed).toBe(true);
    });

    it('fails when submit button or submit handler is missing', () => {
      const ctx: AuditContext = {
        root: '/test',
        files: [],
        vueFiles: [
          {
            filePath: '/test/form.vue',
            relativePath: 'form.vue',
            content: '',
            templateAst: '<UForm><UButton>Submit</UButton></UForm>',
          },
        ],
        tsFiles: [],
        getFilesByPattern: () => [],
      };
      const result = submitButtonPresentRule.check(ctx);
      expect(result.passed).toBe(false);
      expect(result.violations).toHaveLength(1);
    });
  });

  describe('FORMS_006 - Placeholder Not Used As Label', async () => {
    const { placeholderNotLabelRule } = await import('../src/rules/forms/placeholder-not-label.js');

    it('passes when input with placeholder has own label or enclosing UFormField label', () => {
      const ctx: AuditContext = {
        root: '/test',
        files: [],
        vueFiles: [
          {
            filePath: '/test/form.vue',
            relativePath: 'form.vue',
            content: '',
            templateAst: '<UFormField label="Username"><UInput placeholder="Enter username" /></UFormField>',
          },
        ],
        tsFiles: [],
        getFilesByPattern: () => [],
      };
      const result = placeholderNotLabelRule.check(ctx);
      expect(result.passed).toBe(true);
    });

    it('fails when input has placeholder without any label', () => {
      const ctx: AuditContext = {
        root: '/test',
        files: [],
        vueFiles: [
          {
            filePath: '/test/form.vue',
            relativePath: 'form.vue',
            content: '',
            templateAst: '<UInput placeholder="Enter username" />',
          },
        ],
        tsFiles: [],
        getFilesByPattern: () => [],
      };
      const result = placeholderNotLabelRule.check(ctx);
      expect(result.passed).toBe(false);
      expect(result.violations).toHaveLength(1);
    });
  });
});


