# Cypress Test Organization

This directory contains E2E tests organized by priority and purpose.

## Directory Structure

```
cypress/e2e/
├── critical/          # Business-critical tests (must pass)
│   ├── item-create.cy.js
│   ├── item-read.cy.js
│   ├── item-update.cy.js
│   └── form-validation.cy.js
└── regression/        # Full regression suite
    └── ui-tests.cy.js
```

## Test Categories

### Critical Tests (`critical/`)
**Purpose**: Fast feedback on business-critical functionality

These tests cover the core CRUD operations that must work for the application to function:
- **CREATE**: Creating new items (11 tests)
- **READ**: Viewing and fetching items (9 tests)
- **UPDATE**: Editing existing items (8 tests)
- **DELETE**: Removing items (8 tests)
- **Form Validation**: Data integrity validation (6 tests)

**Total**: 34 critical tests

**When to run**: 
- On every push/PR
- Before deployments
- In CI/CD pipeline (first job)

### Regression Tests (`regression/`)
**Purpose**: Comprehensive test coverage including edge cases and UI/UX

These tests cover:
- UI/UX functionality
- Integration workflows
- Edge cases and error handling
- Button interactions
- Message handling

**Total**: 9 regression tests

**When to run**:
- After critical tests pass
- Full regression runs
- Nightly builds
- Pre-release validation

## CI/CD Strategy

### Two-Stage Execution

1. **Stage 1: Critical Tests** (Fast Feedback)
   - Runs first and must pass
   - Small, focused test suite
   - Fast execution (~30-40 seconds)
   - Blocks deployment if failed

2. **Stage 2: Full Regression** (Comprehensive)
   - Runs only after critical tests pass
   - Includes all tests (critical + regression)
   - Can run in parallel (3 containers)
   - Provides comprehensive coverage

### Benefits

✅ **Fast Feedback**: Know immediately if critical functionality is broken
✅ **Efficient CI**: Don't waste time on full suite if basics are broken
✅ **Parallel Execution**: Regression suite runs in parallel for speed
✅ **Cost Effective**: Critical tests run on single machine, regression uses parallelization

## Running Tests Locally

### Run Critical Tests Only
```bash
npx cypress run --spec "cypress/e2e/critical/**/*.cy.js"
```

### Run Regression Tests Only
```bash
npx cypress run --spec "cypress/e2e/regression/**/*.cy.js"
```

### Run All Tests
```bash
npx cypress run --spec "cypress/e2e/**/*.cy.js"
```

### Open Cypress UI
```bash
npx cypress open
```

## Adding New Tests

### When to add to `critical/`:
- Core business functionality
- User-facing features that block workflows
- Payment/checkout flows
- Authentication/authorization
- Data integrity validations

### When to add to `regression/`:
- UI/UX enhancements
- Edge cases
- Performance tests
- Accessibility tests
- Integration scenarios

## GitHub Actions Workflow

The workflow (`.github/workflows/cypress.yml`) implements:

1. **critical-tests job**: Runs critical tests first
2. **full-regression job**: Runs after critical passes, uses parallelization

See the workflow file for detailed configuration.

