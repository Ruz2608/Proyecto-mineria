import { useState } from "react";

// Fase 5.1 — Restricción de permisos (Confidencialidad).
//
// IMPORTANTE: esto es un mock de sesión para la Capa 2 (frontend). Todavía no
// hay autenticación real: `useSessionRole` guarda el rol en estado de React
// solo para poder demostrar y probar visualmente la restricción de permisos.
// Cuando exista un backend de autenticación (Capa 3), este hook debe
// reemplazarse por el rol que devuelva la sesión/IdP real, y la verificación
// de `canRetrain` debe repetirse también en el servidor antes de ejecutar
// cualquier reentrenamiento (nunca confiar solo en la validación de cliente).

export type UserRole = "visitante" | "analista" | "administrador";

const ROLES: { value: UserRole; label: string }[] = [
  { value: "visitante", label: "Visitante" },
  { value: "analista", label: "Analista Ambiental" },
  { value: "administrador", label: "Administrador" },
];

const RETRAIN_ALLOWED: UserRole[] = ["analista", "administrador"];

export function canRetrain(role: UserRole): boolean {
  return RETRAIN_ALLOWED.includes(role);
}

export function useSessionRole() {
  const [role, setRole] = useState<UserRole>("analista");
  return { role, setRole, roles: ROLES };
}
