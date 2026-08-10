import type { AuditContext } from '../../types/context.js';
import type { Rule, RuleResult, RuleViolation } from '../../types/rule.js';

export const responsiveLayoutPresentRule: Rule = {
  id: 'PRODUCTION_003',
  name: 'Responsive Layout Present',
  category: 'production',
  weight: 8,
  description: 'Checks for responsive design patterns in CSS classes or media queries.',
  check: (ctx: AuditContext): RuleResult => {
    const violations: RuleViolation[] = [];
    const responsivePatterns = ['sm:', 'md:', 'lg:', 'xl:', '2xl:', '@media', '@screen'];

    const hasResponsivePattern = ctx.vueFiles.some(file =>
      responsivePatterns.some(pattern => file.content.includes(pattern))
    );

    if (!hasResponsivePattern) {
      const targetPath = ctx.vueFiles[0]?.filePath ?? 'app.vue';
      violations.push({
        filePath: targetPath,
        evidence: 'No responsive design patterns (sm:, md:, lg:, xl:, 2xl:, @media, @screen) found in any Vue component.',
        fixSuggestion: 'Add responsive Tailwind breakpoint utility classes (e.g., md:flex, lg:grid) or media queries to ensure proper layout across screen sizes.'
      });
    }

    return {
      ruleId: 'PRODUCTION_003',
      passed: violations.length === 0,
      confidence: 'medium',
      violations
    };
  }
};
