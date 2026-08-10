# nuxt-ui-scan 🔍

> **Deterministic UI/UX audit CLI tool for Nuxt UI & Vue projects.**  
> Inspired by [`TheOrcDev/shadscan`](https://github.com/TheOrcDev/shadscan).

[![npm version](https://img.shields.io/npm/v/nuxt-ui-scan.svg?color=green)](https://www.npmjs.com/package/nuxt-ui-scan)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-blue.svg)](https://nodejs.org)

`nuxt-ui-scan` performs static AST-based and structural audits on any codebase using **Nuxt UI** — including **Vue (Vite)** and **Nuxt** applications. It computes a normalized **0–100 UI/UX quality score** with letter grades (A–F) and can generate paste-ready **AI remediation plans** for AI Coding Agents (Claude, Cursor, Copilot).

---

## ✨ Features

- ⚡ **Deterministic Static Audits**: AST-level parsing (`@vue/compiler-sfc`) for `.vue` and `.ts` files.
- 🎯 **Nuxt UI Ecosystem Best Practices**: Audits foundation wrappers, error boundaries, form schemas, accessibility labels, and loading states.
- 📊 **Normalized 0–100 Scoring Math**: Category-weighted scoring math yielding clear grades (`A`, `B`, `C`, `D`, `F`).
- 🎨 **Beautiful Terminal UI**: Interactive prompts and visual progress bars powered by `@clack/prompts` and `picocolors`.
- 🤖 **AI Remediation Mode (`--prompt`)**: Generates structured Markdown prompts designed for AI coding assistants to automatically fix reported violations.
- ⚙️ **CI/CD Ready**: Machine-readable `--json` output and strict exit codes via `--fail-under <score>`.

---

## 🚀 Quick Start

Run directly without installation via `npx`:

```bash
npx nuxt-ui-scan
```

Or target a specific project directory:

```bash
npx nuxt-ui-scan /path/to/your/nuxt-project
```

### Installation

Install globally or as a dev dependency:

```bash
# npm
npm install -D nuxt-ui-scan

# pnpm
pnpm add -D nuxt-ui-scan

# yarn
yarn add -D nuxt-ui-scan
```

---

## 🛠️ CLI Usage & Flags

```text
Usage:
  $ nuxt-ui-scan [dir]

Options:
  --json                Output results as machine-readable JSON
  --prompt              Generate an AI remediation prompt (Markdown)
  --fail-under <score>  Exit with code 1 if score is below specified threshold
  -h, --help            Display help information
  -v, --version         Display version number
```

### Examples

#### Standard Console Audit
```bash
npx nuxt-ui-scan
```

#### Generate AI Remediation Plan
```bash
npx nuxt-ui-scan --prompt
```

#### CI/CD Pipeline Check
```bash
npx nuxt-ui-scan --fail-under 80
```

#### JSON Output for Custom Tooling
```bash
npx nuxt-ui-scan --json > audit-report.json
```

---

## 📋 Audit Rules

`nuxt-ui-scan` includes 39 deterministic static analysis rules across 6 core audit categories:

| Category | Rules | Description & Focus |
| :--- | :---: | :--- |
| **Foundation** | 7 | `<UApp>` wrapper presence, `error.vue` boundary, `@nuxt/ui` modules config, favicon, 404 custom page, meta tags, color mode. |
| **Forms** | 6 | `<UForm>` schema validation, form error handling, input type attributes, placeholder vs label usage, required indicators, submit button. |
| **Interaction** | 6 | `<UCommandPalette>` shortcuts, `<UNotifications>` toast feedback, responsive mobile navigation, breadcrumbs, modal confirmation actions, dropdown menus. |
| **States** | 6 | Skeleton loading states for `useFetch`, error handling states, empty data states, pending button loading indicators, success feedback, transition animations. |
| **Accessibility** | 8 | `<UButton>` aria-labels, `<img>`/`<NuxtImg>` alt attributes, form field explicit labeling, heading hierarchy (`h1`-`h6`), skip to content link, focus-visible styles, keyboard navigation handlers, `sr-only` utility text. |
| **Production** | 6 | Dark mode / color mode toggle support, `console.log` cleanliness check, hardcoded production URLs, inline style clean-up, `@nuxt/image` optimization, responsive layout utilities. |

---

## 💯 Scoring Algorithm

Categories are weighted out of 100 max points:

| Category | Max Normalized Points |
| :--- | :---: |
| **Foundation** | 20 |
| **Interaction** | 20 |
| **States** | 20 |
| **Accessibility** | 20 |
| **Forms** | 10 |
| **Production** | 10 |

### Letter Grades

- **90 – 100**: Grade **A**
- **80 – 89**: Grade **B**
- **70 – 79**: Grade **C**
- **60 – 69**: Grade **D**
- **< 60**: Grade **F**

---

## 💻 Programmatic API

You can also use `nuxt-ui-scan` programmatically in Node.js or build scripts:

```typescript
import { createContext, runAudit, calculateScore } from 'nuxt-ui-scan';

// Create audit context for a directory
const ctx = await createContext('/path/to/project');

// Run all built-in rules
const summary = await runAudit(ctx);

console.log(`Total Score: ${summary.totalScore}/100 (Grade ${summary.grade})`);
```

---

## 🧱 Development & Releasing

```bash
# Clone the repository
git clone https://github.com/cnkbekir/nuxt-ui-scan.git
cd nuxt-ui-scan

# Install dependencies
pnpm install

# Run build
pnpm build

# Run unit tests (Vitest)
pnpm test

# Test CLI locally
node bin/nuxt-ui-scan.js .
```

For release workflows and version management instructions, see [CONTRIBUTING.md](CONTRIBUTING.md).


---

## 🙏 Credits & Acknowledgements

This project was inspired by **[`TheOrcDev/shadscan`](https://github.com/TheOrcDev/shadscan)** — a UI/UX audit CLI tool for Shadcn UI and Next.js applications. `nuxt-ui-scan` adapts these audit concepts specifically for the **Nuxt UI & Vue** ecosystem.

---

## 📄 License

[MIT](LICENSE) © 2026 nuxt-ui-scan

