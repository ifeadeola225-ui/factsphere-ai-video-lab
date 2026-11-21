# Model Brief: Oddly Human

Source: `model/model.pdf` ("2.5D Cartoon Animation Model", 22 pages; plain text in `model/model.txt`).
Pages 1–2: four Shorts transcripts. Pages 3–18: four long-form transcripts. Pages 18–21: the visual style spec and a scene prompt template. Pages 21–22: the channel's master settings.

**Important:** the PDF has **no style frames** (it contains no embedded images). So every hex value below is **proposed from the written color names, not sampled from images**. STATE 2 compares against this written spec unless the user uploads 4–10 reference screenshots.

The PDF says: "When in doubt go with the plugin settings." Where the PDF is silent, the reference defaults (A1–A11) apply.

---

## 1. Channel identity

| Setting | Value |
|---|---|
| Channel | **Oddly Human** |
| Identity | Entertaining educational storytelling: strange history, human behavior, surprising science, forgotten inventions, everyday mysteries |
| Recurring cast | **ODD**: the main stick-figure narrator and mascot. Supporting characters change with each story. |
| Priority | YouTube Shorts first (45–60 s). Successful topics grow into 4–8 min long-form. *(The PDF asks to confirm this.)* |
| Topics to avoid | Politics, graphic violence, explicit content, religious controversy, misinformation, overly disturbing subjects |
| Music mood | Playful, mysterious, cinematic, curious. Subtle instrumental bed, light percussion, gentle suspense, occasional comedic accents. Always under the narration. |

## 2. Line and shading

- **Outlines:** bold, clean, smooth near-black `#141414` on every character part and the main edges of sets and props. The PDF asks for a "slightly organic" line with "subtle hand-drawn imperfections". We get this with an inverted-hull outline about **3.2% of head radius R** (slightly heavier than the 2.5–3% reference default) and a very small seeded variation in thickness.
- **Shading:** flat cel shading with **minimal** shadow.
  - Characters: **2-step** toon gradient `[0.82, 1.0]` (the reference uses 3 steps, `[0.62, 0.85, 1]`; the PDF asks for flatter).
  - Sets: gentle **3-step** gradient `[0.74, 0.88, 1.0]` plus soft gradients on walls and sky.
- **No** glossy plastic, specular highlights on characters, realistic textures, or photorealistic light.
- **Ground contact:** every character keeps a soft shadow. Floating feet fail QC (the PDF's negative prompt says the same).

## 3. Palette (proposed; nothing sampled)

The PDF's colors to keep are teal, navy blue, warm yellow, white, sky blue and earthy tones. It also mentions turquoise, burgundy, cream and pastels. Colors to avoid are heavy neon, dull monochrome, overly dark scenes and inconsistent character colors.

| Role | Hex |
|---|---|
| Outline | `#141414` |
| **Brand teal** (ODD, UI accents) | `#1F8A8A` |
| Turquoise | `#3CC4C0` |
| Navy | `#1E3A6E` |
| Warm yellow | `#F5C242` |
| White / cream | `#FAF8F2` / `#F2E8D5` |
| Sky blue | `#8EC9EE` (sky gradient `#8EC9EE` → `#D6ECF8`) |
| Burgundy | `#8E2F3C` |
| Earthy brown / tan / olive | `#8A5A3B` / `#D8B48A` / `#7D8A4E` |
| Skin: peach / tan / brown / deep | `#F4D2A6` / `#D9A06B` / `#B8743F` / `#7E4E2B` (reference default) |
| Pastel walls: cream / mint-teal / butter / sky / blush | `#EFE6D2` / `#CFE8E4` / `#F6E3A1` / `#D6ECF8` / `#F3D6CC` |
| Wood: floor / desk | `#B7834F` / `#8E5A33` |
| Glow gold (reveal moments only) | `#FFC94A` |

Saturation is medium-high on characters and softer (pastel) on backgrounds, so characters always pop. **Night scenes stay readable:** a dusk blue (`#4A5F9C` hemisphere) with warm practical lights, never a near-black frame.

## 4. Characters

PDF: "oversized, perfectly rounded heads with thick smooth black outlines, tiny black oval eyes, expressive eyebrows, simple curved mouths… narrow capsule-shaped torsos, thin black stick arms and legs, tiny circular hands, simple oval feet." Faces stay flat, graphic and minimal. No nose, ears, lips, fingers or muscles.

| Part | Spec (relative to head radius R = 1) | vs reference A4 |
|---|---|---|
| Head | Sphere R 1.0, about **40%** of figure height | Ref 38%: slightly bigger |
| Torso | **Narrow** capsule, radius **0.5** (ref 0.62). Variants: rounded rectangle, **robe silhouette** (a cone flaring to the knees) for historical costume | Narrower; robe added |
| Arms / legs | Thin black capsules, two segments with elbow and knee bends | Same |
| Hands | **Tiny black circles** (r 0.12) | Ref: skin-colored spheres r 0.16 |
| Feet | Small dark ovals | Same |
| Eyes | **Tiny** black ovals (0.08 × 0.11), **no highlight dot** by default | Smaller; highlight removed |
| Brows | **Always visible**, short and thick. Most of the emotion is carried by brow angle | Ref hides them on neutral |
| Mouth | Small curved arc, with variants as in A4.2 | Same |
| Blush | **Off by default**; used only for embarrassed or love beats | Ref: always on |
| Clothing | Flat geometric shapes: T-shirt, hoodie, jacket, uniform, lab coat, historical robe, coats | Same, plus robes and coats |

**Expressions:** emotion reads through brow angle, eye position and mouth shape: neutral, smile, happy (^^), worried, shocked (white sclera with a tiny pupil), smug, angry, sad, thinking.

**ODD (proposed design, to confirm in STATE 3):** a **white head** (`#FAF8F2`), which makes ODD instantly recognizable and gives ODD no ethnicity, so ODD can stand in for "you" in What If stories. Brand-**teal** hoodie with a warm-yellow drawstring and pocket, navy legs, a single tuft of hair, slightly wider brows (curious resting expression).

## 5. Motion

The PDF has two animation sections that disagree. One says "limited 2D cutout animation… for static animation keep characters motionless; animate only the camera". The later **Master Style**, the one with the named spec and the prompt template, asks for **full 3D movement**: walking, turning, sitting, interacting with props, smooth joint rotation, controlled squash and stretch.

**Chosen direction: the Master Style (full 3D motion)**, following the reference A5 library. We also add a `hold` pose mode for "expressive frozen poses", where only the camera moves. The rule throughout: characters never look like flat cardboard rotating in space. They are real 3D primitives, so turns keep their volume.

## 6. Environments

- Fully three-dimensional sets with architectural volume, occlusion, parallax and floor contact, all **styled like colorful 2D illustrations**: pastel palettes, soft gradients, subtle ambient shadow, simplified geometric props.
- More detailed than the characters, but always lower contrast.
- Soft **atmospheric perspective**: distant layers fade toward cream or sky through scene fog. This is new; the reference doesn't include it.
- Each set has at least 3 depth layers and an opening (window or door) to the outside (reference A6).
- **Starter sets, re-chosen for this channel's topics** (reference sets in brackets):
  1. office (kept)
  2. hospital / clinic room (kept)
  3. **palace hall**, historical (replaces the bank hall)
  4. restaurant kitchen (kept as kitchen / workshop)
  5. suburban street (kept)
  6. countryside / hillside (kept)
  7. **classroom / science lab** (replaces the old-time town square)

## 7. Camera and lighting

- Shots: wide, medium, close-up, insert, tracking, over-the-shoulder and three-quarter (PDF), on the reference lens rules (A3.6).
- Moves: slow push-in, pull-out, pan, dolly, orbit and tracking. Hard cuts between compositions. Every shot moves (reference: never static longer than 1.5 s).
- **Depth of field: on, but lighter than the reference.** The PDF never mentions blur and stresses "crisp" images with "clear foreground-to-background separation". So we start at bokehScale ≈ 1.5 (the reference uses a strong blur) and let fog carry most of the depth.
- Lighting: warm, bright and soft. Use the reference A3.3 rig with shadow opacity lowered about 30% and a stronger hemisphere fill, so nothing reads as dark.
- **Comic-panel layout (new):** for comparisons and sequences, a frame can split into 2–3 panels with thick dark borders and rounded corners (the PDF mentions this). It is built as a 2D overlay component over separate renders.

## 8. Captions

The PDF doesn't specify captions, so the reference A7 applies: one word at a time, Fredoka 700, white with a 10–12 px `#141414` stroke, gold `#FFC94A` for emphasis words. "Mobile-friendly readability" is the PDF's only demand, and this already meets it.

## 9. Storytelling formula (from the transcripts)

### Shorts (45–60 s)

Three of the four Shorts (The Ancient Jar, The Job Nobody Wants in Japan, Your Brain's Secret Idea Zone) follow the reference A8.2 formula almost exactly:

1. **Hook:** an impossible-sounding true claim. ("He put a bronze ball in a dragon's mouth and told the emperor, 'If this ever falls out, run.'")
2. **Drop-in:** "Imagine your boss walks you past your desk…"
3. **Escalation:** concrete, drawable actions.
4. **Doubt:** "The whole court burst out laughing." / "Sounds like the worst nap ever."
5. **"You see,"** the hidden mechanism.
6. **Twist / closer** that reframes the hook. ("…because nobody can do nothing forever.")

The fourth Short, "He Was A Genius", is a pure narrative prank story with no "you see" beat. It's a looser variant we can use now and then.

### Long-form: "What If…" series (the main difference from the reference)

The reference long-form is 8–12 min of 4–7 separate fact chapters. The PDF's long-form is a **second-person "What If You…" episode**, about 6–12 min each in the transcripts (the master settings say 4–8 min). The structure:

1. **Cold open:** "you" already using the power, with a funny dialogue exchange. ("Did you just leave?" / "I'm already here.")
2. **"So, what if you… Here's how it works."** The rules of the power, grounded in real science and numbers (cuttlefish, Usain Bolt's 44 km/h, a reaction time of 0.25 s).
3. **The fun montage:** quick, funny everyday uses.
4. **The problems:** a numbered list of real-physics downsides, each with a joke and a short dialogue.
5. **The lesson / rule** ("Start slowing down way before you need to.")
6. **The climax:** a high-stakes moment where the science pays off (a rescue, or a choice between the ball and the boy).
7. **The cliffhanger:** a mysterious organization or a stranger arrives. It's a serialized universe across episodes.
8. **CTA:** a question to the viewer, "tell us in the comments", subscribe.

Dialogue is quoted and frequent, so characters' mouths flap on quoted lines (A4.2). Each episode closes with a real-science check ("But is any of this real?").

**Originality:** the transcripts' "Project If" universe (the woman in the gray coat, Jay, Milo, Max) belongs to the reference channel. Oddly Human uses the **same episode formula with our own original story world**, with ODD as "you".

## 10. Voice (ElevenLabs)

The voice isn't chosen yet. PDF starting values: **Stability 50%, Similarity 75%, Style exaggeration 20%, Speed 1.0×**. Delivery: curious, expressive, conversational and engaging. (The reference default Stability is 45%; the PDF wins.) The voice gets locked in `LOCKED.md` once it's chosen.

## 11. Output

| | Shorts | Long-form |
|---|---|---|
| Size | 1080×1920 + 1920×1080 | 1920×1080 |
| FPS / codec | 30, H.264 CRF 18 (A10) | same |

The PDF asks for **4K**. **Chosen: 1080p for builds and previews, with an optional 4K final** (`--scale=2`) per video. A 4K render takes about 4× as long and is rarely visible on Shorts. *(Confirm.)*

## 12. Where the PDF differs from the references (summary)

| Topic | Reference | PDF | Chosen |
|---|---|---|---|
| Style frames | Expected | None supplied | Written spec only; screenshots can be added later |
| Shading | 3-step | Flat, minimal | 2-step on characters, soft 3-step on sets |
| Head / torso | 38%, torso r 0.62 | Bigger head, narrow body | 40%, torso r 0.5 |
| Hands | Skin spheres | Tiny black circles | Black circles |
| Eyes / brows / blush | Highlight dot; brows hidden; blush on | Tiny eyes, expressive brows, minimal face | Tiny eyes, no highlight; brows always on; blush off |
| Palette | Warm beige / mustard | Teal, navy, yellow, white, sky, earthy, pastel | New palette (section 3) |
| Depth of field | Strong, always | Not mentioned, "crisp" | Light DOF plus atmospheric fog |
| Motion | Full A5 | Conflicting | Full 3D (Master Style) plus a `hold` mode |
| Sets | Bank hall, town square | Palaces, hospitals, streets | Palace hall and classroom/lab replace those two |
| Comic panels | None | Optional | Added as an overlay component |
| Shorts length | 40–58 s | 45–60 s | 45–60 s |
| Long-form | 8–12 min of fact chapters | 4–8 min serialized "What If" | What If formula, original world, 4–8 min target |
| Topic lanes | Money, banks, weird laws… | History, behavior, science, inventions, mysteries | PDF lanes |
| Voice | Stability 0.45 | 0.50 | 0.50 |
| Resolution | 1080p | 4K | 1080p, optional 4K final |
