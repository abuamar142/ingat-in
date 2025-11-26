import express, { Request, Response } from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { createServer } from "http";
import { Server } from "socket.io";
import { loadUsers } from "../utils/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Helper function to get stats
function getStats() {
  const users = loadUsers();
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
      percentage: totalUsers > 0 ? Math.round((absenPagiCount / totalUsers) * 100) : 0,
    },
    absenSore: {
      sudah: absenSoreCount,
      belum: belumAbsenSore,
      percentage: totalUsers > 0 ? Math.round((absenSoreCount / totalUsers) * 100) : 0,
    },
  };
}

// API Routes
app.get("/api/users", (_req: Request, res: Response) => {
  try {
    const users = loadUsers();
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

app.get("/api/stats", (_req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      data: getStats(),
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

// Socket.IO connection
io.on("connection", (socket) => {
  console.log(`📱 Client connected: ${socket.id}`);

  // Send initial data
  socket.emit("stats", getStats());
  socket.emit("users", loadUsers());

  socket.on("disconnect", () => {
    console.log(`📴 Client disconnected: ${socket.id}`);
  });
});

// Broadcast data changes to all connected clients
export function broadcastUpdate(): void {
  io.emit("stats", getStats());
  io.emit("users", loadUsers());
}

export function startWebServer(): void {
  httpServer.listen(PORT, () => {
    console.log(`\n🌐 Dashboard berjalan di: http://localhost:${PORT}`);
    console.log(`📊 API endpoint: http://localhost:${PORT}/api/users`);
    console.log(`🔌 WebSocket ready for real-time updates\n`);
  });
}
