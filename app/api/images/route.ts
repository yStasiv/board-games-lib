import { env } from "cloudflare:workers";
import { NextResponse } from "next/server";
import { canEdit, sameSiteRequest } from "@/lib/auth";

const allowed = new Map([["image/jpeg", "jpg"], ["image/png", "png"], ["image/webp", "webp"]]);

export async function POST(request: Request) {
  if (!sameSiteRequest(request) || !await canEdit()) return NextResponse.json({ error: "Потрібно ввести PIN-код" }, { status: 401 });
  if (!env.BUCKET) return NextResponse.json({ error: "Сховище фото недоступне" }, { status: 503 });
  const form = await request.formData(); const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Оберіть файл" }, { status: 400 });
  const ext = allowed.get(file.type);
  if (!ext) return NextResponse.json({ error: "Підтримуються JPG, PNG та WEBP" }, { status: 400 });
  if (file.size > 6 * 1024 * 1024) return NextResponse.json({ error: "Фото має бути менше 6 МБ" }, { status: 413 });
  const key = `covers/${crypto.randomUUID()}.${ext}`;
  await env.BUCKET.put(key, file.stream(), { httpMetadata: { contentType: file.type, cacheControl: "public, max-age=31536000, immutable" } });
  return NextResponse.json({ imageUrl: `/api/images/${key}` }, { status: 201 });
}
