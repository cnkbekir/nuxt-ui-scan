import type { AuditContext } from '../../types/context.js';
import type { Rule, RuleResult, RuleViolation } from '../../types/rule.js';

export const placeholderNotLabelRule: Rule = {
  id: 'FORMS_006',
  name: 'Placeholder Not Used As Label',
  category: 'forms',
  weight: 8,
  description: 'Checks that input components with placeholder also have proper labels.',
  check: (ctx: AuditContext): RuleResult => {
    const violations: RuleViolation[] = [];

    for (const file of ctx.vueFiles) {
      if (!file.templateAst) continue;

      const inputRegex = /<(?:UInput|u-input|UTextarea|u-textarea)([^>]*)>/g;
      let match: RegExpExecArray | null;

      while ((match = inputRegex.exec(file.templateAst)) !== null) {
        const attributes = match[1];

        const hasPlaceholder = attributes.includes('placeholder=') || attributes.includes(':placeholder=') || attributes.includes('v-bind:placeholder=');
        if (!hasPlaceholder) continue;

        const hasOwnLabel = attributes.includes('label=') || attributes.includes(':label=') || attributes.includes('v-bind:label=');

        const enclosingFormFieldAttrs = getEnclosingFormFieldAttributes(file.templateAst, match.index);
        const hasParentLabel = enclosingFormFieldAttrs !== null && (
          enclosingFormFieldAttrs.includes('label=') ||
          enclosingFormFieldAttrs.includes(':label=') ||
          enclosingFormFieldAttrs.includes('v-bind:label=')
        );

        if (!hasOwnLabel && !hasParentLabel) {
          const lines = file.templateAst.substring(0, match.index).split('\n');
          const line = lines.length;

          violations.push({
            filePath: file.filePath,
            line,
            evidence: match[0],
            fixSuggestion: 'Do not use placeholder as a replacement for a label. Add a label attribute or wrap the input in a <UFormField label="...">.'
          });
        }
      }
    }

    return {
      ruleId: 'FORMS_006',
      passed: violations.length === 0,
      confidence: 'high',
      violations
    };
  }
};

function getEnclosingFormFieldAttributes(template: string, matchIndex: number): string | null {
  const beforeText = template.substring(0, matchIndex);
  const tagRegex = /<\/?(?:UFormField|u-form-field)([^>]*)>/gi;
  let match: RegExpExecArray | null;
  const stack: string[] = [];

  while ((match = tagRegex.exec(beforeText)) !== null) {
    const fullTag = match[0];
    const isClosing = fullTag.startsWith('</');
    const isSelfClosing = fullTag.endsWith('/>') || match[1].trim().endsWith('/');

    if (isClosing) {
      stack.pop();
    } else if (!isSelfClosing) {
      stack.push(match[1]);
    }
  }

  return stack.length > 0 ? stack[stack.length - 1] : null;
}
