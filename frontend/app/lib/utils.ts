import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function that combines `clsx` and `twMerge` for optimized Tailwind CSS class name handling.
 *   1. `clsx` resolves any conditional logic to build a singular, space-delimited class string from the inputs.
 *   2. `twMerge` deduplicates any conflicting Tailwind CSS utility classes at build time (before reaching the DOM).
 * @param inputs - Class values including strings, arrays, objects, or conditionals.
 * @returns A deduplicated, space-delimited string of class names.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}