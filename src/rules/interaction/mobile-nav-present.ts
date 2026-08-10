import type { AuditContext } from '../../types/context.js';
import type { Rule, RuleResult, RuleViolation } from '../../types/rule.js';

export const mobileNavPresentRule: Rule = {
  id: 'INTERACTION_003',
  name: 'Mobile Navigation Present',
  category: 'interaction',
  weight: 8,
  description: 'Checks for responsive mobile navigation using UDrawer, USlideover, or UNavigationMenu.',
  check: (ctx: AuditContext): RuleResult => {
    let navFilePath = '';
    let hasNav = false;

    for (const file of ctx.vueFiles) {
      const template = file.templateAst || file.content;
      if (
        template &&
        (template.includes('<nav') ||
          template.includes('UNavigationMenu') ||
          template.includes('u-navigation-menu'))
      ) {
        hasNav = true;
        navFilePath = file.filePath;
        break;
      }
    }

    if (!hasNav) {
      return {
        ruleId: 'INTERACTION_003',
        passed: true,
        confidence: 'medium',
        violations: []
      };
    }

    const mobilePatterns = [
      'UDrawer',
      'u-drawer',
      'USlideover',
      'u-slideover',
      'UDashboardNavbar',
      'u-dashboard-navbar'
    ];

    let hasMobileNav = false;
    for (const file of ctx.vueFiles) {
      const template = file.templateAst || file.content;
      if (template && mobilePatterns.some(pattern => template.includes(pattern))) {
        hasMobileNav = true;
        break;
      }
    }

    if (!hasMobileNav) {
      const violations: RuleViolation[] = [
        {
          filePath: navFilePath || ctx.vueFiles[0]?.filePath || 'app.vue',
          evidence: 'Project contains navigation components but lacks responsive mobile navigation patterns (UDrawer, USlideover, or UDashboardNavbar).',
          fixSuggestion: 'Implement responsive mobile navigation using UDrawer, USlideover, or UDashboardNavbar.'
        }
      ];

      return {
        ruleId: 'INTERACTION_003',
        passed: false,
        confidence: 'medium',
        violations
      };
    }

    return {
      ruleId: 'INTERACTION_003',
      passed: true,
      confidence: 'medium',
      violations: []
    };
  }
};
