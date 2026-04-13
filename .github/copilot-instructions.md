# Copilot Instructions — @livtorgex/klinecharts

## Commands

```bash
pnpm install              # install dependencies
pnpm run lint             # ESLint (zero warnings allowed)
pnpm run typecheck        # tsc --noEmit
pnpm run build            # tsc -p tsconfig.json → dist/
```

No test runner is configured yet (`pnpm test` is a no-op stub).

## Architecture

This is a **git-only distributed React package** — it is consumed as a git dependency (not published to npm) by consumer apps (e.g. `trading-app`, `trading-bot-react`). Consumers must add it to `transpilePackages` (Next.js) so the TypeScript source is compiled by the consumer.

### Chart surface

`src/KLineChart.tsx` is the root component. It:
- Initialises a [klinecharts](https://klinecharts.com) canvas chart via `init()` / `dispose()`.
- Exposes the raw `Chart` instance via `ChartContext` so child components can call chart APIs directly.
- Loads and caches chart settings (timeframe, indicator visibility, etc.) via `ChartSettingsContext`.
- Renders children as a composable slot — position overlays, projection panels, and other chart widgets are passed as `children`.

### Variant entry-points

| Component | Use-case |
|---|---|
| `KLineChart` | Base chart, used stand-alone or as a wrapper |
| `KLineChartBot` | Bot monitoring — wraps `KLineChart` and mounts `KLineChartProgressPositions` / `KLineChartFinishedPositions` |
| `KLineChartBacktest` | Backtest replay — mounts `KLineChartBacktestPositions` |
| `KLineChartSymbol` | Symbol price chart without position overlays |
| `KLineChartPosition` | Position-focused view |

### Indicators & overlays

Indicators live in `src/indicators/` and overlays in `src/overlays/`. Both are registered by importing their respective `index.ts` files inside `KLineChart.tsx`. To add a new indicator or overlay:
1. Create a new file in the appropriate directory.
2. Register it at the bottom of the corresponding `index.ts`.

Indicators are plain classes with a `next(value): number` method. Overlays use `registerOverlay()` from the `klinecharts` library.

### Projection subsystem

`src/projection/` renders a live market data panel alongside the chart. It is composed of:
- `KLineProjectionLines` — support/resistance lines
- `KLineProjectionMessages` — trade messages
- `KLineProjectionOrderBook` — order book
- `KLineProjectionMovements` — price movements
- `KLinePropjectionIndicators` — per-symbol indicators

Each sub-component is toggled by flags in `ChartSettings.projection` and reads from the same `ChartSettingsContext`.

### Custom events (overlay ↔ app communication)

Overlays communicate drag/click events back to the consumer app via `window.dispatchEvent()` with `CustomEvent`. The consumer app must attach listeners. Named events:
- `manual-order-dragged` — fired when an order overlay is dragged to a new price.
- `overlay-remove-*` — fired when an overlay is removed.

### Hooks & stubs

`src/hooks/api/` contains stub implementations (they return empty data). Consumer apps are expected to replace or extend these via their own hooks layer. The stubs keep the package self-contained for type-checking and CI.

### Context pattern

`ChartContext` → raw `Chart` instance  
`ChartSettingsContext` → serialised settings (timeframe, indicator toggles, projection toggles)

Both contexts are created in `src/context/` and consumed with matching `useChart()` / `useChartSettings()` hooks. Components deep inside the tree use these hooks rather than prop drilling.

## Key conventions

- **Double quotes** everywhere (enforced by prettier — `singleQuote: false`).
- **No `any`** — use `unknown`, `Record<string, unknown>`, or a specific interface.
- **Unused imports/variables are errors** — remove them rather than suppressing with `eslint-disable`.
- **Peer dependencies are not bundled** — `react`, `react-dom`, `@mui/material`, `@emotion/*`, `@tanstack/react-query` are peers; do not import them as regular deps.
- **No build step on install** — `package.json` has no `prepare` script; the `dist/` directory is committed. Consumers transpile the `src/` source via `transpilePackages`.
- **Lockfile is committed** — always run `pnpm install --lockfile-only` after changing `package.json` and commit the updated `pnpm-lock.yaml`.

## CI

`.github/workflows/ci.yml` runs on push/PR to `main`:
1. `pnpm/action-setup@v5` (reads version from `packageManager` in `package.json`, no explicit version in the action)
2. `actions/setup-node@v4` with Node LTS
3. `pnpm install --frozen-lockfile`
4. `pnpm run lint`
5. `pnpm run typecheck`

## Local development inside a consumer app

Fastest iteration loop using a file dependency:

```bash
cd trading-app/web
pnpm add file:../../klinecharts
pnpm dev
```

Or use `pnpm link`:

```bash
cd klinecharts && pnpm link --global
cd ../trading-app/web && pnpm link --global @livtorgex/klinecharts
```

Switch back to the git dependency before committing to the consumer repo:

```bash
pnpm add git+ssh://git@github.com:LivTorgEx/klinecharts.git
```
