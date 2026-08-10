import type { AuditContext } from '../../types/context.js';
import type { Rule, RuleResult } from '../../types/rule.js';

export const faviconPresentRule: Rule = {
  id: 'FOUNDATION_004',
  name: 'Favicon Present',
  category: 'foundation',
  weight: 5,
  description: 'Checks for a favicon in public directory or useHead configuration.',
  check: (ctx: AuditContext): RuleResult => {
    const faviconFileFound = ctx.files.some(f => {
      const rel = f.relativePath.replace(/\\/g, '/').toLowerCase();
      return (
        rel === 'public/favicon.ico' ||
        rel === 'public/favicon.svg' ||
        rel === 'public/favicon.png' ||
        rel.startsWith('public/favicon.')
      );
    });

    const faviconInUseHead = ctx.vueFiles.some(f => {
      const content = f.content;
      if (!content.includes('useHead')) return false;
      const lower = content.toLowerCase();
      return lower.includes('link') && (lower.includes('icon') || lower.includes('favicon'));
    });

    const faviconInTs = ctx.tsFiles.some(f => {
      const content = f.content;
      if (!content.includes('useHead') && !content.includes('head:')) return false;
      const lower = content.toLowerCase();
      return lower.includes('link') && (lower.includes('icon') || lower.includes('favicon'));
    });

    const passed = faviconFileFound || faviconInUseHead || faviconInTs;

    if (!passed) {
      return {
        ruleId: 'FOUNDATION_004',
        passed: false,
        confidence: 'high',
        violations: [
          {
            filePath: 'public/favicon.ico',
            evidence: 'No favicon file (ico/svg/png) found in public/ directory and no favicon configured via useHead/head.',
            fixSuggestion: 'Add a favicon file (favicon.ico, favicon.svg, or favicon.png) to the public/ directory, or define a favicon link using useHead().'
          }
        ]
      };
    }

    return {
      ruleId: 'FOUNDATION_004',
      passed: true,
      confidence: 'high',
      violations: []
    };
  }
};
