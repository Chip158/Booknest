# Exterior references s1-s5: what to take, as buildable specs

Owner's brief: "Think more this style" and "Like this too". Five exterior references: four autumn daylight screenshots from a cozy life-sim made with player-built designs (s1-s4), and one painterly winter-night market (s5).

We borrow the **feel** and none of the assets. Do not copy these things from the references:
- the food-truck livery
- the rabbit villager
- the manhole and grate artwork
- any creator watermark or caption ("mackscrossing", "@crossingwithlyss", "autumn on keepsake", the "Fanny" shop sign)
- the saint statue

Nothing named in this file comes from a franchise.

Supporting files (all under `/tmp/harness/style/`):
- `refs-exterior-palette.json`: game-ready colour tokens, with the measured reference values beside each one.
- `crops/ex-*.png`: 40 zoomed crops, swatch-check sheets and two palette sheets: `crops/ex-palette-autumn.png` and `crops/ex-palette-winter_night.png`.
- `crops/ex-palette-quant.json`: per-image 12-colour quantisation.
- `crops/ex-swatches.json` and `crops/ex-swatches2.json`: raw region samples.
- `tools/ext_crops.py`, `tools/ext_palette.py`, `tools/ext_swatch.py`, `tools/ext_swatch2.py`, `tools/ext_palette_png.py`: the scripts, which can be re-run.

**Method.** Images are quantised with PIL MEDIANCUT plus 4 k-means passes. Regions are sampled as the luminance-sorted median (40-60%), shade (5-20%), light (85-98%) and peak (top 1% or 0.5%). Every sample box was checked against a thumbnail (`crops/ex-swatch-sheet-*.png`, `crops/ex-chk-*.png`).

**Caveats.**
- s3, and to a lesser degree s4, carry a warm, desaturated photo-mode grade.
- s5 is graded deep sepia.
- So the measured values are *lit and graded colour*, not albedo. The "game" column translates them into albedo for our B15 toon ramp: the lit band is about x1.0 (#FFF6EA), the mid band x0.86 (#DCCFD0), and the shadow band is the lavender #7C7A9C.

---

## 1. Palette

### 1a. Measured quantisation (12 colours, sorted by area share)

| Image | Top colours (hex, share) | Read |
|---|---|---|
| s1 café plaza | #D09A68 14.8, #9D5E31 11.0, #E1AF7E 9.7, #C57235 9.0, #D68C47 8.4, #A07D62 8.2, **#D1DEF6 7.9 (sky)**, #F2AC57 6.9, #79411B 6.9, #6D5D48 6.5, #3A3122 5.8, #D6CBC3 4.8 | Honey and caramel paving dominate. The sky is the only cool colour. High key (lum p50 146). |
| s2 stone cottage | #60311F 13.3, #E99C48 10.5, #A97040 10.1, #3A1C11 9.7, #8B532D 8.9, #DF5F31 8.5, #BF401D 8.5, #CE8F5A 7.9, #EAB071 7.0, #872E14 6.9, #A69BA1 4.7, #DABAB5 3.9 | Vermilion foliage, amber ground and chocolate stone. 96% warm pixels, 0% cool. |
| s3 town entrance | #855A41 13.3, #9F6D50 11.4, #484136 9.8, #7C6A58 8.4, #BAA085 8.3, #998975 8.2, #6D4933 8.2, #2B302A 7.9, #605547 7.9, #D3B89D 7.8, #BB8B5D 6.5, #E9D8C6 2.2 | Russet over taupe: a muted, filtered "film" look (mean sat .26). Dark firs at #2B302A. |
| s4 brick path | #A26D43 13.2, #764E29 12.5, #81623E 11.0, #454C39 10.7, #B08357 9.9, #9A5233 7.7, #292D1C 7.4, #5B3A19 7.3, #B89C77 6.7, #C3B5A0 4.8, **#92BFCD 4.6 (sky)**, #8E7D63 4.2 | Brick brown, coral and gold, with sage-black firs as the counterweight. |
| **Autumn family (s1-s4 combined, 16)** | #B07A4E 10.0, #9C6138 9.6, #765235 9.2, #CC9765 8.6, #E6AE72 7.5, #826C56 6.7, #484839 6.4, #613219 6.1, #E69847 6.1, #2D281C 5.4, #A59483 5.1, #D2BAA7 4.6, #D3602B 4.6, **#D5DCED 4.5**, #96401B 4.4, **#9ABCC7 1.2** | Hue sits at 18-33° for 85% of the area. Cool colour is only sky (about 6%), and the evergreens are near-neutral sage. |
| s5 winter market | #19130D 17.6, #241C14 17.1, #3F362D 11.8, #0E0B07 11.0, #2D2924 9.9, #54473C 9.3, #382718 9.0, #6D5B4B 5.3, #533821 5.0, #A07A57 2.0, #7B4F2A 1.7, **#DDBE9A 0.4** | Very low key (lum p5 16, p50 40, p95 85). 81% warm, 0% cool. The lights cover under 1% of the frame and still carry the image. |

Global statistics (warm / cool / grey share, mean saturation, luminance p5/p50/p95):

| Image | Warm | Cool | Grey | Mean sat | Lum p5 | Lum p50 | Lum p95 |
|---|---|---|---|---|---|---|---|
| s1 | .86 | .08 | .04 | .53 | 64 | 146 | 217 |
| s2 | .96 | .00 | .04 | .57 | 38 | 108 | 184 |
| s3 | .81 | .02 | .16 | .26 | 52 | 106 | 187 |
| s4 | .79 | .05 | .06 | .36 | 51 | 104 | 177 |
| s5 | .81 | .00 | .19 | .26 | 16 | 40 | 85 |

### 1b. Named swatches: autumn daylight family (s1-s4)

| Swatch | Measured (mid / lit / shade) | **Game albedo** | Notes |
|---|---|---|---|
| Foliage vermilion | #D44B28 / - / #A02614 (s2) | **#D9542E**, alt #E8743E | s2's whole-tree colour |
| Foliage burnt orange | #DF5F31 (s2 quant) | **#E07A3A** | already in `SEASON.fall.maple` |
| Foliage rust/russet | #945F4A / #D4A587 (s3, graded) | **#A8492E**, alt #B8603F | s3 trees |
| Foliage coral | #9B5235 / #B37C5A (s4) | **#C46A45** | s4 front tree |
| Foliage amber | #D58146 / #E7AE6D (s1) | **#E3A24A** | s1 canopies |
| Foliage straw-gold | #94713F / #C4A475, peak #DDC4A0 (s4) | **#D9B26A**, alt #C9A05A | one tree in 4 should be gold |
| Leaf-gap shadow | #A02614 under #D44B28 | vertex AO **x0.62** | dark notches between lobes |
| Fir (sage-black) | #313D2F-#3B4F3D / #465342-#677E5A / #1B271C-#142D26 | **#4A6450**; variants #44604E, #3E5847, #52705A; cedar #3A5544 | today's `firC` (#3f8f5f...) is about 2x too saturated and bright |
| Round shrub (pine-cone) | #31382E / #444A3B, tips #CDB78B (s3) | **#5B6B4A**, tip #B9A878 | |
| Mum | petals #BEB598 / #CDC5A9 (graded) | petal **#F2EAD6**, leaf #4F6038 | |
| Ground, leaf-amber | lit #E9A652, shade #74431B (s2) | **#E3A253** | yards under maples |
| Ground, straw-olive | #7A5632 / #AD8148 (s3/s4 beds) | **#BFA45E** | November grass (today's `PAL.grass.fall` is #A8C25E, too green) |
| Leaf litter dots | | #C9752E, #A8492E, #E3A24A, #8A3F21 | |
| Leaf pile | #8A3F21 / #A75C31 / #63250F | **#8A3F21**, lit #B8603F, shade #5A2410 | |
| Sand-brick paving | #D09B69 / #E7AD72 (s1) | **#D6A06A**, light grout #E9C08E | |
| Running-bond brick | face #986943, mortar #493617 (s4) | **#9A6A45**, mortar #4A3618 | |
| Herringbone brick | #7A624E, mortar #A58469 (s3, graded) | **#9A6450** rose-brown, mortar #C7A887 | |
| Slab border | #C0A489 / #D0B59B, joints #5A5441 | **#CDB496**, joint #6E604E | |
| Stepping stone | #9F6E56 (sunlit) | **#A88676** mauve-taupe, rim #6E5048 | |
| Leaf-stone wall | #A9642B / #CF8A45 / #884815 (s1) | **#C27A3E**, gaps #6A3A18 | |
| Chocolate stone (quoins, base, arch) | #5E3724 / #86512F (s2) | **#6B4430**, bevel highlight #9A6A48 | |
| Cream stucco | #BE8556 / #D8B48F / peak #F1E0C6 (under orange sun) | **#E6D2AE** | |
| Cream siding | #C1A996 / #D8BCA2 (s3) | **#E9DCC4** | |
| Terracotta roof | #6C2F21-#8B3F2B / #B5776A / #492018 | **#9A4530**; tiles #B5583A, #7E3524, #8B3F2B; lit edge #C87A5A; ridge #965638 | |
| Door walnut | #46281E / #8C563A | **#5A3426**, plank groove #3A2018 | |
| Log fence, stained | #BC501C / #ECA45A / #71280E (s2) | **#BC501C**, end-grain cap #EED3AE | |
| Log fence, honey | #F0A94C / #F6B965 / #B87A3E (s1) | **#E09A48** | |
| Deck plank | #DBA97A | **#D8A374** | |
| Trunk | #8B471F / #CC6F2B | **#7A4A2C** (today #8a5a3a is fine) | flared roots |
| Pumpkin | #CD7D38 / #F7B55B / #84461A | **#E58A3A**, groove #A8551F, stem #6B5A2E | |
| Jack-o'-lantern glow | core #FBD981, lit #F6BD67 | emissive **#FFC96A**, GLOWPTS halo #FF9A40 | |
| Awning stripes | #D17940 + #FECC98 | **#D96A35 / #F4E6CC** | |
| Tablecloth | white #F8F8F7, gingham #E5C6A2 | #F8F6F0 over gingham #E5C6A2 / #F3E9D8 | |
| Iron (lamps, benches) | #484D40 / #3F4336 (green-black) | **#2F3A34** | B8 posts are #2F4A44, slightly too blue |
| White-painted lamp | lit #C5C1B8 | **#EDE6D8** | |
| Sky day | s4 #84BCCE, s1 #C9DCFC, peak #F5F6FA | top **#8FB8D8**, horizon **#D8E2F2** | |
| Sky overcast and dusk | s2 #9897A4, clouds #DABAB5; s3 #6D7F73 teal-grey | #A7A6B4, cloud undersides #DABAB5 | |
| Shadow tint (see section 4) | shade/lit ratio R .49-.60, G .40-.52, B .32-.49 | autumn-day ramp texel **#8A6E78** | |
| Warm highlight | pumpkin peak #FFD384, log #FACC95, paving #FAC875 | sun gain and rim **#FFE2B0** | |

### 1c. Named swatches: winter-night market (s5)

| Swatch | Measured | **Game value** (lifted for phones) |
|---|---|---|
| Window amber | glass #553419 / #BB8650; core #F7E4C5; halo #E3BF94 | emissive **#FFC873**, core #FFE7B8 (through the WLT window table) |
| String-light gold and tree bulbs | core #F9F0DA-#FAF1DD; halo #C7A37B-#D3AD84 | bulb **#FFF1D0**, GLOWPTS halo **#FFC27A** |
| Candle | core #FCF1D5, halo #ECC695 | #FFF0CC |
| Lantern | core #F8EBD7, halo #F2E1CC; body #67401E | emissive #FFD9A0, body #3A2A20 |
| Snow, lamp-lit | ground #4C4036 / #705D4C / peak #A68566 | **#E6D3B8** (warm where lamps reach) |
| Snow, shade and moonlight | (the reference has NO blue: warm taupe throughout) | **#7A7488**, lavender-grey to stay compatible with B15 |
| Snow, far roofs | #71665A / peak #948573 | #9A92A6 |
| Deep brown shadow | #19130D 17.6% + #241C14 17.1% | **#241C14** (lift it in the grade; see section 6) |
| Plaster between timbers | lit #876D56 | #CDB79A |
| Timber | #150F0B / #443426 | #3A2A20 |
| Sky (market night) | #2E2C27, clouds #4F4A41 | top #1C1A22, horizon #3A3330 (warm brown-plum, not navy) |
| Mountains | #211E1B, snow #9A8163 | #2E2A30, snow #8E8496 |
| Moon | #B5916B / #DBBE9C / core #EAD0AD (warm cream) | **#F0DDBE**, halo #E3C8A7 |
| Wreath | crushed #101009 | #2E4A34, berries #B0302A |
| Bow red | #250C07 / #36150C (the saturated accent of the scene) | **#A8282A** |
| Gingerbread heart | cookie #9E6839, icing core #F2DCBF | cookie #A8683A, icing #F6E6CC, ribbon #B0302A |
| Red shawl | #391D10 | #8E3A2A |
| Visitor fur | #18120D / #4E3A29 | #3A2C26, frost tips #D9D2E4, eyes #FFC873 |

---

## 2. Shape language

The whole family is built from **soft, chunky, stacked, scalloped** forms.
- Nothing is thin except iron lamp posts and chair legs.
- Every edge is bevelled or rounded.
- Every repeated element (leaves, fir fringes, stones, bricks, pumpkin ribs) has a slight random variation of about ±8% in value and ±10% in size.

### Scale (in walker-heights H, read from s2, s3 and s4; approximate)

| Object | Size |
|---|---|
| Chibi villager / walker | 1.0 H (head 45-55% of height) |
| Pumpkin | 0.35-0.45 H |
| Mum clump | 0.4 H |
| Round shrub | 0.7-0.9 H across |
| Fence post | 0.5-0.55 H |
| Bench seat | 0.35 H |
| Door | 1.3-1.5 H tall, 0.8-0.9 H wide, arched |
| Three-pumpkin stack | about the door's height (s2: 105 px vs 115 px) |
| Lamp post | 2.2-2.6 H |
| Small fir | 1.5-2 H |
| Maple | 2.5-3 H |
| Cottage | eave about 2 H, ridge 3.5-4 H |
| Leaf pile | about 1.2 H wide x 0.25 H tall |

Trees are only 2-3x the character. That keeps the canopy inside the frame at a 34° pitch.

### Deciduous canopy: lobed shingle tiers

**What the references show** (crops `ex-s2-canopy`, `ex-s3-left`, `ex-s4-left`, `ex-s4-right`):
- Each tree is **2-3 stacked rounded tiers**, like stacked cupcakes: the bottom tier is widest and the top is small, slightly offset.
- Each tier is covered in **rows of maple-leaf tips** (3-5 points) that overlap downward like roof shingles.
- Each row's lower edge is scalloped, and there is a dark gap under each row.
- Silhouette: lumpy and scalloped, never a smooth sphere.
- The trunk is short and thick, with 3-4 flared roots.

**Build.** Replace `bigPuffG`/`puffG` in the maple branch of the tree batch (search `else{t.maple=true`) with a cached `leafTierG(N=11,rows=3)`. It is a dome made of 3 overlapping ring strips:
- Each ring's lower edge alternates tips (radius x1.06, y −0.07) and notches (radius x0.90, y +0.02).
- The rows overlap by 0.12 and are staggered by π/N.
- Add a top fan.
- Store a greyscale `color` attribute: tips 1.08, notches and undersides **0.62**, top 0.95.
- Stack 3 tiers: bottom (r 2.4, y 4.6), middle (r 1.8, y 6.0, offset 0.3), top (r 1.1, y 7.1).
- Add a dark inner core: `smallPuffG` at x0.8 radius, colour x0.55, so the gaps never show sky.

**Cost.** About 220 triangles per tier, so about 700 per tree. Today's maple is about 740. It stays in the same `leaf` Batcher key and the same `VEG` material, so it adds **0 draws**.

**One-line Batcher hook.** In `addM`, multiply the existing up-facing factor `f` by `geo.attributes.color ? geo.attributes.color.getX(j) : 1`. This gives every scalloped geometry baked AO with no new material.

**Colours.**
- Mix per town: 40% orange (#E07A3A, #D9542E), 25% rust (#A8492E, #B8603F), 25% gold (#D9B26A, #E3A24A), 10% coral (#C46A45).
- Jitter per tier (`jit()` already exists).
- Make the top tier +4% lighter, like the existing fir top-tier trick.

### Tiered fir: scalloped skirts

**What the references show** (crop `ex-z-s4-fir`):
- **5 tiers**, each a drooping skirt whose rim is about 14 rounded "fingers".
- Each tier is wider than the one above, and the outline is a slightly bulged cone.
- Colour is a desaturated sage-black. Lit fingertips are about 1.3x the mid value, and the underside of each skirt is near-black.
- The trunk shows below with a root flare.

**Build.** Replace `tierG` (the lathe profile `[[0,0],[.82,.04],[1,.17]...`) with a cached `firTierG(14)`:
- A top cone from the center (y 1.0) to the shoulder (r 0.8, y 0.32).
- A rim ring of 14 fingers: tip at r 1.0, y −0.06; notch at r 0.86, y 0.10; with a mid vertex to round each finger.
- An inner underside ring at r 0.5, y 0.05, so the skirt has visible thickness.
- AO colour: underside 0.5, notch 0.7, tip 1.1.

Use 5 tiers (today it is 3, and cedars 4): R 2.9, 2.35, 1.85, 1.35, 0.85, stepping up by about 1.25.

**Cost.** About 110 triangles per tier, so about 590 per fir (today about 390). That is roughly +26k triangles town-wide and **0 draws**.

**Snow.** Snow caps reuse the same geometry at x0.66, as the code does today.

### Round shrubs and mum clumps

- **Pine-cone ball (s3):** a sphere of overlapping petal-scales. Build: `leafTierG(9,4)` squashed to y 0.85, colour #5B6B4A, tip highlight #B9A878.
- **Sage hosta and round bush (s2, s4):** a lumpy dome. The existing `smallPuffG` triple with radius jitter is fine; recolour it #5B6B4A to #6E7A55.
- **Mums:** 3-5 heads.
  - Each head is IcosahedronGeometry(1,1) at 0.14 H, with ±12% radial vertex jitter for a ruffle, colour #F2EAD6.
  - Stems 0.25-0.4 H tall, on a dark leaf dome #4F6038.
  - White, rust (#B8603F) and butter (#E8C25A) variants.
- **Dried grass tufts:**
  - 6 tapered cones, `Cone(.03, .6H, 3)`, fanned out, colour #D9C79A, with plume tips #EDE0C0.
  - Or, if B41's instanced flower clumps land, crossed alpha cards.

Everything in this section merges into the Batcher `bush` key, so it adds **0 draws**.

### Leaf piles (s2, s3)

A low irregular mound of rust leaf-cards, about 1.2 H by 0.9 H by 0.25 H:
- a hemisphere `Sphere(1,10,5,0,2π,0,π/2)` scaled (1.2, 0.25, 0.9) H, with ±8% radial jitter, colour #8A3F21, AO 0.6 at the rim
- plus 6 tiny flat leaf quads on top in #B8603F and #E3A24A

It merges into the Batcher `bush` key.

### Ribbed pumpkins and stacks

**What the references show** (`ex-s1-topleft`, `ex-s2-pumpkins`):
- 6 ribs, squashed to about 0.78 of the width, with a top dimple and a bent stem.
- Stacks of 3 at scales 1.0, 0.82 and 0.66, slightly rotated.
- Jack-o'-lantern faces on the stacked ones.

**Build** `pumpkinG`:
- Start from `Sphere(1,18,10)`.
- For each vertex with θ = atan2(z, x), multiply the radius by `1 − .08·(1 − min(1, 3·|sin 3θ|))`, which gives 6 narrow grooves.
- Set y ×= 0.78, then pull the poles in by `.12·(1 − rxz²)`.
- Colour attribute: grooves 0.72.

Reuse the existing instanced `pumpkin(KP,KS,KF,...)`, so it adds **0 draws**. Only the top jack-o'-lantern of a stack gets a halo, and that halo goes in GLOWPTS, not `hGlow()` (see section 5, funding).

### Rounded log fences

- **s2:** vertical round posts (r 0.12 H, 0.55 H tall) spaced about 0.45 H apart, with **pale end-grain caps** (#EED3AE). One horizontal rail behind, at 60% of the height. Stain #BC501C.
- **s1:** two horizontal round rails with round end caps and stub posts, honey #E09A48.

Build: `Cyl(.12,.12,1,8)` plus a cap disc with a 2-ring vertex colour. Static runs merge into Batcher. If B41's fence kit is built as InstancedMeshes, that is 2 draws for every fence in town.

### Chunky stone

- **Quoins (s2):** corner stones alternating long and short, about 0.45 x 0.25 H. Base course about 0.35 H tall, 4-5 stones per wall. Door arch: 9-11 voussoirs.
- Build with `rbox(w,h,d, r=.25·min, bev=.06)`:
  - jitter scale ±12%, rotation ±0.06 rad, value ±8%
  - set the stones 0.03 proud of a darker inset wall #4A2E20
- **Leaf-stone retaining wall (s1):** almond-shaped flat stones laid diagonally in 2 courses, like fish scales.
  - Flattened ellipsoids (1 x 0.45 x 0.25), alternating ±25°, colour #C27A3E on gap #6A3A18.
  - Topped by the honey log fence.
  - Use it to terrace the café or market plaza.

### Cottage (s2), as a kit for homes

| Part | Spec |
|---|---|
| Walls | cream stucco #E6D2AE |
| Base course and quoins | chocolate #6B4430 |
| Roof | steep (about 50°) gable of chunky irregular terracotta tiles in 3 tones; thick rounded eave and barge boards #5A2E22 |
| Gable window | arched-top casement, 2x2 panes, thick dark frame |
| Eyebrow dormers | 2 small |
| Door | arched plank door #5A3426 with iron strap hinges |
| Wreath | autumn wreath of mushrooms, berries and leaves |
| Lanterns | 2 black wall lanterns, 4-pane, about 0.4 H, either side of the door |
| Steps | 2 stone steps, rounded |

---

## 3. Surfaces (canvas textures, primitives only)

General rule: **hand-painted and low-frequency.**
- Use 2 octaves of value noise at wavelength ≥ 1/4 of the texture, ±4-6% value.
- Add 6-10 soft brush dabs (ellipses at 6% alpha, light and dark).
- **No high-frequency grain**: it aliases and shimmers on a moving phone camera.
- Every joint gets a 1-2 px darker edge on its lower-right side (soft AO in the gaps), plus a 1 px 12%-white bevel on its upper-left side.
- Ground textures at a 34° pitch need `anisotropy = min(4, renderer.capabilities.getMaxAnisotropy())`, or the brick turns to mush.
- Avoid `ctx.filter` (Safari support is unreliable). Soften with stacked strokes of decreasing alpha.

| Surface | Canvas | Pattern | Colours |
|---|---|---|---|
| **Herringbone square** (s3) | 256², repeat every 2.5 H | 2:1 bricks, 32x16 px at 45°, 2 px light mortar | brick #9A6450 ±6%, mortar #C7A887 |
| **Slab border** (s3) | strip, 64 px slabs | 1 H square slabs, 2 px joints; every 6th slab an iron grate plaque (original motif, e.g. a ghost-lantern crest) | #CDB496, joint #6E604E |
| **Running-bond path** (s4) | 256x128 | bricks 48x14 px (3.5:1), half offset per row, 3 px **dark** mortar; 10% of bricks darker (#7E5232) or lighter (#B07E55); raised brick kerb 0.15 H on both sides | #9A6A45 / #4A3618 |
| **Sand-brick paving** (s1 plazas) | 256² | small 24x10 px bricks, **light** grout, low contrast | #D6A06A / #E9C08E |
| **Plank deck** (s1) | 256² | planks 0.25 H wide, random lengths 1-2 H, 1 px gaps #6A4A2E, nail dots | #D8A374 |
| **Stepping stones** (s2) | geometry, not texture | rosettes: 1 centre + 6 flat pebbles (8-sided cylinders, 0.03 H tall, r 0.12-0.18 H), spaced 0.9 H along a path | #A88676, rim #6E5048 |
| **Leaf litter** | existing `SEASON.litter` instanced quads | plus an **amber leaf carpet** within r 4.5 of each maple, at 60% opacity | #D9A050 |
| **Yard ground** | | straw-olive with tiny pale triangle grass marks (s3 and s2 ground show these); amber leaf carpet under trees | #BFA45E, marks #D8C080 at 25% |

**Soft path edges.** Paths fade into the ground over about 0.3 H: 6-10 px of stacked strokes, never a hard line. Brick paths are the exception: they get a 0.15 H raised brick kerb (s4).

---

## 4. Lighting and camera

**Sun.** Low and warm, which our real calendar already gives us. Seattle (47.6° N) on Nov 3 has a noon solar elevation of about 27°, and about 19° at the solstice, so shadows are naturally long.
- Afternoon sun gain #FFD9A8 (the B41 golden key) from 13:30 to sunset.
- Shadows should be soft: a penumbra of about 10-15% of the caster's height (the s2 house shadow).
- With `PCFShadowMap`, `light.shadow.radius = 3-4` softens shadows. `PCFSoftShadowMap` ignores the radius.

**Shadow tint: measured, and it is warm, not cool.** On ground surfaces, shade/lit ratios are:

| Surface | Shade/lit (R, G, B) | Lit → shade |
|---|---|---|
| s1 deck | .49 / .40 / .32 | |
| s1 lower plaza | .60 / .51 / .47 | |
| s2 sand yard | .50 / .41 / .34 | #E9A652 → #74431B |
| s4 brick | .60 / .52 / .36 | |
| s3 herringbone | .57 / .52 / .49 | |

The hue drops 3-6° (toward red) and saturation drops a little: shadows are **warm umber**. The only cool element in s1-s4 is the sky.
- B15's lavender ramp texel #7C7A9C gives a similar result on orange ground, but it pushes cream and green surfaces cool-grey.
- **Recommendation:** in autumn daylight (Sep 22 to Nov 30, sun up), lerp `PAL.toon[0..2]` toward **#8A6E78** ("mulled mauve") and the mid band #DCCFD0 toward **#E6CDBF** (peach). On amber ground, #8A6E78 gives #7B4627 against the measured #74431B.
- Keep the lavender at night and in winter, as B15 specifies.
- Warm the hemisphere ground bounce from #A39B7A to **#B8946A** in autumn daytime.

**Contact shadows.** s1 has a soft dark blob under every table and chair. On the LOW tier (no shadow maps), props float. Fix: one shared InstancedMesh of multiply-blended radial-gradient blobs (#3A2414 at 35%) under props and characters. That is +1 draw, funded in section 5.

**Lamp bloom.**
- Daytime refs: none (lamps are unlit).
- s5: every light has a halo 3-5x its size and **no light pool** on snow beyond about 1.5 m.
- Do this with GLOWPTS halos and the B8 ground-pool InstancedMesh. Add no lights.

**Tilt-shift.**
- s3 is strong: roughly the top 30% and bottom 12% are blurred.
- s1 and s4 are mild.
- B41 HIGH (top 18%, bottom 10%) is right. On landscape, allow up to 24% at the top.
- On MED (no blur pass), fake it with a distance haze toward warm cream #E9D9C0 plus the existing world bend.
- Add a **warm vignette**: multiply #3A2A20 at 15-18%, falloff from 0.65 radius. It is visible in s3 and costs one line in the B41 grade pass.

**Camera pitch.**
- The follow camera is already `camS.pitch .6` (34°), which matches s3/s4 (about 30-35° down a path). Keep it.
- Add two CAM presets:
  - "overview": pitch about .9 (s1, near top-down over terraces), for the arrival glide and photo mode
  - "porch": pitch about .28 with a short distance (s2 frontal house portrait), for home hero moments and photo mode

**FOV.** The refs read as a narrow, slightly telephoto 30-40° that stacks layers. B41's 46° (portrait) and 40° (landscape) are fine; desktop could go to 38°.

**Foreground framing.**
- s2: fence posts along the bottom edge, with trees as left and right wings.
- s3: two round shrubs in the bottom corners.
- s4: a fir and an orange maple in the bottom corners.

On a phone, framing props stay in the **bottom 12% and outer 8%**. They must be low (fence tops, shrub crowns cut by the frame edge) and never between the camera and Mocha; the existing shell fades handle tall occluders.

---

## 5. Composition and dressing density

**Density measured.**
- s1: about 25 props on the upper terrace, about 1 per 4 m² of a tile grid.
- s2: about 12 in the yard, about 1 per 5 m².
- s3: about 14.
- s4: every bed is completely planted.

Rule for us: **no bare patch larger than 2x2 H within 12 m of a door, bench, stop or path that the follow camera frames.** Away from paths, it can stay calm.

**Layered planting** (s4 is the model):
- Back row, tall (2.5-3 H): alternate warm maple and dark fir, **never two of the same next to each other**. The s4 rhythm is orange, gold, fir, gold, orange, fir.
- Middle row (0.6-0.9 H): round shrubs, dried grass, a windmill or trellis.
- Front row (0.25-0.45 H): mums, leaf piles, pumpkins, stepping stones.

**Themed vignettes** (one kit each, so every place in town reuses them):

| Vignette | Where in our town | Contents |
|---|---|---|
| **Porch** (s2) | every home: Mocha's, Wendell's, the cabin, townsfolk (B40) | arched door + wreath, 2 wall lanterns, a 3-jack stack on one side, a stump with a jack-o'-lantern and shelf mushrooms on the other, 1-2 leaf piles, 3 stepping-stone rosettes, a log-fence front, a little book-box or mailbox, a hosta |
| **Café terrace** (s1) | market and café plazas | a cart or kiosk with a cream/orange striped awning (original, no truck livery), 2-4 round tables with white cloth over gingham, bentwood chairs (iron #2F3A34 with honey slat seats), chalkboard easel, barrel with a pumpkin, crates of pumpkins, orange/gold/brown pennant bunting, a white-bulb string line on poles, a terrace wall of leaf-stones with a honey log fence |
| **Entrance square** (s3) | Rain City Station forecourt (train arrivals) | herringbone square in a slab border, 2 black carriage lamps, a bench with a book stack, a bulletin board, 2 pine-cone shrubs at the front corners, leaf piles, a russet maple each side, the shopfront behind with an awning stripe |
| **Garden path** (s4) | park and nursery | running-bond brick path with a kerb, raised beds, mums and dried grass, a white crook lamp, a windmill or weathervane, string lights across the back |

**Funding the draw budget (we must not add draws).** Everything above merges into existing Batcher keys (`leaf`, `bush`, façade batches) or reuses existing InstancedMeshes (pumpkin KP/KS/KF, lamps, litter). The only new draws are the blob-shadow decal (+1, LOW tier) and the B41 strands. Pay for them with two savings I saw in the current file (read-only):
1. Fall leaf litter builds **one InstancedMesh per colour** (`mats.map(m=>new THREE.InstancedMesh(lg,m,...))`, 6 colours in fall). One InstancedMesh with `setColorAt` saves **5 draws**.
2. Round-1 holiday `hGlow()` creates a **Sprite per halo** (`glow()` makes a new SpriteMaterial each time; 11 call sites). Moving the static ones into GLOWPTS (one draw for all, per spec section 0) saves one draw per halo in October and December.

---

## 6. The winter market (s5)

**What s5 shows** (crops `ex-s5-*`):
- **Half-timbered houses:**
  - dark timber grid with X and diagonal braces on warm plaster
  - jettied upper floors
  - steep (55-60°) roofs under thick snow with icicle drip edges
  - stepped dormers, chimneys with snow caps
  - mullioned windows glowing amber
- **Wreaths:** a big wreath with a red bow on a facade.
- **Hanging sign:** a carved iron-bracket sign with a stag silhouette.
- **Stalls:** open timber stalls with snow-lipped roofs, a garland swag with a red bow along the eave, warm bulbs under the eave, **hanging gingerbread hearts** with white icing, candles on the counter, baked goods in crates.
- **Square:** a gothic spire and church behind, a **giant tree** about 6-8x a person's height lit with hundreds of warm bulbs and a star, a stone **fountain-column with a statue**, its own wreath and bow, and a snowy basin.
- **Background:** dark pines, **snowy mountains**, a full warm **moon** in drifting cloud, steady **snowfall**.
- **Crowd:** villagers in long coats and hats, and a **horned, shaggy visitor** with a twig bundle.
- **Palette:** amber points on deep brown-grey; the only saturated colour is the bow red.

**Translation for a phone** (the s5 key is far too dark for a phone screen in daylight):
- Lift the market grade to roughly lum p50 70-80 and p95 200+, applied only to the bulbs and windows.
- Keep the *ratio*: lights under 2% of the frame, and **everything else in deep warm browns** (#241C14 to #6D5B4B), not navy.
- On Winter Market nights (Dec 1 to Jan 6, after 16:30), add a B41 grade override: lift #2A1E18 at .07, gain #FFE2BC, sat .9.
- Snow in shadow is lavender-grey #7A7488 (B15). Snow in lamp reach is warm #E6D3B8.

**Kit** (all primitives and canvas, no lights):

| Part | Build | Draws |
|---|---|---|
| Half-timber façade | wall box with a 256² canvas: plaster #CDB79A, timbers #3A2A20 (posts every 1/4 of the width, rails at floor lines, X braces in alternate panels); upper floor box +5% jettied; WLT windows 2x3 panes | 0: façade batch + sign atlas |
| Snow roof | steep gable plus a separate cap slab whose lower edge has rounded drips (an extruded shape with a scalloped edge), colour via B41 `roofMats` → #F4F8FC | 0: roof batch |
| Hanging sign | iron scroll bracket as a quad in the SIGN atlas, painted board with an **original** emblem (a salmon, a teapot, a pretzel, a little ghost) | 0 |
| Market stall | timber frame, snow-lip roof, garland (a tube of #2E4A34 puffs) with a red bow, 8-10 bulbs on a B41 strand under the eave, 5-7 gingerbread hearts as sign-atlas cards, 2 candles (emissive + GLOWPTS) | 0 (strand: shared with B41) |
| Giant tree | `firTierG` x 7 tiers, 6-8 H, snow on each tier; a spiral strand of up to 400 bulbs (B41 `addStrand`, 1 draw); emissive star + GLOWPTS halo; reuse the B41 lighting cascade and chime | +1 (strand) |
| Fountain | octagonal basin (`rbox` segments) with a snow lip, ice disc #B9C4D2, a column with wreath and bow; statue: **a stone heron holding a lantern** (PNW, original), not a saint | 0 |
| Backdrop | B41 mountain with a snow cap; the moon at warm cream #F0DDBE for market nights; pines as `firTierG` silhouettes | 0 |
| Snowfall | the existing `rain` Points, which already swaps to `snowTex` when `WEATHER.kind==='snow'` | 0 |

**PNW tie-in: Leavenworth, Washington.**
- These facts are true:
  - It is a real town in the Cascades (Chelan County, on the Wenatchee River) that re-themed itself as a Bavarian village in the 1960s.
  - It is famous for its Christmas lighting, the "Village of Lights".
  - It has a Nutcracker Museum.
  - Amtrak's Empire Builder (Seattle to Chicago) stops at Leavenworth's Icicle Station, about 3 hours from Seattle, so it fits our train destinations. The spec already has keepers asking "how was Leavenworth?!".
  - The subalpine larches in the nearby Enchantments turn gold in October.
- Check the current timetable and festival dates before quoting them in game text (spec truth rule).
- Use it as **the December train-trip diorama**: the evening arrival into a lit village is the s5 picture. Our own town square gets a smaller version of the market layer from Dec 1 to Jan 6.

**The Krampus-like visitor, original and spooky-cute: "Tamarack, the Larch Goat".**
- **Name.** Tamarack is an old common name for larch trees, a nod to the gold larches above Leavenworth.
- **Who he is.** He is the Halloween cast's *winter cousin*: a shaggy, grumbly-polite mountain goat spirit who rides the train down from "up the Icicle" on **Dec 5 evening**. True folklore: in Alpine tradition, Krampusnacht is the eve of St. Nicholas Day.
- **Look** (chibi kit, about 1.3 H, round silhouette):
  - A coat of stacked scalloped fringes that **reuses `firTierG`**, in umber #3A2C26 with frost-white tips #D9D2E4 (vertex AO). That means no new geometry type.
  - A gold larch-needle mane #D9B26A.
  - Short curled horns (torus arcs, #E8D9B8) with tiny brass bells #D9A94A.
  - Big warm amber lantern eyes (emissive #FFC873, no light) and a tiny pink tongue tip #E88AA0.
  - Little cloven boots.
  - A birch-twig bundle (6 thin cylinders, #E9E2D6 with dark marks) tied with a red ribbon #A8282A.
  - A garland of **tin stars** #C9C2B0 instead of chains.
- **Behaviour (gentle mischief, never threatening):**
  - He sweeps snow off doorsteps with his twigs.
  - He jingles his bells to make children squeal.
  - He leaves a "good coal" licorice drop for grumps and a gingerbread heart for the kind.
  - He warms his hooves by the fountain.
- **Autonomy.** He is townsfolk, so he may stop and face you. Mocha's reaction (peek from behind the big tree, offer cocoa, or hide giggling) is only a weighted `localChoose` candidate. It is never triggered.
- **Draws.** Full rig at most 8 draws when he is among the 8 nearest; otherwise a 1-draw LOD (B19).

---

## 7. The 15 highest-impact traits to adopt (ranked)

1. **Scalloped, tiered leaf-cluster canopies instead of smooth sphere puffs.** On a 393-px-wide screen, a tree is 60-150 px tall. Smooth spheres read as balloons, while a scalloped silhouette with dark inter-row gaps reads as "leaves" even at thumbnail size. It is the single most recognisable trait of the references, and costs 0 draws in the same VEG batch.
2. **Five-tier scalloped firs in desaturated sage-black (#4A6450), alternating with maples.** On small screens, value contrast does the work hue cannot. The near-black firs make the orange read as glowing. Today's bright mint firs flatten everything. 0 draws.
3. **A warm-dominant, mid-key autumn palette** (foliage set, straw-olive ground #BFA45E, amber leaf carpet, warm umber shadows #8A6E78). The refs are 79-96% warm pixels with mid-key ground. That makes **Mocha (white) the brightest thing on screen**, an instant focal point at phone size.
4. **Patterned paving with readable scale:** herringbone squares in slab borders, running-bond brick with dark mortar, sand-brick plazas. At a 34° pitch the ground fills 50-60% of a portrait frame, so it is the largest surface the player sees. Canvas textures only, 0 draws; anisotropy 4 keeps them crisp.
5. **Dressing density by vignette, with a prop every ~2 m along camera-framed paths.** Bare ground looks unfinished on a phone, while a filled foreground looks like a diorama. Kits make it repeatable.
6. **The porch vignette kit on every home:** arched plank door + wreath, twin black lanterns, jack-o'-lantern stack, stump jack, leaf piles, stepping stones, log fence. Homes are where the camera lingers (visits, B31), so this is high exposure.
7. **Ribbed pumpkins, stacks and jack-o'-lanterns with GLOWPTS halos.** They follow B15's "saturation only on small things": small, saturated, unmistakably seasonal accents that survive any downscale. They reuse the instanced pumpkin.
8. **Rounded log fences with pale end-grain caps, and low stone or leaf-stone walls.** They give the frame a readable bottom edge, and the caps catch light in a rhythm that reads at 4-6 px. They also terrace plazas the way s1 does.
9. **Soft warm shadows plus contact blobs.** Without grounding, props float, and that is the cheapest "looks cheap" tell on phones. Blob decals cost +1 draw (funded by merging the litter meshes) and cover the LOW tier, which has no shadow maps.
10. **Chunky bevelled stone** (quoins, base courses, arches, steps). Chunky silhouettes survive downscaling where thin trim vanishes, and it uses the existing `rbox()`.
11. **Tilt-shift and a warm vignette on HIGH; warm cream distance haze on MED.** These make the "miniature diorama" read and pull the eye to the subject band. It is one line in the grade pass, and no blur pass on MED.
12. **Layered planting: tall warm/dark alternation, mid shrubs and grasses, front mums and leaf piles.** On a flat phone screen, depth comes only from overlap and value steps; three clear layers deliver both.
13. **Linear accents: iron carriage lamps, white crook lamps, pennant bunting, white-bulb string lines, striped awnings.** Thin straight lines and stripes read at thumbnail scale and guide the eye. At night they become the light structure through the instanced lamp pool and GLOWPTS.
14. **A winter-market night: few warm points on deep warm browns** (half-timber, snow roofs, a giant lit tree, stalls with gingerbread hearts). It gives December its own identity. The lifted key keeps it legible on a phone in daylight, and the Leavenworth train trip gives it a true PNW anchor.
15. **Leaf litter, leaf piles and a few falling leaves.** They tie the ground to the trees and add gentle motion. For falling leaves, reuse the `rain` Points: it already swaps its map between `rainTex` and `snowTex`, so a third swap to a leaf texture on dry fall days, at low count and opacity, costs 0 draws (LOW off). With one InstancedMesh for litter, this is net −5 draws.

---

### Appendix: crop index (`/tmp/harness/style/crops/`)

| Image | Crops |
|---|---|
| s1 | `ex-s1-truck`, `-tables`, `-wall-fence`, `-left-mid`, `-right-mid`, `-bottom`, `-topleft`, `-topright` |
| s2 | `ex-s2-canopy`, `-door`, `-roof`, `-stump-stones`, `-pumpkins`, `-fence`, `-right`, `ex-z-s2-leafpile` |
| s3 | `ex-s3-walker`, `-shop`, `-left`, `-right`, `-front`, `ex-z-s3-herring`, `ex-z-s3-cone-shrub`, `ex-z-s3-lamp` |
| s4 | `ex-s4-left`, `-path`, `-right`, `-front`, `-back`, `ex-z-s4-fir` |
| s5 | `ex-s5-sky`, `-left-house`, `-stall`, `-visitor`, `-tree-church`, `-fountain`, `-ground`, `-crowd`, `-midstall` |
| Checks | `ex-swatch-sheet-0..2`, `ex-chk-s1`, `ex-chk-s2`, `ex-chk-s4`, `ex-palette-autumn`, `ex-palette-winter_night` |

The unprefixed `crops/s1-*` … `s5-*` files (19 of them) and the `i*` and `boxes-*` files were made by other passes, not this one.

Note for the wardrobe analyst: the s3 walker wears a **plaid newsboy cap, round glasses and a grey knit sweater with dark trousers**. All three are generic menswear and are good Your Look (B18) items for the owner's guy walker.

Code touchpoints (read-only; nobody edits `index.html` in this workflow):
- `tierG`, `bigPuffG`/`puffG`, `firC`, `mapleC = SEASON.maple`
- `Batcher.addM` (the vertex-colour factor `f`)
- `SEASON.fall.litter` (per-colour InstancedMeshes)
- `pumpkin()` / `hGlow()` / `glow()`
- `PAL.toon`, `PAL.grass.fall`, `PAL.cobble`
- `camS.pitch .6`, `rbox()`, `GLOWPTS`, `LAMPS`
