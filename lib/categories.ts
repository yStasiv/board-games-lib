import { env } from "cloudflare:workers";

function db() { if (!env.DB) throw new Error("D1 binding DB is unavailable"); return env.DB; }

export async function listCategories() {
  const result = await db().prepare(`
    SELECT name, MIN(position) AS position FROM (
      SELECT name, position FROM categories
      UNION ALL
      SELECT category AS name, 1000 AS position FROM games WHERE category != ''
    ) GROUP BY name ORDER BY position, name COLLATE NOCASE
  `).all<{ name: string }>();
  return result.results.map((row) => row.name);
}

export async function addCategory(name: string) {
  const position = await db().prepare("SELECT COALESCE(MAX(position), -1) + 1 AS next FROM categories").first<{ next: number }>();
  await db().prepare("INSERT OR IGNORE INTO categories (name, position, created_at) VALUES (?, ?, ?)").bind(name, position?.next ?? 0, new Date().toISOString()).run();
}

export async function renameCategory(oldName: string, newName: string) {
  const current = await db().prepare("SELECT position, created_at FROM categories WHERE name = ?").bind(oldName).first<{ position: number; created_at: string }>();
  const statements = [
    db().prepare("INSERT OR IGNORE INTO categories (name, position, created_at) VALUES (?, ?, ?)").bind(newName, current?.position ?? 1000, current?.created_at ?? new Date().toISOString()),
    db().prepare("UPDATE games SET category = ?, updated_at = ? WHERE category = ?").bind(newName, new Date().toISOString(), oldName),
    db().prepare("DELETE FROM categories WHERE name = ?").bind(oldName),
  ];
  await db().batch(statements);
}

export async function deleteCategory(name: string) {
  const used = await db().prepare("SELECT COUNT(*) AS count FROM games WHERE category = ?").bind(name).first<{ count: number }>();
  if ((used?.count ?? 0) > 0) throw new Error("CATEGORY_IN_USE");
  await db().prepare("DELETE FROM categories WHERE name = ?").bind(name).run();
}
