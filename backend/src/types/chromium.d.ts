declare module '@sparticuz/chromium' {
  export function executablePath(): Promise<string>;
  export const args: string[];
  export const headless: boolean | string;
  const chromium: {
    executablePath: typeof executablePath;
    args: string[];
    headless: boolean | string;
  };
  export default chromium;
}
