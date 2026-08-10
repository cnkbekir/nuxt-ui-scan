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
});
