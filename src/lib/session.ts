export type Role = "admin" | "student";

const ROLE_KEY = "portal_role";
const ADMIN_TOKEN_KEY = "portal_admin_session";

export function setSession(role: Role) {
  sessionStorage.setItem(ROLE_KEY, role);
  sessionStorage.removeItem(ADMIN_TOKEN_KEY);
}

export function setAdminSession(token: string) {
  sessionStorage.setItem(ROLE_KEY, "admin");
  sessionStorage.setItem(ADMIN_TOKEN_KEY, token);
}

export function getRole(): Role | null {
  if (typeof window === "undefined") return null;
  return (sessionStorage.getItem(ROLE_KEY) as Role) ?? null;
}

export function getAdminToken(): string {
  if (typeof window === "undefined") return "";
  return sessionStorage.getItem(ADMIN_TOKEN_KEY) ?? "";
}

export function clearSession() {
  sessionStorage.removeItem(ROLE_KEY);
  sessionStorage.removeItem(ADMIN_TOKEN_KEY);
}
