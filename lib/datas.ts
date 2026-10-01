// datetime-local <-> ISO, sempre em horário de Brasília (UTC-3, sem horário de verão desde 2019).
export const isoParaLocal = (iso: string | null) => {
  if (!iso) return "";
  return new Date(new Date(iso).getTime() - 3 * 3600_000).toISOString().slice(0, 16);
};
export const localParaIso = (v: string) => (v ? new Date(`${v}:00-03:00`).toISOString() : null);
export const ehFuturo = (v: string) => !!v && new Date(`${v}:00-03:00`).getTime() > Date.now();
