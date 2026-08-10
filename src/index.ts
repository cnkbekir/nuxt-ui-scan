export type { Rule, RuleResult, RuleViolation, Category, Confidence } from './types/rule.js';
export type { AuditSummary, CategoryScore, Grade } from './types/result.js';
export type { AuditContext, ParsedFile } from './types/context.js';
export { createContext } from './core/context.js';
export { runAudit } from './core/runner.js';
export { calculateScore } from './core/scoring.js';
export { rules } from './rules/index.js';
