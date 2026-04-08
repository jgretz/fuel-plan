// This file is required for Expo/React Native SQLite migrations - https://orm.drizzle.team/quick-sqlite/expo

import journal from './meta/_journal.json';

const m0000 = `CREATE TABLE \`execution_entries\` (
\t\`id\` text PRIMARY KEY NOT NULL,
\t\`log_id\` text NOT NULL,
\t\`plan_entry_id\` text NOT NULL,
\t\`status\` text DEFAULT 'pending' NOT NULL,
\t\`actual_time_seconds\` integer,
\tFOREIGN KEY (\`log_id\`) REFERENCES \`execution_logs\`(\`id\`) ON UPDATE no action ON DELETE cascade,
\tFOREIGN KEY (\`plan_entry_id\`) REFERENCES \`plan_entries\`(\`id\`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE \`execution_logs\` (
\t\`id\` text PRIMARY KEY NOT NULL,
\t\`race_id\` text NOT NULL,
\t\`started_at\` text NOT NULL,
\t\`finished_at\` text,
\t\`pause_duration_seconds\` integer DEFAULT 0 NOT NULL,
\tFOREIGN KEY (\`race_id\`) REFERENCES \`races\`(\`id\`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX \`execution_logs_race_id_unique\` ON \`execution_logs\` (\`race_id\`);--> statement-breakpoint
CREATE TABLE \`fuel_sources\` (
\t\`id\` text PRIMARY KEY NOT NULL,
\t\`name\` text NOT NULL,
\t\`calories\` real NOT NULL,
\t\`carbs\` real NOT NULL,
\t\`created_at\` text NOT NULL,
\t\`updated_at\` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE \`plan_entries\` (
\t\`id\` text PRIMARY KEY NOT NULL,
\t\`plan_id\` text NOT NULL,
\t\`time_minutes\` integer NOT NULL,
\t\`sort_order\` integer NOT NULL,
\tFOREIGN KEY (\`plan_id\`) REFERENCES \`race_plans\`(\`id\`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE \`plan_entry_fuel_sources\` (
\t\`plan_entry_id\` text NOT NULL,
\t\`fuel_source_id\` text NOT NULL,
\tFOREIGN KEY (\`plan_entry_id\`) REFERENCES \`plan_entries\`(\`id\`) ON UPDATE no action ON DELETE cascade,
\tFOREIGN KEY (\`fuel_source_id\`) REFERENCES \`fuel_sources\`(\`id\`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE \`race_plans\` (
\t\`id\` text PRIMARY KEY NOT NULL,
\t\`race_id\` text NOT NULL,
\t\`silent\` integer DEFAULT false NOT NULL,
\t\`alarm_sound\` text DEFAULT 'default' NOT NULL,
\tFOREIGN KEY (\`race_id\`) REFERENCES \`races\`(\`id\`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX \`race_plans_race_id_unique\` ON \`race_plans\` (\`race_id\`);--> statement-breakpoint
CREATE TABLE \`races\` (
\t\`id\` text PRIMARY KEY NOT NULL,
\t\`name\` text NOT NULL,
\t\`date\` text NOT NULL,
\t\`status\` text DEFAULT 'upcoming' NOT NULL,
\t\`created_at\` text NOT NULL,
\t\`updated_at\` text NOT NULL
);`;

export default {
  journal,
  migrations: {
    m0000,
  },
};
