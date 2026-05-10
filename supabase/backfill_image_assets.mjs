import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BATCH_SIZE = Number(process.env.BACKFILL_BATCH_SIZE ?? 100);

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before running backfill.");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const TABLES = [
  { table: "resources", entityType: "resource" },
  { table: "events", entityType: "event" },
  { table: "resource_submissions", entityType: "resource_submission" },
  { table: "event_submissions", entityType: "event_submission" },
];

async function ingest(sourceUrl, entityType) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000); // 30s timeout
  
  try {
    const { data, error } = await supabase.functions.invoke("ingest-external-image", {
      body: {
        sourceUrl,
        entityType,
      },
    });

    if (error) {
      console.error(`      Edge Function error:`, JSON.stringify(error));
      throw new Error(error.message || "Function invocation failed.");
    }

    if (!data?.assetPath) {
      console.error(`      Missing assetPath in response:`, JSON.stringify(data));
      throw new Error("Function response missing assetPath.");
    }

    return data.assetPath;
  } finally {
    clearTimeout(timeout);
  }
}

async function processTable(table, entityType, failures) {
  const stats = {
    table,
    attempted: 0,
    succeeded: 0,
    failed: 0,
  };

  while (true) {
    const { data, error } = await supabase
      .from(table)
      .select("id, image_url")
      .not("image_url", "is", null)
      .is("image_asset_path", null)
      .order("id", { ascending: true })
      .limit(BATCH_SIZE);

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      break;
    }

    // Process rows in parallel batches (max 5 concurrent)
    const CONCURRENT_LIMIT = 5;
    for (let i = 0; i < data.length; i += CONCURRENT_LIMIT) {
      const batch = data.slice(i, i + CONCURRENT_LIMIT);
      console.log(`  Processing batch: IDs ${batch.map(r => r.id).join(", ")}`);
      await Promise.all(
        batch.map(async (row) => {
          stats.attempted += 1;
          try {
            const assetPath = await ingest(row.image_url, entityType);
            const { error: updateError } = await supabase
              .from(table)
              .update({ image_asset_path: assetPath })
              .eq("id", row.id);

            if (updateError) {
              throw updateError;
            }
            stats.succeeded += 1;
            console.log(`    ✓ ID ${row.id} updated`);
          } catch (error) {
            stats.failed += 1;
            const errorMsg = error instanceof Error ? error.message : String(error);
            console.log(`    ✗ ID ${row.id} failed: ${errorMsg}`);
            failures.push({
              table,
              id: row.id,
              image_url: row.image_url,
              error: errorMsg,
            });
          }
        })
      );
    }
  }

  return stats;
}

async function run() {
  const startedAt = new Date().toISOString();
  const failures = [];
  const tableStats = [];

  for (const { table, entityType } of TABLES) {
    // eslint-disable-next-line no-console
    console.log(`Backfilling ${table}...`);
    const stats = await processTable(table, entityType, failures);
    tableStats.push(stats);
    // eslint-disable-next-line no-console
    console.log(`Done ${table}: ${stats.succeeded}/${stats.attempted} updated`);
  }

  const report = {
    startedAt,
    finishedAt: new Date().toISOString(),
    batchSize: BATCH_SIZE,
    totals: {
      attempted: tableStats.reduce((sum, item) => sum + item.attempted, 0),
      succeeded: tableStats.reduce((sum, item) => sum + item.succeeded, 0),
      failed: tableStats.reduce((sum, item) => sum + item.failed, 0),
    },
    tables: tableStats,
    failures,
  };

  const reportPath = path.resolve(process.cwd(), "supabase", "backfill_image_assets_report.json");
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  // eslint-disable-next-line no-console
  console.log(`Backfill complete. Report written to ${reportPath}`);
}

run().catch((error) => {
  // eslint-disable-next-line no-console
  console.error("Backfill failed:", error);
  process.exitCode = 1;
});

