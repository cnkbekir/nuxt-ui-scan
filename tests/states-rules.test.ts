import { describe, it, expect } from 'vitest';
import type { AuditContext } from '../src/types/context.js';
import { errorStateHandledRule } from '../src/rules/states/error-state-handled.js';
import { emptyStatePresentRule } from '../src/rules/states/empty-state-present.js';
import { pendingUiFeedbackRule } from '../src/rules/states/pending-ui-feedback.js';
import { successFeedbackPresentRule } from '../src/rules/states/success-feedback-present.js';
import { transitionAnimationsPresentRule } from '../src/rules/states/transition-animations-present.js';

describe('STATES_002 - Error State Handled', () => {
  it('passes when error is destructured from useFetch', () => {
    const ctx: AuditContext = {
      root: '/test',
      files: [],
      vueFiles: [
        {
          filePath: '/test/data.vue',
          relativePath: 'data.vue',
          content: '<script setup>\nconst { data, error } = useFetch("/api/items")\n</script>',
          scriptSetupContent: 'const { data, error } = useFetch("/api/items")'
        }
      ],
      tsFiles: [],
      getFilesByPattern: () => []
    };

    const result = errorStateHandledRule.check(ctx);
    expect(result.passed).toBe(true);
    expect(result.confidence).toBe('high');
    expect(result.violations).toHaveLength(0);
  });

  it('passes when template contains UAlert for error handling', () => {
    const ctx: AuditContext = {
      root: '/test',
      files: [],
      vueFiles: [
        {
          filePath: '/test/data.vue',
          relativePath: 'data.vue',
          content: '<template><UAlert title="Error" /></template><script setup>const res = useFetch("/api/items")</script>',
          templateAst: '<UAlert title="Error" />',
          scriptSetupContent: 'const res = useFetch("/api/items")'
        }
      ],
      tsFiles: [],
      getFilesByPattern: () => []
    };

    const result = errorStateHandledRule.check(ctx);
    expect(result.passed).toBe(true);
  });

  it('fails when useFetch is used without destructuring error or having template error patterns', () => {
    const ctx: AuditContext = {
      root: '/test',
      files: [],
      vueFiles: [
        {
          filePath: '/test/data.vue',
          relativePath: 'data.vue',
          content: '<script setup>\nconst { data } = useFetch("/api/items")\n</script>',
          scriptSetupContent: 'const { data } = useFetch("/api/items")',
          templateAst: '<div>{{ data }}</div>'
        }
      ],
      tsFiles: [],
      getFilesByPattern: () => []
    };

    const result = errorStateHandledRule.check(ctx);
    expect(result.passed).toBe(false);
    expect(result.confidence).toBe('high');
    expect(result.violations).toHaveLength(1);
    expect(result.violations[0].filePath).toBe('/test/data.vue');
  });
});

describe('STATES_003 - Empty State Present', () => {
  it('passes when v-for is accompanied by .length check', () => {
    const ctx: AuditContext = {
      root: '/test',
      files: [],
      vueFiles: [
        {
          filePath: '/test/list.vue',
          relativePath: 'list.vue',
          content: '<template><div v-if="items.length"><div v-for="i in items">{{ i }}</div></div></template>',
          templateAst: '<div v-if="items.length"><div v-for="i in items">{{ i }}</div></div>'
        }
      ],
      tsFiles: [],
      getFilesByPattern: () => []
    };

    const result = emptyStatePresentRule.check(ctx);
    expect(result.passed).toBe(true);
    expect(result.confidence).toBe('medium');
  });

  it('fails when v-for is used without an empty state pattern', () => {
    const ctx: AuditContext = {
      root: '/test',
      files: [],
      vueFiles: [
        {
          filePath: '/test/list.vue',
          relativePath: 'list.vue',
          content: '<template><div><div v-for="i in items">{{ i }}</div></div></template>',
          templateAst: '<div><div v-for="i in items">{{ i }}</div></div>'
        }
      ],
      tsFiles: [],
      getFilesByPattern: () => []
    };

    const result = emptyStatePresentRule.check(ctx);
    expect(result.passed).toBe(false);
    expect(result.confidence).toBe('medium');
    expect(result.violations).toHaveLength(1);
  });
});

describe('STATES_004 - Pending UI Feedback', () => {
  it('passes when UButton uses :loading prop alongside async operations', () => {
    const ctx: AuditContext = {
      root: '/test',
      files: [],
      vueFiles: [
        {
          filePath: '/test/form.vue',
          relativePath: 'form.vue',
          content: '<template><UButton :loading="pending" /></template><script setup>const { pending } = useFetch("/api")</script>',
          templateAst: '<UButton :loading="pending" />',
          scriptSetupContent: 'const { pending } = useFetch("/api")'
        }
      ],
      tsFiles: [],
      getFilesByPattern: () => []
    };

    const result = pendingUiFeedbackRule.check(ctx);
    expect(result.passed).toBe(true);
    expect(result.confidence).toBe('medium');
  });

  it('fails when component has async operations and UButton but no :loading prop', () => {
    const ctx: AuditContext = {
      root: '/test',
      files: [],
      vueFiles: [
        {
          filePath: '/test/form.vue',
          relativePath: 'form.vue',
          content: '<template><UButton label="Submit" /></template><script setup>async function submit() { await $fetch("/api") }</script>',
          templateAst: '<UButton label="Submit" />',
          scriptSetupContent: 'async function submit() { await $fetch("/api") }'
        }
      ],
      tsFiles: [],
      getFilesByPattern: () => []
    };

    const result = pendingUiFeedbackRule.check(ctx);
    expect(result.passed).toBe(false);
    expect(result.confidence).toBe('medium');
    expect(result.violations).toHaveLength(1);
  });
});

describe('STATES_005 - Success Feedback Present', () => {
  it('passes when useToast is used in async operation component', () => {
    const ctx: AuditContext = {
      root: '/test',
      files: [],
      vueFiles: [
        {
          filePath: '/test/action.vue',
          relativePath: 'action.vue',
          content: '<script setup>const toast = useToast(); async function doFetch() { await $fetch("/api"); toast.add({ title: "Done" }); }</script>',
          scriptSetupContent: 'const toast = useToast(); async function doFetch() { await $fetch("/api"); toast.add({ title: "Done" }); }',
          templateAst: '<button @click="doFetch">Click</button>'
        }
      ],
      tsFiles: [],
      getFilesByPattern: () => []
    };

    const result = successFeedbackPresentRule.check(ctx);
    expect(result.passed).toBe(true);
    expect(result.confidence).toBe('low');
  });

  it('fails when async operation has no success feedback mechanism', () => {
    const ctx: AuditContext = {
      root: '/test',
      files: [],
      vueFiles: [
        {
          filePath: '/test/action.vue',
          relativePath: 'action.vue',
          content: '<script setup>async function saveData() { await $fetch("/api/save") }</script>',
          scriptSetupContent: 'async function saveData() { await $fetch("/api/save") }',
          templateAst: '<button @click="saveData">Save</button>'
        }
      ],
      tsFiles: [],
      getFilesByPattern: () => []
    };

    const result = successFeedbackPresentRule.check(ctx);
    expect(result.passed).toBe(false);
    expect(result.confidence).toBe('low');
    expect(result.violations).toHaveLength(1);
  });
});

describe('STATES_006 - Transition Animations Present', () => {
  it('passes when v-if is present and Vue Transition component is used', () => {
    const ctx: AuditContext = {
      root: '/test',
      files: [],
      vueFiles: [
        {
          filePath: '/test/modal.vue',
          relativePath: 'modal.vue',
          content: '<template><Transition><div v-if="open">Content</div></Transition></template>',
          templateAst: '<Transition><div v-if="open">Content</div></Transition>'
        }
      ],
      tsFiles: [],
      getFilesByPattern: () => []
    };

    const result = transitionAnimationsPresentRule.check(ctx);
    expect(result.passed).toBe(true);
    expect(result.confidence).toBe('low');
  });

  it('fails when v-if is used without any transition component or CSS transition', () => {
    const ctx: AuditContext = {
      root: '/test',
      files: [],
      vueFiles: [
        {
          filePath: '/test/modal.vue',
          relativePath: 'modal.vue',
          content: '<template><div v-if="open">Content</div></template>',
          templateAst: '<div v-if="open">Content</div>'
        }
      ],
      tsFiles: [],
      getFilesByPattern: () => []
    };

    const result = transitionAnimationsPresentRule.check(ctx);
    expect(result.passed).toBe(false);
    expect(result.confidence).toBe('low');
    expect(result.violations).toHaveLength(1);
  });
});
