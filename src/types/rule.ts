import type { AuditContext } from './context.js';

export type Category = 'foundation' | 'interaction' | 'states' | 'accessibility' | 'forms' | 'production';
export type Confidence = 'high' | 'medium' | 'low';

export interface RuleViolation {
  filePath: string;
  line?: number;
  column?: number;
  evidence: string;
  fixSuggestion: string;
}

export interface RuleResult {
  ruleId: string;
  passed: boolean;
  confidence: Confidence;
  violations: RuleViolation[];
}

export interface Rule {
  id: string;
  name: string;
  category: Category;
  weight: number;
  description: string;
  check: (ctx: AuditContext) => Promise<RuleResult> | RuleResult;
}
