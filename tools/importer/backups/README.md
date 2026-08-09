# Importer bundle backups

Frozen, self-contained `import-grace-master.bundle.js` snapshots — ONE per completed page set.
These are read-only rollback/reproduction artifacts. They are NOT a source of truth.

## Model
- **Centralized sources (single canonical copy, edit here):** `tools/importer/import-grace-master.js`,
  `component-library.json`, `catalog-data.js`, `parsers/`, `transformers/`.
  To change the importer: edit these → `python3 tools/importer/gen-catalog-module.py` (if catalog changed)
  → rebundle. Never gather sources from a backup folder.
- **Per-set backups (this folder):** just the frozen bundle that produced that set. To reproduce a
  set's import exactly, run the runner with `--import-script backups/<set>/import-grace-master.bundle.js`.

## To reproduce a set
```
WORKSPACE_PATH=/workspace/current node <runner>/run-bulk-import.js \
  --import-script tools/importer/backups/<set>/import-grace-master.bundle.js \
  --urls tools/importer/backups/<set>/urls.txt --disable-http2
```

## Caveat
There is ONE master importer with page-type dispatch → ONE live bundle. Editing centralized sources
rebundles for ALL templates, so a change for one set can affect others — verify with the visual-parity
gate + console sweep after any source edit. These frozen bundles are the safety net.
