import type { AuditContext } from '../../types/context.js';
import type { Rule, RuleResult, RuleViolation } from '../../types/rule.js';

export const imageAltPresentRule: Rule = {
  id: 'A11Y_002',
  name: 'Image Alt Text',
  category: 'accessibility',
  weight: 10,
  description: 'Checks that img, NuxtImg, NuxtPicture, and UAvatar elements have alt attributes.',
  check: (ctx: AuditContext): RuleResult => {
    const violations: RuleViolation[] = [];

    for (const file of ctx.vueFiles) {
      if (!file.templateAst) continue;

      const imageRegex = /<(?:img|NuxtImg|nuxt-img|NuxtPicture|nuxt-picture|UAvatar|u-avatar)\b([^>]*)>/g;
      let match: RegExpExecArray | null;

      while ((match = imageRegex.exec(file.templateAst)) !== null) {
        const attributes = match[1];

        const hasAlt = attributes.includes('alt=') || attributes.includes(':alt=') || /\b:?alt\b/.test(attributes);

        if (!hasAlt) {
          const lines = file.templateAst.substring(0, match.index).split('\n');
          const line = lines.length;

          violations.push({
            filePath: file.filePath,
            line,
            evidence: match[0],
            fixSuggestion: 'Add an alt attribute (e.g. alt="description" or alt="" for decorative images) to the image component for accessibility.'
          });
        }
      }
    }

    return {
      ruleId: 'A11Y_002',
      passed: violations.length === 0,
      confidence: 'high',
      violations
    };
  }
};
