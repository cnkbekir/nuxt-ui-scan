import type { AuditContext, FrameworkType, ParsedFile } from '../types/context.js';
import { scanFiles } from './parser.js';

export async function createContext(
  root: string,
  frameworkOverride?: FrameworkType
): Promise<AuditContext> {
  const files = await scanFiles(root);

  const vueFiles = files.filter((f) => f.relativePath.endsWith('.vue'));
  const tsFiles = files.filter(
    (f) => f.relativePath.endsWith('.ts') && !f.relativePath.endsWith('.d.ts')
  );

  let framework: FrameworkType = frameworkOverride ?? 'unknown';

  if (!frameworkOverride || frameworkOverride === 'unknown') {
    const pkgFile = files.find((f) => f.relativePath === 'package.json');
    const hasNuxtConfig = files.some((f) =>
      /nuxt\.config\.(ts|js|mjs|cjs)$/i.test(f.relativePath)
    );

    let hasNuxtDep = false;
    let hasVueDep = false;

    if (pkgFile) {
      try {
        const pkg = JSON.parse(pkgFile.content);
        const deps = { ...pkg.dependencies, ...pkg.devDependencies };
        hasNuxtDep = Boolean(deps.nuxt || deps['@nuxt/kit'] || deps['@nuxt/module-builder']);
        hasVueDep = Boolean(deps.vue || deps['@nuxt/ui'] || deps['@nuxt/ui-vue']);
      } catch {
        // Fallback string matching if package.json fails to parse
        hasNuxtDep = pkgFile.content.includes('"nuxt"') || pkgFile.content.includes('"@nuxt/kit"');
        hasVueDep = pkgFile.content.includes('"vue"') || pkgFile.content.includes('"@nuxt/ui"');
      }
    }

    if (hasNuxtConfig || hasNuxtDep) {
      framework = 'nuxt';
    } else if (hasVueDep || vueFiles.length > 0) {
      framework = 'vue-spa';
    }
  }

  const isNuxt = framework === 'nuxt';

  return {
    root,
    files,
    vueFiles,
    tsFiles,
    framework,
    isNuxt,
    getFilesByPattern(pattern: string | RegExp): ParsedFile[] {
      if (typeof pattern === 'string') {
        return files.filter((f) => f.relativePath.includes(pattern));
      }
      return files.filter((f) => pattern.test(f.relativePath));
    },
  };
}
