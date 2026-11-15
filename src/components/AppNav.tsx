"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Expenses" },
  { href: "/daily", label: "Daily" },
  { href: "/summary", label: "Summary" },
];

export function AppNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Main" className="flex gap-4">
      {LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          aria-current={link.href === pathname ? "page" : undefined}
          className="text-sm font-medium text-zinc-600 hover:text-foreground aria-[current=page]:text-foreground aria-[current=page]:underline aria-[current=page]:underline-offset-4 dark:text-zinc-400"
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
