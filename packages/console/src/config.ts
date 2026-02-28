/**
 * Console configuration — reads from Vite env variables.
 */
export interface ConsoleConfig {
  baseUrl: string;
  autoBatchTime: number;
  cacheTime: number;
}

export function getConfig(): ConsoleConfig {
  return {
    baseUrl: import.meta.env.VITE_MEDXAI_BASE_URL || window.location.origin,
    autoBatchTime: 100,
    cacheTime: 60_000,
  };
}
