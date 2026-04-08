CREATE TABLE `execution_entries` (
	`id` text PRIMARY KEY NOT NULL,
	`log_id` text NOT NULL,
	`plan_entry_id` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`actual_time_seconds` integer,
	FOREIGN KEY (`log_id`) REFERENCES `execution_logs`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`plan_entry_id`) REFERENCES `plan_entries`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `execution_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`race_id` text NOT NULL,
	`started_at` text NOT NULL,
	`finished_at` text,
	`pause_duration_seconds` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`race_id`) REFERENCES `races`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `execution_logs_race_id_unique` ON `execution_logs` (`race_id`);--> statement-breakpoint
CREATE TABLE `fuel_sources` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`calories` real NOT NULL,
	`carbs` real NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `plan_entries` (
	`id` text PRIMARY KEY NOT NULL,
	`plan_id` text NOT NULL,
	`time_minutes` integer NOT NULL,
	`sort_order` integer NOT NULL,
	FOREIGN KEY (`plan_id`) REFERENCES `race_plans`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `plan_entry_fuel_sources` (
	`plan_entry_id` text NOT NULL,
	`fuel_source_id` text NOT NULL,
	FOREIGN KEY (`plan_entry_id`) REFERENCES `plan_entries`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`fuel_source_id`) REFERENCES `fuel_sources`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `race_plans` (
	`id` text PRIMARY KEY NOT NULL,
	`race_id` text NOT NULL,
	`silent` integer DEFAULT false NOT NULL,
	`alarm_sound` text DEFAULT 'default' NOT NULL,
	FOREIGN KEY (`race_id`) REFERENCES `races`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `race_plans_race_id_unique` ON `race_plans` (`race_id`);--> statement-breakpoint
CREATE TABLE `races` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`date` text NOT NULL,
	`status` text DEFAULT 'upcoming' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
