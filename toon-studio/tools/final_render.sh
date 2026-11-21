#!/usr/bin/env bash
# Final render in chunks (each well under the job time limit), audio once, then lossless join.
set -uo pipefail
cd "$(dirname "$0")/.."
COMP=${1:-MHH-9x16}; OUT=${2:-out/mailed-himself-home_9x16.mp4}; N=1794
P=out/final_parts; mkdir -p $P
log(){ echo "$(date +%H:%M:%S) $*" >> $P/log.txt; }
for r in 0-599 600-1199 1200-$((N-1)); do
  f=$P/v_$r.mp4
  [ -s "$f" ] && { log "skip $r"; continue; }
  log "start $r"
  npx remotion render src/index.ts $COMP $f --frames=$r --muted --crf=18 --concurrency=4 > $P/r_$r.log 2>&1 && log "done $r" || log "FAIL $r"
done
[ -s $P/audio.aac ] || { npx remotion render src/index.ts $COMP $P/audio.aac --codec=aac --audio-bitrate=192k > $P/audio.log 2>&1 && log "done audio" || log "FAIL audio"; }
printf "file '%s'\n" v_0-599.mp4 v_600-1199.mp4 v_1200-$((N-1)).mp4 > $P/list.txt
ffmpeg -v error -y -f concat -safe 0 -i $P/list.txt -i $P/audio.aac -map 0:v -map 1:a -c copy -movflags +faststart $OUT && log "JOINED $OUT" || log "FAIL join"
