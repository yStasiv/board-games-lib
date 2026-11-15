import { env } from "cloudflare:workers";
import { cookies } from "next/headers";

const COOKIE = "catalog_editor";
const encoder = new TextEncoder();

function vars() {
  return env as unknown as { CATALOG_PIN?: string; CATALOG_SESSION_SECRET?: string };
}

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return result === 0;
}

async function sign(payload: string) {
  const secret = vars().CATALOG_SESSION_SECRET;
  if (!secret) throw new Error("CATALOG_SESSION_SECRET is unavailable");
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return Array.from(new Uint8Array(signature), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function validPin(pin: string) {
  const expected = vars().CATALOG_PIN;
  return Boolean(expected && safeEqual(pin, expected));
}

export async function createEditorSession() {
  const expires = Date.now() + 1000 * 60 * 60 * 24 * 30;
  const payload = String(expires);
  const signature = await sign(payload);
  const jar = await cookies();
  jar.set(COOKIE, `${payload}.${signature}`, { httpOnly: true, secure: true, sameSite: "strict", path: "/", expires: new Date(expires) });
}

export async function clearEditorSession() {
  const jar = await cookies();
  jar.set(COOKIE, "", { httpOnly: true, secure: true, sameSite: "strict", path: "/", maxAge: 0 });
}

export async function canEdit() {
  const value = (await cookies()).get(COOKIE)?.value;
  if (!value) return false;
  const [expires, received, ...extra] = value.split(".");
  if (!expires || !received || extra.length || Number(expires) < Date.now()) return false;
  try { return safeEqual(received, await sign(expires)); } catch { return false; }
}

export function sameSiteRequest(request: Request) {
  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite === "cross-site") return false;
  const origin = request.headers.get("origin");
  return !origin || new URL(request.url).origin === origin;
}
