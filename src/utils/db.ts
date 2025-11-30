import { supabase, User as SupabaseUser } from "./supabase.js";
import type { User } from "../types/index.js";

// Load all users from Supabase
export async function loadUsers(): Promise<User[]> {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Error loading users from Supabase:", error);
      return [];
    }

    // Map Supabase user format to our User type
    return (data || []).map((user: SupabaseUser) => ({
      number: user.number,
      name: user.name,
      absen_pagi: user.absen_pagi,
      absen_sore: user.absen_sore,
      last_checkin: user.last_checkin || null,
      suspend_until: user.suspend_until || null,
    }));
  } catch (error) {
    console.error("❌ Unexpected error loading users:", error);
    return [];
  }
}

// Is user exists in Supabase
export async function isUserExists(number: string): Promise<User | null> {
  try {
    const { data, error } = await supabase.from("users").select("*").eq("number", number).single();

    if (error) {
      if (error.code === "PGRST116") {
        // No rows found
        return null;
      }
      console.error("❌ Error checking user existence in Supabase:", error);
      return null;
    }

    return data as User;
  } catch (error) {
    console.error("❌ Unexpected error checking user existence:", error);
    return null;
  }
}

// Add a new user to Supabase
export async function addUser(number: string): Promise<void> {
  try {
    // Check if user already exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("number")
      .eq("number", number)
      .single();

    if (existingUser) {
      console.log(`ℹ️ User ${number} already exists`);
      return;
    }

    // Insert new user
    const { error } = await supabase.from("users").insert({
      number,
      absen_pagi: false,
      absen_sore: false,
      last_checkin: null,
    });

    if (error) {
      console.error("❌ Error adding user to Supabase:", error);
      return;
    }

    console.log(`✅ User ${number} added to Supabase`);
  } catch (error) {
    console.error("❌ Unexpected error adding user:", error);
  }
}

// Update an existing user in Supabase
export async function updateUser(number: string, update: Partial<User>): Promise<void> {
  try {
    const { error } = await supabase
      .from("users")
      .update({
        ...update,
        updated_at: new Date().toISOString(),
      })
      .eq("number", number);

    if (error) {
      console.error("❌ Error updating user in Supabase:", error);
      return;
    }

    console.log(`✅ User ${number} updated in Supabase`);
  } catch (error) {
    console.error("❌ Unexpected error updating user:", error);
  }
}

// Reset all users' attendance (for daily reset)
export async function resetAllUsers(): Promise<void> {
  try {
    const { error } = await supabase
      .from("users")
      .update({
        absen_pagi: false,
        absen_sore: false,
      })
      .neq("number", ""); // Update all records

    if (error) {
      console.error("❌ Error resetting users in Supabase:", error);
      return;
    }

    console.log("✅ All users reset in Supabase");
  } catch (error) {
    console.error("❌ Unexpected error resetting users:", error);
  }
}
