import { supabase } from "./supabase.js";

export interface UserLeave {
  id?: number;
  user_number: string;
  type: "izin" | "sakit" | "cuti";
  reason: string;
  start_date: string;
  end_date: string;
  days: number;
  status: "pending" | "approved" | "active" | "completed" | "cancelled";
  approved_by?: string | null;
  approved_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

/**
 * Create new leave request
 */
export async function createLeaveRequest(
  leave: Omit<UserLeave, "id" | "created_at" | "updated_at">
): Promise<UserLeave | null> {
  try {
    const { data, error } = await supabase.from("user_leaves").insert(leave).select().single();

    if (error) {
      console.error("❌ Error creating leave request:", error);
      return null;
    }

    console.log(`✅ Leave request created: ${leave.type} for ${leave.days} days`);
    return data as UserLeave;
  } catch (error) {
    console.error("❌ Unexpected error creating leave request:", error);
    return null;
  }
}

/**
 * Get active leave for user (currently on leave)
 */
export async function getActiveLeave(userNumber: string): Promise<UserLeave | null> {
  try {
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

    const { data, error } = await supabase
      .from("user_leaves")
      .select("*")
      .eq("user_number", userNumber)
      .eq("status", "active")
      .lte("start_date", today)
      .gte("end_date", today)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // No rows found
        return null;
      }
      console.error("❌ Error getting active leave:", error);
      return null;
    }

    return data as UserLeave;
  } catch (error) {
    console.error("❌ Unexpected error getting active leave:", error);
    return null;
  }
}

/**
 * Get all leaves for a user
 */
export async function getUserLeaves(userNumber: string, limit: number = 10): Promise<UserLeave[]> {
  try {
    const { data, error } = await supabase
      .from("user_leaves")
      .select("*")
      .eq("user_number", userNumber)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("❌ Error getting user leaves:", error);
      return [];
    }

    return (data || []) as UserLeave[];
  } catch (error) {
    console.error("❌ Unexpected error getting user leaves:", error);
    return [];
  }
}

/**
 * Update leave status
 */
export async function updateLeaveStatus(
  leaveId: number,
  status: UserLeave["status"],
  approvedBy?: string
): Promise<boolean> {
  try {
    const updateData: any = { status };

    if (approvedBy && status === "approved") {
      updateData.approved_by = approvedBy;
      updateData.approved_at = new Date().toISOString();
    }

    const { error } = await supabase.from("user_leaves").update(updateData).eq("id", leaveId);

    if (error) {
      console.error("❌ Error updating leave status:", error);
      return false;
    }

    console.log(`✅ Leave ${leaveId} status updated to: ${status}`);
    return true;
  } catch (error) {
    console.error("❌ Unexpected error updating leave status:", error);
    return false;
  }
}

/**
 * Cancel leave request
 */
export async function cancelLeave(leaveId: number, userNumber: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("user_leaves")
      .update({ status: "cancelled" })
      .eq("id", leaveId)
      .eq("user_number", userNumber);

    if (error) {
      console.error("❌ Error cancelling leave:", error);
      return false;
    }

    console.log(`✅ Leave ${leaveId} cancelled`);
    return true;
  } catch (error) {
    console.error("❌ Unexpected error cancelling leave:", error);
    return false;
  }
}

/**
 * Mark completed leaves (past end_date) as completed
 * Should be run daily by scheduler
 */
export async function markCompletedLeaves(): Promise<void> {
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    const { error } = await supabase
      .from("user_leaves")
      .update({ status: "completed" })
      .eq("status", "active")
      .lt("end_date", yesterdayStr);

    if (error) {
      console.error("❌ Error marking completed leaves:", error);
      return;
    }

    console.log("✅ Completed leaves marked");
  } catch (error) {
    console.error("❌ Unexpected error marking completed leaves:", error);
  }
}

/**
 * Get leave statistics for a user
 */
export async function getLeaveStats(
  userNumber: string,
  year?: number
): Promise<{
  izin: { count: number; days: number };
  sakit: { count: number; days: number };
  cuti: { count: number; days: number };
  total: { count: number; days: number };
}> {
  try {
    const currentYear = year || new Date().getFullYear();
    const startDate = `${currentYear}-01-01`;
    const endDate = `${currentYear}-12-31`;

    const { data, error } = await supabase
      .from("user_leaves")
      .select("type, days")
      .eq("user_number", userNumber)
      .gte("start_date", startDate)
      .lte("start_date", endDate)
      .in("status", ["approved", "active", "completed"]);

    if (error) {
      console.error("❌ Error getting leave stats:", error);
      return {
        izin: { count: 0, days: 0 },
        sakit: { count: 0, days: 0 },
        cuti: { count: 0, days: 0 },
        total: { count: 0, days: 0 },
      };
    }

    const leaves = data || [];
    const stats = {
      izin: { count: 0, days: 0 },
      sakit: { count: 0, days: 0 },
      cuti: { count: 0, days: 0 },
      total: { count: leaves.length, days: 0 },
    };

    leaves.forEach((leave: any) => {
      const leaveType = leave.type as "izin" | "sakit" | "cuti";
      stats[leaveType].count++;
      stats[leaveType].days += leave.days;
      stats.total.days += leave.days;
    });

    return stats;
  } catch (error) {
    console.error("❌ Unexpected error getting leave stats:", error);
    return {
      izin: { count: 0, days: 0 },
      sakit: { count: 0, days: 0 },
      cuti: { count: 0, days: 0 },
      total: { count: 0, days: 0 },
    };
  }
}

/**
 * Get all active leaves (for admin view)
 */
export async function getAllActiveLeaves(): Promise<UserLeave[]> {
  try {
    const today = new Date().toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("user_leaves")
      .select("*")
      .eq("status", "active")
      .lte("start_date", today)
      .gte("end_date", today)
      .order("start_date", { ascending: true });

    if (error) {
      console.error("❌ Error getting all active leaves:", error);
      return [];
    }

    return (data || []) as UserLeave[];
  } catch (error) {
    console.error("❌ Unexpected error getting all active leaves:", error);
    return [];
  }
}
