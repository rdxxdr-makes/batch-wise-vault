import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader, setResponseHeader } from "@tanstack/react-start/server";
import {
  ADMIN_SESSION_COOKIE,
  adminSessionFromCookie,
  isValidAdminSession,
  issueAdminSession,
} from "./admin-auth.server";

export const createAdminSession = createServerFn({ method: "POST" })
  .inputValidator((data: { pin: string }) => data)
  .handler(async ({ data }) => {
    const expectedPin = process.env["ADMIN_PIN"];
    const sessionSecret = process.env["ADMIN_SESSION_SECRET"];
    if (!expectedPin || !sessionSecret) throw new Error("Admin sign-in is temporarily unavailable.");
    const token = await issueAdminSession(data.pin, expectedPin, sessionSecret);
    setResponseHeader(
      "Set-Cookie",
      `${ADMIN_SESSION_COOKIE}=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=28800`,
    );
    return { ok: true };
  });

export const verifyAdminSession = createServerFn({ method: "POST" }).handler(async () =>
  isValidAdminSession(
    adminSessionFromCookie(getRequestHeader("cookie")),
    process.env["ADMIN_SESSION_SECRET"],
  ),
);

export const clearAdminSession = createServerFn({ method: "POST" }).handler(async () => {
  setResponseHeader("Set-Cookie", `${ADMIN_SESSION_COOKIE}=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`);
  return { ok: true };
});