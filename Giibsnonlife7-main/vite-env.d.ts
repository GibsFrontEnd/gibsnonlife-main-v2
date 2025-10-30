declare global {
  interface ImportMetaEnv {
    readonly VITE_SECRET_KEY: string;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

export {};