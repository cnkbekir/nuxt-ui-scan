import type { AuditContext } from '../../types/context.js';
import type { Rule, RuleResult, RuleViolation } from '../../types/rule.js';

export const skeletonOnFetchRule: Rule = {
  id: 'STATES_001',
  name: 'Skeleton Loading States',
  category: 'states',
  weight: 10,
  description: 'Checks files using useFetch / useAsyncData to see if pending or status is destructured, or <USkeleton> is referenced.',
  check: (ctx: AuditContext): RuleResult => {
    const violations: RuleViolation[] = [];

    for (const file of ctx.vueFiles) {
      const scriptContent = [file.scriptSetupContent, file.scriptContent].filter(Boolean).join('\n');
      
      if (!scriptContent.includes('useFetch') && !scriptContent.includes('useAsyncData')) {
        continue;
      }

      const hasLoadingState = scriptContent.includes('pending') || scriptContent.includes('status');
      const hasSkeletonTemplate = file.templateAst && (file.templateAst.includes('<USkeleton') || file.templateAst.includes('<u-skeleton'));

      if (!hasLoadingState && !hasSkeletonTemplate) {
        const lines = file.content.split('\n');
        const fetchLine = lines.findIndex(l => l.includes('useFetch') || l.includes('useAsyncData'));
        
        violations.push({
          filePath: file.filePath,
          line: fetchLine !== -1 ? fetchLine + 1 : undefined,
          evidence: fetchLine !== -1 ? lines[fetchLine].trim() : 'useFetch / useAsyncData used without loading state',
          fixSuggestion: 'Destructure `pending` or `status` from your fetch composable, and display a <USkeleton> while loading.'
        });
      }
    }

    return {
      ruleId: 'STATES_001',
      passed: violations.length === 0,
      confidence: 'medium',
      violations
    };
  }
};
