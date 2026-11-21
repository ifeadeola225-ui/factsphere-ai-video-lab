import * as THREE from 'three';
import {mulberry32} from './rng';

// A3.5: seeded, low-contrast procedural canvas textures.
const cache = new Map<string, THREE.CanvasTexture>();

const shade = (hex: string, k: number) => {
  const c = new THREE.Color(hex);
  c.offsetHSL(0, 0, k);
  return `#${c.getHexString()}`;
};

const make = (key: string, size: number, draw: (g: CanvasRenderingContext2D, r: () => number) => void, repeat: [number, number]) => {
  const k = `${key}|${repeat.join('x')}`;
  const hit = cache.get(k);
  if (hit) return hit;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const g = canvas.getContext('2d')!;
  draw(g, mulberry32(size * 7919 + key.length * 104729 + key.charCodeAt(0)));
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(...repeat);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  cache.set(k, tex);
  return tex;
};

/** Mottled paper / plaster grain for walls. */
export const plasterTex = (base: string, repeat: [number, number] = [2, 2]) =>
  make(`plaster${base}`, 512, (g, r) => {
    g.fillStyle = base;
    g.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 2600; i++) {
      g.fillStyle = shade(base, (r() - 0.5) * 0.06);
      g.globalAlpha = 0.35;
      const s = 2 + r() * 10;
      g.beginPath();
      g.arc(r() * 512, r() * 512, s, 0, Math.PI * 2);
      g.fill();
    }
    g.globalAlpha = 1;
  }, repeat);

/** Faint wood planks for floors and docks. */
export const woodTex = (base: string, repeat: [number, number] = [3, 3], planks = 6) =>
  make(`wood${base}${planks}`, 512, (g, r) => {
    const h = 512 / planks;
    for (let p = 0; p < planks; p++) {
      g.fillStyle = shade(base, (r() - 0.5) * 0.05);
      g.fillRect(0, p * h, 512, h);
      // grain streaks
      for (let i = 0; i < 26; i++) {
        g.strokeStyle = shade(base, -0.04 - r() * 0.03);
        g.globalAlpha = 0.35;
        g.lineWidth = 1 + r() * 1.5;
        const y = p * h + r() * h;
        g.beginPath();
        g.moveTo(0, y);
        g.bezierCurveTo(170, y + (r() - 0.5) * 6, 340, y + (r() - 0.5) * 6, 512, y);
        g.stroke();
      }
      g.globalAlpha = 0.8;
      g.fillStyle = shade(base, -0.14);
      g.fillRect(0, p * h, 512, 2); // seam
      const seamX = r() * 512;
      g.fillRect(seamX, p * h, 2, h);
    }
    g.globalAlpha = 1;
  }, repeat);

/** Soft checker tiles for kitchens and clinics. */
export const checkerTex = (a: string, b: string, repeat: [number, number] = [4, 4]) =>
  make(`checker${a}${b}`, 256, (g) => {
    for (let y = 0; y < 4; y++)
      for (let x = 0; x < 4; x++) {
        g.fillStyle = (x + y) % 2 ? a : b;
        g.fillRect(x * 64, y * 64, 64, 64);
      }
  }, repeat);

/** Vertical sky gradient (top → bottom) with a few soft clouds, for windows. */
export const skyTex = (top: string, bottom: string, clouds = true) =>
  make(`sky${top}${bottom}${clouds}`, 512, (g, r) => {
    const grad = g.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0, top);
    grad.addColorStop(1, bottom);
    g.fillStyle = grad;
    g.fillRect(0, 0, 512, 512);
    if (clouds) {
      g.fillStyle = '#FFFFFF';
      for (let c = 0; c < 4; c++) {
        const cx = r() * 512;
        const cy = 80 + r() * 200;
        g.globalAlpha = 0.75;
        for (let i = 0; i < 6; i++) {
          g.beginPath();
          g.arc(cx + (i - 3) * 22, cy + Math.sin(i) * 8, 26 + r() * 16, 0, Math.PI * 2);
          g.fill();
        }
      }
      g.globalAlpha = 1;
    }
  }, [1, 1]);

/** Short sign / label text on a colored card (A6: clean sans, 1–3 words). */
export const textTex = (text: string, bg: string, fg: string, w = 512, h = 256) => {
  const key = `text${text}${bg}${fg}${w}x${h}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const g = canvas.getContext('2d')!;
  g.fillStyle = bg;
  g.fillRect(0, 0, w, h);
  g.fillStyle = fg;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  let size = h * 0.55;
  g.font = `900 ${size}px "Arial Black", "Helvetica Neue", Arial, sans-serif`;
  while (g.measureText(text).width > w * 0.86 && size > 10) {
    size -= 4;
    g.font = `900 ${size}px "Arial Black", "Helvetica Neue", Arial, sans-serif`;
  }
  g.fillText(text, w / 2, h / 2 + size * 0.04);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  cache.set(key, tex);
  return tex;
};
