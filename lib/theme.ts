export const THEME_COOKIE = "DATTIS_THEME";
export type Theme = "light" | "dark";

export function isTheme(v: string | undefined | null): v is Theme {
  return v === "light" || v === "dark";
}
