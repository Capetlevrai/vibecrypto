import { loadEnvFile } from "@/lib/env";
loadEnvFile();

import { runIngest } from "@/lib/ingest";

async function main() {
  const only = process.argv.slice(2).filter((a) => !a.startsWith("-"));
  console.log("→ Ingestion VibeCrypto…", only.length ? `(sources: ${only.join(", ")})` : "(toutes les sources)");
  const result = await runIngest({ only: only.length ? only : undefined });
  console.log(`✓ ${result.inserted}/${result.total} nouveaux articles`);
  for (const [src, r] of Object.entries(result.perSource)) {
    const err = r.error ? `  ⚠ ${r.error}` : "";
    console.log(`  · ${src}: ${r.inserted}/${r.fetched}${err}`);
  }
  process.exit(0);
}

main().catch((e) => {
  console.error("✗ Erreur d'ingestion:", e);
  process.exit(1);
});
