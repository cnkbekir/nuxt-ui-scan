import type { AuditContext } from '../../types/context.js';
import type { Rule, RuleResult, RuleViolation } from '../../types/rule.js';

export const breadcrumbNavPresentRule: Rule = {
  id: 'INTERACTION_004',
  name: 'Breadcrumb Navigation',
  category: 'interaction',
  weight: 5,
  description: 'Checks for UBreadcrumb usage in projects with multiple pages.',
  check: (ctx: AuditContext): RuleResult => {
    const pageFiles = ctx.files.filter(f =>
      f.relativePath.startsWith('pages/') || f.relativePath.startsWith('src/pages/')
    );

    if (pageFiles.length < 3) {
      return {
        ruleId: 'INTERACTION_004',
        passed: true,
        confidence: 'low',
        violations: []
      };
    }

    let hasBreadcrumb = false;
    for (const file of ctx.vueFiles) {
      const template = file.templateAst || file.content;
      if (template && (template.includes('UBreadcrumb') || template.includes('u-breadcrumb'))) {
        hasBreadcrumb = true;
        break;
      }
    }

    if (!hasBreadcrumb) {
      const violations: RuleViolation[] = [
        {
          filePath: pageFiles[0]?.filePath || 'pages/',
          evidence: 'Project has multiple pages (3 or more) but UBreadcrumb component is not used.',
          fixSuggestion: 'Use UBreadcrumb component to improve navigation UX across multi-page layouts.'
        }
      ];

      return {
        ruleId: 'INTERACTION_004',
        passed: false,
        confidence: 'low',
        violations
      };
    }

    return {
      ruleId: 'INTERACTION_004',
      passed: true,
      confidence: 'low',
      violations: []
    };
  }
};
