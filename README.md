# klinecharts

Shared KLineChart React components and utilities for LivTorgEx projects.

Install (git):

npm install git+ssh://git@github.com:LivTorgEx/klinecharts.git

Development workflows

- Developing inside trading-app or trading-bot-react (recommended):
  1. Clone both repositories side-by-side:
     ```bash
     /work
     ├─ trading-app
     └─ klinecharts
     ```
  2. In trading-app/web/package.json, set dependency to the git URL (the default):
     `"@livtorgex/klinecharts": "git+ssh://git@github.com:LivTorgEx/klinecharts.git"`
  3. During active development, use a local file dependency to iterate quickly:
     ```bash
     cd trading-app/web
     pnpm install --no-prefer-frozen-lockfile
     pnpm add file:../../klinecharts
     # start dev server
     pnpm run dev
     ```
  4. Alternatively use pnpm link:
     ```bash
     cd klinecharts
     pnpm link --global
     cd ../trading-app/web
     pnpm link --global @livtorgex/klinecharts
     ```

- CI/CD: klinecharts builds a Docker image and publishes to GitHub Container Registry (ghcr.io) on push to main. The image contains the built dist files and can be used in Kubernetes for demo or static-serving.

