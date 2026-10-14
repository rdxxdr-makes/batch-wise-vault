import { createServerFn } from "@tanstack/react-start";
import { isValidAdminSession, issueAdminSession } from "./admin-auth.server";

export const createAdminSession = createServerFn({ method: "POST" })
  .inputValidator((data: { pin: string }) => data)
  .handler(async ({ data }) => {
    const expectedPin = process.env["ADMIN_PIN"];
    const sessionSecret = process.env["ADMIN_SESSION_SECRET"];
    if (!expectedPin || !sessionSecret) throw new Error("Admin sign-in is temporarily unavailable.");
    return { token: await issueAdminSession(data.pin, expectedPin, sessionSecret) };
  });

export const verifyAdminSession = createServerFn({ method: "POST" })
  .inputValidator((data: { token: string }) => data)
  .handler(async ({ data }) => isValidAdminSession(data.token, process.env["ADMIN_SESSION_SECRET"]));