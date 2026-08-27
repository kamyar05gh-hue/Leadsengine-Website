/// <reference types="vite/client" />

/* Brings in Vite's ambient types — `import.meta.glob`, `?url` imports and the
   asset module declarations. The trust band uses `import.meta.glob` to pick up
   whatever logo files have been dropped into `src/assets/logos/`, which does
   not typecheck without this. */
