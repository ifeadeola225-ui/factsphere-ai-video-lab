# LOCKED decisions

Approved style and rule decisions, newest last. These override `MODEL_BRIEF.md` and the plugin references.

## STATE 0 (Model Brief approved)

- Model Brief approved, with section 0 (the "He Got Rich Selling Water" reference video) as the visual target.
- **Shorts length: 45–60 s, hard cap 60 s** (about 130–165 words). This overrides the brief's "up to about 90 s".
- Resolution: 1080p for builds and previews; 4K final is optional per video.
- Content priority: Shorts first; long-form 4–8 min "What If" episodes later.

## STATE 2: style lock

### Round 1: APPROVED and locked (styletest_v1b)

- Outline: inverted hull in world units. Head 4.2% R, torso 3.5% R, hair 3–3.5% R, props 2–3%. Color `#160502`.
- Proportions: head R 1, head center y 5.2, figure height ≈ 6.3 R (head ≈ 32%). Torso capsule r 0.72 × len 1.0, z-scale 0.85. Limbs r 0.045. Hands are dark dots (r 0.11).
- Head shading: smooth gradient map [0.8, 0.9, 1.0] (linear filter). Sets use 3-step [0.74, 0.88, 1.0].
- Face: eyes 0.085 × 0.115 with a white glint, at yaw ±0.26, pitch 0.07. Brows: arc r 0.15, tube 0.05, pitch 0.19. Mouth at pitch −0.25.
- Hair: tilted cap plus a 10-spike fringe that breaks the outline. ODD has one tall forward tuft.
- Depth of field: bokehScale 5, focus range 1.6 world units, focused on the head.
- Bloom 0.6 (threshold 0.85). Vignette 0.4. No tone mapping (palette hexes render true).
- Captions: Bangers (bundled locally), ALL CAPS. 9:16: 70 px at y 64%, 7 px stroke. 16:9: 58 px at y 84%. Emphasis words are gold `#FFC94A` at ×1.12.
- Light: interior rig (warm key `#FFE6C4` 2.2, hemisphere 1.3, cool rim 0.5) plus warm practical lamps.
- Set-building rule (from the window and shelf fixes): no two visible surfaces may share a plane. Keep a gap of at least 0.03 units between stacked or inset surfaces. Every preview runs `tools/flicker_check.py`.
- Silent test renders are expected until STATE 5. Always say so when sending a test.
