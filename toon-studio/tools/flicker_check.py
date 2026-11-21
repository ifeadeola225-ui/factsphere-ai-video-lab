"""A11 flicker check: flags frames whose change from BOTH neighbours is a spike
(something popped in for one frame and back), which slow camera moves never cause.

Usage: python3 -I tools/flicker_check.py out/video.mp4 [threshold]
"""
import subprocess, sys, tempfile, glob, os
from PIL import Image, ImageChops, ImageStat

video = sys.argv[1]
thr = float(sys.argv[2]) if len(sys.argv) > 2 else 4.0
with tempfile.TemporaryDirectory() as d:
    subprocess.run(['ffmpeg', '-v', 'error', '-i', video, '-vf', 'scale=270:-2', os.path.join(d, 'f_%04d.png')], check=True)
    fs = sorted(glob.glob(os.path.join(d, 'f_*.png')))
    ims = [Image.open(f).convert('L') for f in fs]
    W, H = ims[0].size
    N = 6  # grid: a flicker in a small area (a window) must not be averaged away

    def tiles(a, b):
        dm = ImageChops.difference(a, b)
        return [ImageStat.Stat(dm.crop((x * W // N, y * H // N, (x + 1) * W // N, (y + 1) * H // N))).mean[0] for y in range(N) for x in range(N)]

    bad = []
    for i in range(1, len(ims) - 1):
        ta, tb, ts = tiles(ims[i - 1], ims[i]), tiles(ims[i], ims[i + 1]), tiles(ims[i - 1], ims[i + 1])
        for k in range(N * N):
            a, b, skip = ta[k], tb[k], ts[k]  # if prev ~ next but current differs, frame i flickered there
            if min(a, b) > thr and skip < 0.5 * min(a, b):
                bad.append((i, k, round(a, 1), round(b, 1), round(skip, 1)))
                break
    print(f'{video}: {len(ims)} frames, {len(bad)} flicker frames')
    for row in bad[:20]:
        print('  frame %d tile %d  in %.1f out %.1f skip %.1f' % row)
    sys.exit(1 if bad else 0)
