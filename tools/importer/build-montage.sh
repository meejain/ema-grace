#!/usr/bin/env bash
# Build side-by-side (EDS | SOURCE) composites for each captured page, then tile
# them into montage sheets for an efficient visual pass across all pages.
set -e
cd /backups/meejain/ema-grace/repo/tools/importer/shots
mkdir -p pair montage
LABELS=$(node -e 'const a=require("./index.json");a.forEach(x=>console.log(x.n+" "+x.path))')

# 1. per-page side-by-side, scaled to 380px wide each (760 total), capped at 1200px tall,
#    with the path label as a caption bar.
while read -r n path; do
  [ -f "eds/$n.png" ] || continue
  [ -f "src/$n.png" ] || continue
  # scale each to 380 wide; crop tall pages to 1200 so montage cells stay uniform-ish
  convert "eds/$n.png" -resize 380x -gravity North -crop 380x1200+0+0 +repage -background white -flatten /tmp/e.png
  convert "src/$n.png" -resize 380x -gravity North -crop 380x1200+0+0 +repage -background white -flatten /tmp/s.png
  # label bar
  convert -size 760x22 xc:'#222' -font DejaVu-Sans -fill white -gravity West -pointsize 13 -annotate +6+0 " $n  $path   [ EDS | SOURCE ]" /tmp/lbl.png
  convert /tmp/e.png /tmp/s.png +append -bordercolor '#888' -border 1 /tmp/body.png
  convert /tmp/lbl.png /tmp/body.png -append "pair/$n.png"
done <<< "$LABELS"

# 2. tile 3 pairs per montage sheet (3 rows), so each sheet shows 3 pages fully.
i=0; sheet=0; batch=()
for f in $(ls pair/*.png | sort); do
  batch+=("$f"); i=$((i+1))
  if [ $((i%3)) -eq 0 ]; then
    montage "${batch[@]}" -tile 1x3 -geometry +0+4 -background '#ccc' "montage/sheet-$(printf '%02d' $sheet).png"
    sheet=$((sheet+1)); batch=()
  fi
done
[ ${#batch[@]} -gt 0 ] && montage "${batch[@]}" -tile 1x3 -geometry +0+4 -background '#ccc' "montage/sheet-$(printf '%02d' $sheet).png"
echo "built $(ls pair/*.png 2>/dev/null | wc -l) pairs, $(ls montage/*.png 2>/dev/null | wc -l) montage sheets"
