import type { SVMConfig } from "@/types/svm";

/**
 * Fase 5.2 — Sellado de configuración (Integridad).
 *
 * Genera un hash SHA-256 determinístico del conjunto de hiperparámetros
 * (kernel, C, gamma, tamaño de muestra). El mismo conjunto de valores
 * siempre produce el mismo hash, lo que permite auditar qué combinación
 * entrenó un modelo cartográfico determinado sin depender de un timestamp.
 *
 * Usa la Web Crypto API (`crypto.subtle`), disponible tanto en el navegador
 * como en el runtime de servidor de Node/Nitro, por lo que funciona igual
 * en SSR y en el cliente.
 */
export async function hashSvmConfig(config: SVMConfig): Promise<string> {
  const canonical = JSON.stringify(config, Object.keys(config).sort());
  const bytes = new TextEncoder().encode(canonical);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function shortHash(hash: string): string {
  if (hash.length <= 14) return hash;
  return `${hash.slice(0, 8)}…${hash.slice(-6)}`;
}
