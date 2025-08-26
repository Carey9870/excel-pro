// types/declarations.d.ts
declare global {
  interface Window {
    Clerk?: {
      session?: {
        getToken: () => Promise<string>;
      };
    };
  }
}

