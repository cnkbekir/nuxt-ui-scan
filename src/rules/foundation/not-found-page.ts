import type { AuditContext } from '../../types/context.js';
import type { Rule, RuleResult } from '../../types/rule.js';

export const notFoundPageRule: Rule = {
  id: 'FOUNDATION_005',
  name: '404 Not Found Page',
  category: 'foundation',
  weight: 8,
  description: 'Checks for a catch-all route or proper 404 handling page.',
  check: (ctx: AuditContext): RuleResult => {
    const hasCatchAllRoute = ctx.vueFiles.some(f => {
      const rel = f.relativePath.replace(/\\/g, '/');
      return (
        /pages\/.*\[\.\.\..*\]\.vue$/i.test(rel) ||
        (rel.includes('pages/') && rel.includes('[...')) ||
        rel.toLowerCase().endsWith('notfound.vue') ||
        rel.toLowerCase().endsWith('404.vue')
      );
    });

    const hasRouterCatchAll = ctx.tsFiles.some(f =>
      f.content.includes('pathMatch') || f.content.includes('/:catchAll(.*)')
    );

    const errorFile = ctx.vueFiles.find(f => {
      const rel = f.relativePath.replace(/\\/g, '/').toLowerCase();
      return rel === 'error.vue' || rel === 'src/error.vue' || rel.endsWith('/error.vue');
    }) || ctx.files.find(f => {
      const rel = f.relativePath.replace(/\\/g, '/').toLowerCase();
      return rel === 'error.vue' || rel === 'src/error.vue' || rel.endsWith('/error.vue');
    });

    const hasErrorHandling404 = errorFile ? (
      errorFile.content.includes('404') || errorFile.content.includes('statusCode')
    ) : false;

    const passed = hasCatchAllRoute || hasRouterCatchAll || hasErrorHandling404;

    if (!passed) {
      return {
        ruleId: 'FOUNDATION_005',
        passed: false,
        confidence: 'high',
        violations: [
          {
            filePath: 'pages/[...slug].vue',
            evidence: 'No 404 page (e.g., NotFound.vue, pages/[...slug].vue, 404.vue) or catch-all route was found.',
            fixSuggestion: 'Create a catch-all route page (pages/[...slug].vue or NotFound.vue) or handle 404 errors.'
          }
        ]
      };
    }

    return {
      ruleId: 'FOUNDATION_005',
      passed: true,
      confidence: 'high',
      violations: []
    };
  }
};

