import { NextResponse } from "next/server";
import { canEdit, sameSiteRequest } from "@/lib/auth";
import { addCategory, deleteCategory, listCategories, renameCategory } from "@/lib/categories";

const clean = (value: unknown) => typeof value === "string" ? value.trim().slice(0, 60) : "";
async function authorized(request: Request) { return sameSiteRequest(request) && await canEdit(); }

export async function GET() {
  try { return NextResponse.json({ categories: await listCategories() }); }
  catch (error) { console.error("categories.list", error); return NextResponse.json({ error: "Категорії недоступні" }, { status: 503 }); }
}
export async function POST(request: Request) {
  if (!await authorized(request)) return NextResponse.json({ error: "Потрібно ввести PIN-код" }, { status: 401 });
  const body = await request.json().catch(() => null) as { name?: unknown } | null; const name = clean(body?.name);
  if (!name) return NextResponse.json({ error: "Введи назву категорії" }, { status: 400 });
  await addCategory(name); return NextResponse.json({ ok: true });
}
export async function PUT(request: Request) {
  if (!await authorized(request)) return NextResponse.json({ error: "Потрібно ввести PIN-код" }, { status: 401 });
  const body = await request.json().catch(() => null) as { oldName?: unknown; newName?: unknown } | null;
  const oldName = clean(body?.oldName), newName = clean(body?.newName);
  if (!oldName || !newName) return NextResponse.json({ error: "Заповни обидві назви" }, { status: 400 });
  await renameCategory(oldName, newName); return NextResponse.json({ ok: true });
}
export async function DELETE(request: Request) {
  if (!await authorized(request)) return NextResponse.json({ error: "Потрібно ввести PIN-код" }, { status: 401 });
  const body = await request.json().catch(() => null) as { name?: unknown } | null; const name = clean(body?.name);
  if (!name) return NextResponse.json({ error: "Категорію не вказано" }, { status: 400 });
  try { await deleteCategory(name); return NextResponse.json({ ok: true }); }
  catch (error) { if (error instanceof Error && error.message === "CATEGORY_IN_USE") return NextResponse.json({ error: "Спочатку зміни категорію в іграх, де вона використовується" }, { status: 409 }); throw error; }
}
