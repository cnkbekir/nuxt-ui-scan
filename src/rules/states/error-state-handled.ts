import type { AuditContext } from '../../types/context.js';
import type { Rule, RuleResult, RuleViolation } from '../../types/rule.js';

export const errorStateHandledRule: Rule = {
  id: 'STATES_002',
  name: 'Error State Handled',
  category: 'states',
  weight: 10,
  description: 'Checks that files using useFetch/useAsyncData handle error states.',
  check: (ctx: AuditContext): RuleResult => {
    const violations: RuleViolation[] = [];

    for (const file of ctx.vueFiles) {
      const scriptContent = [file.scriptSetupContent, file.scriptContent].filter(Boolean).join('\n');

      if (!scriptContent.includes('useFetch') && !scriptContent.includes('useAsyncData')) {
        continue;
      }

      const destructureRegex = /(const|let|var)\s*\{[\s\S]*?\berror\b[\s\S]*?\}\s*=\s*(await\s+)?(useFetch|useAsyncData)/;
      const isErrorDestructured = destructureRegex.test(scriptContent);

      const template = file.templateAst || '';
      const hasTemplateErrorPattern =
        /v-(if|else-if)=["'][^"']*\berror\b[^"']*["']/.test(template) ||
        template.includes('<UAlert') ||
        template.includes('<u-alert') ||
        template.includes('<NuxtErrorBoundary') ||
        template.includes('<nuxt-error-boundary');

      if (!isErrorDestructured && !hasTemplateErrorPattern) {
        const lines = file.content.split('\n');
        const fetchLineIndex = lines.findIndex(l => l.includes('useFetch') || l.includes('useAsyncData'));

        violations.push({
          filePath: file.filePath,
          line: fetchLineIndex !== -1 ? fetchLineIndex + 1 : undefined,
          evidence: fetchLineIndex !== -1 ? lines[fetchLineIndex].trim() : 'useFetch / useAsyncData used without handling error state',
          fixSuggestion: 'Destructure `error` from `useFetch`/`useAsyncData` and handle it in the template using `<UAlert>` or `<NuxtErrorBoundary>`.'
        });
      }
    }

    return {
      ruleId: 'STATES_002',
      passed: violations.length === 0,
      confidence: 'high',
      violations
    };
  }
};
