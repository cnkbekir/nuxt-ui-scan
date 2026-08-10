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

export interface AuditContext {
  root: string;
  files: ParsedFile[];
  vueFiles: ParsedFile[];
  tsFiles: ParsedFile[];
  getFilesByPattern: (pattern: string | RegExp) => ParsedFile[];
}
