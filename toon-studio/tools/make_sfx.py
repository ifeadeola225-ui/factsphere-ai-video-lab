"""Procedurally synthesize the channel's sound effects (original, license-free).
Usage: python -I tools/make_sfx.py <out dir>   (needs numpy + scipy)
Every sound is a pure function of a fixed seed, so re-running gives identical files.
"""
import os
import sys
import wave

import numpy as np
from scipy import signal

SR = 44100
OUT = sys.argv[1]
os.makedirs(OUT, exist_ok=True)
rng = np.random.default_rng(1964)


def t_(dur):
    return np.arange(int(dur * SR)) / SR


def env_exp(dur, tau, attack=0.002):
    t = t_(dur)
    a = np.clip(t / attack, 0, 1)
    return a * np.exp(-t / tau)


def noise(dur):
    return rng.standard_normal(int(dur * SR))


def bp(x, lo, hi, order=2):
    sos = signal.butter(order, [lo, hi], btype='band', fs=SR, output='sos')
    return signal.sosfilt(sos, x)


def lp(x, f, order=2):
    return signal.sosfilt(signal.butter(order, f, btype='low', fs=SR, output='sos'), x)


def hp(x, f, order=2):
    return signal.sosfilt(signal.butter(order, f, btype='high', fs=SR, output='sos'), x)


def chirp(f0, f1, dur, kind='exp'):
    t = t_(dur)
    if kind == 'exp':
        f = f0 * (f1 / f0) ** (t / dur)
    else:
        f = f0 + (f1 - f0) * t / dur
    return np.sin(2 * np.pi * np.cumsum(f) / SR)


def reverb(x, size=0.35, mix=0.18):
    ir = noise(size) * np.exp(-t_(size) / (size / 5))
    ir = lp(ir, 6000)
    wet = signal.fftconvolve(x, ir)[: len(x) + int(size * SR)]
    dry = np.concatenate([x, np.zeros(len(wet) - len(x))])
    wet = wet / (np.max(np.abs(wet)) + 1e-9) * np.max(np.abs(x))
    return dry * (1 - mix) + wet * mix


def pad(x, before=0.0, after=0.05):
    return np.concatenate([np.zeros(int(before * SR)), x, np.zeros(int(after * SR))])


def save(name, x, peak_db=-3.0):
    x = x - np.mean(x)
    x = x / (np.max(np.abs(x)) + 1e-9) * 10 ** (peak_db / 20)
    # 3 ms fade in/out to avoid clicks
    f = int(0.003 * SR)
    x[:f] *= np.linspace(0, 1, f)
    x[-f:] *= np.linspace(1, 0, f)
    pcm = (x * 32767).astype(np.int16)
    with wave.open(os.path.join(OUT, f'{name}.wav'), 'w') as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())


def bell(f, dur, tau, partials=((1, 1), (2.76, 0.4), (5.4, 0.2), (8.93, 0.1))):
    t = t_(dur)
    return sum(a * np.sin(2 * np.pi * f * m * t) * np.exp(-t / (tau / m ** 0.5)) for m, a in partials)


def knock(f, dur=0.12, q=(0.6, 1.0)):
    """Wooden knock: a short noise click through two resonances."""
    n = noise(dur) * env_exp(dur, 0.004)
    return bp(n, f * 0.8, f * 1.25) * 3 + bp(n, f * 2.2, f * 2.8) * 1.5 + np.sin(2 * np.pi * f * t_(dur)) * env_exp(dur, 0.03) * 0.6


# ── the 21 cues ──────────────────────────────────────────────
save('pop', pad(chirp(950, 260, 0.09) * env_exp(0.09, 0.03, 0.001)))

thump = np.sin(2 * np.pi * np.cumsum(np.linspace(140, 70, int(0.25 * SR))) / SR) * env_exp(0.25, 0.07)
slap = hp(noise(0.25), 1500) * env_exp(0.25, 0.006) * 0.5
save('stamp-thunk', pad(reverb(thump + slap + knock(420, 0.25) * 0.5, 0.25, 0.12)))

save('hammer-tap', pad(reverb(knock(700, 0.16) + hp(noise(0.16), 3000) * env_exp(0.16, 0.002) * 0.6, 0.2, 0.12)))

def whoosh(dur, lo0, hi0, lo1, hi1, peak=0.55):
    n = noise(dur)
    t = t_(dur)
    out = np.zeros_like(n)
    seg = 64
    for k in range(0, len(n), int(SR * 0.01)):
        p = k / len(n)
        lo = lo0 + (lo1 - lo0) * p
        hi = hi0 + (hi1 - hi0) * p
        chunk = slice(max(0, k - seg * 8), min(len(n), k + int(SR * 0.01)))
        out[k:k + int(SR * 0.01)] = bp(n[chunk], lo, hi)[-len(n[k:k + int(SR * 0.01)]):]
    e = np.exp(-((t / dur - peak) ** 2) / 0.05)
    return out * e

save('whoosh', pad(whoosh(0.55, 400, 1200, 1800, 5000, 0.45)))
save('swipe', pad(whoosh(0.22, 1500, 4000, 3000, 8000, 0.4)))

# plane pass-by: whoosh + droning engine with a doppler pitch drop
pd = 2.0
t = t_(pd)
fdop = 160 * (1.12 - 0.24 / (1 + np.exp(-(t - 1.0) * 5)))
engine = signal.sawtooth(2 * np.pi * np.cumsum(fdop) / SR) * 0.4 + signal.sawtooth(2 * np.pi * np.cumsum(fdop * 2.01) / SR) * 0.2
engine = lp(engine, 900) * np.exp(-((t - 1.0) ** 2) / 0.35)
save('plane-whoosh', pad(engine + whoosh(pd, 200, 800, 300, 2500, 0.5) * 0.8))

# comedic shock sting: two short brassy notes down a semitone, then a lower held one
def brass(f, dur, vib=0.0):
    t = t_(dur)
    fm = f * (1 + vib * np.sin(2 * np.pi * 6 * t))
    x = signal.sawtooth(2 * np.pi * np.cumsum(fm) / SR)
    return lp(x, 2200) * np.clip(t / 0.015, 0, 1) * np.exp(-t / (dur * 0.9))

save('gasp-sting', pad(reverb(np.concatenate([brass(311, 0.16), brass(294, 0.16), brass(262, 0.55, 0.02)]), 0.4, 0.2)))

squeak = chirp(620, 980, 0.35, 'lin') * (0.6 + 0.4 * np.sin(2 * np.pi * 37 * t_(0.35))) * env_exp(0.35, 0.2, 0.03)
save('squeak', pad(lp(squeak, 3000)))

save('click', pad(np.concatenate([hp(noise(0.012), 2500) * env_exp(0.012, 0.002), np.zeros(int(0.05 * SR)), hp(noise(0.015), 1800) * env_exp(0.015, 0.003)])))

fh = 1.6
t = t_(fh)
horn = (signal.sawtooth(2 * np.pi * 110 * t) * 0.6 + signal.sawtooth(2 * np.pi * 110.7 * t) * 0.4)
horn = lp(horn, 500) * np.sin(np.pi * np.clip(t / fh, 0, 1)) ** 0.7
save('foghorn-soft', pad(reverb(horn, 1.2, 0.35)))

save('thud', pad(np.sin(2 * np.pi * np.cumsum(np.linspace(95, 45, int(0.35 * SR))) / SR) * env_exp(0.35, 0.09) + lp(noise(0.35), 400) * env_exp(0.35, 0.03) * 0.8))

tick = []
for k in range(4):
    tick.append(knock(2600 if k % 2 == 0 else 2100, 0.05) * 0.8)
    tick.append(np.zeros(int(0.45 * SR)))
save('clock-tick', np.concatenate(tick))

# flashback shimmer: rising soft arpeggio with long reverb
notes = [523.25, 659.25, 783.99, 1046.5, 1318.5, 1568.0]
sh = np.zeros(int(1.6 * SR))
for i, f in enumerate(notes):
    b = bell(f, 1.2, 0.5) * 0.5
    s0 = int(i * 0.07 * SR)
    sh[s0:s0 + len(b)] += b[: len(sh) - s0]
save('flashback-shimmer', reverb(sh, 1.2, 0.45))

cr = np.zeros(int(1.2 * SR))
drawer = lp(noise(0.25), 3000) * env_exp(0.25, 0.08) * 0.6
cr[: len(drawer)] += drawer
b = bell(2093, 1.0, 0.35) * 0.6 + bell(2637, 1.0, 0.3) * 0.4
s0 = int(0.12 * SR)
cr[s0:s0 + len(b)] += b[: len(cr) - s0]
save('cash-register', cr)

crk = np.zeros(int(2.6 * SR))
for start in np.arange(0.05, 2.5, 0.62):
    for j in range(3):
        s = int((start + j * 0.055 + rng.uniform(0, 0.01)) * SR)
        c = np.sin(2 * np.pi * 4300 * t_(0.035)) * np.sin(np.pi * t_(0.035) / 0.035)
        crk[s:s + len(c)] += c * (0.6 + 0.4 * rng.uniform())
save('crickets', reverb(crk, 0.5, 0.3), peak_db=-9)

wc = np.zeros(int(0.5 * SR))
for k in range(9):
    s = int(rng.uniform(0, 0.3) * SR)
    c = hp(noise(0.04), 1200) * env_exp(0.04, 0.006) * rng.uniform(0.4, 1)
    wc[s:s + len(c)] += c[: len(wc) - s]
wc += knock(300, 0.5) * 0.7
save('wood-crack', wc)

pf = np.zeros(int(0.9 * SR))
for k, (dt, f, a) in enumerate([(0.0, 260, 1.0), (0.18, 330, 0.6), (0.31, 300, 0.4), (0.4, 350, 0.25)]):
    kk = knock(f, 0.2) * a
    s = int(dt * SR)
    pf[s:s + len(kk)] += kk[: len(pf) - s]
save('plank-fall', reverb(pf, 0.3, 0.15))

cp = 1.8
t = t_(cp)
fe = 85 * (1.15 - 0.3 / (1 + np.exp(-(t - 0.9) * 6)))
eng = lp(signal.sawtooth(2 * np.pi * np.cumsum(fe) / SR) + 0.5 * signal.square(2 * np.pi * np.cumsum(fe * 0.5) / SR), 700)
save('car-pass', pad((eng * 0.5 + bp(noise(cp), 300, 2000) * 0.5) * np.exp(-((t - 0.9) ** 2) / 0.18)))

ph = 0.75
t = t_(ph)
fhorn = 420 * (1 + 0.06 * np.clip(t / 0.15, 0, 1)) * (1 + 0.015 * np.sin(2 * np.pi * 9 * t))
kazoo = signal.square(2 * np.pi * np.cumsum(fhorn) / SR, duty=0.3)
save('party-horn', pad(bp(kazoo, 300, 3500) * np.clip(t / 0.02, 0, 1) * np.clip((ph - t) / 0.1, 0, 1)))

pu = 1.0
t = t_(pu)
rust = bp(noise(pu), 1500, 7000) * (0.4 + 0.6 * np.abs(np.sin(2 * np.pi * 7 * t + np.sin(2 * np.pi * 2.3 * t))))
save('paper-unroll', pad(rust * np.clip(t / 0.05, 0, 1) * np.clip((pu - t) / 0.2, 0, 1)), peak_db=-6)

save('ding', reverb(bell(1760, 1.4, 0.6) + bell(2640, 1.4, 0.4) * 0.3, 0.8, 0.25))

print('wrote', len([f for f in os.listdir(OUT) if f.endswith('.wav')]), 'sfx to', OUT)
