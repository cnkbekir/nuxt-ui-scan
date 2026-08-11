import { cac } from 'cac';
import path from 'node:path';
import * as p from '@clack/prompts';
import pc from 'picocolors';
import { createContext } from './core/context.js';
import { runAudit } from './core/runner.js';
import { rules } from './rules/index.js';
import { reportConsole } from './reporters/console.js';
import { reportJSON } from './reporters/json.js';
import { generateAIPrompt } from './reporters/ai-prompt.js';

import fs from 'node:fs';
import type { FrameworkType } from './types/context.js';

interface ScanConfig {
  framework?: FrameworkType;
  ignoreRules?: string[];
}

function loadConfig(projectDir: string): ScanConfig {
  const configPaths = ['.scanrc.json', 'nuxt-ui-scan.config.json'];
  for (const configFile of configPaths) {
    const fullPath = path.join(projectDir, configFile);
    if (fs.existsSync(fullPath)) {
      try {
        const content = fs.readFileSync(fullPath, 'utf-8');
        return JSON.parse(content);
      } catch {
        // Ignore parse error
      }
    }
  }
  return {};
}

const cli = cac('nuxt-ui-scan');

cli
  .command('[dir]', 'Audit a Nuxt UI & Vue project for UI/UX best practices')
  .option('--json', 'Output results as JSON')
  .option('--prompt', 'Generate an AI remediation prompt')
  .option('--fail-under <score>', 'Exit with code 1 if score is below threshold', { type: [Number] })
  .option('--framework <type>', 'Specify target framework: nuxt or vue-spa')
  .option('--ignore <rules>', 'Comma-separated list of rule IDs to ignore (e.g. PRODUCTION_004,FOUNDATION_002)')
  .action(async (dir: string | undefined, options: {
    json?: boolean;
    prompt?: boolean;
    failUnder?: number[];
    framework?: string;
    ignore?: string;
  }) => {
    const projectDir = path.resolve(dir ?? '.');
    const failUnder = options.failUnder?.[0];
    const config = loadConfig(projectDir);

    const frameworkOption = (options.framework as FrameworkType) || config.framework;
    let ignoreRules: string[] = config.ignoreRules ?? [];
    if (options.ignore) {
      const cliIgnores = String(options.ignore).split(',').map((s) => s.trim()).filter(Boolean);
      ignoreRules = Array.from(new Set([...ignoreRules, ...cliIgnores]));
    }

    if (!options.json) {
      p.intro(pc.bgCyan(pc.black(' nuxt-ui-scan ')));
      const s = p.spinner();
      s.start('Scanning project...');

      try {
        const ctx = await createContext(projectDir, frameworkOption);
        s.message(`Detected framework: ${ctx.framework}`);
        const summary = await runAudit(ctx, { ignoreRules });
        s.stop(`Scan complete! (${ctx.framework} mode)`);

        if (options.prompt) {
          const prompt = generateAIPrompt(summary, rules);
          console.log(prompt);
        } else {
          reportConsole(summary, rules);
        }

        if (failUnder !== undefined && summary.totalScore < failUnder) {
          p.log.error(
            pc.red(`Score ${summary.totalScore} is below threshold ${failUnder}`)
          );
          process.exit(1);
        }
      } catch (error) {
        s.stop('Scan failed!');
        p.log.error(pc.red(String(error)));
        process.exit(1);
      }
    } else {
      // JSON mode — no interactive UI
      try {
        const ctx = await createContext(projectDir, frameworkOption);
        const summary = await runAudit(ctx, { ignoreRules });
        console.log(reportJSON(summary));

        if (failUnder !== undefined && summary.totalScore < failUnder) {
          process.exit(1);
        }
      } catch (error) {
        console.error(JSON.stringify({ error: String(error) }));
        process.exit(1);
      }
    }
  });

cli.help();
cli.version('0.2.0');
cli.parse();
