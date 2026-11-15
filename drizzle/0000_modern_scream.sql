CREATE TABLE `games` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`players_min` integer NOT NULL,
	`players_max` integer NOT NULL,
	`duration` integer NOT NULL,
	`age` integer NOT NULL,
	`category` text NOT NULL,
	`language` text NOT NULL,
	`shelf` text NOT NULL,
	`status` text NOT NULL,
	`notes` text DEFAULT '' NOT NULL,
	`image_url` text DEFAULT '' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
