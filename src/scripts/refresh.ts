import { loadEnvFile } from "@/lib/env";
loadEnvFile();

async function main() {
  // Import dynamique: en ESM les imports statiques sont evalues avant
  // loadEnvFile(), et db/client.ts fige son URL au chargement du module.
  const { runIngest } = await import("@/lib/ingest");
  const only = process.argv.slice(2).filter((a) => !a.startsWith("-"));
  console.log("→ Ingestion VibeCrypto…", only.length ? `(sources: ${only.join(", ")})` : "(toutes les sources)");
  const result = await runIngest({ only: only.length ? only : undefined });
  console.log(`✓ ${result.inserted}/${result.total} nouveaux articles`);
  for (const [src, r] of Object.entries(result.perSource)) {
    const err = r.error ? `  ⚠ ${r.error}` : "";
    console.log(`  · ${src}: ${r.inserted}/${r.fetched}${err}`);
  }
  const s = result.summary;
  if (s.skippedReason) {
    console.log(`  · résumé auto: désactivé (${s.skippedReason})`);
  } else {
    console.log(`  · résumé auto: ${s.summarized}/${s.candidates} (échecs: ${s.failed})`);
  }
  process.exit(0);
}

main().catch((e) => {
  console.error("✗ Erreur d'ingestion:", e);
  process.exit(1);
});
