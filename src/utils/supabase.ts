import { createClient, SupabaseClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Define the User type matching our database schema
export interface User {
  id?: string;
  number: string;
  absen_pagi: boolean;
  absen_sore: boolean;
  last_checkin?: string | null;
  created_at?: string;
  updated_at?: string;
}

// Validate environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "❌ Error: SUPABASE_URL and SUPABASE_ANON_KEY must be set in .env file",
  );
  console.error(
    "📝 Please copy .env.example to .env and fill in your Supabase credentials",
  );
  process.exit(1);
}

// Create Supabase client
export const supabase: SupabaseClient = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: false, // We don't need auth sessions for this bot
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  },
);

// Test connection on startup
export async function testSupabaseConnection(): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("users")
      .select("count", { count: "exact", head: true });

    if (error) {
      console.error("❌ Supabase connection failed:", error.message);
      return false;
    }

    console.log("✅ Supabase connection successful");
    return true;
  } catch (error) {
    console.error("❌ Supabase connection error:", error);
    return false;
  }
}
