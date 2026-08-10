import type { AuditContext } from '../../types/context.js';
import type { Rule, RuleResult, RuleViolation } from '../../types/rule.js';

export const uFormSchemaRule: Rule = {
  id: 'FORMS_001',
  name: 'UForm Schema Validation',
  category: 'forms',
  weight: 10,
  description: 'Inspects template content for <UForm> usages, verifies that each has :schema or schema prop bound.',
  check: (ctx: AuditContext): RuleResult => {
    const violations: RuleViolation[] = [];
    
    for (const file of ctx.vueFiles) {
      if (!file.templateAst) continue;
      
      const formRegex = /<(?:UForm|u-form)([^>]*)>/g;
      let match;
      
      while ((match = formRegex.exec(file.templateAst)) !== null) {
        const attributes = match[1];
        if (!attributes.includes('schema=') && !attributes.includes(':schema=')) {
          const lines = file.templateAst.substring(0, match.index).split('\n');
          const line = lines.length;
          
          violations.push({
            filePath: file.filePath,
            line,
            evidence: match[0],
            fixSuggestion: 'Add a :schema prop to <UForm> to validate form data.'
          });
        }
      }
    }

    return {
      ruleId: 'FORMS_001',
      passed: violations.length === 0,
      confidence: 'high',
      violations
    };
  }
};
