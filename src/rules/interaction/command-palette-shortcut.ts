import type { AuditContext } from '../../types/context.js';
import type { Rule, RuleResult } from '../../types/rule.js';

export const commandPaletteShortcutRule: Rule = {
  id: 'INTERACTION_001',
  name: 'Command Palette Keyboard Shortcut',
  category: 'interaction',
  weight: 10,
  description: 'Checks if <UCommandPalette> is used AND defineShortcuts with meta_k or control_k exists somewhere.',
  check: (ctx: AuditContext): RuleResult => {
    let usesCommandPalette = false;
    let paletteFilePath = '';

    for (const file of ctx.vueFiles) {
      if (file.templateAst && (file.templateAst.includes('<UCommandPalette') || file.templateAst.includes('<u-command-palette'))) {
        usesCommandPalette = true;
        paletteFilePath = file.filePath;
        break;
      }
    }

    if (!usesCommandPalette) {
      return {
        ruleId: 'INTERACTION_001',
        passed: true,
        confidence: 'high',
        violations: []
      };
    }

    let hasShortcut = false;
    for (const file of ctx.vueFiles.concat(ctx.tsFiles)) {
      const content = file.scriptContent || file.scriptSetupContent || file.content;
      if (content && content.includes('defineShortcuts') && (content.includes('meta_k') || content.includes('control_k'))) {
        hasShortcut = true;
        break;
      }
    }

    if (!hasShortcut) {
      return {
        ruleId: 'INTERACTION_001',
        passed: false,
        confidence: 'high',
        violations: [
          {
            filePath: paletteFilePath,
            evidence: 'Command palette is used, but no global shortcut (meta_k or control_k) is defined.',
            fixSuggestion: 'Use defineShortcuts({ meta_k: ... }) to provide a quick way to open the command palette.'
          }
        ]
      };
    }

    return {
      ruleId: 'INTERACTION_001',
      passed: true,
      confidence: 'high',
      violations: []
    };
  }
};
