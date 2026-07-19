# QA Automation Framework — DemoBlaze

The End-to-End automation framework built with **Playwright and TypeScript** for validating the DemoBlaze](https://www.demoblaze.com) application. A few highlights:

- **API Strategy** — every test drives the real UI, while a lightweight API layer handles setup and teardown (register users, seed and clear carts) so tests stay fast, focused, and reliable instead of brittle preconditions.
- **Worker-isolated test data** — each parallel worker provisions its own unique account, so runs never collide and results stay deterministic.
- **Cross-browser and parallel** — the same suite runs across Chromium and other engines and fans out over multiple workers, cutting wall-clock time without sacrificing stability.
- **Configurable and no code changes** — target URL, browser, worker count, tag filters, and reporting are all driven by CLI parameters and environment variables.
- **Comprehensive reporting** — interactive Allure reports both locally and published to GitHub Pages outputs for CI.
- **CI/CD** — a single parameterized GitHub Actions workflow with three trigger-based flows (build gate on push/PR, on-demand smoke, scheduled/on-demand regression, each with a published Allure report).

# 1. Framework Structure and Rationale

## Framework Structure

```text
qa-automation-demoblaze/
├── src/
│   ├── api/
│   │   └── controllers/                       # API calls for fast setup/teardown
│   │       ├── account.controller.ts          # Register / login users via API
│   │       ├── cart.controller.ts             # Add / clear cart items via API
│   │       ├── product.controller.ts          # Fetch product data via API
│   │       └── index.ts                       # Barrel export + shared API client
│   │
│   ├── common/
│   │   ├── config/
│   │   │   ├── envManager.ts                  # Reads env vars (BASE_URL, API_URL, flags)
│   │   │   └── timeoutConfig.ts               # Framework-specific dialog / wait timings
│   │   ├── data/
│   │   │   ├── accounts.json                  # Account per browser / worker
│   │   │   └── products.json                  # Product test data
│   │   └── models/
│   │       ├── user.model.ts                  # User domain type
│   │       ├── product.model.ts               # Product domain type
│   │       └── order.model.ts                 # Purchase order domain type
│   │
│   ├── fixtures/
│   │   └── test.fixture.ts                    # Test setup, Page Objects, worker credentials, API helper
│   │
│   └── ui/
│       ├── pages/
│       │   ├── base.page.ts                   # Shared page behavior (navigation, common actions)
│       │   ├── home/
│       │   │   ├── home.elements.ts           # Home page selectors
│       │   │   └── home.page.ts               # Home page interactions
│       │   ├── login/
│       │   │   ├── login.elements.ts          # Login modal selectors
│       │   │   └── login.page.ts              # Login interactions
│       │   ├── product/
│       │   │   ├── product.elements.ts        # Product page selectors
│       │   │   └── product.page.ts            # Product interactions (add to cart)
│       │   └── cart/
│       │       ├── cart.elements.ts           # Cart & checkout selectors
│       │       └── cart.page.ts               # Cart / checkout interactions
│       │
│       └── utils/
│           ├── enums/
│           │   ├── cartTable.enum.ts          # Cart table column indexes
│           │   └── messages.enum.ts           # Expected UI / validation messages
│           └── helpers/
│               ├── browserDialog.helper.ts    # Handles native JS alerts / confirms
│               ├── table.helper.ts            # Reads / parses cart table rows
│               └── wait.helper.ts             # Page / DOM readiness helpers
│
├── tests/
│   └── e2e/
│       ├── login.spec.ts                      # Login test suite
│       └── cart.spec.ts                       # Cart & Purchase Order test suite
│
├── reports/
│   ├── playwright/                            # Built-in HTML report (traces, videos)
│   ├── allure/                                # Allure results & report
│   
│
├── .github/workflows/
│   └── playwright.yml                         # CI/CD: build gate + smoke + regression
│
├── playwright.config.ts                       # Browsers, timeouts, reporters, projects
└── package.json                               # Scripts & dependencies
```

The structure separates test specifications, UI behavior, test data, configuration, and supporting API operations.

## Page Object Model (POM)

The UI layer follows a feature-folder Page Object Model. Each page keeps its locator definitions in an `*.elements.ts` file and its reusable interactions in a corresponding `*.page.ts` file.

```text
login/
├── login.elements.ts
└── login.page.ts
```

`login.elements.ts` owns selectors.  
`login.page.ts` uses those selectors to expose meaningful operations.

When a selector changes, maintenance is normally limited to the elements file.  
Isolating selectors in `*.elements.ts` also makes UI maintenance **AI-powered**: when the DOM changes, Playwright MCP combined with Playwright UI Mode inspects the live page source, extracts every locator on the page in one pass, and updates the matching `*.elements.ts` file — turning locator maintenance into a fast, AI-assisted step instead of manual selector hunting. The tests themselves stay deterministic and run directly through Playwright locally and in CI/CD.

## Separation of Responsibilities

Domain models (`src/common/models`) define model; test inputs come from centralized JSON plus Faker for realistic data.  
API controllers (`src/api/controllers`) are supporting infrastructure for fast state setup/teardown — they do not replace the UI coverage required by this assignment.

## API Strategy

The behavior under test always runs through the UI. Supporting steps that are not under test use the API: Cart and Purchase Order tests authenticate via API and inject the browser session (instead of re-running the Login UI already covered by the Login suite), and the cart is cleared via API after each test. This keeps the core scenario on the UI while cutting execution time and avoiding flaky preconditions or teardown.

## Wait Strategy

The framework relies on Playwright's locator auto-waiting and retryable assertions, adding explicit synchronization only when DemoBlaze requires.  
Playwright-native timeouts live in `playwright.config.ts`; framework-specific dialog timing lives in `timeoutConfig.ts`.

## Cross-Browser and Parallel Execution

Projects are defined for Cross-Browser, selectable at runtime via `--project`.  
Parallel runs are safe because `test.fixture.ts` gives each worker a unique API-registered account and isolates cart cleanup per worker — so the same suite runs sequentially or with multiple workers unchanged.

## Reporting

### Allure — the primary, stakeholder-facing report

Allure is the framework's report of record because it turns raw test output into a structured, navigable story:

- Organized by suite → feature → test
- Cases are grouped the way people actually think about the product

## Demo Automation Scripts

The Demo Automation Scripts is a focused four-test subset selected with the `@demo` tag. It demonstrates successful Login, Cart operations, Purchase Order completion, validation behavior, reusable test setup, and cleanup.

- LGN-001 — Verify successful login with valid credentials
- CRT-002 — Verify multiple category products can be added to the cart successfully
- CRT-004 — Verify an order containing products from multiple categories can be placed successfully
- CRT-006 — Verify order cannot be placed when required fields are empty

All scripts runs API cleanup afterward, even when the test fails, so remaining items do not affect later scenarios.

## Run the Demo Automation Scripts

The standard command runs the four Demo Automation Scripts:

```bash
npm run test:demo
```

The script is a convenient preset equivalent to:

```bash
npm test -- tests/e2e --grep @demo --project=chromium
```

---

## Run with Dynamic Parameters

`npm test --` forwards all following arguments directly to the Playwright CLI. Browser, tags, workers, and test paths can therefore be selected at runtime without adding another script to `package.json`.

### Parallel Workers

```bash
HEADED=true npm test -- tests/e2e \
  --grep @demo \
  --project=chromium \
  --workers=3
```

### Cross-Browser

```bash
HEADED=true npm test -- tests/e2e \
  --grep @demo \
  --project=chromium \
  --project=firefox
```

This runs the same four Demo cases once on each browser, producing eight test executions.

---

### Different Environment

```bash
BASE_URL=https://staging.demoblaze.com \
npm test -- tests/e2e \
  --grep @demo \
  --project=chromium
```

### Disable Allure Result Generation

```bash
ALLURE=false npm test -- tests/e2e \
  --grep @demo \
  --project=chromium
```

These options can also be combined:

```bash
HEADED=true \
BASE_URL=https://www.demoblaze.com \
ALLURE=false \
npm test -- tests/e2e \
  --grep @demo \
  --project=firefox \
  --workers=3
```

---

## Run Smoke and Regression

On CI (GitHub Actions). The build gate runs automatically on every push / PR, and full regression runs nightly on schedule (see CI/CD Workflow). To run a suite on demand: Actions → CI → Run workflow, then pick suite (smoke or regression) along with browser, workers, base_url, and api_url. The run publishes an Allure report to GitHub Pages and uploads the Playwright HTML and JUnit artifacts.

Locally:

```bash
npm run test:smoke        # 3 critical smoke scenarios
npm run test:regression   # full 12-case regression suite
```

Both accept native Playwright flags for cross-browser and parallel runs:

```bash
npm test -- tests/e2e --grep @regression --project=chromium --project=firefox --workers=4
```

---

## View Reports

Open the latest Playwright HTML report:

```bash
npm run report
```

Generate and serve an Allure report directly from the latest raw results:

```bash
npm run allure:serve
```

To generate a persistent Allure HTML report and open it later:

```bash
npm run allure:generate
npm run allure:open
```
