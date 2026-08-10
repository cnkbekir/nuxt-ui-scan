import type { AuditContext } from '../../types/context.js';
import type { Rule, RuleResult, RuleViolation } from '../../types/rule.js';

export const transitionAnimationsPresentRule: Rule = {
  id: 'STATES_006',
  name: 'Transition Animations Present',
  category: 'states',
  weight: 5,
  description: 'Checks for Vue transition components or CSS transition usage.',
  check: (ctx: AuditContext): RuleResult => {
    const violations: RuleViolation[] = [];

    for (const file of ctx.vueFiles) {
      const template = file.templateAst || '';

      const hasConditionalRendering =
        /\bv-(if|show)\b/.test(template) ||
        template.includes('<UModal') ||
        template.includes('<u-modal') ||
        template.includes('<USlideover') ||
        template.includes('<u-slideover') ||
        template.includes('<UDrawer') ||
        template.includes('<u-drawer');

      if (!hasConditionalRendering) {
        continue;
      }

      const fileContent = file.content;

      const hasVueTransition =
        /<(?:Transition|transition|TransitionGroup|transition-group)\b/.test(template) ||
        /\b:?transition=/.test(template);

      const hasCssTransition =
        /transition:\s*/.test(fileContent) ||
        /animation:\s*/.test(fileContent) ||
        /transition-property:\s*/.test(fileContent) ||
        /@keyframes\s+/.test(fileContent) ||
        /\btransition(-[a-z]+)?\b/.test(template);

      if (!hasVueTransition && !hasCssTransition) {
        const lines = fileContent.split('\n');
        const condLineIndex = lines.findIndex(l => l.includes('v-if') || l.includes('v-show') || l.includes('<UModal') || l.includes('<u-modal') || l.includes('<USlideover'));

        violations.push({
          filePath: file.filePath,
          line: condLineIndex !== -1 ? condLineIndex + 1 : undefined,
          evidence: condLineIndex !== -1 ? lines[condLineIndex].trim() : 'State toggles found without Vue transitions or CSS animation properties',
          fixSuggestion: 'Use `<Transition>` / `<TransitionGroup>` or CSS/Tailwind transitions (`transition-all`, etc.) for smooth UI state changes.'
        });
      }
    }

    return {
      ruleId: 'STATES_006',
      passed: violations.length === 0,
      confidence: 'low',
      violations
    };
  }
};
