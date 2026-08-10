import type { AuditContext } from '../../types/context.js';
import type { Rule, RuleResult, RuleViolation } from '../../types/rule.js';

export const pendingUiFeedbackRule: Rule = {
  id: 'STATES_004',
  name: 'Pending UI Feedback',
  category: 'states',
  weight: 8,
  description: 'Checks that UButton components use :loading prop for async operations.',
  check: (ctx: AuditContext): RuleResult => {
    const violations: RuleViolation[] = [];

    for (const file of ctx.vueFiles) {
      const template = file.templateAst || '';

      const hasButton = template.includes('<UButton') || template.includes('<u-button');
      if (!hasButton) {
        continue;
      }

      const scriptContent = [file.scriptSetupContent, file.scriptContent].filter(Boolean).join('\n');
      const hasAsyncOperations = /\b(useFetch|useAsyncData|\$fetch|async|await)\b/.test(scriptContent);

      if (!hasAsyncOperations) {
        continue;
      }

      const buttonRegex = /<(?:UButton|u-button)([^>]*)>/g;
      let match;
      let hasLoadingProp = false;

      while ((match = buttonRegex.exec(template)) !== null) {
        const attributes = match[1];
        if (attributes.includes(':loading=') || attributes.includes(' loading=') || attributes.includes(' :loading ') || /\b:?loading\b/.test(attributes)) {
          hasLoadingProp = true;
          break;
        }
      }

      if (!hasLoadingProp) {
        const lines = file.content.split('\n');
        const buttonLineIndex = lines.findIndex(l => l.includes('<UButton') || l.includes('<u-button'));

        violations.push({
          filePath: file.filePath,
          line: buttonLineIndex !== -1 ? buttonLineIndex + 1 : undefined,
          evidence: buttonLineIndex !== -1 ? lines[buttonLineIndex].trim() : '<UButton> component used without :loading prop during async operations',
          fixSuggestion: 'Bind `:loading` prop on `<UButton>` (e.g. `:loading="pending"` or `:loading="loading"`) to signal background async operations.'
        });
      }
    }

    return {
      ruleId: 'STATES_004',
      passed: violations.length === 0,
      confidence: 'medium',
      violations
    };
  }
};
