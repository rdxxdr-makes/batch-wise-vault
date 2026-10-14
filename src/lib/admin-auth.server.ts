const encoder = new TextEncoder();

function encodeBase64Url(value: Uint8Array): string {
  let binary = "";
  for (const byte of value) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function decodeBase64Url(value: string): Uint8Array {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(base64 + "=".repeat((4 - (base64.length % 4)) % 4));
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

async function signingKey(secret: string, usages: KeyUsage[]): Promise<CryptoKey> {
  return crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, usages);
}

export async function issueAdminSession(pin: string, expectedPin: string, secret: string): Promise<string> {
  if (pin !== expectedPin) throw new Error("Incorrect PIN. Please try again.");

  const payload = encodeBase64Url(
    encoder.encode(JSON.stringify({ role: "admin", expiresAt: Date.now() + 8 * 60 * 60 * 1000 })),
  );
  const signature = await crypto.subtle.sign("HMAC", await signingKey(secret, ["sign"]), encoder.encode(payload));
  return `${payload}.${encodeBase64Url(new Uint8Array(signature))}`;
}

export async function isValidAdminSession(token: string, secret: string | undefined): Promise<boolean> {
  if (!secret || !token || token.length > 2048) return false;
  const [payloadPart, signaturePart, extraPart] = token.split(".");
  if (!payloadPart || !signaturePart || extraPart !== undefined) return false;

  try {
    const signature = decodeBase64Url(signaturePart);
    const isAuthentic = await crypto.subtle.verify(
      "HMAC",
      await signingKey(secret, ["verify"]),
      signature,
      encoder.encode(payloadPart),
    );
    if (!isAuthentic) return false;

    const payload = JSON.parse(new TextDecoder().decode(decodeBase64Url(payloadPart))) as {
      role?: unknown;
      expiresAt?: unknown;
    };
    return payload.role === "admin" && typeof payload.expiresAt === "number" && payload.expiresAt > Date.now();
  } catch {
    return false;
  }
}