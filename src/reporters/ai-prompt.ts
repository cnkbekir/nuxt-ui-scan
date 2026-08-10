import type { AuditSummary } from '../types/result.js';
import type { Rule } from '../types/rule.js';

export function generateAIPrompt(summary: AuditSummary, rules: Rule[]): string {
  const lines: string[] = [];

  lines.push('# Nuxt UI Scan — AI Remediation Plan');
  lines.push('');
  lines.push(`**Project**: \`${summary.projectRoot}\``);
  lines.push(`**Score**: ${summary.totalScore}/100 (Grade ${summary.grade})`);
  lines.push(`**Generated**: ${summary.timestamp}`);
  lines.push('');
  lines.push('## Issues to Fix');
  lines.push('');

  const failedResults = summary.results.filter((r) => !r.passed);

  if (failedResults.length === 0) {
    lines.push('No issues found. All rules passed! ✅');
    return lines.join('\n');
  }

  for (const result of failedResults) {
    const rule = rules.find((r) => r.id === result.ruleId);
    lines.push(`### ${result.ruleId}: ${rule?.name ?? result.ruleId}`);
    lines.push('');
    lines.push(`> ${rule?.description ?? ''}`);
    lines.push('');
    lines.push('**Violations:**');
    lines.push('');

    for (const v of result.violations) {
      const loc = v.line ? `:${v.line}` : '';
      lines.push(`- **File**: \`${v.filePath}${loc}\``);
      lines.push(`  - **Issue**: ${v.evidence}`);
      lines.push(`  - **Fix**: ${v.fixSuggestion}`);
      lines.push('');
    }
  }

  lines.push('---');
  lines.push('');
  lines.push('## Instructions for AI Agent');
  lines.push('');
  lines.push('Please fix each issue listed above in order. For each fix:');
  lines.push('1. Open the file specified in the violation.');
  lines.push('2. Apply the suggested fix.');
  lines.push('3. Verify the fix does not break existing functionality.');
  lines.push('4. Run `npx nuxt-ui-scan` again to confirm the score improves.');
  lines.push('');

  return lines.join('\n');
}
