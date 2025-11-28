import { supabase } from "../utils/supabase.js";

/**
 * Reset status absen pagi untuk semua user
 */
export async function resetAbsenPagi(): Promise<void> {
  try {
    const { error } = await supabase
      .from("users")
      .update({ absen_pagi: false })
      .neq("number", ""); // Update all records

    if (error) {
      console.error("❌ Error resetting absen pagi:", error);
      return;
    }

    const { count } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true });

    console.log(`🔄 Reset absen pagi untuk ${count || 0} user`);
  } catch (error) {
    console.error("❌ Unexpected error resetting absen pagi:", error);
  }
}

/**
 * Reset status absen sore untuk semua user
 */
export async function resetAbsenSore(): Promise<void> {
  try {
    const { error } = await supabase
      .from("users")
      .update({ absen_sore: false })
      .neq("number", ""); // Update all records

    if (error) {
      console.error("❌ Error resetting absen sore:", error);
      return;
    }

    const { count } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true });

    console.log(`🔄 Reset absen sore untuk ${count || 0} user`);
  } catch (error) {
    console.error("❌ Unexpected error resetting absen sore:", error);
  }
}

/**
 * Reset semua status absen (pagi dan sore)
 */
export async function resetAllAbsen(): Promise<void> {
  try {
    const { error } = await supabase
      .from("users")
      .update({
        absen_pagi: false,
        absen_sore: false,
      })
      .neq("number", ""); // Update all records

    if (error) {
      console.error("❌ Error resetting all absen:", error);
      return;
    }

    const { count } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true });

    console.log(`🔄 Reset semua absen untuk ${count || 0} user`);
  } catch (error) {
    console.error("❌ Unexpected error resetting all absen:", error);
  }
}
