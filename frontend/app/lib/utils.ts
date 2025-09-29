import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function that combines `clsx` and `tailwind-merge` for ergonomic Tailwind class handling.
 * 1. `clsx` resolves conditional logic, filtering for truthy values before flattening inputs into space-delimited class strings.
 * 2. `twMerge` resolves conflicting Tailwind class strings at runtime (SSR or CSR).
 * @param inputs - Class values including strings, arrays, objects, or conditionals.
 * @returns A conflict-resolved, space-delimited string of class names.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
