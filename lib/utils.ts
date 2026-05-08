import { clsx, type ClassValue } from "clsx";
import {
  addYears,
  differenceInCalendarDays,
  format,
  isBefore,
  parseISO,
  startOfDay,
} from "date-fns";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getTimeOfDayGreeting(now = new Date()) {
  const h = now.getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export function formatEventDate(dateISO: string) {
  try {
    return format(parseISO(dateISO), "MMM d, yyyy");
  } catch {
    return dateISO;
  }
}

export function nextOccurrenceDate(dateISO: string, isRecurring: boolean) {
  const today = startOfDay(new Date());
  const base = startOfDay(parseISO(dateISO));
  if (!isRecurring) return base;

  const thisYear = new Date(today.getFullYear(), base.getMonth(), base.getDate());
  const thisYearDay = startOfDay(thisYear);
  if (!isBefore(thisYearDay, today)) return thisYearDay;
  return startOfDay(addYears(thisYearDay, 1));
}

export function daysUntil(date: Date, from = new Date()) {
  return differenceInCalendarDays(startOfDay(date), startOfDay(from));
}

