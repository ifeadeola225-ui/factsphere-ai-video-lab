"""Tighten a VO: cap inter-sentence gaps (keeping chosen dramatic pauses) and optionally slow the
final stretch. Uses words.json sentence boundaries. Writes a WAV and prints the new duration.

Usage: python3 -I tools/tighten_vo.py <in audio> <words.json> <out.wav> <gap_cap_s> <keep: comma list of
       word texts whose PRECEDING pause is kept> [slow_from_word_index] [tempo]
"""
import json, re, subprocess, sys

src, words_p, out, cap = sys.argv[1], sys.argv[2], sys.argv[3], float(sys.argv[4])
keep = set(sys.argv[5].split(',')) if len(sys.argv) > 5 and sys.argv[5] else set()
slow_from = int(sys.argv[6]) if len(sys.argv) > 6 else None
tempo = float(sys.argv[7]) if len(sys.argv) > 7 else 1.0
w = json.load(open(words_p))
dur = float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', src]))

cuts = []  # (start, end) seconds to remove: the middle of over-long gaps
for i in range(1, len(w)):
    a, b = w[i - 1]['endMs'] / 1000, w[i]['startMs'] / 1000
    gap = b - a
    if gap > cap and w[i]['text'] not in keep:
        mid = (a + b) / 2
        r = (gap - cap) / 2
        cuts.append((mid - r, mid + r))

# keep-intervals
keepi, t = [], 0.0
for c0, c1 in cuts:
    keepi.append((t, c0)); t = c1
keepi.append((t, dur))

slow_t = w[slow_from]['startMs'] / 1000 - 0.05 if slow_from is not None else None
parts, labels = [], []
for k, (a, b) in enumerate(keepi):
    if slow_t is not None and a < slow_t < b:
        parts.append(f'[0:a]atrim={a:.3f}:{slow_t:.3f},asetpts=N/SR/TB,afade=t=out:st={slow_t - a - 0.01:.3f}:d=0.01[p{k}a]')
        parts.append(f'[0:a]atrim={slow_t:.3f}:{b:.3f},asetpts=N/SR/TB,atempo={tempo}[p{k}b]')
        labels += [f'[p{k}a]', f'[p{k}b]']
    elif slow_t is not None and a >= slow_t:
        parts.append(f'[0:a]atrim={a:.3f}:{b:.3f},asetpts=N/SR/TB,atempo={tempo}[p{k}]')
        labels.append(f'[p{k}]')
    else:
        # 8 ms fades at each splice so cuts never click
        parts.append(f'[0:a]atrim={a:.3f}:{b:.3f},asetpts=N/SR/TB,afade=t=in:d=0.008,afade=t=out:st={max(0, b - a - 0.008):.3f}:d=0.008[p{k}]')
        labels.append(f'[p{k}]')
fc = ';'.join(parts) + f";{''.join(labels)}concat=n={len(labels)}:v=0:a=1[out]"
subprocess.check_call(['ffmpeg', '-v', 'error', '-y', '-i', src, '-filter_complex', fc, '-map', '[out]', '-ar', '44100', '-ac', '1', out])
nd = float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', out]))
print(f'{len(cuts)} gaps tightened, {dur:.2f}s -> {nd:.2f}s')
