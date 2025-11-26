import fs from "fs";
import type { User } from "../types/index.js";

const FILE = "./data/users.json";

export function loadUsers(): User[] {
  if (!fs.existsSync(FILE)) return [];
  const content = fs.readFileSync(FILE, "utf-8");
  if (!content.trim()) return [];
  return JSON.parse(content) as User[];
}

export function saveUsers(data: User[]): void {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

export function addUser(number: string): void {
  const users = loadUsers();
  if (!users.find((u) => u.number === number)) {
    users.push({
      number,
      absen_pagi: false,
      absen_sore: false,
      last_checkin: null,
    });
    saveUsers(users);
  }
}

export function updateUser(number: string, update: Partial<User>): void {
  const users = loadUsers();
  const idx = users.findIndex((u) => u.number === number);
  if (idx >= 0) {
    users[idx] = { ...users[idx], ...update };
    saveUsers(users);
  }
}
