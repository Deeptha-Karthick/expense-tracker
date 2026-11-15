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
  /** Rupee range; amounts become integer paise. */
  minRupees: number;
  maxRupees: number;
  /** Chance per day of one expense (ignored when monthlyDay is set). */
  dailyChance: number;
  /** Emit exactly one expense on this day of the month. */
  monthlyDay?: number;
};

const TEMPLATES: Record<string, Template> = {
  Groceries: {
    purposes: ["Weekly groceries", "Vegetables and fruits", "Milk and eggs"],
    merchants: ["BigBasket", "Local market", "DMart"],
    minRupees: 150,
    maxRupees: 2200,
    dailyChance: 0.3,
  },
  Stationery: {
    purposes: ["Notebooks", "Pens", "Printing"],
    merchants: ["Stationery shop", "Amazon"],
    minRupees: 40,
    maxRupees: 600,
    dailyChance: 0.04,
  },
  "Dine out": {
    purposes: ["Lunch", "Dinner with friends", "Coffee"],
    merchants: ["Cafe Coffee Day", "Local restaurant", "Domino's"],
    minRupees: 120,
    maxRupees: 1800,
    dailyChance: 0.3,
  },
  "Food delivery": {
    purposes: ["Dinner order", "Lunch order", "Late night snack"],
    merchants: ["Swiggy", "Zomato"],
    minRupees: 180,
    maxRupees: 900,
    dailyChance: 0.25,
  },
  Books: {
    purposes: ["Novel", "Textbook", "Magazine"],
    merchants: ["Amazon", "Crossword"],
    minRupees: 150,
    maxRupees: 1200,
    dailyChance: 0.03,
  },
  Internet: {
    purposes: ["Broadband bill"],
    merchants: ["ACT Fibernet", "Airtel Xstream"],
    minRupees: 799,
    maxRupees: 1199,
    dailyChance: 0,
    monthlyDay: 5,
  },
  "Medical Expenses": {
    purposes: ["Pharmacy", "Doctor consultation", "Lab tests"],
    merchants: ["Apollo Pharmacy", "MedPlus", "City clinic"],
    minRupees: 100,
    maxRupees: 2500,
    dailyChance: 0.04,
  },
  "Recharge/Bills": {
    purposes: ["Mobile recharge", "Electricity bill", "Water bill"],
    merchants: ["Jio", "BESCOM", "Airtel"],
    minRupees: 199,
    maxRupees: 2200,
    dailyChance: 0,
    monthlyDay: 12,
  },
  Outing: {
    purposes: ["Movie tickets", "Weekend trip", "Park entry"],
    merchants: ["PVR Cinemas", "BookMyShow", "Amusement park"],
    minRupees: 250,
    maxRupees: 3500,
    dailyChance: 0.06,
  },
  "Transportation cost": {
    purposes: ["Cab ride", "Metro recharge", "Auto fare", "Fuel"],
    merchants: ["Uber", "Ola", "Namma Metro", "Indian Oil"],
    minRupees: 30,
    maxRupees: 700,
    dailyChance: 0.5,
  },
  "Clothing/Accessories": {
    purposes: ["T-shirt", "Shoes", "Watch strap"],
    merchants: ["Myntra", "Zara", "Local store"],
    minRupees: 400,
    maxRupees: 4500,
    dailyChance: 0.04,
  },
  "Electronic gadgets": {
    purposes: ["Earphones", "Charger", "Phone case"],
    merchants: ["Amazon", "Croma", "Flipkart"],
    minRupees: 350,
    maxRupees: 6000,
    dailyChance: 0.02,
  },
};

// Used for custom categories that have no dedicated template.
const FALLBACK_TEMPLATE: Template = {
  purposes: ["Miscellaneous"],
  merchants: ["Local shop"],
  minRupees: 50,
  maxRupees: 800,
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
  const span = template.maxRupees - template.minRupees + 1;
  // Skew towards smaller amounts so a few big purchases stand out.
  const rupees = template.minRupees + Math.floor(rng() * rng() * span);
  const paise = rupees * 100 + (rng() < 0.3 ? 50 : 0);
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
      const template = TEMPLATES[category.name] ?? FALLBACK_TEMPLATE;
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
