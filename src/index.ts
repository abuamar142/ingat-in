import { startBot } from "./bot/bayley.js";
import { startCron } from "./scheduler/cron.js";
import { testSupabaseConnection } from "./utils/supabase.js";

// Test Supabase connection before starting
console.log("🔍 Testing Supabase connection...");
testSupabaseConnection().then((success) => {
  if (!success) {
    console.error("⚠️ Warning: Supabase connection failed. Please check your .env configuration.");
    console.error("📝 Make sure SUPABASE_URL and SUPABASE_ANON_KEY are set correctly.");
    process.exit(1);
  }

  console.log("✅ Supabase connection successful");
  console.log("🤖 Starting WhatsApp bot...\n");

  // Start WhatsApp bot
  startBot().then((sock) => {
    console.log("✅ Bot berjalan...");
    startCron(sock);
  });
});
