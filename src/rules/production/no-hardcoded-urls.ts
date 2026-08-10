import type { AuditContext } from '../../types/context.js';
import type { Rule, RuleResult, RuleViolation } from '../../types/rule.js';

const IGNORED_DOMAINS = [
  'fonts.googleapis',
  'fonts.gstatic',
  'cdn.jsdelivr',
  'unpkg.com',
  'cdnjs.cloudflare',
  'w3.org',
  'schema.org',
  'github.com',
  'raw.githubusercontent.com'
];

export const noHardcodedUrlsRule: Rule = {
  id: 'PRODUCTION_002',
  name: 'No Hardcoded API URLs',
  category: 'production',
  weight: 8,
  description: 'Checks for hardcoded API URLs instead of runtime config.',
  check: (ctx: AuditContext): RuleResult => {
    const violations: RuleViolation[] = [];
    const allFiles = [...ctx.vueFiles, ...ctx.tsFiles];
    const fetchRegex = /(?:fetch|\$fetch|useFetch|axios(?:\.(?:get|post|put|delete|patch|request))?)\s*\(\s*[`'"](https?:\/\/[^`'"]+)[`'"]/g;

    for (const file of allFiles) {
      const content = file.scriptContent || file.scriptSetupContent || file.content;
      if (!content) continue;

      let match: RegExpExecArray | null;
      while ((match = fetchRegex.exec(content)) !== null) {
        const url = match[1];
        const isIgnored = IGNORED_DOMAINS.some(domain => url.includes(domain));

        if (!isIgnored) {
          const lines = content.substring(0, match.index).split('\n');
          const line = lines.length;

          violations.push({
            filePath: file.filePath,
            line,
            evidence: match[0],
            fixSuggestion: 'Use useRuntimeConfig() or environment variables (.env) instead of hardcoding API URLs.'
          });
        }
      }
    }

    return {
      ruleId: 'PRODUCTION_002',
      passed: violations.length === 0,
      confidence: 'medium',
      violations
    };
  }
};
