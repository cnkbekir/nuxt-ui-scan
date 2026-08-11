import type { SFCDescriptor } from '@vue/compiler-sfc';

export interface ParsedFile {
  filePath: string;
  relativePath: string;
  content: string;
  descriptor?: SFCDescriptor;
  templateAst?: any;
  scriptContent?: string;
  scriptSetupContent?: string;
}

export type FrameworkType = 'nuxt' | 'vue-spa' | 'unknown';

export interface AuditContext {
  root: string;
  files: ParsedFile[];
  vueFiles: ParsedFile[];
  tsFiles: ParsedFile[];
  framework: FrameworkType;
  isNuxt: boolean;
  getFilesByPattern: (pattern: string | RegExp) => ParsedFile[];
}
