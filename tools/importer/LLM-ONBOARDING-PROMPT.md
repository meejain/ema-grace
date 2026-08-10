# LLM Onboarding Prompt — grace.com → EDS migration

Paste the block below **verbatim** into a fresh session to bring a new LLM up to speed on how to run
the importer and how to create backup sets. Fill in `<FAMILY>` with the page family to migrate
(e.g. `about-grace leadership bios`, `campaign`, `industries`). Everything it needs to know lives in
`tools/importer/MIGRATION-PLAYBOOK.md`; this prompt just points there and encodes the non-negotiables.

---

```
You are continuing the migration of grace.com → AEM Edge Delivery Services (EDS) in this repo
(meejain/ema-grace). Before doing anything, get fully oriented:

1. READ, in full, `tools/importer/MIGRATION-PLAYBOOK.md`. It is the single source of truth.
   Start with its "START HERE" block, then §0 mental model → §1 architecture → §2 principles →
   §3 the per-family loop → §4/§4a validation → §5 scope + per-template recipes → §6 commands →
   §7 backups. Then skim the companion docs in the same folder: MASTER-IMPORTER-STRATEGY.md,
   component-library.json (the block catalog), block-intelligence.json, MIGRATED-PAGES.tsv,
   and backups/README.md.
2. READ the memory notes the playbook lists (kebab-case slugs) — they hold the deep detail behind
   each recipe (esp. product-detail-template, products-hydration-fix, authored-option-and-emits,
   block-intelligence-and-richest-rep, visual-parity-completion-standard, importer-bundle-backups).

Hard rules you must follow (from the playbook — do not deviate):
- ONE master importer → ONE live bundle serves ALL templates via page-type dispatch. Editing any
  centralized source (import-grace-master.js / component-library.json / parsers/ / transformers/)
  rebundles for EVERY family, so a change for one set can silently regress another. Prove no
  regression after any source edit.
- Reuse ladder: authored OPTION ▸ VARIANT ▸ new block. Prefer authored options over JS heuristics.
- Styling/decoration fixes belong in RUNTIME files (blocks/*, templates/{name}/*, scripts.js) — no
  reimport. Structure/naming/selection fixes belong in the IMPORTER — rebundle + reimport. Keep
  template-specific behavior in templates/{name}/{name}.{js,css}, NOT in global scripts.js/styles.css.
- Never claim a set "done" without the §4a visual-parity gate: 3+ full-page side-by-side screenshots,
  migrated (localhost:3000) vs LIVE grace.com, region by region.
- Content is git-ignored and served from Document Authoring (DA), not the repo. "Migrated + validated
  locally" ≠ published. NEVER upload/publish to DA without my explicit go-ahead.

How to RUN the importer (from §6):
- Edit centralized sources under tools/importer/. If component-library.json changed:
  `python3 tools/importer/gen-catalog-module.py`
- Rebundle:
  `bash /home/node/.excat-marketplaces/excat-marketplace/excat/skills/excat-content-import/scripts/aem-import-bundle.sh --importjs tools/importer/import-grace-master.js`
  Then verify your new logic is actually in the bundle (grep it; esbuild strips comments).
- Import a 1–2 page sample first:
  `WORKSPACE_PATH=/workspace/current node <runner>/run-bulk-import.js --import-script tools/importer/import-grace-master.bundle.js --urls <urls.txt>`
- Run the §4a visual gate on the sample → fix → then import the rest IN BATCHES OF ~5 (a large run
  can time out ~10 min, and a JS-hydrated page can serialize EMPTY under load). After each batch,
  AUDIT byte size + section count and reimport any tiny/empty page.
- Quality gate before "done": `npm run lint` · `node tools/quality/breakpoint-check.mjs` ·
  `npm run test:a11y <localhost url>` · confirm visually at localhost:3000. Paste the actual output.

How to CREATE a backup set when a family is COMPLETE (from §7 — do this every time):
- Snapshot to `tools/importer/backups/<set>/` (one folder per completed set):
  1. `cp tools/importer/import-grace-master.bundle.js tools/importer/backups/<set>/import-grace-master.bundle.js`
     — the frozen, self-contained bundle that produced the set (catalog/parsers/transformers are
     inlined; it's the only file needed to re-run that set's import). First confirm the live bundle
     is byte-identical to what produced the set and contains that set's fixes (grep).
  2. `tools/importer/backups/<set>/urls.txt` — the set's exact source URLs (pull from the report
     JSONs in tools/importer/reports/<set>/ so casing matches).
  3. `tools/importer/backups/<set>/MANIFEST.md` — provenance (git sha or "working tree"), the delta
     over the previous set's bundle, which fixes are RUNTIME (in blocks/templates — NOT in the
     bundle), page count, known gaps, and snapshot date. Match the format of the existing
     insights/newsroom/products MANIFESTs.
- Update the playbook §7 "Snapshotted so far" line to include the new set.
- NEVER duplicate sources into backup folders and never gather sources from a backup — sources stay
  centralized; backups hold only the frozen bundle + urls + manifest.
- These backups are the rollback net; the live bundle is overwritten on every rebundle. To recover an
  older set's exact bundle, use backups/<set>/ or `git show <sha>:tools/importer/import-grace-master.bundle.js`.
- To reproduce/rollback a set: run the runner with
  `--import-script tools/importer/backups/<set>/import-grace-master.bundle.js --urls tools/importer/backups/<set>/urls.txt`

Task: migrate the `<FAMILY>` pages following the §3 per-family loop — cluster by RENDERED template,
pick the richest representative BY LOOKING (block-intelligence is a hint, not a ranker), derive the
section→block contract from that page's rendered DOM, extend the importer (reuse ladder), rebundle,
sample-import, run the §4a visual gate, then batch-import the rest and audit. When the family is
complete and gated, CREATE its backup set as above. Show me the quality-gate output and the
side-by-side screenshots before you claim done. Do not publish to DA without my go-ahead.
```

---

## Notes for the human using this

- **Where:** `tools/importer/LLM-ONBOARDING-PROMPT.md` (this file). The playbook it references is
  `tools/importer/MIGRATION-PLAYBOOK.md`.
- **How:** open a new session, paste the fenced block above, replace `<FAMILY>`. The LLM will read
  the playbook + memory notes first, then run the per-family loop and create the backup set.
- **Completed sets (already done + backed up):** insights (165), newsroom (28), products (34 = 28
  detail + 6 hubs). Next recommended: about-grace leadership bios → campaign → industries (last) →
  forms (Adaptive Forms pass). See playbook §5 for the full scope table + status.
- Keep this prompt in sync with the playbook's "START HERE" block if the process changes.
```
