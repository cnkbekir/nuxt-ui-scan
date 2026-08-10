# Contributing to nuxt-ui-scan

Thank you for your interest in contributing to `nuxt-ui-scan`! We welcome contributions of all kinds, including bug fixes, new audit rules, documentation improvements, and feature requests.

---

## 🛠️ Development Setup

1. **Fork and Clone the Repository**
   ```bash
   git clone https://github.com/cnkbekir/nuxt-ui-scan.git
   cd nuxt-ui-scan
   ```

2. **Install Dependencies**
   We use [`pnpm`](https://pnpm.io/) as our package manager.
   ```bash
   pnpm install
   ```

3. **Build the Project**
   ```bash
   pnpm build
   ```

4. **Run Unit Tests**
   ```bash
   pnpm test
   ```

---

## 📐 Adding a New Audit Rule

`nuxt-ui-scan` uses deterministic AST parsing (`@vue/compiler-sfc`) and file-level static checks to evaluate Nuxt UI & Vue projects.

### Step-by-Step Guide:

1. **Create the Rule File**: Add your rule in the appropriate category under `src/rules/`:
   - `src/rules/foundation/`
   - `src/rules/forms/`
   - `src/rules/interaction/`
   - `src/rules/states/`
   - `src/rules/a11y/`
   - `src/rules/production/`

2. **Implement the `Rule` Interface**:
   ```typescript
   import type { Rule, RuleResult } from '../../types/rule.js';
   import type { AuditContext } from '../../types/context.js';

   export const myNewRule: Rule = {
     id: 'CATEGORY_00X',
     name: 'Human Readable Name',
     category: 'Foundation', // 'Foundation' | 'Forms' | 'Interaction' | 'States' | 'Accessibility' | 'Production'
     description: 'Short description of what this rule verifies.',
     weight: 10,
     check(ctx: AuditContext): RuleResult {
       // Perform AST or string check on ctx.files or ctx.vueFiles
       const passed = true; // your logic here

       return {
         ruleId: 'CATEGORY_00X',
         name: 'Human Readable Name',
         category: 'Foundation',
         passed,
         score: passed ? 10 : 0,
         maxScore: 10,
         weight: 10,
         evidence: passed ? 'Check succeeded.' : 'Missing required component/pattern.',
         fixSuggestion: 'How the developer can fix this issue.',
       };
     },
   };
   ```

3. **Register the Rule**: Export and add your rule to `src/rules/index.ts`.

4. **Add Unit Tests**: Write unit tests in `tests/` covering both passing and failing scenarios using `vitest`.

---

## 🧪 Testing Guidelines

- Run all unit tests before submitting a Pull Request:
  ```bash
  pnpm test
  ```
- Ensure CLI execution works locally:
  ```bash
  node bin/nuxt-ui-scan.js .
  ```

---

## 📜 Commit Messages & Pull Requests

- Keep commit messages concise and descriptive.
- Ensure your branch is up-to-date with `main`.
- Open a Pull Request on GitHub with a summary of changes and reference any related issues.

Thank you for helping build a better UI/UX audit tool for the Nuxt ecosystem! 🚀
