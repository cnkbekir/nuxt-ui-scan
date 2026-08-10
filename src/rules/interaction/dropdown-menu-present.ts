import type { AuditContext } from '../../types/context.js';
import type { Rule, RuleResult, RuleViolation } from '../../types/rule.js';

export const dropdownMenuPresentRule: Rule = {
  id: 'INTERACTION_006',
  name: 'Dropdown Menu Present',
  category: 'interaction',
  weight: 5,
  description: 'Checks for UDropdownMenu or UContextMenu usage for action menus.',
  check: (ctx: AuditContext): RuleResult => {
    const dropdownPatterns = [
      'UDropdownMenu',
      'u-dropdown-menu',
      'UContextMenu',
      'u-context-menu'
    ];

    let hasDropdownMenu = false;

    for (const file of ctx.vueFiles) {
      const template = file.templateAst || file.content;
      if (template && dropdownPatterns.some(pattern => template.includes(pattern))) {
        hasDropdownMenu = true;
        break;
      }
    }

    if (!hasDropdownMenu) {
      const targetPath = ctx.vueFiles[0]?.filePath || 'app.vue';
      const violations: RuleViolation[] = [
        {
          filePath: targetPath,
          evidence: 'No UDropdownMenu or UContextMenu component found for action menus.',
          fixSuggestion: 'Use UDropdownMenu or UContextMenu to group action menus and clean up UI layouts.'
        }
      ];

      return {
        ruleId: 'INTERACTION_006',
        passed: false,
        confidence: 'low',
        violations
      };
    }

    return {
      ruleId: 'INTERACTION_006',
      passed: true,
      confidence: 'low',
      violations: []
    };
  }
};
