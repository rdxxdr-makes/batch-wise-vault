export type Role = "admin" | "student";

const ROLE_KEY = "portal_role";

export function setSession(role: Role) {
  sessionStorage.setItem(ROLE_KEY, role);
}

export function getRole(): Role | null {
  if (typeof window === "undefined") return null;
  return (sessionStorage.getItem(ROLE_KEY) as Role) ?? null;
}

export function clearSession() {
  sessionStorage.removeItem(ROLE_KEY);
} 
export function getAdminToken(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem("admin_token") || localStorage.getItem("admin_token") || null;
}