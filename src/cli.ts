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

const cli = cac('nuxt-ui-scan');

cli
  .command('[dir]', 'Audit a Nuxt UI & Vue project for UI/UX best practices')
  .option('--json', 'Output results as JSON')
  .option('--prompt', 'Generate an AI remediation prompt')
  .option('--fail-under <score>', 'Exit with code 1 if score is below threshold', { type: [Number] })
  .action(async (dir: string | undefined, options: { json?: boolean; prompt?: boolean; failUnder?: number[] }) => {
    const projectDir = path.resolve(dir ?? '.');
    const failUnder = options.failUnder?.[0];

    if (!options.json) {
      p.intro(pc.bgCyan(pc.black(' nuxt-ui-scan ')));
      const s = p.spinner();
      s.start('Scanning project...');

      try {
        const ctx = await createContext(projectDir);
        const summary = await runAudit(ctx);
        s.stop('Scan complete!');

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
        const ctx = await createContext(projectDir);
        const summary = await runAudit(ctx);
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
cli.version('0.1.0');
cli.parse();
