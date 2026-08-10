import fs from 'node:fs';
import path from 'node:path';
import fg from 'fast-glob';
import { parse as parseSFC } from '@vue/compiler-sfc';
import type { ParsedFile } from '../types/context.js';

export async function scanFiles(root: string): Promise<ParsedFile[]> {
  const patterns = ['**/*.vue', '**/*.ts'];
  const ignore = ['node_modules/**', '.nuxt/**', '.output/**', 'dist/**'];

  const filePaths = await fg(patterns, {
    cwd: root,
    absolute: false,
    ignore,
  });

  const files: ParsedFile[] = [];

  for (const relativePath of filePaths) {
    const filePath = path.resolve(root, relativePath);
    const content = fs.readFileSync(filePath, 'utf-8');
    const file: ParsedFile = { filePath, relativePath, content };

    if (relativePath.endsWith('.vue')) {
      try {
        const { descriptor } = parseSFC(content, { filename: relativePath });
        file.descriptor = descriptor;

        if (descriptor.template) {
          // Store template source for regex-based checks
          file.templateAst = descriptor.template.content;
        }

        if (descriptor.script) {
          file.scriptContent = descriptor.script.content;
        }

        if (descriptor.scriptSetup) {
          file.scriptSetupContent = descriptor.scriptSetup.content;
        }
      } catch {
        // Skip files that fail to parse
      }
    }

    files.push(file);
  }

  return files;
}
