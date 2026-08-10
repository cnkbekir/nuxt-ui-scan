import type { AuditContext } from '../types/context.js';
import type { Rule, RuleResult, Category } from '../types/rule.js';
import type { AuditSummary, CategoryScore, Grade } from '../types/result.js';

const CATEGORY_MAX_WEIGHTS: Record<Category, number> = {
  foundation: 20,
  interaction: 20,
  states: 20,
  accessibility: 20,
  forms: 10,
  production: 10,
};

export function calculateScore(
  results: RuleResult[],
  rules: Rule[],
  ctx: AuditContext
): AuditSummary {
  const categories = Object.keys(CATEGORY_MAX_WEIGHTS) as Category[];
  const categoryScores: CategoryScore[] = [];

  for (const category of categories) {
    const categoryRules = rules.filter((r) => r.category === category);
    const categoryResults = results.filter((r) =>
      categoryRules.some((rule) => rule.id === r.ruleId)
    );

    if (categoryRules.length === 0) {
      // No rules for this category — award full marks
      categoryScores.push({
        category,
        score: CATEGORY_MAX_WEIGHTS[category],
        maxScore: CATEGORY_MAX_WEIGHTS[category],
        normalizedScore: CATEGORY_MAX_WEIGHTS[category],
        passedRules: 0,
        totalRules: 0,
      });
      continue;
    }

    const totalWeight = categoryRules.reduce((sum, r) => sum + r.weight, 0);
    let earnedWeight = 0;
    let passedCount = 0;

    for (const result of categoryResults) {
      if (result.passed) {
        const rule = categoryRules.find((r) => r.id === result.ruleId);
        if (rule) {
          earnedWeight += rule.weight;
          passedCount++;
        }
      }
    }

    const rawScore = totalWeight > 0 ? earnedWeight / totalWeight : 1;
    const normalizedScore = rawScore * CATEGORY_MAX_WEIGHTS[category];

    categoryScores.push({
      category,
      score: earnedWeight,
      maxScore: totalWeight,
      normalizedScore: Math.round(normalizedScore * 100) / 100,
      passedRules: passedCount,
      totalRules: categoryRules.length,
    });
  }

  const totalScore = Math.round(
    categoryScores.reduce((sum, cs) => sum + cs.normalizedScore, 0)
  );

  return {
    totalScore,
    grade: getGrade(totalScore),
    categoryScores,
    results,
    projectRoot: ctx.root,
    filesScanned: ctx.files.length,
    timestamp: new Date().toISOString(),
  };
}

export function getGrade(score: number): Grade {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}
