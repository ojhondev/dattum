import fs from "node:fs";
import chromium from "@sparticuz/chromium-min";

// @sparticuz/chromium-min ships no binary — it downloads this pack at cold start
// into /tmp instead of bundling ~35-50MB into the function (which broke Vercel's
// file tracing: "@sparticuz/chromium" alone failed in prod with "input directory
// /var/task/node_modules/@sparticuz/chromium/bin does not exist"). Keep this
// version number in lockstep with the installed @sparticuz/chromium-min version —
// the pack filename is version-pinned, there's no "latest" alias that works here.
export const CHROMIUM_PACK_URL =
  "https://github.com/Sparticuz/chromium/releases/download/v153.0.0/chromium-v153.0.0-pack.x64.tar";

export async function resolveExecutablePath(): Promise<string> {
  const isServerless = !!(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
  if (!isServerless) {
    const candidates = [
      process.env.CHROME_PATH,
      "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
      "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
      "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
      "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
      "/usr/bin/google-chrome",
      "/usr/bin/chromium-browser",
      "/usr/bin/chromium",
    ].filter((c): c is string => !!c);
    for (const c of candidates) {
      if (fs.existsSync(c)) return c;
    }
  }
  return chromium.executablePath(CHROMIUM_PACK_URL);
}
