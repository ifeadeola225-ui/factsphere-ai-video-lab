"""Build shotlist.json from a plan whose shots are given by their exact spoken words.
Cut points sit in the middle of the pause between shots (A3.6: cut on clause boundaries).
Usage: python3 -I tools/make_shotlist.py <plan.json> <words.json> <vo audio> <out shotlist.json>
"""
import json, re, subprocess, sys

plan_p, words_p, audio, out_p = sys.argv[1:5]
plan = json.load(open(plan_p))
words = json.load(open(words_p))
dur = float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', audio]))
norm = lambda s: re.sub(r"[^a-z0-9']", '', s.lower().replace('’', "'"))

i = 0
ranges = []
for s in plan['shots']:
    toks = s['line'].split()
    a = i
    for t in toks:
        if norm(words[i]['text']) != norm(t):
            raise SystemExit(f"{s['id']}: expected '{words[i]['text']}' got '{t}'")
        i += 1
    ranges.append((a, i - 1))
if i != len(words):
    raise SystemExit(f'plan covers {i} of {len(words)} words')

tail = plan.get('tail', 0.6)
shots = []
for k, (s, (a, b)) in enumerate(zip(plan['shots'], ranges)):
    start = 0.0 if k == 0 else shots[-1]['end']
    if k + 1 < len(ranges):
        end = (words[b]['endMs'] + words[ranges[k + 1][0]]['startMs']) / 2000
    else:
        end = dur + tail
    shot = {'id': s['id'], 'start': round(start, 3), 'end': round(end, 3), 'line': ' '.join(w['text'] for w in words[a:b + 1])}
    shot.update({k2: v for k2, v in s.items() if k2 not in ('id', 'line')})
    shots.append(shot)

out = {'slug': plan['slug'], 'fps': plan.get('fps', 30), 'duration': round(dur + tail, 3), 'shots': shots}
json.dump(out, open(out_p, 'w'), indent=1)
bad = [(x['id'], round(x['end'] - x['start'], 2)) for x in shots if not 1.2 <= x['end'] - x['start'] <= 3.6]
print(f"{len(shots)} shots, {out['duration']} s total. Out-of-range lengths: {bad or 'none'}")
