import type { AuditContext } from '../../types/context.js';
import type { Rule, RuleResult, RuleViolation } from '../../types/rule.js';

export const successFeedbackPresentRule: Rule = {
  id: 'STATES_005',
  name: 'Success Feedback Present',
  category: 'states',
  weight: 5,
  description: 'Checks for success feedback patterns after operations.',
  check: (ctx: AuditContext): RuleResult => {
    const violations: RuleViolation[] = [];

    for (const file of ctx.vueFiles) {
      const scriptContent = [file.scriptSetupContent, file.scriptContent].filter(Boolean).join('\n');

      const hasAsyncOps = /\b(\$fetch|useFetch|useAsyncData|async|await|handleSubmit|onSubmit)\b/.test(scriptContent);
      if (!hasAsyncOps) {
        continue;
      }

      const template = file.templateAst || '';

      const hasToast = scriptContent.includes('useToast') || scriptContent.includes('toast.add') || scriptContent.includes('toast.success');
      const hasAlert = template.includes('<UAlert') || template.includes('<u-alert');
      const hasSuccessPattern = hasToast || hasAlert || /\b(success|submitted|isSuccess|successMessage)\b/i.test(scriptContent);

      if (!hasSuccessPattern) {
        const lines = file.content.split('\n');
        const asyncLineIndex = lines.findIndex(l =>
          l.includes('$fetch') || l.includes('useFetch') || l.includes('useAsyncData') || l.includes('async') || l.includes('handleSubmit') || l.includes('onSubmit')
        );

        violations.push({
          filePath: file.filePath,
          line: asyncLineIndex !== -1 ? asyncLineIndex + 1 : undefined,
          evidence: asyncLineIndex !== -1 ? lines[asyncLineIndex].trim() : 'Async operation found without success feedback notification/alert',
          fixSuggestion: 'Provide feedback after successful operations using `useToast()` (`toast.add(...)`) or a success `<UAlert>`.'
        });
      }
    }

    return {
      ruleId: 'STATES_005',
      passed: violations.length === 0,
      confidence: 'low',
      violations
    };
  }
};
