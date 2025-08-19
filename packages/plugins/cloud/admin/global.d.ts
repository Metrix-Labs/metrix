export {};

declare global {
  interface Window {
    metrix: {
      backendURL: string;
    };
  }
}
