import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  date,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const categories = pgTable(
  "categories",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    name: text().notNull(),
    isDefault: boolean("is_default").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    // Case-insensitive uniqueness; also makes default seeding idempotent.
    uniqueIndex("categories_name_lower_idx").on(sql`lower(${t.name})`),
  ],
);

export const expenses = pgTable(
  "expenses",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    // Plain calendar date as "YYYY-MM-DD"; never a timestamp.
    date: date({ mode: "string" }).notNull(),
    purpose: text().notNull(),
    // Integer paise; never floats.
    amountPaise: integer("amount_paise").notNull(),
    categoryId: integer("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "restrict" }),
    merchant: text(),
    paymentMethod: text("payment_method"),
    notes: text(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    index("expenses_date_idx").on(t.date),
    check("expenses_amount_paise_positive", sql`${t.amountPaise} > 0`),
  ],
);

export type Category = typeof categories.$inferSelect;
export type Expense = typeof expenses.$inferSelect;
export type NewExpense = typeof expenses.$inferInsert;
