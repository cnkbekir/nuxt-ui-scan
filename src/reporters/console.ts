import * as p from '@clack/prompts';
import pc from 'picocolors';
import type { AuditSummary } from '../types/result.js';
import type { Rule } from '../types/rule.js';

export function reportConsole(summary: AuditSummary, rules: Rule[]): void {
  // Print summary stats
  p.log.info(`📁 Project: ${pc.dim(summary.projectRoot)}`);
  p.log.info(`📄 Files scanned: ${pc.bold(String(summary.filesScanned))}`);
  p.log.info('');

  // Print category breakdown
  p.log.step(pc.bold('Category Scores:'));
  for (const cs of summary.categoryScores) {
    const label = cs.category.charAt(0).toUpperCase() + cs.category.slice(1);
    const pct = cs.totalRules > 0
      ? Math.round((cs.normalizedScore / maxWeight(cs.category)) * 100)
      : 100;
    const bar = renderBar(pct);
    const color = pct >= 80 ? pc.green : pct >= 60 ? pc.yellow : pc.red;
    p.log.info(`  ${label.padEnd(15)} ${bar} ${color(`${cs.normalizedScore}/${maxWeight(cs.category)}`)} (${cs.passedRules}/${cs.totalRules} rules)`);
  }

  p.log.info('');

  // Print violations
  const failedResults = summary.results.filter((r) => !r.passed);
  if (failedResults.length > 0) {
    p.log.step(pc.bold(pc.red(`⚠ ${failedResults.length} rule(s) failed:`)));
    for (const result of failedResults) {
      const rule = rules.find((r) => r.id === result.ruleId);
      p.log.warn(`  ${pc.red('✗')} ${pc.bold(result.ruleId)}: ${rule?.name ?? result.ruleId}`);
      for (const v of result.violations) {
        const loc = v.line ? `:${v.line}` : '';
        p.log.info(`    ${pc.dim(`${v.filePath}${loc}`)} — ${v.evidence}`);
        p.log.info(`    ${pc.cyan('→')} ${v.fixSuggestion}`);
      }
    }
  } else {
    p.log.success(pc.green('All rules passed! 🎉'));
  }

  p.log.info('');

  // Print overall score and grade
  const gradeColor = summary.grade === 'A' ? pc.green
    : summary.grade === 'B' ? pc.cyan
    : summary.grade === 'C' ? pc.yellow
    : pc.red;

  p.outro(
    `Score: ${pc.bold(String(summary.totalScore))}/100 — Grade: ${gradeColor(pc.bold(summary.grade))}`
  );
}

function maxWeight(category: string): number {
  const weights: Record<string, number> = {
    foundation: 20, interaction: 20, states: 20,
    accessibility: 20, forms: 10, production: 10,
  };
  return weights[category] ?? 10;
}

function renderBar(pct: number): string {
  const total = 20;
  const filled = Math.round((pct / 100) * total);
  const empty = total - filled;
  return `${'█'.repeat(filled)}${'░'.repeat(empty)}`;
}
