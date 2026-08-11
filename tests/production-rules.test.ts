import { describe, it, expect } from 'vitest';
import type { AuditContext, ParsedFile } from '../src/types/context.js';
import { noConsoleLogsRule } from '../src/rules/production/no-console-logs.js';
import { noHardcodedUrlsRule } from '../src/rules/production/no-hardcoded-urls.js';
import { responsiveLayoutPresentRule } from '../src/rules/production/responsive-layout-present.js';
import { nuxtImageUsedRule } from '../src/rules/production/nuxt-image-used.js';
import { noInlineStylesRule } from '../src/rules/production/no-inline-styles.js';
import { darkModeSupportRule } from '../src/rules/production/dark-mode-support.js';

function createMockContext(
  vueFiles: Partial<ParsedFile>[] = [],
  tsFiles: Partial<ParsedFile>[] = [],
  framework: 'nuxt' | 'vue-spa' = 'nuxt'
): AuditContext {
  const fullVueFiles: ParsedFile[] = vueFiles.map((f, i) => ({
    filePath: f.filePath || `/project/components/Comp${i}.vue`,
    relativePath: f.relativePath || `components/Comp${i}.vue`,
    content: f.content || '',
    templateAst: f.templateAst !== undefined ? f.templateAst : f.content || '',
    scriptContent: f.scriptContent || '',
    scriptSetupContent: f.scriptSetupContent || ''
  }));

  const fullTsFiles: ParsedFile[] = tsFiles.map((f, i) => ({
    filePath: f.filePath || `/project/utils/util${i}.ts`,
    relativePath: f.relativePath || `utils/util${i}.ts`,
    content: f.content || '',
    scriptContent: f.content || ''
  }));

  const allFiles = [...fullVueFiles, ...fullTsFiles];

  return {
    root: '/project',
    files: allFiles,
    vueFiles: fullVueFiles,
    tsFiles: fullTsFiles,
    framework,
    isNuxt: framework === 'nuxt',
    getFilesByPattern: () => []
  };
}

describe('Production Rules', () => {
  describe('PRODUCTION_001 - No Console Logs', () => {
    it('passes when no console.log is present', () => {
      const ctx = createMockContext([{ content: 'const a = 1;' }]);
      const res = noConsoleLogsRule.check(ctx);
      expect(res.passed).toBe(true);
      expect(res.violations).toHaveLength(0);
    });

    it('fails when console.log is present in code outside catch block', () => {
      const ctx = createMockContext([{ content: 'const a = 1;\nconsole.log(a);' }]);
      const res = noConsoleLogsRule.check(ctx);
      expect(res.passed).toBe(false);
      expect(res.violations).toHaveLength(1);
      expect(res.violations[0].line).toBe(2);
    });

    it('ignores console.log inside catch block within 5 lines', () => {
      const ctx = createMockContext([{
        content: `try {
  doSomething();
} catch (err) {
  console.log(err);
}`
      }]);
      const res = noConsoleLogsRule.check(ctx);
      expect(res.passed).toBe(true);
      expect(res.violations).toHaveLength(0);
    });
  });

  describe('PRODUCTION_002 - No Hardcoded API URLs', () => {
    it('passes when relative or runtime config URLs are used', () => {
      const ctx = createMockContext([{ content: `const data = await $fetch('/api/users');` }]);
      const res = noHardcodedUrlsRule.check(ctx);
      expect(res.passed).toBe(true);
    });

    it('fails when absolute API URL is hardcoded in fetch', () => {
      const ctx = createMockContext([{ content: `const data = await $fetch('https://api.example.com/users');` }]);
      const res = noHardcodedUrlsRule.check(ctx);
      expect(res.passed).toBe(false);
      expect(res.violations).toHaveLength(1);
    });

    it('ignores common CDN URLs like google fonts or jsdelivr', () => {
      const ctx = createMockContext([{ content: `const css = await fetch('https://fonts.googleapis.com/css2?family=Roboto');` }]);
      const res = noHardcodedUrlsRule.check(ctx);
      expect(res.passed).toBe(true);
    });
  });

  describe('PRODUCTION_003 - Responsive Layout Present', () => {
    it('passes when Tailwind breakpoints or @media rules exist', () => {
      const ctx = createMockContext([{ content: `<template><div class="flex md:flex-row"></div></template>` }]);
      const res = responsiveLayoutPresentRule.check(ctx);
      expect(res.passed).toBe(true);
    });

    it('fails when zero responsive patterns exist in the project', () => {
      const ctx = createMockContext([{ content: `<template><div class="flex flex-col"></div></template>` }]);
      const res = responsiveLayoutPresentRule.check(ctx);
      expect(res.passed).toBe(false);
      expect(res.violations).toHaveLength(1);
    });
  });

  describe('PRODUCTION_004 - NuxtImage Optimization', () => {
    it('passes when NuxtImg or NuxtPicture is used', () => {
      const ctx = createMockContext([{ templateAst: `<NuxtImg src="/hero.jpg" alt="Hero" />` }]);
      const res = nuxtImageUsedRule.check(ctx);
      expect(res.passed).toBe(true);
    });

    it('fails when raw img tag is used without Nuxt image component in Nuxt project', () => {
      const ctx = createMockContext([{ templateAst: `<img src="/hero.jpg" alt="Hero" />` }], [], 'nuxt');
      const res = nuxtImageUsedRule.check(ctx);
      expect(res.passed).toBe(false);
      expect(res.violations).toHaveLength(1);
    });

    it('passes when raw img tag is used in non-Nuxt vue-spa project', () => {
      const ctx = createMockContext([{ templateAst: `<img src="/hero.jpg" alt="Hero" />` }], [], 'vue-spa');
      const res = nuxtImageUsedRule.check(ctx);
      expect(res.passed).toBe(true);
      expect(res.violations).toHaveLength(0);
    });
  });

  describe('PRODUCTION_005 - No Inline Styles', () => {
    it('passes when no static inline style attributes are present', () => {
      const ctx = createMockContext([{ templateAst: `<div class="p-4" :style="{ color: 'red' }"></div>` }]);
      const res = noInlineStylesRule.check(ctx);
      expect(res.passed).toBe(true);
    });

    it('fails when static inline style attribute style="..." is used', () => {
      const ctx = createMockContext([{ templateAst: `<div style="color: red; margin: 10px;"></div>` }]);
      const res = noInlineStylesRule.check(ctx);
      expect(res.passed).toBe(false);
      expect(res.violations).toHaveLength(1);
    });
  });

  describe('PRODUCTION_006 - Dark Mode Support', () => {
    it('passes when dark: classes or UColorModeButton is used', () => {
      const ctx = createMockContext([{ content: `<template><div class="bg-white dark:bg-black"><UColorModeButton /></div></template>` }]);
      const res = darkModeSupportRule.check(ctx);
      expect(res.passed).toBe(true);
    });

    it('fails when no dark mode patterns are found in the project', () => {
      const ctx = createMockContext([{ content: `<template><div class="bg-white">Hello</div></template>` }]);
      const res = darkModeSupportRule.check(ctx);
      expect(res.passed).toBe(false);
      expect(res.violations).toHaveLength(1);
    });
  });
});
