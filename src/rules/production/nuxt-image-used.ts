import type { AuditContext } from '../../types/context.js';
import type { Rule, RuleResult, RuleViolation } from '../../types/rule.js';

export const nuxtImageUsedRule: Rule = {
  id: 'PRODUCTION_004',
  name: 'NuxtImage Optimization',
  category: 'production',
  weight: 5,
  description: 'Checks that NuxtImg/NuxtPicture are used instead of raw img tags for optimization.',
  check: (ctx: AuditContext): RuleResult => {
    const violations: RuleViolation[] = [];

    for (const file of ctx.vueFiles) {
      if (!file.templateAst) continue;

      const hasNuxtImageComponent =
        file.templateAst.includes('<NuxtImg') ||
        file.templateAst.includes('<nuxt-img') ||
        file.templateAst.includes('<NuxtPicture') ||
        file.templateAst.includes('<nuxt-picture');

      if (!hasNuxtImageComponent) {
        const rawImgRegex = /<img[\s/>]/g;
        let match: RegExpExecArray | null;

        while ((match = rawImgRegex.exec(file.templateAst)) !== null) {
          const lines = file.templateAst.substring(0, match.index).split('\n');
          const line = lines.length;
          const endIdx = file.templateAst.indexOf('>', match.index);
          const evidence = endIdx !== -1 ? file.templateAst.substring(match.index, endIdx + 1) : match[0];

          violations.push({
            filePath: file.filePath,
            line,
            evidence,
            fixSuggestion: 'Use <NuxtImg> or <NuxtPicture> instead of raw HTML <img> tags for automatic image optimization.'
          });
        }
      }
    }

    return {
      ruleId: 'PRODUCTION_004',
      passed: violations.length === 0,
      confidence: 'medium',
      violations
    };
  }
};
