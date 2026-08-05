#!/usr/bin/env python3
"""Generate catalog-data.js (ES module) from component-library.json.

The master importer is bundled with esbuild (via @adobe/aem-import-helper), which
inlines ES `import`s but does NOT populate `globalThis`, and our eslint config
rejects `.json` import extensions. So the catalog ships as a plain .js module that
`export default`s the catalog object. Run this after editing component-library.json:

    python3 tools/importer/gen-catalog-module.py
"""
import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, 'component-library.json')
DST = os.path.join(HERE, 'catalog-data.js')

cat = json.load(open(SRC, encoding='utf-8'))
body = json.dumps(cat, ensure_ascii=False, indent=2)
out = (
    "/* eslint-disable */\n"
    "/**\n"
    " * GENERATED — do not edit by hand.\n"
    " * Source: tools/importer/component-library.json\n"
    " * Regenerate: python3 tools/importer/gen-catalog-module.py\n"
    " *\n"
    " * Exists as an ES module (not a JSON import) because the importer is bundled with\n"
    " * esbuild via @adobe/aem-import-helper, and our eslint config rejects `.json` import\n"
    " * extensions. Importing this .js keeps the catalog inlined into the bundle.\n"
    " */\n"
    f"export default {body};\n"
)
open(DST, 'w', encoding='utf-8').write(out)
print(f"wrote {DST}: {len(out)} bytes, {len(cat['blocks'])} blocks")
