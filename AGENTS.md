# Developer & Agent Guidelines for nuxt-ui-scan

This document outlines architectural decisions, design patterns, testing strategies, and release workflows for AI assistants and developers contributing to `nuxt-ui-scan`.

---

## 🏗️ Architecture & Project Structure

- **`src/cli.ts`**: Command-line entry point (`cac` parser, `@clack/prompts` UI, `.scanrc.json` config loader).
- **`src/core/context.ts`**: Scans workspace files and performs **framework auto-detection** (`nuxt` vs `vue-spa`).
- **`src/core/runner.ts`**: Runs active audit rules, filters out framework-incompatible rules and ignored rule IDs.
- **`src/core/scoring.ts`**: Normalizes scores across 6 categories (Foundation, Forms, Interaction, States, Accessibility, Production).
- **`src/rules/`**: Deterministic static audit rules categorized by focus area.
- **`src/reporters/`**: Console, JSON, and AI remediation prompt generators.

---

## ⚙️ Framework Auto-Detection & Rule Filtering

`nuxt-ui-scan` supports both **Nuxt 3 applications** and **Vue 3 / Vite Single Page Applications (SPAs)** using `@nuxt/ui`:

1. **Detection Logic**:
   - Checks `package.json` for `nuxt`, `@nuxt/kit`, `@nuxt/module-builder` dependencies or presence of `nuxt.config.*`.
   - If not found, defaults to `vue-spa` if `vue` or `@nuxt/ui` dependencies exist.
2. **Framework-Specific Rules**:
   - Rules can specify `framework: 'nuxt'` or `framework: 'vue-spa'` in their `Rule` interface.
   - Nuxt-only rules (e.g. `PRODUCTION_004` for `<NuxtImg>` and `FOUNDATION_002` for `error.vue`) automatically adapt or skip on `vue-spa` projects to avoid false positives.

---

## 🛠️ Configuration & CLI Options

- `--framework <nuxt|vue-spa>`: Overrides automatic framework detection.
- `--ignore <ruleIds>`: Ignores specific rules by comma-separated IDs (e.g. `--ignore PRODUCTION_004,FOUNDATION_002`).
- `.scanrc.json` or `nuxt-ui-scan.config.json`: Allows persistent configuration in project root:
  ```json
  {
    "framework": "vue-spa",
    "ignoreRules": ["PRODUCTION_004", "FOUNDATION_002"]
  }
  ```

---

## 🚀 Releasing & CI/CD Workflows

Releases are published to NPM via GitHub Actions OIDC Trusted Publishing ([`.github/workflows/publish.yml`](.github/workflows/publish.yml)).

### Key Trusted Publisher Requirements:
1. **Node & NPM Version**: Uses Node.js `22.x` and installs `npm@11` (`npm install -g npm@11`) for native OIDC token handshake support.
2. **Registry Configuration**: `registry-url: 'https://registry.npmjs.org'` must be set in `actions/setup-node@v4`.
3. **No Auth Token Secret**: `NODE_AUTH_TOKEN` secret MUST NOT be passed when using Trusted Publisher OIDC.
4. **Permissions**: Job permissions must include `id-token: write` and `contents: read`.
5. **Publish Command**: Uses `npm publish --provenance --access public`.

---

## 🧪 Testing

All rules and core utilities must have corresponding Vitest unit tests in `tests/`:
```bash
pnpm test
pnpm build
```
