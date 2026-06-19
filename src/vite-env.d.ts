// Minimal Vite environment type declarations for klinecharts library build.
// The consuming app (trading-bot-react) provides the full vite/client types at runtime.

interface ImportMetaEnv {
  readonly [key: string]: string | undefined;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "*.css" {
  const stylesheet: string;
  export default stylesheet;
}
