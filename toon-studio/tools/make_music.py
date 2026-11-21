"""Procedural music bed: playful + mysterious (brief: 'Music mood'). Original, license-free.
Pizzicato bass, marimba motif, soft shaker, celesta glints. D dorian, 104 bpm.
Usage: python -I tools/make_music.py <out.wav> <seconds> [quiet_from-quiet_to ...]
'quiet' windows (seconds) thin the arrangement (bass + ticks only) for tense beats.
"""
import sys
import wave

import numpy as np
from scipy import signal

SR = 44100
out_path, total = sys.argv[1], float(sys.argv[2])
quiet = [tuple(map(float, q.split('-'))) for q in sys.argv[3:]]
rng = np.random.default_rng(104)
BPM = 104
BEAT = 60 / BPM
N = int((total + 2.5) * SR)
mix = np.zeros(N)


def is_quiet(t):
    return any(a <= t < b for a, b in quiet)


def add(x, at, gain):
    s = int(at * SR)
    if s >= N:
        return
    e = min(N, s + len(x))
    mix[s:e] += x[: e - s] * gain


def tt(d):
    return np.arange(int(d * SR)) / SR


def midi(n):
    return 440 * 2 ** ((n - 69) / 12)


def pluck(f, d=0.5):
    t = tt(d)
    x = np.sin(2 * np.pi * f * t) + 0.45 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t / 0.06) + 0.2 * np.sin(2 * np.pi * 3 * f * t) * np.exp(-t / 0.03)
    return x * np.clip(t / 0.004, 0, 1) * np.exp(-t / 0.22)


def marimba(f, d=0.6):
    t = tt(d)
    x = np.sin(2 * np.pi * f * t) * np.exp(-t / 0.28) + 0.35 * np.sin(2 * np.pi * 3.93 * f * t) * np.exp(-t / 0.05)
    return x * np.clip(t / 0.002, 0, 1)


def celesta(f, d=1.2):
    t = tt(d)
    return (np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * 2 * f * t)) * np.exp(-t / 0.5) * np.clip(t / 0.003, 0, 1)


def shaker(d=0.08):
    n = rng.standard_normal(int(d * SR))
    n = signal.sosfilt(signal.butter(2, 6000, 'high', fs=SR, output='sos'), n)
    return n * np.exp(-tt(d) / 0.02)


# progression (one chord per bar, 4/4): Dm7 | G7 | Dm7 | Asus4→A7
CHORDS = [
    (50, [62, 65, 69, 72]),  # D
    (43, [62, 65, 67, 71]),  # G7
    (50, [62, 65, 69, 72]),  # Dm7
    (45, [61, 64, 67, 69]),  # A7
]
# marimba motif per bar, (beat offset, midi note); a sly, bouncy figure
MOTIF = [
    [(0, 74), (0.5, 77), (1.5, 76), (2, 74), (3, 72), (3.5, 74)],
    [(0, 71), (0.75, 74), (1.5, 77), (2.5, 76), (3, 74)],
    [(0, 74), (0.5, 77), (1.0, 81), (2, 79), (2.5, 77), (3.5, 76)],
    [(0, 73), (1, 76), (1.5, 79), (2.5, 77), (3, 76), (3.5, 73)],
]

bar_len = 4 * BEAT
bar = 0
while bar * bar_len < total + bar_len:
    t0 = bar * bar_len
    root, tones = CHORDS[bar % 4]
    q = is_quiet(t0)
    intro = bar < 2
    # bass: beats 1 and 3, plus a pickup on 4& (walking feel)
    add(pluck(midi(root), 0.6), t0, 0.55)
    add(pluck(midi(root + 7), 0.5), t0 + 2 * BEAT, 0.45)
    if not q:
        add(pluck(midi(root + 12 if bar % 2 else root + 10), 0.3), t0 + 3.5 * BEAT, 0.3)
    # marimba motif (not in the intro or quiet windows); 2nd half of each 8-bar phrase up an octave on the last note
    if not intro and not q:
        for off, n in MOTIF[bar % 4]:
            add(marimba(midi(n)), t0 + off * BEAT + rng.uniform(-0.004, 0.004), 0.32)
        # soft chord stab on beat 2 &
        for n in tones:
            add(marimba(midi(n - 12), 0.4), t0 + 1.5 * BEAT, 0.07)
    # shaker on the off-beats (16ths swing feel)
    if not intro:
        for k in range(8):
            add(shaker(), t0 + (k + 0.5) * BEAT / 2, 0.06 if not q else 0.03)
    # celesta glint every 4 bars
    if bar % 4 == 0 and not intro:
        for i, n in enumerate([86, 89, 93]):
            add(celesta(midi(n)), t0 + i * 0.12, 0.12)
    # quiet windows: a muted clock-like tick on every beat to keep tension
    if q:
        for k in range(4):
            tick = signal.sosfilt(signal.butter(2, [1800, 3200], 'band', fs=SR, output='sos'), rng.standard_normal(int(0.03 * SR))) * np.exp(-tt(0.03) / 0.005)
            add(tick, t0 + k * BEAT, 0.15)
    bar += 1

# final resolving D chord with a long tail
end = total - 1.2
for n in [50, 62, 65, 69, 74]:
    add(pluck(midi(n), 2.0) if n < 60 else marimba(midi(n), 1.6), end, 0.35)
add(celesta(midi(86), 2.0), end + 0.05, 0.15)

# gentle room reverb + master fades
ir = rng.standard_normal(int(0.9 * SR)) * np.exp(-tt(0.9) / 0.25)
ir = signal.sosfilt(signal.butter(2, 4000, 'low', fs=SR, output='sos'), ir)
wet = signal.fftconvolve(mix, ir)[:N]
wet *= np.max(np.abs(mix)) / (np.max(np.abs(wet)) + 1e-9)
y = mix * 0.82 + wet * 0.18
y = y[: int(total * SR)]
fade_in = int(0.8 * SR)
y[:fade_in] *= np.linspace(0, 1, fade_in)
fade_out = int(0.9 * SR)
y[-fade_out:] *= np.linspace(1, 0, fade_out)
y = y / np.max(np.abs(y)) * 10 ** (-3 / 20)
with wave.open(out_path, 'w') as w:
    w.setnchannels(1)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((y * 32767).astype(np.int16).tobytes())
print(f'wrote {out_path}: {total:.1f}s, quiet windows {quiet}')
