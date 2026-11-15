import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const games = sqliteTable("games", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  playersMin: integer("players_min").notNull(),
  playersMax: integer("players_max").notNull(),
  duration: integer("duration").notNull(),
  age: integer("age").notNull(),
  category: text("category").notNull(),
  language: text("language").notNull(),
  shelf: text("shelf").notNull(),
  status: text("status", { enum: ["available", "borrowed"] }).notNull(),
  notes: text("notes").notNull().default(""),
  imageUrl: text("image_url").notNull().default(""),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const categories = sqliteTable("categories", {
  name: text("name").primaryKey(),
  position: integer("position").notNull().default(0),
  createdAt: text("created_at").notNull(),
});
