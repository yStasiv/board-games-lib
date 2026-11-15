import { readFile, writeFile } from "node:fs/promises";

const configPath = new URL("../dist/server/wrangler.json", import.meta.url);
const workerName = process.env.WORKER_NAME?.trim() || "board-games-catalog";
const databaseId = process.env.D1_DATABASE_ID?.trim();
const bucketName = process.env.R2_BUCKET_NAME?.trim() || "board-games-catalog-images";

if (!databaseId) {
  throw new Error("D1_DATABASE_ID is required. Add it to GitHub Actions secrets.");
}

const config = JSON.parse(await readFile(configPath, "utf8"));
config.name = workerName;
config.d1_databases = [{
  binding: "DB",
  database_name: "board-games-catalog-db",
  database_id: databaseId,
  migrations_dir: "../../drizzle",
}];
config.r2_buckets = [{ binding: "BUCKET", bucket_name: bucketName }];

await writeFile(configPath, `${JSON.stringify(config, null, 2)}\n`);
console.log(`Configured Worker: ${workerName}`);
