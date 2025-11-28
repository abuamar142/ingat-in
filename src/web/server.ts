import express, { Request, Response } from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { loadUsers } from "../utils/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Helper function to get stats
async function getStats() {
  const users = await loadUsers();
  const totalUsers = users.length;
  const absenPagiCount = users.filter((u) => u.absen_pagi).length;
  const absenSoreCount = users.filter((u) => u.absen_sore).length;
  const belumAbsenPagi = totalUsers - absenPagiCount;
  const belumAbsenSore = totalUsers - absenSoreCount;

  return {
    totalUsers,
    absenPagi: {
      sudah: absenPagiCount,
      belum: belumAbsenPagi,
      percentage:
        totalUsers > 0 ? Math.round((absenPagiCount / totalUsers) * 100) : 0,
    },
    absenSore: {
      sudah: absenSoreCount,
      belum: belumAbsenSore,
      percentage:
        totalUsers > 0 ? Math.round((absenSoreCount / totalUsers) * 100) : 0,
    },
  };
}

// API Routes
app.get("/api/config", (_req: Request, res: Response) => {
  // Serve Supabase config for frontend
  res.json({
    supabaseUrl: process.env.SUPABASE_URL || "",
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY || "",
  });
});

app.get("/api/users", async (_req: Request, res: Response) => {
  try {
    const users = await loadUsers();
    res.json({
      success: true,
      total: users.length,
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to load users",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

app.get("/api/stats", async (_req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      data: await getStats(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to load stats",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Serve dashboard
app.get("/", (_req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

export function startWebServer(): void {
  app.listen(PORT, () => {
    console.log(`\n🌐 Dashboard berjalan di: http://localhost:${PORT}`);
    console.log(`📊 API endpoint: http://localhost:${PORT}/api/users`);
    console.log(`📡 Supabase realtime enabled (client-side subscription)\n`);
  });
}
