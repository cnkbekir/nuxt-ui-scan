import type { AuditContext, ParsedFile } from '../types/context.js';
import { scanFiles } from './parser.js';

export async function createContext(root: string): Promise<AuditContext> {
  const files = await scanFiles(root);

  const vueFiles = files.filter((f) => f.relativePath.endsWith('.vue'));
  const tsFiles = files.filter(
    (f) => f.relativePath.endsWith('.ts') && !f.relativePath.endsWith('.d.ts')
  );

  return {
    root,
    files,
    vueFiles,
    tsFiles,
    getFilesByPattern(pattern: string | RegExp): ParsedFile[] {
      if (typeof pattern === 'string') {
        return files.filter((f) => f.relativePath.includes(pattern));
      }
      return files.filter((f) => pattern.test(f.relativePath));
    },
  };
}
