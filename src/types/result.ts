import type { Category, RuleResult } from './rule.js';

export interface CategoryScore {
  category: Category;
  score: number;
  maxScore: number;
  normalizedScore: number;
  passedRules: number;
  totalRules: number;
}

export type Grade = 'A' | 'B' | 'C' | 'D' | 'F';

export interface AuditSummary {
  totalScore: number;
  grade: Grade;
  categoryScores: CategoryScore[];
  results: RuleResult[];
  projectRoot: string;
  filesScanned: number;
  timestamp: string;
}
