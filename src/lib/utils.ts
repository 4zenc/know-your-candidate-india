import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Formats a ₹ lakh amount as lakh / crore using the Indian numbering system. */
export function formatINR(lakh: number): string {
  if (Math.abs(lakh) >= 100) {
    return `₹${(lakh / 100).toLocaleString("en-IN", { maximumFractionDigits: 2 })} Cr`;
  }
  return `₹${lakh.toLocaleString("en-IN", { maximumFractionDigits: 2 })} L`;
}

export const formatNumber = (n: number) => n.toLocaleString("en-IN");
