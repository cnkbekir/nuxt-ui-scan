import type { Rule } from '../types/rule.js';
import { uAppExistsRule } from './foundation/u-app-exists.js';
import { errorBoundaryRule } from './foundation/error-boundary.js';
import { uFormSchemaRule } from './forms/u-form-schema.js';
import { commandPaletteShortcutRule } from './interaction/command-palette-shortcut.js';
import { skeletonOnFetchRule } from './states/skeleton-on-fetch.js';
import { buttonAriaLabelRule } from './a11y/button-aria-label.js';

export const rules: Rule[] = [
  uAppExistsRule,
  errorBoundaryRule,
  uFormSchemaRule,
  commandPaletteShortcutRule,
  skeletonOnFetchRule,
  buttonAriaLabelRule,
];
