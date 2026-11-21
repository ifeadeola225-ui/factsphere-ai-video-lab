#!/usr/bin/env bash
# Contact sheet for a batch: tools/sheet.sh <name> <s01,s02,...> [at=0.5]
set -euo pipefail
name=$1; ids=$2; at=${3:-0.5}
json=$(python3 -c "import json,sys;print(json.dumps({'ids':sys.argv[1].split(','),'at':float(sys.argv[2])}))" "$ids" "$at")
for fmt in 9x16 16x9; do
  rm -rf "out/sheetframes_$fmt"
  npx remotion render src/index.ts "MHH-Sheet$fmt" "out/sheetframes_$fmt" --sequence --image-format=png --props="$json" --concurrency=2 >/dev/null
  n=$(ls out/sheetframes_$fmt | wc -l)
  if [ $fmt = 9x16 ]; then cols=4; w=480; else cols=2; w=960; fi
  rows=$(( (n + cols - 1) / cols ))
  ffmpeg -v error -y -pattern_type glob -i "out/sheetframes_$fmt/*.png" -vf "scale=$w:-1,tile=${cols}x${rows}:padding=6:color=black" -frames:v 1 "out/${name}_$fmt.png"
done
echo "out/${name}_9x16.png out/${name}_16x9.png"
