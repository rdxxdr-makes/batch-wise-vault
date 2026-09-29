export type Role = "admin" | "student";

const ROLE_KEY = "portal_role";
const PIN_KEY = "portal_pin";

export function setSession(role: Role, pin: string) {
  sessionStorage.setItem(ROLE_KEY, role);
  sessionStorage.setItem(PIN_KEY, pin);
}

export function getRole(): Role | null {
  if (typeof window === "undefined") return null;
  return (sessionStorage.getItem(ROLE_KEY) as Role) ?? null;
}

export function getPin(): string {
  if (typeof window === "undefined") return "";
  return sessionStorage.getItem(PIN_KEY) ?? "";
}

export function clearSession() {
  sessionStorage.removeItem(ROLE_KEY);
  sessionStorage.removeItem(PIN_KEY);
}
