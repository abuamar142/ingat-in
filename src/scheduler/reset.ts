import { supabase } from "../utils/supabase.js";

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
