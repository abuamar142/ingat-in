import { ADMIN_NUMBERS } from "../constants/constants.js";

/**
 * Check if a phone number is an admin
 */
export function isAdmin(number: string): boolean {
  return ADMIN_NUMBERS.includes(number);
}
