import { describe, it, expect } from 'vitest';
import type { AuditContext } from '../src/types/context.js';
import { toastFeedbackPresentRule } from '../src/rules/interaction/toast-feedback-present.js';
import { mobileNavPresentRule } from '../src/rules/interaction/mobile-nav-present.js';
import { breadcrumbNavPresentRule } from '../src/rules/interaction/breadcrumb-nav-present.js';
import { modalConfirmationRule } from '../src/rules/interaction/modal-confirmation.js';
import { dropdownMenuPresentRule } from '../src/rules/interaction/dropdown-menu-present.js';

describe('INTERACTION_002 - Toast Feedback Present', () => {
  it('passes when useToast is used in script setup', () => {
    const ctx: AuditContext = {
      root: '/test',
      files: [],
      vueFiles: [
        {
          filePath: '/test/app.vue',
          relativePath: 'app.vue',
          content: '<script setup>const toast = useToast()</script>',
          scriptSetupContent: 'const toast = useToast()'
        }
      ],
      tsFiles: [],
      getFilesByPattern: () => []
    };

    const result = toastFeedbackPresentRule.check(ctx);
    expect(result.passed).toBe(true);
    expect(result.confidence).toBe('medium');
    expect(result.violations).toHaveLength(0);
  });

  it('fails when useToast is not used anywhere', () => {
    const ctx: AuditContext = {
      root: '/test',
      files: [],
      vueFiles: [
        {
          filePath: '/test/app.vue',
          relativePath: 'app.vue',
          content: '<template><div>Hello</div></template>'
        }
      ],
      tsFiles: [],
      getFilesByPattern: () => []
    };

    const result = toastFeedbackPresentRule.check(ctx);
    expect(result.passed).toBe(false);
    expect(result.confidence).toBe('medium');
    expect(result.violations).toHaveLength(1);
    expect(result.violations[0].filePath).toBe('/test/app.vue');
  });
});

describe('INTERACTION_003 - Mobile Navigation Present', () => {
  it('passes when project has no navigation', () => {
    const ctx: AuditContext = {
      root: '/test',
      files: [],
      vueFiles: [
        {
          filePath: '/test/app.vue',
          relativePath: 'app.vue',
          content: '<template><div>No nav</div></template>',
          templateAst: '<div>No nav</div>'
        }
      ],
      tsFiles: [],
      getFilesByPattern: () => []
    };

    const result = mobileNavPresentRule.check(ctx);
    expect(result.passed).toBe(true);
    expect(result.confidence).toBe('medium');
    expect(result.violations).toHaveLength(0);
  });

  it('passes when project has nav and UDrawer / USlideover / UDashboardNavbar', () => {
    const ctx: AuditContext = {
      root: '/test',
      files: [],
      vueFiles: [
        {
          filePath: '/test/app.vue',
          relativePath: 'app.vue',
          content: '<template><nav><UDrawer /></nav></template>',
          templateAst: '<nav><UDrawer /></nav>'
        }
      ],
      tsFiles: [],
      getFilesByPattern: () => []
    };

    const result = mobileNavPresentRule.check(ctx);
    expect(result.passed).toBe(true);
    expect(result.confidence).toBe('medium');
  });

  it('fails when project has nav but no mobile responsive navigation component', () => {
    const ctx: AuditContext = {
      root: '/test',
      files: [],
      vueFiles: [
        {
          filePath: '/test/nav.vue',
          relativePath: 'nav.vue',
          content: '<template><nav><ul><li>Link</li></ul></nav></template>',
          templateAst: '<nav><ul><li>Link</li></ul></nav>'
        }
      ],
      tsFiles: [],
      getFilesByPattern: () => []
    };

    const result = mobileNavPresentRule.check(ctx);
    expect(result.passed).toBe(false);
    expect(result.confidence).toBe('medium');
    expect(result.violations).toHaveLength(1);
    expect(result.violations[0].filePath).toBe('/test/nav.vue');
  });
});

describe('INTERACTION_004 - Breadcrumb Navigation', () => {
  it('passes when project has fewer than 3 pages', () => {
    const ctx: AuditContext = {
      root: '/test',
      files: [
        { filePath: '/test/pages/index.vue', relativePath: 'pages/index.vue', content: '' },
        { filePath: '/test/pages/about.vue', relativePath: 'pages/about.vue', content: '' }
      ],
      vueFiles: [
        { filePath: '/test/pages/index.vue', relativePath: 'pages/index.vue', content: '' },
        { filePath: '/test/pages/about.vue', relativePath: 'pages/about.vue', content: '' }
      ],
      tsFiles: [],
      getFilesByPattern: () => []
    };

    const result = breadcrumbNavPresentRule.check(ctx);
    expect(result.passed).toBe(true);
    expect(result.confidence).toBe('low');
    expect(result.violations).toHaveLength(0);
  });

  it('passes when project has >= 3 pages and uses UBreadcrumb', () => {
    const ctx: AuditContext = {
      root: '/test',
      files: [
        { filePath: '/test/pages/index.vue', relativePath: 'pages/index.vue', content: '' },
        { filePath: '/test/pages/about.vue', relativePath: 'pages/about.vue', content: '' },
        { filePath: '/test/pages/contact.vue', relativePath: 'pages/contact.vue', content: '' }
      ],
      vueFiles: [
        {
          filePath: '/test/pages/index.vue',
          relativePath: 'pages/index.vue',
          content: '<template><UBreadcrumb :items="items" /></template>',
          templateAst: '<UBreadcrumb :items="items" />'
        }
      ],
      tsFiles: [],
      getFilesByPattern: () => []
    };

    const result = breadcrumbNavPresentRule.check(ctx);
    expect(result.passed).toBe(true);
    expect(result.confidence).toBe('low');
  });

  it('fails when project has >= 3 pages but does not use UBreadcrumb or u-breadcrumb', () => {
    const ctx: AuditContext = {
      root: '/test',
      files: [
        { filePath: '/test/pages/index.vue', relativePath: 'pages/index.vue', content: '' },
        { filePath: '/test/pages/about.vue', relativePath: 'pages/about.vue', content: '' },
        { filePath: '/test/pages/contact.vue', relativePath: 'pages/contact.vue', content: '' }
      ],
      vueFiles: [
        { filePath: '/test/pages/index.vue', relativePath: 'pages/index.vue', content: '<div>No breadcrumb</div>' }
      ],
      tsFiles: [],
      getFilesByPattern: () => []
    };

    const result = breadcrumbNavPresentRule.check(ctx);
    expect(result.passed).toBe(false);
    expect(result.confidence).toBe('low');
    expect(result.violations).toHaveLength(1);
  });
});

describe('INTERACTION_005 - Modal Confirmation Pattern', () => {
  it('passes when project has no destructive actions', () => {
    const ctx: AuditContext = {
      root: '/test',
      files: [],
      vueFiles: [
        {
          filePath: '/test/app.vue',
          relativePath: 'app.vue',
          content: '<script setup>const title = "hello"</script>',
          scriptSetupContent: 'const title = "hello"'
        }
      ],
      tsFiles: [],
      getFilesByPattern: () => []
    };

    const result = modalConfirmationRule.check(ctx);
    expect(result.passed).toBe(true);
    expect(result.confidence).toBe('medium');
  });

  it('passes when project has destructive actions and UModal or UAlertDialog', () => {
    const ctx: AuditContext = {
      root: '/test',
      files: [],
      vueFiles: [
        {
          filePath: '/test/app.vue',
          relativePath: 'app.vue',
          content: '<template><UModal v-model="isOpen" /></template><script setup>function deleteUser() {}</script>',
          templateAst: '<UModal v-model="isOpen" />',
          scriptSetupContent: 'function deleteUser() {}'
        }
      ],
      tsFiles: [],
      getFilesByPattern: () => []
    };

    const result = modalConfirmationRule.check(ctx);
    expect(result.passed).toBe(true);
    expect(result.confidence).toBe('medium');
  });

  it('fails when project has delete/remove action but lacks UModal / UAlertDialog', () => {
    const ctx: AuditContext = {
      root: '/test',
      files: [],
      vueFiles: [
        {
          filePath: '/test/users.vue',
          relativePath: 'users.vue',
          content: '<script setup>function removeItem(id) {}</script>',
          scriptSetupContent: 'function removeItem(id) {}'
        }
      ],
      tsFiles: [],
      getFilesByPattern: () => []
    };

    const result = modalConfirmationRule.check(ctx);
    expect(result.passed).toBe(false);
    expect(result.confidence).toBe('medium');
    expect(result.violations).toHaveLength(1);
    expect(result.violations[0].filePath).toBe('/test/users.vue');
  });
});

describe('INTERACTION_006 - Dropdown Menu Present', () => {
  it('passes when UDropdownMenu or UContextMenu is used', () => {
    const ctx: AuditContext = {
      root: '/test',
      files: [],
      vueFiles: [
        {
          filePath: '/test/app.vue',
          relativePath: 'app.vue',
          content: '<template><UDropdownMenu :items="items" /></template>',
          templateAst: '<UDropdownMenu :items="items" />'
        }
      ],
      tsFiles: [],
      getFilesByPattern: () => []
    };

    const result = dropdownMenuPresentRule.check(ctx);
    expect(result.passed).toBe(true);
    expect(result.confidence).toBe('low');
  });

  it('fails when no UDropdownMenu or UContextMenu is found', () => {
    const ctx: AuditContext = {
      root: '/test',
      files: [],
      vueFiles: [
        {
          filePath: '/test/app.vue',
          relativePath: 'app.vue',
          content: '<template><div>No dropdown</div></template>',
          templateAst: '<div>No dropdown</div>'
        }
      ],
      tsFiles: [],
      getFilesByPattern: () => []
    };

    const result = dropdownMenuPresentRule.check(ctx);
    expect(result.passed).toBe(false);
    expect(result.confidence).toBe('low');
    expect(result.violations).toHaveLength(1);
  });
});
