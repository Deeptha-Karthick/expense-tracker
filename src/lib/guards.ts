/** Throws when running in production. Used to protect demo/destructive scripts. */
export function assertNotProduction(
  env: { NODE_ENV?: string } = process.env,
): void {
  if (env.NODE_ENV === "production") {
    throw new Error("Refusing to run: NODE_ENV is production");
  }
}
