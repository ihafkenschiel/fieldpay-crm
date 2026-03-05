# Development Guide

## Quality Gates

This project uses multiple quality gates to catch issues before runtime:

### 1. TypeScript Type Checking

```bash
# Check all TypeScript files
npm run typecheck
```

**What it catches:**
- Type errors (like the ListItem Container issue)
- Missing imports
- Invalid prop types
- Incorrect function signatures

### 2. ESLint

```bash
# Lint all files
npm run lint

# Auto-fix issues
npm run lint:fix
```

**What it catches:**
- Code style violations
- React hooks rules violations
- Unused variables
- Potential bugs (e.g., missing dependencies in useEffect)

### 3. Unit Tests

```bash
# Run all tests
npm test

# Watch mode for development
npm test:watch

# Coverage report
npm test:coverage
```

**What it catches:**
- Business logic errors
- Component rendering issues
- API contract violations

### 4. Pre-commit Hooks

Automatically runs on `git commit`:
- TypeScript type checking
- ESLint with auto-fix
- Staged files only (fast)

**To bypass** (not recommended):
```bash
git commit --no-verify
```

## Recommended Development Workflow

### Before Starting Work

```bash
# Install dependencies
npm install

# Verify everything works
npm run validate
```

### During Development

1. **Make changes** to code
2. **Run type check** frequently:
   ```bash
   npm run typecheck
   ```
3. **Fix linting issues**:
   ```bash
   npm run lint:fix
   ```
4. **Write tests** for new features
5. **Run tests**:
   ```bash
   npm test
   ```

### Before Committing

```bash
# Run full validation
npm run validate
```

This runs:
- TypeScript type checking
- ESLint
- All tests

**Pre-commit hooks will automatically run** when you commit, but running `validate` manually catches issues earlier.

### CI/CD Integration (Future)

For production deployments, add these checks to CI:

```yaml
# .github/workflows/ci.yml
- name: Validate
  run: npm run validate

- name: Build
  run: npm run build:packages && npm run build:server
```

## Why These Tools Matter

### Real Example: ListItem Component

**Without tooling:**
- TypeScript error not caught until runtime
- Metro bundler returns 404
- White screen in browser
- Debugging takes 10+ minutes

**With tooling:**
```bash
$ npm run typecheck
packages/ui/src/components/ListItem.tsx(22,6): error TS2604: 
JSX element type 'Container' does not have any construct or call signatures.
```

**Result:** Issue caught in 2 seconds, before even running the app.

## Coverage Requirements

Current thresholds (jest.config.js):
- Branches: 70%
- Functions: 70%
- Lines: 70%
- Statements: 70%

These can be increased as the codebase matures.

## Editor Integration

### VS Code

Install extensions:
- ESLint
- TypeScript and JavaScript Language Features

Add to `.vscode/settings.json`:
```json
{
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

### Other Editors

Configure your editor to:
1. Use the workspace TypeScript version
2. Run ESLint on save
3. Show type errors inline
