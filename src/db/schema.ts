import { int, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core"
import { sql } from "drizzle-orm"

export const bookings = mysqlTable("bookings", {
  id: varchar('id', { length: 36 }).notNull().default(sql`(uuid())`).primaryKey(),
  userId: text("user_id").notNull(),
  guestName: text("guest_name").notNull(),
  guestEmail: text("guest_email").notNull(),
  notes: text("notes"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const availability = mysqlTable("availability", {
  id: varchar('id', { length: 36 }).notNull().default(sql`(uuid())`).primaryKey(),
  userId: text("user_id").notNull(),
  dayOfWeek: text("day_of_week").notNull(), // Monday, Tuesday, etc.
  startTime: text("start_time").notNull(), // HH:mm format
  endTime: text("end_time").notNull(), // HH:mm format
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const calendarSelections = mysqlTable("calendar_selections", {
  id: varchar('id', { length: 36 }).notNull().default(sql`(uuid())`).primaryKey(),
  userId: text("user_id").notNull(),
  calendarId: text("calendar_id").notNull(),
  calendarName: text("calendar_name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})
