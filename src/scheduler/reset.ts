import { loadUsers, saveUsers } from "../utils/db.js";

/**
 * Reset status absen pagi untuk semua user
 */
export function resetAbsenPagi(): void {
  const users = loadUsers();
  users.forEach((user) => {
    user.absen_pagi = false;
  });
  saveUsers(users);
  console.log(`🔄 Reset absen pagi untuk ${users.length} user`);
}

/**
 * Reset status absen sore untuk semua user
 */
export function resetAbsenSore(): void {
  const users = loadUsers();
  users.forEach((user) => {
    user.absen_sore = false;
  });
  saveUsers(users);
  console.log(`🔄 Reset absen sore untuk ${users.length} user`);
}

/**
 * Reset semua status absen (pagi dan sore)
 */
export function resetAllAbsen(): void {
  const users = loadUsers();
  users.forEach((user) => {
    user.absen_pagi = false;
    user.absen_sore = false;
  });
  saveUsers(users);
  console.log(`🔄 Reset semua absen untuk ${users.length} user`);
}
