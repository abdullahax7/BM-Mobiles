import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return `PKR ${amount.toFixed(2)}`
}

export function formatCurrencyInteger(amount: number): string {
  return `PKR ${amount.toFixed(0)}`
}
