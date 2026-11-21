"""A9 timestamps: force-align the APPROVED script to the VO audio (pocketsphinx), so every caption
word is the script's own spelling. Writes Remotion Caption JSON: [{text,startMs,endMs,timestampMs,confidence}].

Usage: python -I tools/align_vo.py <vo16k.wav> <script-display.txt> <out words.json>
script-display.txt: the caption tokens exactly as they should appear, separated by whitespace;
a token may carry its spoken form after '|', e.g.  1964|nineteen_sixty_four  Sixty-three|sixty_three
"""
import json, re, sys, wave
from pocketsphinx import Decoder

wav, script_path, out_path = sys.argv[1:4]
tokens = open(script_path).read().split()
display, spoken = [], []
for t in tokens:
    if '|' in t:
        d, s = t.split('|', 1)
        parts = s.split('_')
    else:
        d = t
        parts = [re.sub(r"[^a-z']", '', t.lower().replace('’', "'"))]
    display.append(d)
    spoken.append([p for p in parts if p])

dec = Decoder(samprate=16000, bestpath=False)
# out-of-vocabulary words get a pronunciation
OOV = {
    'spiers': 'S P IY R Z',
    'pocketknife': 'P AA K AH T N AY F',
    'hitchhikes': 'HH IH CH HH AY K S',
}
for w in sorted({p for ws in spoken for p in ws}):
    if dec.lookup_word(w) is None:
        if w in OOV:
            dec.add_word(w, OOV[w], True)
        else:
            raise SystemExit(f'No pronunciation for "{w}": add it to OOV')

flat = [p for ws in spoken for p in ws]
dec.set_align_text(' '.join(flat))
with wave.open(wav) as w:
    data = w.readframes(w.getnframes())
dec.start_utt(); dec.process_raw(data, full_utt=True); dec.end_utt()
segs = [s for s in dec.seg() if s.word not in ('<s>', '</s>', '<sil>', '[NOISE]') and not s.word.startswith('+')]
fps = 100  # pocketsphinx frames are 10 ms
seg_words = [re.sub(r'\(\d+\)$', '', s.word) for s in segs]
if seg_words != flat:
    raise SystemExit(f'Alignment mismatch: got {len(seg_words)} words, expected {len(flat)}')

out, i = [], 0
for d, ws in zip(display, spoken):
    first, last = segs[i], segs[i + len(ws) - 1]
    start, end = first.start_frame * 1000 // fps, (last.end_frame + 1) * 1000 // fps
    out.append({'text': d, 'startMs': start, 'endMs': end, 'timestampMs': (start + end) // 2, 'confidence': None})
    i += len(ws)
json.dump(out, open(out_path, 'w'), indent=1)
print(f'{len(out)} caption words aligned, last word ends at {out[-1]["endMs"]} ms')
