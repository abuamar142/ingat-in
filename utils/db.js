import fs from "fs";

const FILE = "./data/users.json";

export function loadUsers() {
  if (!fs.existsSync(FILE)) return [];
  return JSON.parse(fs.readFileSync(FILE));
}

export function saveUsers(data) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

export function addUser(number) {
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

export function updateUser(number, update) {
  const users = loadUsers();
  const idx = users.findIndex((u) => u.number === number);
  if (idx >= 0) {
    users[idx] = { ...users[idx], ...update };
    saveUsers(users);
  }
}
