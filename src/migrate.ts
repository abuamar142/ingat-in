import { supabase } from "./utils/supabase.js";
import fs from "fs";
import path from "path";

/**
 * Script untuk migrasi data dari users.json lokal ke Supabase
 *
 * Cara pakai:
 * 1. Pastikan .env sudah terisi dengan credentials Supabase
 * 2. Jalankan: npm run migrate
 *
 * Script ini akan:
 * - Membaca data dari data/users.json
 * - Upload ke Supabase
 * - Backup file lokal ke backups/users-backup-[timestamp].json
 */

interface LocalUser {
  number: string;
  absen_pagi: boolean;
  absen_sore: boolean;
  last_checkin: string | null;
}

async function migrateData() {
  console.log("🚀 Starting migration from local JSON to Supabase...\n");

  // 1. Check if local file exists
  const localFile = path.join(process.cwd(), "data", "users.json");

  if (!fs.existsSync(localFile)) {
    console.log("ℹ️ No local users.json found. Nothing to migrate.");
    return;
  }

  // 2. Read local data
  console.log("📖 Reading local users.json...");
  const fileContent = fs.readFileSync(localFile, "utf-8");

  if (!fileContent.trim()) {
    console.log("ℹ️ Local users.json is empty. Nothing to migrate.");
    return;
  }

  const localUsers: LocalUser[] = JSON.parse(fileContent);
  console.log(`   Found ${localUsers.length} users in local file\n`);

  if (localUsers.length === 0) {
    console.log("ℹ️ No users to migrate.");
    return;
  }

  // 3. Migrate to Supabase
  console.log("📤 Uploading to Supabase...");
  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  for (const user of localUsers) {
    try {
      // Check if user already exists
      const { data: existing } = await supabase
        .from("users")
        .select("number")
        .eq("number", user.number)
        .single();

      if (existing) {
        console.log(`   ⏭️  Skipped: ${user.number} (already exists)`);
        skipCount++;
        continue;
      }

      // Insert new user
      const { error } = await supabase.from("users").insert({
        number: user.number,
        absen_pagi: user.absen_pagi,
        absen_sore: user.absen_sore,
        last_checkin: user.last_checkin,
      });

      if (error) {
        console.error(`   ❌ Error: ${user.number} - ${error.message}`);
        errorCount++;
      } else {
        console.log(`   ✅ Migrated: ${user.number}`);
        successCount++;
      }
    } catch (error) {
      console.error(`   ❌ Unexpected error: ${user.number}`, error);
      errorCount++;
    }
  }

  console.log("\n📊 Migration Summary:");
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ⏭️  Skipped: ${skipCount}`);
  console.log(`   ❌ Errors: ${errorCount}`);
  console.log(`   📝 Total: ${localUsers.length}\n`);

  // 4. Backup local file
  if (successCount > 0) {
    const backupDir = path.join(process.cwd(), "backups");
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupFile = path.join(backupDir, `users-backup-${timestamp}.json`);

    fs.copyFileSync(localFile, backupFile);
    console.log(`💾 Backup created: ${backupFile}`);
    console.log(`   Original file kept at: ${localFile}\n`);
  }

  console.log("✨ Migration completed!\n");
  console.log("Next steps:");
  console.log("1. Verify data at: https://supabase.com/dashboard");
  console.log("2. Test the bot and dashboard");
  console.log("3. Once verified, you can safely delete data/users.json");
  console.log("   (Backups are kept in backups/ folder)\n");
}

// Run migration
migrateData()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Migration failed:", error);
    process.exit(1);
  });
