export {};

declare global {
  interface Window {
    metrix: {
      backendURL: string;
    };
  }
  declare module '*?raw';
}
