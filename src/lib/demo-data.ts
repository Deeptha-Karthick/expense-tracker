import { addDays } from "@/lib/dates";

export type DemoCategory = { id: number; name: string };

export type DemoExpense = {
  date: string;
  purpose: string;
  amountPaise: number;
  categoryId: number;
  merchant: string;
  paymentMethod: string;
  notes: null;
};

type Template = {
  purposes: string[];
  merchants: string[];
  /** Integer paise range (never floats); amounts step in whole-rupee (100 paise) increments. */
  minPaise: number;
  maxPaise: number;
  /** Chance per day of one expense (ignored when monthlyDay is set). */
  dailyChance: number;
  /** Emit exactly one expense on this day of the month. */
  monthlyDay?: number;
};

const TEMPLATES: Record<string, Template> = {
  Groceries: {
    purposes: ["Weekly groceries", "Vegetables and fruits", "Milk and eggs"],
    merchants: ["BigBasket", "Local market", "DMart"],
    minPaise: 15000,
    maxPaise: 220000,
    dailyChance: 0.3,
  },
  Stationery: {
    purposes: ["Notebooks", "Pens", "Printing"],
    merchants: ["Stationery shop", "Amazon"],
    minPaise: 4000,
    maxPaise: 60000,
    dailyChance: 0.04,
  },
  "Dine out": {
    purposes: ["Lunch", "Dinner with friends", "Coffee"],
    merchants: ["Cafe Coffee Day", "Local restaurant", "Domino's"],
    minPaise: 12000,
    maxPaise: 180000,
    dailyChance: 0.3,
  },
  "Food delivery": {
    purposes: ["Dinner order", "Lunch order", "Late night snack"],
    merchants: ["Swiggy", "Zomato"],
    minPaise: 18000,
    maxPaise: 90000,
    dailyChance: 0.25,
  },
  Books: {
    purposes: ["Novel", "Textbook", "Magazine"],
    merchants: ["Amazon", "Crossword"],
    minPaise: 15000,
    maxPaise: 120000,
    dailyChance: 0.03,
  },
  Internet: {
    purposes: ["Broadband bill"],
    merchants: ["ACT Fibernet", "Airtel Xstream"],
    minPaise: 79900,
    maxPaise: 119900,
    dailyChance: 0,
    monthlyDay: 5,
  },
  "Medical Expenses": {
    purposes: ["Pharmacy", "Doctor consultation", "Lab tests"],
    merchants: ["Apollo Pharmacy", "MedPlus", "City clinic"],
    minPaise: 10000,
    maxPaise: 250000,
    dailyChance: 0.04,
  },
  "Recharge/Bills": {
    purposes: ["Mobile recharge", "Electricity bill", "Water bill"],
    merchants: ["Jio", "BESCOM", "Airtel"],
    minPaise: 19900,
    maxPaise: 220000,
    dailyChance: 0,
    monthlyDay: 12,
  },
  Outing: {
    purposes: ["Movie tickets", "Weekend trip", "Park entry"],
    merchants: ["PVR Cinemas", "BookMyShow", "Amusement park"],
    minPaise: 25000,
    maxPaise: 350000,
    dailyChance: 0.06,
  },
  "Transportation cost": {
    purposes: ["Cab ride", "Metro recharge", "Auto fare", "Fuel"],
    merchants: ["Uber", "Ola", "Namma Metro", "Indian Oil"],
    minPaise: 3000,
    maxPaise: 70000,
    dailyChance: 0.5,
  },
  "Clothing/Accessories": {
    purposes: ["T-shirt", "Shoes", "Watch strap"],
    merchants: ["Myntra", "Zara", "Local store"],
    minPaise: 40000,
    maxPaise: 450000,
    dailyChance: 0.04,
  },
  "Electronic gadgets": {
    purposes: ["Earphones", "Charger", "Phone case"],
    merchants: ["Amazon", "Croma", "Flipkart"],
    minPaise: 35000,
    maxPaise: 600000,
    dailyChance: 0.02,
  },
};

// Used for custom categories that have no dedicated template.
const FALLBACK_TEMPLATE: Template = {
  purposes: ["Miscellaneous"],
  merchants: ["Local shop"],
  minPaise: 5000,
  maxPaise: 80000,
  dailyChance: 0.05,
};

const PAYMENT_METHODS = ["UPI", "UPI", "UPI", "Credit card", "Debit card", "Cash"];

/** Small deterministic PRNG (mulberry32) so demo data is reproducible per seed. */
export function createRng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(items: T[], rng: () => number): T {
  return items[Math.floor(rng() * items.length)];
}

function makeExpense(
  date: string,
  category: DemoCategory,
  template: Template,
  rng: () => number,
): DemoExpense {
  const steps = Math.floor((template.maxPaise - template.minPaise) / 100) + 1;
  // Skew towards smaller amounts so a few big purchases stand out.
  const base = template.minPaise + Math.floor(rng() * rng() * steps) * 100;
  const paise = base + (rng() < 0.3 ? 50 : 0);
  return {
    date,
    purpose: pick(template.purposes, rng),
    amountPaise: paise,
    categoryId: category.id,
    merchant: pick(template.merchants, rng),
    paymentMethod: pick(PAYMENT_METHODS, rng),
    notes: null,
  };
}

/**
 * Generates realistic fake expenses for the `days` days ending at `today`
 * ("YYYY-MM-DD", inclusive). Deterministic for a given seed.
 */
export function generateDemoExpenses(options: {
  today: string;
  days: number;
  seed: number;
  categories: DemoCategory[];
}): DemoExpense[] {
  const { today, days, seed, categories } = options;
  const rng = createRng(seed);
  const result: DemoExpense[] = [];

  for (let offset = days - 1; offset >= 0; offset--) {
    const date = addDays(today, -offset);
    const dayOfMonth = Number(date.slice(8, 10));

    for (const category of categories) {
      const template = Object.hasOwn(TEMPLATES, category.name)
        ? TEMPLATES[category.name]
        : FALLBACK_TEMPLATE;
      const due =
        template.monthlyDay !== undefined
          ? dayOfMonth === template.monthlyDay
          : rng() < template.dailyChance;
      if (due) {
        result.push(makeExpense(date, category, template, rng));
      }
    }
  }

  return result;
}
