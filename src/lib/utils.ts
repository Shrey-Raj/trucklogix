import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function parsePythonString<T = any>(input: string): T {
  let s = input.trim();

  if (
    (s.startsWith(`"`) && s.endsWith(`"`)) ||
    (s.startsWith(`'`) && s.endsWith(`'`))
  ) {
    s = s.slice(1, -1);
  }

  s = s
    .replace(/\bNone\b/g, "null")
    .replace(/\bTrue\b/g, "true")
    .replace(/\bFalse\b/g, "false");

  s = s.replace(/([{\s,])'([^']+)'\s*:/g, `$1"$2":`);

  s = s.replace(/:\s*'([^']*)'/g, `: "$1"`);

  return JSON.parse(s) as T;
}