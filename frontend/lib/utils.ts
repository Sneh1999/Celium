import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateRandomDigits(length: number) {
  let result = "";
  const characters = "0123456789";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

export function getRelativeTimeString(date: Date) {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

  if (seconds < 60) {
    return "a few seconds ago";
  }

  if (seconds < 60 * 60) {
    return `${Math.floor(seconds / 60)} minutes ago`;
  }

  if (seconds < 60 * 60 * 24) {
    return `${Math.floor(seconds / (60 * 60))} hours ago`;
  }

  if (seconds < 60 * 60 * 24 * 7) {
    return `${Math.floor(seconds / (60 * 60 * 24))} days ago`;
  }

  if (seconds < 60 * 60 * 24 * 30) {
    return `${Math.floor(seconds / (60 * 60 * 24 * 7))} weeks ago`;
  }

  return `${Math.floor(seconds / (60 * 60 * 24 * 30))} months ago`;
}
