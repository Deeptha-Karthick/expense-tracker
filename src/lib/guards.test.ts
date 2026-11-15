import { assertNotProduction } from "@/lib/guards";

describe("assertNotProduction", () => {
  it("throws in production", () => {
    expect(() => assertNotProduction({ NODE_ENV: "production" })).toThrow(
      /production/,
    );
  });

  it.each(["development", "test", undefined])("allows %s", (env) => {
    expect(() => assertNotProduction({ NODE_ENV: env })).not.toThrow();
  });

  it("reads process.env by default", () => {
    // Vitest runs with NODE_ENV=test.
    expect(() => assertNotProduction()).not.toThrow();
  });
});
