import {sqliteTable, text, integer, real} from 'drizzle-orm/sqlite-core';

export const fuelSources = sqliteTable('fuel_sources', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  calories: real('calories').notNull(),
  carbs: real('carbs').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const races = sqliteTable('races', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  date: text('date').notNull(),
  status: text('status', {enum: ['upcoming', 'active', 'finished', 'archived']})
    .notNull()
    .default('upcoming'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const racePlans = sqliteTable('race_plans', {
  id: text('id').primaryKey(),
  raceId: text('race_id')
    .notNull()
    .references(() => races.id, {onDelete: 'cascade'})
    .unique(),
  silent: integer('silent', {mode: 'boolean'}).notNull().default(false),
  alarmSound: text('alarm_sound').notNull().default('default'),
});

export const planEntries = sqliteTable('plan_entries', {
  id: text('id').primaryKey(),
  planId: text('plan_id')
    .notNull()
    .references(() => racePlans.id, {onDelete: 'cascade'}),
  timeMinutes: integer('time_minutes').notNull(),
  sortOrder: integer('sort_order').notNull(),
});

export const planEntryFuelSources = sqliteTable('plan_entry_fuel_sources', {
  planEntryId: text('plan_entry_id')
    .notNull()
    .references(() => planEntries.id, {onDelete: 'cascade'}),
  fuelSourceId: text('fuel_source_id')
    .notNull()
    .references(() => fuelSources.id, {onDelete: 'cascade'}),
});

export const executionLogs = sqliteTable('execution_logs', {
  id: text('id').primaryKey(),
  raceId: text('race_id')
    .notNull()
    .references(() => races.id, {onDelete: 'cascade'})
    .unique(),
  startedAt: text('started_at').notNull(),
  finishedAt: text('finished_at'),
  pauseDurationSeconds: integer('pause_duration_seconds').notNull().default(0),
});

export const executionEntries = sqliteTable('execution_entries', {
  id: text('id').primaryKey(),
  logId: text('log_id')
    .notNull()
    .references(() => executionLogs.id, {onDelete: 'cascade'}),
  planEntryId: text('plan_entry_id')
    .notNull()
    .references(() => planEntries.id, {onDelete: 'cascade'}),
  status: text('status', {enum: ['taken', 'skipped', 'pending']}).notNull().default('pending'),
  actualTimeSeconds: integer('actual_time_seconds'),
});
