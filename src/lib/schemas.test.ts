import {
  categoryCreateSchema,
  expenseCreateSchema,
  expenseUpdateSchema,
  idSchema,
  rangeQuerySchema,
} from "@/lib/schemas";

const validExpense = {
  date: "2026-06-15",
  purpose: "Lunch",
  amountPaise: 25050,
  categoryId: 3,
};

describe("expenseCreateSchema", () => {
  it("accepts a minimal valid expense", () => {
    expect(expenseCreateSchema.safeParse(validExpense).success).toBe(true);
  });

  it("trims text and turns blank optional text into null", () => {
    const result = expenseCreateSchema.parse({
      ...validExpense,
      purpose: "  Lunch  ",
      merchant: "   ",
      notes: " ok ",
    });
    expect(result.purpose).toBe("Lunch");
    expect(result.merchant).toBeNull();
    expect(result.notes).toBe("ok");
  });

  it.each([0, -5, 12.5, 2_147_483_648])("rejects amountPaise %s", (amountPaise) => {
    expect(
      expenseCreateSchema.safeParse({ ...validExpense, amountPaise }).success,
    ).toBe(false);
  });

  it("rejects a string amount", () => {
    expect(
      expenseCreateSchema.safeParse({ ...validExpense, amountPaise: "100" })
        .success,
    ).toBe(false);
  });

  it.each(["2026-02-30", "2026-13-01", "15-06-2026", "2026-6-5", ""])(
    "rejects date %j",
    (date) => {
      expect(expenseCreateSchema.safeParse({ ...validExpense, date }).success).toBe(
        false,
      );
    },
  );

  it("rejects a blank or too-long purpose", () => {
    expect(
      expenseCreateSchema.safeParse({ ...validExpense, purpose: "   " }).success,
    ).toBe(false);
    expect(
      expenseCreateSchema.safeParse({ ...validExpense, purpose: "x".repeat(201) })
        .success,
    ).toBe(false);
  });

  it("rejects a missing category and unknown keys", () => {
    const { categoryId, ...rest } = validExpense;
    void categoryId;
    expect(expenseCreateSchema.safeParse(rest).success).toBe(false);
    expect(
      expenseCreateSchema.safeParse({ ...validExpense, amount_paise: 5 }).success,
    ).toBe(false);
  });
});

describe("expenseUpdateSchema", () => {
  it("accepts a partial update", () => {
    expect(expenseUpdateSchema.safeParse({ purpose: "Dinner" }).success).toBe(
      true,
    );
  });

  it("allows clearing optional fields with null", () => {
    expect(expenseUpdateSchema.parse({ merchant: null })).toEqual({
      merchant: null,
    });
  });

  it("rejects an empty update", () => {
    expect(expenseUpdateSchema.safeParse({}).success).toBe(false);
  });

  it("still validates provided fields", () => {
    expect(expenseUpdateSchema.safeParse({ amountPaise: 0 }).success).toBe(false);
  });
});

describe("categoryCreateSchema", () => {
  it("trims the name", () => {
    expect(categoryCreateSchema.parse({ name: "  Pets  " })).toEqual({
      name: "Pets",
    });
  });

  it("accepts 1 and 40 characters", () => {
    expect(categoryCreateSchema.safeParse({ name: "a" }).success).toBe(true);
    expect(
      categoryCreateSchema.safeParse({ name: "a".repeat(40) }).success,
    ).toBe(true);
  });

  it("rejects blank, whitespace-only and 41-character names", () => {
    expect(categoryCreateSchema.safeParse({ name: "" }).success).toBe(false);
    expect(categoryCreateSchema.safeParse({ name: "   " }).success).toBe(false);
    expect(
      categoryCreateSchema.safeParse({ name: "a".repeat(41) }).success,
    ).toBe(false);
  });
});

describe("rangeQuerySchema", () => {
  it("accepts an empty query and valid dates", () => {
    expect(rangeQuerySchema.safeParse({}).success).toBe(true);
    expect(
      rangeQuerySchema.safeParse({ from: "2026-01-01", to: "2026-01-31" }).success,
    ).toBe(true);
  });

  it("rejects malformed dates", () => {
    expect(rangeQuerySchema.safeParse({ from: "yesterday" }).success).toBe(false);
  });
});

describe("idSchema", () => {
  it("parses a positive integer string", () => {
    expect(idSchema.parse("42")).toBe(42);
  });

  it.each(["0", "-1", "1.5", "abc", "", "1e3", " 5", "99999999999"])(
    "rejects %j",
    (value) => {
      expect(idSchema.safeParse(value).success).toBe(false);
    },
  );
});
