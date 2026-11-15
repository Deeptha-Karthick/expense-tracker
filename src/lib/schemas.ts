import { z } from "zod";
import { isValidDateString } from "@/lib/dates";

const INT4_MAX = 2_147_483_647;

/** A real calendar date as "YYYY-MM-DD". */
export const dateString = z
  .string()
  .refine(isValidDateString, "must be a valid date in YYYY-MM-DD format");

/** Trimmed optional text; blank becomes null. */
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((value) => (value === "" ? null : value))
    .nullish();

export const rangeQuerySchema = z.object({
  from: dateString.optional(),
  to: dateString.optional(),
});

export const idSchema = z
  .string()
  .regex(/^\d+$/, "must be a positive integer")
  .transform(Number)
  .pipe(z.number().int().positive().max(INT4_MAX));

export const expenseCreateSchema = z.strictObject({
  date: dateString,
  purpose: z.string().trim().min(1).max(200),
  amountPaise: z.number().int().positive().max(INT4_MAX),
  categoryId: z.number().int().positive().max(INT4_MAX),
  merchant: optionalText(100),
  paymentMethod: optionalText(50),
  notes: optionalText(1000),
});

export const expenseUpdateSchema = expenseCreateSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: "at least one field is required",
  });

export const categoryCreateSchema = z.strictObject({
  name: z.string().trim().min(1).max(40),
});

export type ExpenseCreateInput = z.infer<typeof expenseCreateSchema>;
export type ExpenseUpdateInput = z.infer<typeof expenseUpdateSchema>;
export type CategoryCreateInput = z.infer<typeof categoryCreateSchema>;
