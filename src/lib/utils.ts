import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XAF",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function generateTransactionId(): string {
  return `TXN_${Date.now()}_${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
}

export function calculateDailyReturn(
  amount: number,
  dailyRate: number,
): number {
  return (amount * dailyRate) / 100;
}

export function calculateTotalReturn(
  amount: number,
  dailyRate: number,
  duration: number,
): number {
  return calculateDailyReturn(amount, dailyRate) * duration;
}
