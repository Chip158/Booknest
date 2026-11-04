# Addendum S: Autumn Keepsake, Cozy Vintage Interiors and the Winter Market

**Status: binding art direction from B27S onward.** It applies to the two style passes and to every later step that touches visuals (the per-step notes are in `/tmp/harness/style/later-notes.json`). The passes are two parallel tracks of two sequential sub-steps each (S17):
- B27S, exteriors: **B27Sa** (the look), then **B27Sb** (the dressing).
- B27T, interiors and wardrobe: **B27Ta** (the rooms), then **B27Tb** (catalog and wardrobe).

Where Addendum S and B15 disagree, Addendum S wins; section S0 lists every change. Sections 0 and 2 of `round2-spec.md` still apply in full (autonomy, performance, state, truth and IP).

**Revision 2.** An independent review checked this plan against the live code (read only). These sections changed:
- **S17.** Seam S0 now declares `STYLE` before `LAYOUTS` (a boot crash otherwise). It also adds the camera distance factor `STYLE.fovK`, pool height and rotation, a freeze switch for probes, `DAY` dates for the ledger scripts and per-track ledger files. Each block's placement is checked against the temporal dead zone, and each track is split into two sub-steps.
- **S2b.** The calendar follows `holTheme` exactly, and Nov 27-30 is decided. The existing winter case is re-coloured now.
- **S8, S16.** The draw claims now match what the batchers can do: foliage goes into the tree batch, and dressing gets its own batch with no shadows. Jack halos move to GLOWPTS.
- **S5, S6.** Tilt-shift and the post vignette are gated by camera layer. The narrower FOV is compensated by one distance factor in `placeCam`, so no hand-tuned camera layer changes.
- **S5, S10, S17.** T gets its own baked material, `BAKEMI`, so the interior ramp never reaches exterior buildings.
- **S2h.** The character test is value separation in either direction, so the owner's guy in dark clothes can pass.

**The owner's request.** He sent nine reference images, saying "Think more this style" and then "Like this too".
- Exterior: s1 autumn café plaza, s2 autumn stone cottage, s3 autumn town entrance, s4 autumn brick path, s5 painterly alpine winter market at night.
- Interior and wardrobe: i1 boutique outfit wall, i2 library-study, i3 book café, i4 Victorian study.
- All are in `/tmp/harness/refs/`.

**Evidence this addendum is built on** (read them for detail; this file is the decision):
- `refs-exterior.md` and `refs-exterior-palette.json`: measured palettes, shape recipes, the winter market.
- `refs-interior.md`: the INT palette, the architecture, lighting and furniture kits, and the Rainy Term wardrobe.
- `gap-exterior.md` and `gap-interior.md`: today's build against the references, with code anchors and measured draw calls.
- `now/*.png`: the before screenshots; `now/*draws*.json`: per-view draw splits.

**"Autumn Keepsake" is an internal working name only.** The s3 caption names a player's island "Keepsake". Never put "Keepsake", or any caption, watermark, creator name, shop name or code from the references, into game text.

---

## S0. What changes from the B15 art bible

| Topic | B15 said | Addendum S says | Why |
|---|---|---|---|
| Daylight shadow tint in autumn | lavender ramp (#7C7A9C) all year | Autumn days with the sun up use the mauve ramp TOONA, base #8A6E78 (S5). Night, winter, spring and summer keep the lavender | The references' shadows are warm umber. Lavender turned cream and green surfaces cool grey |
| Fall grass | #A8C25E | straw-olive #BFA45E, with leaf flecks and amber leaf pools | The lime grass was the main source of green in our frames |
| Road | #6E7486 blue-grey asphalt with a dash batch | warm grey setts #7A6A60, with the dashes baked into the texture | The road was the largest cool area on screen |
| Sidewalks and place walks | flat #F1E6D0 | running-bond brick canvas with a kerb | The references are paved in warm patterns |
| Firs | bright mid-green lathe cones (#3f8f5f to #57a36a) | sage-black #4A6450 in 5 scalloped tiers, all year | The dark mass is the counterweight that makes the orange glow |
| Deciduous trees | smooth sphere puffs | lobed leaf-cluster tiers | The "cotton balls" were the strongest un-cozy tell |
| Building families | plum #7E5A86, slate #6F8FB0, sage #9DB89A | mulberry #8A5E6E, fog slate #7B8C99, olive sage #A6AE8A. Butter, brick, log and gothic are unchanged; gothic trim becomes #E9DCCB | Warms Main Street and the square |
| Shop signs | white pill, navy UI font, MeshBasic | dark-wood board #4A2E22, cream lettering #F3E6CC, brass border #C9A06A, family accent on the edge | The pills read as app buttons and were the brightest thing in frame |
| Night sky | #141E4A / #2E3570 indigo | plum-umber #1C1824 / #3A2E36 | Our nights measured 58-78% cool; s5 measured 0% |
| Hemisphere at night | #8A96D8 / #2A2A3A | #8C849C / #2A221E | |
| Post pass | neutral vignette to .86; night tint (.94,.97,1.06) | warm vignette (#3A2A20 at 16% from radius .65); night tint (1.0,.97,.96); tilt-shift taps; both gated off under the close-up and room camera layers (S5) | |
| Lens | fov 64 when w<h, else 50 | 46 portrait, 44 Duo, 40 landscape and desktop, with one distance factor `STYLE.fovK` in `placeCam` so every camera layer keeps its framing (S6) | Less sky, less wide-angle stretch, a more miniature look |
| Interiors | the world ramp; cream plaster everywhere | the warm interior ramp TOONI, the INT palette, and dark wood framing a lamp-lit middle | The refs' rooms are one warm hue family |

**Unchanged from B15:**
- saturation only on small things
- characters stand out from their background; the test is now value separation in either direction (S2h), because the owner's guy wears darks
- shadows never below 25%
- Mocha's gothic house identity
- `rbox()` for rounded forms
- the RIM uniform (the night rim stays #9FB4FF, a cool accent on characters only)
- the `PATCH` pipeline and `TOONC` for characters

---

## S1. The look in five lines

1. **Autumn exterior.** A handmade diorama in honey, rust and gold over straw ground and warm brick, held together by near-black sage firs. Mocha, who is white, is always the brightest thing on screen.
2. **Light.** Low warm sun and mauve shadows, a warm haze in the distance, a soft miniature blur at the frame edges, and lamps that bloom softly at dusk.
3. **Interiors.** Dark wood frames a lamp-lit middle, all in one hue family (red-brown to orange-brown). Colour lives only on small things, and the window is the one cool note.
4. **December.** A few warm lights on deep warm browns: snow-lipped roofs, a giant lit tree, gingerbread hearts and one red bow colour.
5. **Wardrobe.** Rainy Term, a dark-academia line in tweed, cord, cable knit and camel, re-cut with trousers and square silhouettes for the owner's guy.

---

## S2. Palette tokens

All values are albedo or emissive for our toon ramps. Measured reference values are in the evidence files. B27S writes the PAL slots in place and puts the constant `AUT` in a small pre-block right after PAL's closing line. Early code (SEASONS, `grassTex`, the roads and walks) runs long before S's main block, so it can read only PAL, AUT, literal hexes and hoisted `function` painters. B27T adds `INT` in its own block, never next to PAL (see S17).

### S2a. Exterior, autumn (whenever `SEASON_KEY` is fall)

**Ground and paving**

| Token | Hex | Use |
|---|---|---|
| grass | #BFA45E | `PAL.grass.fall`, the yard ground |
| grassMark | #D8C080 at 25% | tiny pale triangle grass marks in `grassTex` |
| leafPool | #E3A253 at .25 alpha | amber leaf pools in `grassTex`, replacing the green radial blobs |
| litter | #C9752E, #A8492E, #E3A24A, #8A3F21 | leaf flecks and litter instances |
| leafPile | #8A3F21, lit #B8603F, shade #5A2410 | leaf piles |
| herring | #9A6450, mortar #C7A887 | herringbone squares (Lantern Square, the station apron) |
| bond | #9A6A45, mortar #4A3618, odd bricks #7E5232 and #B07E55 | running-bond walks and paths |
| sandBrick | #D6A06A, grout #E9C08E | café and market terraces |
| slab | #CDB496, joint #6E604E | slab borders around squares |
| stepStone | #A88676, rim #6E5048 | stepping-stone rosettes |
| deck | #D8A374, gap #6A4A2E | plank decks |
| kerb | #6E5A48 | raised kerb strips |
| sett | #7A6A60, joint #5E5048, baked dash #E9D9B0 | the road |

**Foliage and planting**

| Token | Hex | Use |
|---|---|---|
| mapleOrange | #E07A3A | 40% of maples (with vermilion) |
| mapleVermilion | #D9542E | |
| mapleRust | #A8492E, alt #B8603F | 25% |
| mapleGold | #D9B26A, alt #E3A24A amber | 25% (one tree in four reads gold) |
| mapleCoral | #C46A45 | 10% |
| leafGapAO | x.62 | vertex `ao` in leaf notches and undersides |
| fir | #4A6450; variants #44604E, #3E5847, #52705A | firs all year |
| cedar | #3A5544 | cedars |
| trunk | #7A4A2C; stump #5E3A26 | |
| roundShrub | #5B6B4A, tip #B9A878 | pine-cone ball shrubs |
| bushFall | #6E7A55, dried #7A6A44 | fall bushes (instead of the summer greens) |
| mum | petal #F2EAD6, rust #B8603F, butter #E8C25A; leaf #4F6038 | mum clumps |
| driedGrass | #D9C79A, plume #EDE0C0 | grass tufts |

**Built forms**

| Token | Hex | Use |
|---|---|---|
| stucco | #E6D2AE | cottage walls |
| sidingCream | #E9DCC4 | cream siding |
| chocStone | #6B4430, bevel #9A6A48, inset wall #4A2E20 | quoins, base courses, arches |
| leafStone | #C27A3E, gap #6A3A18 | terrace retaining walls |
| terracotta | #9A4530; tiles #B5583A, #7E3524, #8B3F2B; edge #C87A5A; ridge #965638 | roofs |
| doorWalnut | #5A3426, groove #3A2018 | arched plank doors |
| logStained | #BC501C, end-grain cap #EED3AE | s2 post fences |
| logHoney | #E09A48 | s1 rail fences |
| iron | #2F3A34 | lamps, benches, bistro chairs |
| lampWhite | #EDE6D8 | white crook lamps |
| awning | #D96A35 over #F4E6CC; alts cream with forest #2F5F4A, cream with mustard #C9A04A | awnings (mustard is fine on awnings; the hue block applies to jackets only) |
| cloth | #F8F6F0 over gingham #E5C6A2 / #F3E9D8 | terrace tables |
| signBoard | board #4A2E22, letters #F3E6CC, border #C9A06A | shop signs |

**Props and glow**

| Token | Hex | Use |
|---|---|---|
| pumpkin | #E58A3A, groove #A8551F, stem #6B5A2E | |
| jackGlow | emissive #FFC96A, halo #FF9A40 | Oct 17 to Oct 31 only (holTheme 'halloween'); the halo is a GLOWPTS point, never a sprite |
| pennant | #D96A35, #E3A24A, #8A3F21, #F4E6CC | bunting |
| bulb | #FFF1D0, halo #FFC27A | string lights |

**Sky and light**

| Token | Hex | Use |
|---|---|---|
| skyDay | top #8FB8D8, horizon #D8E2F2 | |
| skyAfter | top #8FB3D9 (bottom unchanged) | |
| skyGolden | bottom #FFC27A (kept) | |
| overcast | #A7A6B4, cloud undersides #DABAB5 | |
| haze | #E9D9C0 | fog colour lerps 40% toward it in autumn daylight |
| sunGolden | #FFD9A8 | 13:30 to sunset |
| litBand | #FFF2E2 | |
| hemiAut | sky #D8DDF0, ground #B8946A | |
| toonA | #8A6E78 x3, #A88A88, #E6CDBF, #FFF2E2 x3 | the autumn day ramp |
| highlight | #FFE2B0 | rims and peaks |
| blob | #3A2414 at 35% | contact shadows |
| vignette | #3A2A20 at 16%, from radius .65 | |

### S2b. Exterior, other seasons and the calendar

**Year-round from B27S:**
- the fir colours and 5-tier shape
- the leaf-cluster maple shape
- warm setts and brick walks
- sign boards
- the family re-tune
- iron #2F3A34

**Spring and summer.** Keep B15 grass and clover. Maples use the tiered shape in greens: #6E9A4E, #7FAE58, #5E8A46, with the same `ao`. Bushes keep the B15 greens.

**Winter (B15's winter months).**
- Grass is #EEF3F9.
- Snow caps reuse `firTierG` at x.66.
- Snow in shadow is lavender-grey #7A7488; lamp-lit snow is warm #E6D3B8; far roofs are #9A92A6.
- The shadow ramp is lavender.

**Seasonal calendar.**
- **`holTheme()` is the only source of holiday dates** (search `function holTheme`). The dressing never keeps its own holiday dates. It reads `holTheme()` plus the month and day for the non-holiday rows.
- Every interval is half-open, [start, end), in local time.
- Thanksgiving is the fourth Thursday of November: Nov 26 in 2026. `holTheme` returns 'harvest' through Thanksgiving day and 'winter' from the day after.
- The persistent dressing is the dressing batch DB (S8). `dressCal()` runs at boot and in the same 2-second holiday tick that calls `holBuild` (search `if(th!==HOL.theme||holDirty)`).
  - It rebuilds DB only when its own calendar row changes.
  - That tick calls `holBuild` only on a theme change, so a row boundary without one (Sep 22) still applies without a reload.

| Interval | `holTheme` | Persistent autumn dressing (DB) | Holiday layer (`holBuild`) |
|---|---|---|---|
| [Sep 22, Oct 17) | null | uncarved pumpkin stacks, gourds, hay, mums, dried grass, corn stalks, leaf piles, pennant bunting | none |
| [Oct 17, Nov 1) | halloween | the same, but the front pumpkin of each stack shows a face (the face IM) and a halo (a slot in the reserved GLOWPTS jack range) | halloween lights and wisps. Its pumpkin and stem IMs are retired, because DB carries the stacks (S8) |
| [Nov 1, Nov 3) | muertos | uncarved stacks, gourds, mums, leaf piles | muertos: marigolds #E8A050 and #FFB02E, papel picado, the ofrenda |
| [Nov 3, Nov 27) in 2026, that is, to Thanksgiving + 1 | harvest | uncarved stacks, gourds, hay, mums, corn stalks, leaf piles. **Today, Nov 3, is harvest.** | harvest wreaths. Its pumpkin and hay IMs are retired (S8) |
| [Nov 27, Dec 1) | winter | **Decided:** the town tidies up after Thanksgiving. Pumpkins, gourds, hay, mums, corn stalks and bunting are cleared. Leaf piles, benches, lanterns, shrubs and fences stay. The ground is still autumn (SEASON fall runs to Nov 30) | winter lights, wreaths and the town tree, re-coloured (below) |
| [Dec 1, Jan 7) | winter (newyear on Dec 31 and Jan 1) | none (SEASON winter brings the snow ground) | winter plus the market layer (S15) |
| [Jan 7, Mar 1) | null | none | snow-only winter |

- **B40 owns the October festival.** If B40 wants faces from Oct 1, it changes `holTheme` explicitly and updates this table and the B27Sb tests. B27S never changes `holTheme`.
- **Winter re-palette (B27Sa CORE, data only, about 15 minutes).** Nov 27 arrives long before batch 5's B41, so the existing `case'winter'` in `holBuild` is re-coloured now:
  - `lights([...])`: warm-white bulbs #FFF1D0, every third bulb #FFC27A (no more rainbow #ff5a5a / #5ad1ff / #7dff9a / #ff9ad5)
  - `xmasTree`: the tier colour #2f7a4f becomes sage-black #4A6450; ornaments in bow red #A8282A, brass #B5804A and cream #F3E6CC; its bulbs #FFF1D0 and #FFE2B0
  - wreaths #2E4A34 with bows in bow red #A8282A
  - `presents`: bow red, cream, sage #6C7A5A, brass and plum #5A3A5E
  - the three tree `hGlow` colours become #FFC27A
- **There is one town tree:** `holBuild`'s `xmasTree` at `TOWNTREE` (34.5,-9.6). S15 and B41 restyle that tree; nobody adds a second one (S15 covers moving it).

Benches, lanterns, round shrubs, fences, walls, barrels and stepping stones stay all year.

### S2c. Night, all seasons

**Base.**
- Sky top #1C1824, bottom #3A2E36.
- Hemisphere sky #8C849C, ground #2A221E.
- Post night tint (1.0, .97, .96).
- The shadow ramp is lavender.

**Overrides.**
- Halloween nights [Oct 17, Nov 1): B41's plum lift #2A1840 at .06.
- December market nights ([Dec 1, Jan 7), after 16:30): lift #2A1E18 at .07, gain #FFE2BC, sat .9 (B27Sb STRETCH or B41).

**Lights.** These are all emissive, GLOWPTS or POOLS; no THREE lights.

| Light | Emissive | Halo |
|---|---|---|
| lamp head | #FFC46B | #FFCF7A |
| wall lantern | #FFD9A0 | #FFC27A |
| window amber | #FFC873, core #FFE7B8 | |
| bulb | #FFF1D0 | #FFC27A |
| candle | #FFF0CC | |

- Pools are #FFB070.
- Mocha's ghost friends (#CFE4FF, B40) and the night rim are the only cool lights.

**Night targets.** About 45-65% warm pixels; cool ≤ 35%; L50 45-75. That is s5's ratio, lifted for phones in daylight.

### S2d. Interiors (`INT`, from refs-interior 1c; authored 10-25% lighter than measured)

**Woods**

| Token | Hex | Use |
|---|---|---|
| walnut | #4B2A1F | panels, bookcase frames, pedestal desk, wainscot field |
| walnutHi | #6E412E | bevels and edge highlights (vertex colour) |
| mahogany | #5E2620 | carved Victorian frames, telephone, curio cabinet |
| chocolate | #3A1E16 | dark plank floors |
| timber | #5A372C | posts, beams, stair stringers |
| chestnut / chestnutLt / chestnutDk | #8E4A36 / #A85E44 / #6E3528 | herringbone boards, counter fronts |
| seam | #3A1A14 | floor seams |
| honey | #A87B5E | mezzanine deck and rail, counter tops, sills |
| oakPale | #CDB8A6 | whitewashed Windsor chairs |

**Walls**

| Token | Hex | Use |
|---|---|---|
| plaster | #A9765E | above the wainscot |
| plasterBand | #7A4E3E | above the 4.6 picture rail |
| beadCream | #E9D3BE, groove #9C7462 | plank and beadboard walls |
| ivoryTrim | #EFE3D6 | painted doors and moulding in cream rooms |
| gothicUpper | #3B3446, with plum-tinted plaster | Mocha's house |

**Textiles**

| Token | Hex |
|---|---|
| cloth | #F3E9E4 (never #FFF) |
| plaidChoc / plaidRose / plaidLine | #3A2420 / #8E5E58 / #E8D5CC |
| sofaBlush / sofaCream | #C99A90 / #F0DDD3 |
| ginghamRose / ginghamCream / ginghamMix | #C48C80 / #F4E4DA / #DCB8AC |
| shagCream | #E8DCD2 |
| oyster | #D8CBC2 |
| linen | #E3D3C3 |

**Accents** (only on objects .6 units or smaller; 2-3 accent hues per room, each repeated in a triangle):

| Token | Hex |
|---|---|
| oxblood | #8C2C24 |
| maple | #C2412C |
| ember | #D0683A |
| parchment | #E2B07E |
| brass | #B5804A |
| straw | #D6B48E |
| marigold | #E8A050 |
| forestInk | #35512F |
| leaf | #2E4A26 |
| sageSpine | #6C7A5A |
| navyInk | #333A55 |
| plumInk | #4E3450 |
| pansy | #5A3A78 |
| slateTeal | #2F4A4E (Threads' one cool planter) |

**Spines** (`SPINES`, used for every book wall and the catalog `books` decal; replaces the candy `GOODC` look for books):
- oxblood, ember, sageSpine, navyInk, beadCream and chestnutDk
- plumInk added in Mocha's house

**Light and glass** (MeshBasic or emissive, never lit):

| Token | Hex | Use |
|---|---|---|
| bulb | #FFF6E6 | bulb cores |
| globeGlass | #FFF3E0 | globe pendants |
| frilly | #F2E2D6 | frilly shade |
| coneOut | #1E1A1C | cone pendant exterior |
| coneIn | #FFC27A | cone mouth |
| pool | #FFB070 | floor pools |
| sconce | #FFD9A0 | sconces |
| winDay | #C9CDD8 | clear glass by day (the cool note) |
| winMilk | #EADBC8 | frosted lattice by day |
| winGolden | #FFD9B0 | golden hour |
| winBlue | #3A4A8A | blue hour |
| winNight | #2A3260 | night |
| muntin | #2A1C18 | |
| moonShaft | #8A96D8 | |
| cabGlow | #FFDDB0 | glass-cabinet back glow |

**TOONI** (the interior ramp): #4A2C2C x3, #7A4E44, #C99A80, #FFEBD6 x3.

**Room void.** While the room camera is on top, the clear colour is #1E1612.

### S2e. Pattern recipes

Each is one 128-px cell in the B24 decal atlas, tiled by UV.

| Pattern | Recipe | Use |
|---|---|---|
| Cocoa Tartan | plaidChoc base; 40-px plaidRose bands at 60% alpha on both axes; 3-px plaidLine lines at 1/6 and 5/6; a 2-px #241411 centre line | café underskirts, hallway runners |
| Blush Windowpane | sofaBlush base; 10-px sofaCream bands every 64 px; a 2-px #4A2E26 line beside each band | plaid sofa |
| Rose Gingham | 16-px squares on ginghamCream; rose stripes at 55% alpha on both axes | rugs, café corner |
| Puget Glen | base #D8CCBE; 2-px #6E625A hairlines in 4-on/4-off groups rotated 90° in alternating 32-px blocks; 2-px Oxblood Ink overcheck every 64 px | trousers |
| Ferry Tartan | base #2E3A55; 24-px #4A5A7A bands; 2-px #B98E62 camel line | trousers, scarf, shirt |
| Corduroy | vertical 3-px wales at ±8% lightness of the base | cords |
| Argyle | diamonds 32x48 px in the base colour; Oxblood Ink and Fog Cream alternating diamonds; a 1-px Fog Cream overcheck | sweater vest |
| Birdseye | 2-px dots at 4-px pitch, ±6% lightness | Puget mac |

### S2f. Rainy Term wardrobe colours

Every outerwear colour clears the 38-68° jacket hue block. Creams stay pink-leaning (hue 28-33) so the B24 parser never trips.

| Name | Hex | Name | Hex |
|---|---|---|---|
| Puget Grey | #7A7570 | Taupe Field | #8A7462 |
| Fog Cream | #E8D8C8 | Ferry Navy | #2E3A55 |
| Oatmeal Knit | #D9C6B4 | Oxblood Ink | #6E2A2A |
| Lamplight Camel | #B98E62 | Moss Stitch | #4E5E44 |
| Cedar Bark | #6B4632 | Charcoal Wool | #3A3638 |
| Tweed Brown | #6B5442 | Plum Ink | #5A3A5E |
| Chestnut Leaf | #8A4A2E | | |

- **Shirts:** Oxford White #F2EEE8, Chambray #9FB0C8, Sage #A8B49A, Ecru #EADFD2.
- **Bottoms:** Glen Check (base #6E625A), Cocoa Cord #5A3A2A, Chestnut Cord #7A4A32, Olive Cord #5E6248, Cream Flannel #D8CCBE, plus the owner-fix khaki.
- **Shoes:** Black Oxford #221C1A, Chestnut Brogue #7A4128, Oxblood Loafer #6A2420, chelsea boot #2E2622.
- **Metal and frames:** brass #B5804A, tortoise #5A3A28.

### S2g. Winter market (s5)

| Token | Hex |
|---|---|
| deep brown base | #241C14 (alt #19130D) |
| plaster between timbers | #CDB79A |
| timber | #3A2A20 |
| market sky | top #1C1A22, horizon #3A3330 |
| mountains | #2E2A30, snow #8E8496 |
| moon | #F0DDBE, halo #E3C8A7 |
| wreath | #2E4A34, berries #B0302A |
| bow red (the only saturated colour) | #A8282A |
| gingerbread | #A8683A, icing #F6E6CC, ribbon #B0302A |
| shawl red | #8E3A2A |
| snow | lamp-lit #E6D3B8, shade #7A7488, roofs #F4F8FC (B41 roofMats) |
| visitor fur | #3A2C26, frost tips #D9D2E4, eyes #FFC873 |
| larch-gold mane | #D9B26A |

### S2h. Colour budget per frame

These rules are what the B42 critics check.

**Exterior daylight, autumn.**
- Warm pixels ≥ 65%, cool ≤ 12%, green ≤ 15%, grey ≤ 15%. The cool share comes only from the sky, the Sound, slate roofs and one accent per building.
- L50 100-150.
- Large surfaces (ground, walls, roofs) are never saturated cool or grey.
- The saturated accents (pumpkins, awnings, bunting, berries) are small and repeated.

**Interiors.**
- Walls, floor and big furniture stay at hue 6-25°.
- Exactly one large cream surface per room.
- 2-3 accent hues, each on objects .6 units or smaller.
- One cool note (the window by day, or Threads' slateTeal planter).
- Mean L .30-.40; corners at .65-.80 of the centre; at least one near-white highlight per framing.

**Characters: separation, not brightness.** The old rule, "characters at least 10% brighter than their ground", cannot hold for the owner's guy. His jacket and the Rainy Term darks (Ferry Navy, Charcoal Wool, Oxblood Ink, Cedar Bark) sit on lighter straw, setts and brick. The rule is now value separation in either direction.

**How to measure.** Use the rendered frame with the simulation frozen. Make a character mask by rendering the same frame with and without the character and diffing the two.
- **Body.** It passes if either of these holds:
  - |ΔL*| between the silhouette mean and an 8-px ring of ground around it is 12 or more.
  - At least 60% of the silhouette's edge pixels differ by |ΔL*| 8 or more from the pixel 3 px outside. The RIM light counts.
- **Head.** The top 30% of the silhouette (hair, face, hat) must pass the body test on its own.
- **Mocha** is still the brightest object in every exterior frame.

**Known weak pairs** (albedo |ΔL*| under 8, from the token tables):

| Colour (L*) | Weak on (L*) |
|---|---|
| Puget Grey #7A7570 (49.5) | setts #7A6A60 (46.0), running bond #9A6A45 (49.0), herringbone #9A6450 (47.7) |
| Lamplight Camel #B98E62 (62.1) | straw #BFA45E (68.3), sand brick #D6A06A (69.8), deck #D8A374 (70.9) |
| Tweed Brown #6B5442 (37.6) | leaf piles #8A3F21 (36.1) |

These pairs must pass through the edge clause. If one fails:
- raise the character RIM on autumn days (TOONC materials, RIM day .25 to .35), or darken that look's trousers
- never brighten the ground, and never drop the look

---

## S3. Shape language

**One rule for everything:** soft, chunky, stacked, scalloped.
- Every edge is bevelled (`rbox`).
- Every repeated element (leaves, fir fingers, bricks, stones, pumpkin ribs, spines) varies about ±8% in value and ±10% in size.
- Nothing is thin except iron lamp posts, chair legs and pendant cords.
- Anything smaller than .35 units is a decal or texture, not geometry.

**Exterior scale** (H = 2.1 m, the measured townsfolk height):

| Object | Size |
|---|---|
| pumpkin | .35-.45 H |
| mum clump | .4 H |
| fence post | .5-.55 H |
| bench seat | .35 H |
| round shrub | .7-.9 H across |
| leaf pile | 1.2 x .9 x .25 H |
| 3-pumpkin stack | about door height |
| door | 1.3-1.5 H, arched |
| lamp post | 2.2-2.6 H (today 2.8 H; shortening the lathe to about 4.6 m is B27Sb STRETCH) |
| small fir | 1.5-2 H |
| maple | 2.5-3 H on avenues (scale .8), up to about 3.9 H in parks |

Buildings stay at their size (resizing is out of scope). Lower them visually with:
- a stone base band
- a heavier eave or fascia line at about 5.5 m
- window boxes
- door surrounds

**Leaf-cluster maple, `leafTierG(N=11, rows=3)`.** Cached, built once.
- A dome of 3 overlapping ring strips. Each strip's lower edge alternates tips (r x1.06, y −.07) and notches (r x.90, y +.02). Rows overlap by .12 and are staggered by π/N. Add a top fan.
- Write a 1-component `ao` attribute: tips 1.08, notches and undersides .62, top .95.
- Stack 3 tiers: bottom (r 2.4, y 4.6), middle (r 1.8, y 6.0, offset .3), top (r 1.1, y 7.1), each ±10% jittered.
- Add a dark inner core (`smallPuffG` at x.8 radius, colour x.55), so the gaps never show sky.
- Trunk: short and thick, with 3-4 flared roots.
- Cost: about 700 tris per tree (today about 740).
- **Draws.** It replaces the puff maples inside the tree batch `TB` (the `leaf` key, VEG material), so it adds **0 draws** where it replaces a tree. TB is a block-local batcher that `TB.build(VEG)` finishes long before `dressTown()` runs. New trees must therefore be pushed into `trees[]` before the `trees.forEach` that feeds TB (S7). A new tree in a 36-m cell that has no leaf chunk adds +1 main and +1 shadow draw, because leaf chunks cast shadows. The ledger records each one.

**Tiered fir, `firTierG(14)`.** Cached, built once.
- A top cone from the centre (y 1.0) to the shoulder (r .8, y .32).
- A rim of 14 rounded fingers: tip r 1.0 at y −.06, notch r .86 at y .10, plus a mid vertex to round each finger.
- An inner underside ring (r .5, y .05), so each skirt has visible thickness.
- `ao`: underside .5, notch .7, tip 1.1.
- 5 tiers at R 2.9, 2.35, 1.85, 1.35, .85, stepping up by about 1.25. Cedars use the same geometry in #3A5544.
- Cost: about 590 tris per fir. Inside TB, like the maple: 0 draws where it replaces a fir.
- Snow caps reuse it at x.66 (TB `snow` key, which never casts).

**Round shrub.** `leafTierG(9,4)` squashed to y .85, in roundShrub colours. It stays all year, so it goes in TB's `bush` key before `TB.build`. Bush chunks never cast shadows.

**Mum clump.**
- 3-5 heads of `IcosahedronGeometry(1,1)` at .14 H, with ±12% radial vertex jitter.
- Stems .25-.4 H tall, on a #4F6038 leaf dome.
- Mums are seasonal ([Sep 22, Nov 27)), so they go in the calendar dressing batch DB (S8). They never go in TB, which is built once per load and cannot follow the calendar.

**Dried grass.** 6 fanned `Cone(.03, .6H, 3)`. Seasonal, so it goes in DB.

**Leaf pile.** A jittered hemisphere scaled (1.2, .25, .9) H in #8A3F21 with ao .6 at the rim, plus 6 flat leaf quads.

**Ribbed pumpkin, `pumpkinG`.**
- `Sphere(1,18,10)`; for each vertex with θ = atan2(z,x), multiply the radius by `1 − .08·(1 − min(1, 3·|sin 3θ|))`.
- Set y ×= .78, then pull the poles in by `.12·(1 − rxz²)`.
- `ao` .72 in the grooves.
- The stem is part of the same geometry, coloured through vertex colour, so a pumpkin is one piece of DB.
- Stacks of 3 at scales 1, .82 and .66, each slightly rotated.
- **Gourds** are `pumpkinG` at .4-.6 scale in cream #EFE2C0, green #6F8F4A or butter #E8C04A.
- **Corn-stalk bundle:** 5 tapered `Cyl(.04,.06,1.1H,5)` tied with twine at .6 height, in straw #D9C79A. About 100 tris, in DB.

**Fences.**
- s2 posts: `Cyl(.12,.12,1,8)`, .55 H tall, about .45 H apart, end-grain caps #EED3AE, one rail behind at 60% height.
- s1 rails: two round rails with round end caps and stub posts.

**Chunky stone.** Use `rbox(w,h,d, r=.25·min, bev=.06)`.
- Jitter scale ±12%, rotation ±.06 rad, value ±8%.
- Set the stones .03 proud of a darker inset wall.
- Leaf-stone walls: flattened ellipsoids (1 x .45 x .25) laid alternately at ±25°.

**Interior shapes.**
- Turned legs: a cyl with a sph bulge.
- Arches: a cached `rarch(w,h,t)` ExtrudeGeometry.
- Scalloped frilly shades.
- Tufting, spines, keys and labels are decals.
- Hero silhouettes (globe, gramophone horn, rocking chair, cone shade, outfit stand) must read at 70 px in a landscape room view.

---

## S4. Surfaces (canvas textures and primitives only)

**General rules.**
- Hand-painted and low-frequency: 2 octaves of value noise at wavelength ≥ 1/4 of the texture (±4-6%), plus 6-10 soft brush dabs at 6% alpha.
- **No high-frequency grain**; it shimmers on a moving phone camera.
- Every joint gets a 1-2 px darker lower-right edge and a 1 px 12%-white upper-left bevel.
- Ground textures set `anisotropy = min(4, renderer.capabilities.getMaxAnisotropy())`.
- Never use `ctx.filter` (Safari). Soften with stacked strokes of falling alpha.
- **Keep brick size constant on boxes of any length.** Scale the uv attribute by length at creation; never use per-mesh texture repeats, so every walk still shares one material.

**Exterior canvases**

| Surface | Canvas | Pattern |
|---|---|---|
| Herringbone square | 256², repeating every 2.5 H | 2:1 bricks, 32x16 px at 45°, 2-px light mortar |
| Slab border | strip of 64-px slabs | 1-H square slabs with 2-px joints; every 6th slab is an iron plaque with an original ghost-lantern crest |
| Running bond | 256x128 | 48x14 px bricks (3.5:1), half offset per row, 3-px dark mortar, 10% odd bricks; 0.15-H raised kerb (DB, B27Sb; the canvas itself ships in B27Sa) |
| Sand brick | 256² | 24x10 px, light grout, low contrast |
| Road setts | 256² | rounded setts in sett colours, with the centre dashes baked in |
| Plank deck | 256² | .25-H planks of random length 1-2 H, 1-px gaps, nail dots |
| `grassTex`, autumn branch | 512² (unchanged size and repeat) | straw-olive base, leaf flecks, amber leaf pools, pale grass marks |
| Sign board | atlas cell per shop | rounded dark-wood board, wood grain at 4% alpha, 2-tone border, cream serif-ish lettering (system font stack), text ≤ 60% of the façade width |

**Interior surfaces**

| Surface | Spec | Use |
|---|---|---|
| Wall style factory | `railMat` becomes `wallStyle(kind,col)`, painted as a vertical strip like today: 'plaster+dado', 'walnutPanel', 'beadboard', 'damask' (Mocha's existing paper), 'plank' (cream). Dado and panel geometry go into the B12 merge | every room |
| `herring` floor | 512² canvas = 2.6 x 2.6 units; .32 x 1.3 boards at 45° in chestnutLt / chestnut / chestnutDk; 2-px seams; one grain stroke per board; seamless (draw 2x, crop the centre) | |
| `plank2` floor | wide chestnut (.5) or dark chocolate (.35) boards, staggered joints, low-contrast seams | |
| Window atlas | 512², 4 designs at 128x256: lattice 4x6 with nested squares, fan arch, café curtain, glazed door 2x3. Glass white (lighter at the top), muntins black; `material.color` tints the glass | |
| Spine strips | 6 atlas cells of 5-9 spine blocks with 2-px brass bands at 15% and 85% height; a random u-offset per shelf row | |

---

## S5. Lighting and post targets

### Exterior keys

| Key | Sun | Hemisphere | Shadow ramp | Fog | Post |
|---|---|---|---|---|---|
| Day (autumn) | #FFF4E6 | sky #D8DDF0, ground #B8946A | TOONA weight 1 | colour = sky bottom lerped 40% to #E9D9C0; near 45, far 125 | sat 1.09, tint (1.025,1,.965), warm vignette |
| Golden (13:30 to sunset; Seattle sunset is about 16:50 in early November) | #FFD9A8 | same | TOONA | same, warmer | same; halos start at sunset −20 min |
| Blue hour | B15 keys | B15 | lerping to lavender | toward the night colour | |
| Night | #b4c6ff (unchanged) | #8C849C / #2A221E | lavender | B15 | night tint (1.0,.97,.96); halo size x1.3 on clear nights |

**TOONA.** Lerp `TOONG.image.data` toward TOONA in autumn with the sun up. The weight is 1 by day and 0 by night, written at most once a second with `needsUpdate`. **0 programs, 0 draws.** `TOONC` (characters) is untouched.
- The shadow tint is a cool-leaning mauve: cooler than the amber key light, warmer than B15's lavender.
- On amber ground it lands about #7B4627, against the measured #74431B.
- This keeps the warm light against cool shadow that the owner likes, and matches the references.
- Every material on TOONG takes TOONA by day, exterior baked meshes on `BAKEM` included (intended). Interior materials still on TOONG take it too. T moves its interior batches onto its own `BAKEMI` with TOONI (S17), so only loose interior meshes are affected, and the merge glue re-runs T's tone test.

**Soft shadows.** Use `PCFShadowMap` with `shadow.radius` 3 where it is set (MED and HIGH, B41), aiming for a penumbra of about 10-15% of the caster's height.
- Nothing in the dressing batch DB casts (S8). Neither do flat casters under .35 m (F7).
- Trees, buildings, characters and the existing vc chunks keep their shadows.
- Contact blobs ground everything that doesn't cast.

**Contact blobs.** One InstancedMesh of radial-gradient discs (#3A2414 at 35%, normal alpha blending, depthWrite off, polygonOffset) under every dressing prop, bench, table and townsperson. **+1 draw** (B27Sa, measured by toggle). It matters most on LOW, which has no shadow maps. Moving characters update their blob matrices each frame; static props are written once.

**Post gating** (the lists are seam S0; the post code is S's). Tilt-shift and the warm post vignette run only where they help.
- S recomputes `STYLE.post.ts` and `STYLE.post.vig` every frame from the top camera layer (`CAM.cur&&CAM.cur.owner`).
- `ts` is 0 under the layers in `STYLE.noTs`: look (Your Look), tryon, room, cabin, deco and talk. In those layers the walker's head, the room's hero on the back wall or the talk pair would otherwise sit in the blur band.
- The warm post vignette is 0 under `STYLE.noVig` (room and cabin). There, T's CSS room vignette owns the corners, so the two never stack and T's corner/centre ratio holds after the merge.
- T adds its own layers to both lists from its block, never by editing S's code.
- Selfie and postcard renders (`youPhoto`, `renderer.render(scene,selfieCam)`) bypass the post pass. The code has no photo mode today; if one is added later, it sets ts to 0.

**Tilt-shift, inside the existing `post` pass (+0 draws).**
- Add `uniform float ts` and a band mask from `STYLE.tsBand`: top 12% and bottom 8% in portrait, top 16% in landscape. The earlier 18% and 24% bands covered the shop boards in the portrait square views.
- Take 6 taps (vertical plus a small horizontal). The radius ramps from 0 at the band's inner edge to at most 1.5 CSS px at the frame edge, so text in the band softens but stays readable.
- `ts` is 0 on LOW and `SET.saver`, .6 on touch MED and 1 on desktop.
- **The legibility test runs with ts on.** If a shop board in a fixed view sits in the band and fails, shrink `STYLE.tsBand`; never relax the test.
- B41 later folds ts and tsBand into TIER.
- On MED the warm distance haze also sells the miniature.

**Fake lamp bloom (+0 draws).**
- Rework the GLOWPTS fragment profile into a two-stage falloff: a bright core of 25% radius, then a wide soft skirt.
- Lamp heads carry emissive cores; halos are x1.3 on clear nights (B41 later adds x1.4 in fog).
- No bloom pass and no extra render target, ever.

**After-hours windows.** A closed shop keeps its `main` panes at .4 warm (WC.warm) until 23:00, then steps down (`wltTick`; B16 tests expect the new value). This is the exterior echo of i1's "after hours".

### Interior

- **TOONI goes on T's own `BAKEMI`.** BAKEMI is a second vertex-colour `ToonM` with `gradientMap=TOONI`, and `innerMerge` and the room batches use it for their plain parts.
  - T never changes `BAKEM`. `bake()` (L1421) and `innerMerge` (L1515) share that one lazy global today, and `bake()` also bakes exterior buildings and S's F3 stalls. Setting TOONI on BAKEM would give the street the interior ramp.
  - r128 keys MeshToonMaterial programs on the presence of a gradientMap, not on which one, so expect 0 new programs; confirm with `__mocha.programs()`.
  - A merged-file test checks that every exterior baked mesh still uses TOONG and every interior batch uses TOONI.
- **RIM** stays at B15's interior value, #FFC88A at .3.
- **Lamps stay on all day.** Emissive is .7 by day and 1.0 at night.
- **POOLS opacity:** .12-.18 by day, .30 at golden hour, .45-.55 at night (driven by `STYLE.poolsDay`; seam S0). At most 6 pools per room.
- **POOLS height.** Today `poolAdd` lays every pool flat at y .37, and all 6 existing callers are outdoors. Home floors sit at .65 (`floorAt`), so a pool at .37 would be buried under the floor.
  - Interior floor pools use the seam's `poolAdd(x,z,r,color,k,y)` at the room's floor height + .02.
  - Wall scallops and window floor patches use the seam's `poolAddM(matrix,color,k)`, which takes position, rotation and non-uniform scale.
- **Windows** are tinted at the 4 Hz light tick: winDay or winMilk, then winGolden, winBlue, winNight (with two faint baked warm streaks).
- **Window floor patches:** elongated POOLS instances, #FFF1DC at .16 by day, off at night; a moonShaft at .10 on full-moon nights.
- **Dim corners:** baked vertex `ao` (S11), plus a CSS radial vignette while CAM 'room' or 'cabin' is on top (transparent at 55%, rgba(30,14,10,.32) at the corners; 0 GPU draws; off on LOW).
- **Room void:** while 'room' or 'cabin' is on top, set `camera.far` to `STYLE.effDist()` + roomDiag + 6, the clear colour to #1E1612, and fog from effDist to effDist + roomDiag toward it. Restore on pop.
  - Use `STYLE.effDist()`, never `camS.dist` or `camDist()`. After the merge the camera sits fovK (up to 1.55x) farther back than in T's copy, and a far plane built from the logical distance would clip the room.
- **Indoor shadows:** while 'room' or 'cabin' is on top, the shadow half-extent is max(w,d)/2 + 3, re-rendered on entry, on decorate set-down and every 2 s.
- **The walker's night lift** (`b18Frame`, k = 1.16 + nightAmt*.75) is scaled to 30% while 'room' or 'cabin' is on top, so he no longer blows out under lamps.
- **A closed shop at night** keeps one warm night-light pool and its window glow. Rooms are never cold.

---

## S6. Camera framing

**Lens.** FOV is 46° in portrait (aspect < .75), 44° on the Duo (.75-1.25) and 40° in landscape and on desktop. S sets it in `resize()` (L5410, today `camera.fov=w<h?64:50`). B41 later adds the HUD-band offset.

**One distance factor, applied once.** A narrower FOV alone would shrink every subject; moving every camera back by hand would break about 12 hand-tuned layers. So:
- **The factor.** Seam S0 adds `STYLE.fovK`. `resize()` sets it to `tan(base/2)/tan(fov/2)`, where base is what BASE would pick for the same window (`w<h?64:50`; the Duo's 900x1000 is w<h, so its base is 64). Results:
  - portrait 64 to 46: fovK 1.47
  - Duo 64 to 44: fovK 1.55
  - landscape and desktop 50 to 40: fovK 1.28
- **Where it applies.** `placeCam` (L4907-4909) places the camera at `STYLE.effDist()` = camS.dist × fovK. The exception is when the top layer is in `STYLE.fovAware`. talk (about L5964) and deco (`dCam`, about L8480) are fovAware, because they already derive their distance from the live `camera.fov`.
- **What stays the same.** `camS.dist`, the zoom limits (`zoomLim`, `setDist`) and every layer's `dist` and `range` keep their BASE meaning. So test-controls and the owner-fix walk controls are untouched. These hand-tuned layers keep their framing with no edits: seat, look (Your Look), crowd, room, hang, tryon, scope, rainseat, cabin, moving, plus walk and follow.
- **World-space sizing reads effDist.** Anything sized in world units from the camera distance uses `STYLE.effDist()`, never `camS.dist`: the F7 shadow box (the seam rewrites the `updateSky` shadow line), T's room-void far plane and fog, and any LOD radius.
- **The room camera uses fovK only.**
  - `roomFit` stays FOV-free. T tunes it in its own copy, where fovK is 1, and the 'room' and 'cabin' layers are not fovAware.
  - Never also derive roomFit from `camera.fov`. That would compensate twice, and `hangCam` reuses `roomFit(p)*.7`.
- **Fog and bend.**
  - Fog near and far are measured from the camera, so S adds `effDist − camS.dist` to both. The haze then sits around the subject where the targets put it.
  - Check the world-bend flat radius (`BEND` y = 30) the same way: the default watch view's camera moves from 24 to about 35 in portrait.
- **Acceptance.** In every layer listed above, the subject's on-screen height is within 8% of BASE in all 4 viewports (393x852, 852x393, 900x1000 and 1100x820). For room and cabin the reference is T's own after-shots, because T re-frames those rooms on purpose.

**Walk mode.** This is the owner-fix "Cozy camera": pitch about .62 (slightly lower when zoomed in), dist 10-11, fixed heading. Addendum S does not change it; fovK keeps its framing. It sets the framing targets below.

**Watch mode.** Pitch .6, dist 24 (unchanged; through fovK the camera sits at about 35 in portrait).

**Presets for `shotMode` and the B42 views.** The code has no photo mode; if one is added later, it reuses these presets.
- 'overview': pitch .9, high (s1 terraces); also the start of the B41 arrival glide
- 'porch': pitch .28, short distance, a frontal home portrait (s2)

**Targets for every portrait walk frame:**
- Sky ≤ 15% of the frame; the horizon is out of frame or inside the top 12%.
- Ground 45-60%, and it must be patterned or dressed, never a bare plane.
- The walker or subject sits on the lower-third line, in the HUD free area.
- Nothing occludes the walker. Lamp posts, fences and fountain columns fade within 1.5 m of the camera-to-walker segment (B27Sb STRETCH; the shell fade already covers buildings). With fovK the camera sits farther back, so check this on every fixed walk view.
- Foreground framing props (fence tops, shrub crowns, trunks) stay in the bottom 12% and outer 8% only, and never come between the camera and Mocha.

**Interiors.**
- The B12 room camera, with pitch .78 in portrait and .62 in landscape or on desktop (B41's "fills 90% of the width").
- `roomFit` stays FOV-free, and fovK keeps the framing after the merge (see above). The merge glue re-shoots the rooms: each must still fill at least 80% of the width.
- The room void (S5) removes the street and the town above the walls.
- The hero piece sits inside the first portrait framing, on the door axis.

---

## S7. Dressing density

### Exterior

- **No bare patch larger than 2x2 H (4.2 m square)** within 12 m of a door, bench, stop or path that the follow or walk camera frames. Away from paths, the town may stay calm.
- **Vignettes run at about 1 prop per 4-6 m²** (s1 measured about 1 per 4 m²; today Lantern Square is 1 per 20).
- **Layered planting** (s4 is the model):
  - back row 2.5-3 H: maples and firs alternating, **never two firs side by side**, in the rhythm orange, gold, fir, gold, orange, fir
  - middle row .6-.9 H: round shrubs, dried grass, a windmill or trellis
  - front row .25-.45 H: mums, leaf piles, pumpkins, stepping stones
- **Street-tree avenues:**
  - one tree every 9-11 m on both kerbs, 7-7.5 m from the road centreline (outside the 11-m sidewalk band)
  - skip 3 m around lamps (`LAMPS.pts`), place walks and doors
  - bypass `nearRoad(x,z,8)` for these trees only
  - register each tree in `blockers` and the collision set
  - **Avenue trees go into the tree batch.** Push them into `trees[]` (with `hand:1` and a kind) after the seeded loop and before the `trees.forEach` that feeds `TB`, so they share TB's `leaf` chunks. `dressTown()` runs after `TB.build(VEG)`, so it can never add foliage.
  - **Reserve the dressing footprints first.** Right after `const blockers=` (L2614), before the seeded tree loop, push every S9 site footprint into `blockers` (`styleFootprints()`, a hoisted function in S's block). Then no seeded tree or bush lands on a porch, terrace or square.
    - This reshuffles the seeded tree layout, because one RNG stream (`seeded(5150)`) feeds positions, kinds and colours. Expect different trees in the before/after pairs.
    - Re-check layoutLint, collision and the fixed views.
    - The hand-placed `B8TREES` are unaffected.
  - An avenue tree in a cell with no leaf chunk adds +1 main and +1 shadow draw. Ledger each one.
- **Placement is seeded and deterministic:** `rng('B27S:'+site)`, the same layout on every load. Nothing is random per session.

### Interior

- **Walls dense, floor open.** About 60% of props stand against or hang on walls; 35-50% of the floor stays visible; aisles are at least 1.8 wide; the entry zone stays clear; islands are 1.3 or lower (B12).
- **Three wall layers** on every visible wall: base 0-1.25, middle 1.25-4.6, top 4.6 and up. No bare plaster run longer than 2.5 units.
- **Every 7-unit-wide portrait slice** holds one complete vignette: a wall layer, a piece of furniture, a light and its pool.
- **One hero per room** (S12).
- **2-4 seasonal swap slots per room** (shelf tops, a hanging planter, the sill, a table centrepiece):
  - November: maple branches, a small pumpkin trio, wheat in a jug
  - December: fir garland with red bows, a mini tree on the counter
- **One low foreground object** near the cut-away edge (a plant, cart or chair back, under 1.3 tall) gives depth.
- **Chairs turn 20-35°** off square, never parallel to the walls.

---

## S8. The exterior prop kit

**Render paths.** These are checked against the batcher code. PB builds only the keys vc, sign, win and fogwin. The whole vc chunk casts shadows (`{vc:true}`), and the tree batch is finished before `dressTown()` runs.
- **DB, the dressing batch.** S's own `Batcher(36)`, built in `dressTown()` with the existing `PBM.vc` material (same program), with **castShadow false**.
  - It holds every static dressing prop, year-round and seasonal.
  - `dressCal()` rebuilds it whenever the S2b calendar row changes. It is checked at boot and in the 2-second holiday tick next to `holBuild`. Rebuilding costs a few ms, a few times a year.
  - Cost: +1 main draw per dressed 36-m cell in view, 0 shadow draws. The contact blobs ground it.
  - It is one mechanism instead of the earlier vc-or-dress split. Props merged into vc can never be castShadow false.
- **TB, the tree batch** (S7). Only before `TB.build`:
  - round shrubs in the `bush` key, which never casts
  - avenue maples and firs in the `leaf` key, which casts
- **PB** only for pieces that must sit in an existing PB key: lantern glass in `win` (emissive) and painted faces in the `sign` atlas. 0 draws where the cell already has that key.
- **IM**, one InstancedMesh for the whole town, only for per-instance seasonal or animated state: the merged litter (F1), the face IM (shown only [Oct 17, Nov 1)), the contact blobs, the bunting and the strand.
- **Halos** are GLOWPTS points. Jacks use a reserved range of 40 slots, kept at alpha 0 and switched with `glowSet`. Never `hGlow` or `glow()` sprites: each is one draw, and runtime ones are never converted by `b8Glows`.
- Every prop carries vertex `ao`.

| Archetype | Build | Size | Tris | Path | Season |
|---|---|---|---|---|---|
| Pumpkin, stack of 3 | `pumpkinG` (body and stem in one geometry). Front stacks sit at the `holFronts()` positions and retire the halloween `KP`/`KS` IMs and the harvest `KP` IM. The face of the front pumpkin is a face-IM instance, and its halo is a jack GLOWPTS slot | .35-.45 H each | about 180 each | DB; face IM and GLOWPTS for faces | stacks [Sep 22, Nov 27); faces [Oct 17, Nov 1) |
| Gourds | `pumpkinG` at .4-.6 in cream, green and butter | .2 H | about 120 | DB | [Sep 22, Nov 27) |
| Stump jack | stump cyl #5E3A26, 2-3 shelf mushrooms (half-sph), a pumpkin on top | .5 H | about 250 | DB; face as above | stump all year; pumpkin [Sep 22, Nov 27) |
| Leaf pile | S3 recipe | 1.2 x .25 H | about 120 | instances in the merged litter IM | fall, to Nov 30 |
| Leaf carpet | 6-10 large leaf instances (x1.5-2.5) per maple within r 4.5 | | 2 each | merged litter IM | fall, to Nov 30 |
| Mum clump | S3 | .4 H | about 220 | DB | [Sep 22, Nov 27) |
| Round shrub | S3 | .8 H | about 300 | TB `bush` | all year |
| Dried grass tuft | S3 | .6 H | 36 | DB | [Sep 22, Nov 27) |
| Corn-stalk bundle | S3 | 1.1 H | about 100 | DB | [Sep 22, Nov 27) |
| Hay bale | rbox 1.0 x .5 x .6 H, straw #D9C79A, twine lines in vertex colour; retires the harvest `KH` IM | | 60 | DB | [Sep 22, Nov 27) |
| Barrel | 10-sided cyl with 2 band tori #3A2A20, staves in vertex colour #8A5A3A | .5 H | 120 | DB | all year |
| Crate of pumpkins | box crate #A87B5E plus 3 small pumpkins | .4 H | 150 | DB (the pumpkins drop out on Nov 27) | crate all year |
| Bench | honey slats #A87B5E on iron #2F3A34 ends, plus an optional book stack | .35 H seat | 140 | DB, plus blockers | all year |
| Wall lantern | 4-pane iron box; emissive glass; GLOWPTS halo and a small POOLS pool | .4 H | 80 | frame in DB; glass in PB `win`; GLOWPTS; POOLS | all year |
| Carriage lamp (s3) | the existing `LAMPS` IM with an iron profile | | | existing IM | all year |
| White crook lamp (s4) | a lathe in lampWhite; the head on the lamp pool | 2.2 H | 200 | DB, plus a GLOWPTS head | all year |
| Log fence, s2 posts | S3 | .55 H | about 40 per post | DB, plus blockers | all year |
| Log fence, s1 rails | 2 round rails with end caps | .5 H | about 60 per bay | DB, plus blockers | all year |
| Leaf-stone wall | S3 | .7 H | about 30 per stone | DB, plus blockers | all year |
| Stepping-stone rosette | 1 + 6 flat 8-sided cyls, .03 H | .9 H across | 100 | DB | all year |
| Kerb strip | .15 H rbox along the running-bond walks, in kerb #6E5A48 | | 12 per segment | DB | all year |
| Chalkboard A-frame | 2 slate boards in an oak frame with chalk decal text (original lines) | .5 H | 60 | frame in DB; faces in the PB `sign` atlas | all year |
| Bistro set | round table, white cloth over gingham decal, 2-3 bentwood chairs (iron with honey seats) | | about 400 | DB | all year |
| Striped awning cart | an original kiosk cart (no truck, no livery) with a scalloped striped awning | 1.5 H | about 500 | DB, plus blockers | all year |
| Pennant bunting | triangular flags, `pennant` colours | | 2 each | one new IM (+1) | [Sep 22, Nov 27); the December garland is S15 |
| String lights | `addStrand(points,.45,owner)`, exactly the B41 signature: one IM of up to 600 bulbs; patterns arrive with B41 | | | +1 (one strand IM for the whole town) | all year (warm white) |
| Book box / mailbox | small rbox house on a post, original | .7 H | 80 | DB | all year |
| Windmill / weathervane (s4) | a cross of 4 blades on a lattice post; the blades turn by slow rotation | 1.6 H | 200 | 1 shared IM (+1), STRETCH | all year |

---

## S9. Vignettes and where they go

| Vignette (ref) | Contents | Sites in our town |
|---|---|---|
| **Porch** (s2) | arched plank door with a seasonal wreath at the door's x (fixes the house wreath at x=0); 2 wall lanterns; a 3-pumpkin stack on one side; a stump jack with shelf mushrooms on the other; 1-2 leaf piles; 3 stepping-stone rosettes; a log-fence front; a book box or mailbox; a hosta or round shrub | Mocha's (between the gate pillars and the stoop, inside the fence line), Wendell's porch, the cabin porch and lot, the pink house (18,72), the blue house (80,44) |
| **Café terrace** (s1) | the awning cart; 2-4 bistro sets; a chalkboard; a barrel with a pumpkin; 2 crates of pumpkins; pennant bunting and a white-bulb strand on 2 poles; a leaf-stone and honey-log terrace edge where the ground changes level | the café's Main Street front (replacing the umbrella tables), the bakery side of Lantern Square, the market apron |
| **Entrance square** (s3) | herringbone apron in a slab border; 2 carriage lamps; a bench with a book stack; a bulletin board; 2 round shrubs at the front corners; leaf piles; a russet maple on each side | Rain City Station forecourt |
| **Garden path** (s4) | a running-bond path with a kerb; beds layered back, middle and front; a white crook lamp; a weathervane (STRETCH); a string line across the back | the cemetery path (x 11.5, z 64-88), the park loop, the nursery front |
| **Lantern Square** | herringbone square in a slab border with a sett ring around the fountain; grey planters re-dressed with round shrubs and mums; bunting across; 2 bistro sets by the bakery; leaf piles at the tree bases | the square |
| **Avenues** | S7 rows | Maple Row (z 58), Needle Way south of Main, the cemetery path, the square edges |

**Floor, if B27Sb runs out of time:** Mocha's and Wendell's porches, the café terrace, Lantern Square, and the Maple Row avenue.

All vignette props go through DB, TB or the IMs in S8. Every site's footprint is reserved in `blockers` before the seeded tree loop (S7).

---

## S10. Interior architecture kit

All pieces are static. `innerMerge` merges them per material (B12 6) with vertex `ao`, and their plain parts land on T's `BAKEMI` (TOONI), never on the shared `BAKEM` (S5).

| Piece | Spec | Tris |
|---|---|---|
| Wainscot dado (`wainscot`) | cap height 1.25. Per 1.2 bay: baseboard (.22 x .06), field (.9 x .03), raised panel (rbox, bevel .02, walnutHi top edge), chair-rail cap (.07 x .09). In cream rooms, narrow beadboard under a walnut cap | about 44 per bay |
| Raised-panel wall (`panelwall`) | lower panels 1.0, mid rail 1.2, upper panels 2.6, stiles .16; walnut or plasterBand above the 4.6 rail | about 200 per 6 units |
| Beadboard and plank walls | wall-style texture only | 0 |
| Crown moulding | 2 stepped boxes at the ceiling joint (.12 x .12 and .08 x .2), walnut or ivoryTrim | |
| Picture rail and corded frames | rail at 4.6 (B12) with plasterBand above; frames hang from it on 2 thin cords | |
| Arched lattice window (`archwin`) | 1.6 x 4.4 in h7-8 rooms, sill at .9; 2.4 x 7.5 triptych in the library. Walnut `rarch` casing (outer w+.36, depth .25). Glass and muntins are one arch-topped ShapeGeometry plane in the room's LIT batch (window atlas). Honey sill with a seasonal swap slot. Interior only; exteriors keep the WLT windows | about 150 |
| Herringbone and `plank2` floors | S4 | 0 |
| Cased opening into a void | .25 walnut casing; a #0A0A0A plane 1.0 deep; homes, library and Town Hall only (shops get real staff doors) | 12 |
| Glazed double doors | 3.2 x 3.0, lower raised panel, upper 2x3 panes on a window-atlas cell, brass lever at 1.05; cabGlow at .25 when the room behind is lit | |
| Timber posts and beams | .42 square posts with a plinth and capital, one every 4-5 units to split zones; never in a 1.8 aisle or the entry zone | |
| Mezzanine rail and ladder stair (**B27Ta STRETCH**) | deck top at 3.5 (h7-8) or 5.0 (library), depth 1.1, honey; balusters .07 every .36; a 60° open ladder stair with 10-12 treads; decorative (no walking unless B11 registers it); the rail replaces the picture rail as the cosy band | about 1.2k |

---

## S11. Interior lighting kit

These are fixtures only, with **no THREE lights**.
- Every emissive part (bulbs, shade mouths, frilly shades, globes, sconce tulips, lit strips, window glass, door panes) merges into one **LIT batch per room**: MeshBasicMaterial with vertexColors and the window atlas, **+1 draw per room**. Brightness comes from `material.color.setScalar(k)` at the 4 Hz light tick.
- Halos go to GLOWPTS with `glowPt(...,'b27t')`, and pools go to POOLS, all called from `styleRooms()` and later code, never at the top level of T's block (S17).
  - Floor pools use the seam's `poolAdd(x,z,r,color,k,y)` at the room's floor height + .02 (homes sit at .65).
  - Wall scallops and window patches use the seam's `poolAddM(matrix,color,k)`: stood up with rx −π/2, turned to the wall, non-uniform scale.
  - 0 new draws.
- Every fixture registers a `LIGHTSPOTS` entry `{pid,lx,ly,lz,color,kind}` for B16.
- The lowest shade bottom is 3.3, so no seated head is hidden.
- **Note:** interior pendant halos are already converted to GLOWPTS at boot by `b8Glows` (104 conversions measured). That saving is banked, so B27Ta's draw funding comes from S16 T1-T3.

| Fixture | Build | Halo | Pool |
|---|---|---|---|
| Black cone pendant (i3) | cord; cone shade r .38-.06, h .5 in coneOut; mouth disc coneIn; bulb sph r .09. Hang at 3.4-3.8 over seating | 1.2, .35 | r 1.5 |
| Frilly glass pendant (i3) | brass cap; a 12-segment open cone r .1-.36, h .22, with alternate bottom vertices moved ±.05 in y; the whole shade glows frilly at .85 | 1.5, .45 | r 1.6 |
| Globe trio (i4) | brass stem; 3 torus-quarter arms; 3 globes r .2 in globeGlass | 2.0, .5 | r 2.2 |
| Wall sconce (i4) | brass plate, arm and tulip shade; mounted in pairs at 2.4 | .9, .4 | vertical scallop 1.0 x 1.6 at .3 |
| Bare-bulb pendant | cord, socket, sph r .1 | .8, .35 | r 1.0 |
| Picture light (i1) | brass bar over a frame with an emissive underside strip | .7, .3 | scallop down the frame |
| Banker's lamp | brass stem, half-cyl shade in forestInk, lit underside strip #FFE0B0 | .6, .3 | r .9 on the desk |
| Glass-cabinet glow | back panel in cabGlow at .35 | none | none |

**Per-room recipes** (at most 6 pools each; the hero gets the brightest source; corners get none):

| Room | Sources | Window by day | Night mood |
|---|---|---|---|
| Café | 3 cones over tables, 1 frilly over the counter, the bakery-case strip | clear winDay | amber pools, dark book band above |
| Rainy Day Books | 2 cones, a globe trio over the reading nook | milky lattice | pools on the tables |
| Library | banker's lamp, 2 globe trios, 2 sconce pairs | milky triptych with floor patches | indigo windows; the desk pool is the hero |
| Drizzle Threads | 1 pool per outfit stand (4), a picture light | street window only | "after hours": stands lit, room dim; pools rise 17:00-19:00 |
| Thrift curio | globe trio, bare bulb, cabinet glow | café curtain | cabinet glows, warm centre |
| Mocha's house | globe trio over the tufted pair, sconces either side of the ancestor portrait, banker's lamp on the study desk | milky lancets | plum walls, amber centre |
| Wendell's cottage | frilly over the table, a sconce pair by the fireplace | clear | cosy; the beadboard catches the light |
| Log cabin | banker's lamp on the desk, a bare bulb, the hearth | clear | desk pool plus hearth |

---

## S12. Furniture and hero kit

**Build each piece once, as a B24 part-list builder** (a `CATB` branch). Rooms place the same part lists as fixed dressing:
- A helper `partsToGroup(parts)` builds a temporary group, and `Batcher.addObj`/`innerMerge` merges it: 0 new draws.
- Emissive parts go to the room's LIT batch.
- The catalog sells the same templates (S13).
- One builder serves the room, the shelf and the cabin.

The full 40-item list with parts and sizes is refs-interior §4. The B27Ta CORE hero kit:

| Piece | Parts (summary) | Size W x D x H | Tris |
|---|---|---|---|
| Typewriter desk | pedestal desk (rbox top, 2 raised-panel pedestals, brass pull decals) plus a forestInk typewriter (body, keyboard bed, platen cyl, paper) | 2.0 x 1.0 x 1.05 | about 250 |
| Globe on stand | parchment sph r .28 with an original stylised-continents decal; brass meridian half-torus; tripod or iron cart | .6 x .6 x 1.2 | 200 |
| Gramophone | mahogany box, platter, tonearm, brass open-cone horn with a torus lip tilted 25° (Mocha's existing horn player is his hero) | .55 x .5 x .9 | 180 |
| Antique wall telephone | mahogany box, 2 brass bells, crank, mouthpiece horn, earpiece on a hook; hung at 1.6 | .35 x .2 x .65 | 110 |
| Rocking chair | spindle back, seat, arms, 2 torus-arc rockers; rocks .05 rad at .3 Hz while occupied (reuses or extends `rck`) | .6 x .9 x 1.35 | 200 |
| Tufted armchair | mahogany shield back, oyster pad with a tuft-dot decal, cabriole legs | .7 x .65 x 1.3 | 240 |
| Plaid sofa | boxy rbox base and cushions with a Blush Windowpane decal | 2.0 x .85 x 1.0 | 150 |
| Flower cart | walnut box with brass straps, 2 spoked wheels (torus plus 8 spokes), about 24 bloom sph in marigold, pansy, oxblood and baby's-breath | 1.3 x .6 x 1.0 | 420 |
| Potted maple branches | a hanging half-sph basket on 3 cords, or a shelf "spill", with drooping twigs and leaf clusters in maple and ember (the November swap slot; December uses pine and bows) | .8 x .8 x .9 | 150 |
| Bookcase with spines | walnut frame, 4-5 shelves, ao .55 backs, one spine-strip decal per shelf | 1.4 x .5 x 3.0 | 90 |
| Windsor chair | oakPale saddle seat, splayed legs, bow back, 5 spindles | .52 x .5 x 1.25 | 170 |
| Clothed bistro table | pedestal; underskirt open cyl with a Cocoa Tartan decal; a white cloth square at 45° with 4 corner drops | .95 x .95 x 1.0 | 120 |
| Bakery case | walnut raised-panel base, glass box (`B12M.glass`), 2 tiers of loaves, cakes, a roll cake and pie slices, a lit strip | 1.9 x .75 x 1.6 | 380 |
| Chalkboard A-frame | slate boards with original chalk lines ("Soup of the Day", "Day-old loaves 1/2 price") | .65 x .5 x 1.0 | 60 |
| Outfit stand | base disc #1E1A1C, pole, head knob, shoulder hanger, garment form (S14) | .55 x .55 x 1.6 | 150 + garment |

**Hero per room** (on the door axis, inside the first portrait framing):

| Room | Hero |
|---|---|
| Café | the bakery case and counter under the frilly pendant |
| Rainy Day Books | the book wall (the mezzanine is STRETCH) |
| Library | the arched triptych behind Rosalind's pedestal desk |
| Drizzle Threads | the Rainy Term outfit wall |
| Thrift | the parlour set with the glass cabinet |
| Mocha's house | the gothic library-study: the typewriter desk under the lancet, the book wall with plum spines, the tufted pair under the globe trio, an original ancestor portrait, and the gramophone |
| Wendell's cottage | the rocking chair by the teaware shelf |
| Log cabin | the desk with the typewriter under the window |

---

## S13. Catalog re-themes inside the exact 150

**All rows are B27Tb** (S17). That sub-step runs only after the owner-fix guy is verified, because S14 rewrites the walker's look state that the owner-fix just changed.

**Rules.**
- Same `code`, same `n`, same category, so `CATC` counts, the owned and seen bitsets, cabin tuples (`code.v.cx.cz.rot`) and `SIGIT` (rck at Evergreen, scf at Threads, bnn at Spoke & Sprocket) all stay valid.
- Variants stay at 2-5 (6 for jackets); the jacket hue block holds.
- Each re-theme is: one CATSRC row (name, k, tags, size, pool, variants), one CATFLV line, a CATB builder branch, and at most one CATDEC cell. Thumbnails regenerate.
- **Never add or remove items.**
- Add the tags `vintage` and `study` to every re-themed furniture row so Mocha's taste (B30) can find them.

| Code | Today | Becomes (variants) | Ref | Tier |
|---|---|---|---|---|
| stl | Café Stool | **Windsor Café Chair** (whitewash, oak, black) | i3 | CORE |
| rtb | Round Café Table | **Clothed Bistro Table** (white over cocoa tartan, over rose gingham, bare oak) | i3 | CORE |
| lsv | Cottage Loveseat | **Plaid Loveseat** (blush windowpane, cream, sage) | i3 | CORE |
| ach | Wingback Armchair | **Tufted Parlour Chair** (oyster on walnut, oxblood, plum, forest) | i4 | CORE |
| dsk | Writing Desk | **Pedestal Desk** (mahogany, oak, black) | i2 | CORE |
| geo | Geode | **Desk Globe** (parchment on brass, sea-blue on walnut) | i2, i4 | CORE |
| hgc | Handheld Game | **Green Typewriter** (forest, oxblood, black); pool moves to thrift and bookstore | i2 | CORE |
| pmt | Poster: Metropolis | **Antique Wall Telephone** (walnut, oxblood); first check that nothing maps pmt to a film id | i4 | CORE |
| dlp | Desk Lamp | **Banker's Lamp** (green glass, oxblood glass) | i2 | CORE |
| ppl | Paper Lantern | **Cone Pendant** (black, cream, brass); hangs from the new decorate `ceil` surface. Fallback if `ceil` slips: "Cone Shade Lamp" on a stand | i3 | CORE |
| lvl | Lava Lamp | **Globe Trio Pendant** (brass, black); CABACT `lvl:'lamp'` keeps working | i4 | CORE |
| rgc | Checker Rug | **Rose Gingham Rug** (rose, sage, cocoa) | i3 | CORE |
| rgb | Braided Oval Rug | **Round Shag Rug** (cream, oatmeal, rose) | i4 | CORE |
| fpq | Parquet Floor | **Herringbone Floor** | i2 | CORE |
| wpp | Pixel Wallpaper | **Walnut Panelling** (walnut, oak, cream paint) | i1, i2 | CORE |
| pth | Golden Pothos | **Trailing Planter** (maple in Oct-Nov, ivy otherwise) | i2 | CORE |
| fsc | Folding Screen | **Chalkboard A-Frame** (black, green) | i3 | CORE |
| bkh | Bucket Hat | **Newsboy Cap** (Tweed Brown, Charcoal Wool, Puget Grey); wearable | i3, s3 | CORE |
| swt | Cable Sweater | **Library Knit**, wearable. Variant to garment: v0 Fog Cream cable crew, v1 Lamplight Camel shawl cardigan, v2 Cedar Bark argyle vest, v3 Oxblood Ink cardigan, v4 Plum Ink cardigan | i1 | CORE |
| scf | Chunky Scarf | keep the name; wearable; variants Ferry Tartan, Oxblood Ink, Lamplight Camel | i1 | CORE |
| bnn, mtn | Knit Beanie, Mittens | keep; make wearable (a hat slot; a hand recolour) | | CORE |
| crn | Cornucopia (Nov) | **Flower Cart** (Nov; marigold and pansy, mustard-free) | i2 | STRETCH (B27Tb) |

**Kept on purpose:**
- bks Tall Bookshelf (only its decal palette changes to SPINES)
- rck Porch Rocker
- rpl Record Player (Mocha's own player and B34)
- tsc Brass Telescope, mns, fig
- the four October costumes (B40 needs them)
- records, seeds, kitchen and food
- rjk, fln, rbt, bpk and umb (the default look and weather depend on them)

---

## S14. The Rainy Term wardrobe (Your Look, the catalog and the boutique)

**B27Tb**, after the owner has approved his guy and the owner-fix walker is verified (S17). The outfit wall's room shell (walnut panels, picture light, planters, pools) is B27Ta; its stands, garments and look cards are B27Tb.

The owner's guy keeps his rain jacket as the everyday default (the owner-fix default). Rainy Term is his evening and library wardrobe: trousers, squared shoulders, flat shoes, short hair. He must read clearly as a guy at phone size.

### Eight complete looks (presets that fill the look slots)

| # | Look | Pieces | Catalog pieces to buy |
|---|---|---|---|
| 1 | **Stacks** (hero) | Oxford White shirt, Cedar Bark argyle vest, Cocoa Cord trousers, Chestnut Brogues, round brass glasses, Tweed newsboy cap | swt v2, bkh v0 |
| 2 | **Reading Room** | Sage shirt, Lamplight Camel shawl-collar cardigan, Chestnut Cord trousers, Oxblood Loafers, tortoise glasses | swt v1 |
| 3 | **Seminar** | Oxford White shirt, black knit tie, Tweed Brown blazer with elbow patches, Cream Flannel trousers, Black Oxfords, satchel | free |
| 4 | **Ferry Night** | Ferry Navy duffle coat with horn toggles (the hood flips up in rain, reusing B18's hood shell), Fog Cream cable crew, Glen Check trousers, chelsea boots, Ferry Tartan scarf | swt v0, scf v0 |
| 5 | **Jazz Hour** | Oxford White shirt, black bow tie, Puget Grey pleated trousers with Oxblood braces, Black Oxfords, porkpie with a check band. Optional TRUE flavour line: Kansas City jazz grew up around 18th and Vine in the 1920s and 1930s | free |
| 6 | **Puget Mac** | Puget Grey belted mac (birdseye), Chambray shirt, Charcoal trousers, satchel; the umbrella in rain (umb) | free |
| 7 | **Field Notes** | Taupe Field coat with a Fog Cream cord collar, Ferry Tartan shirt, Olive Cord trousers, chelsea boots, Charcoal beret | free |
| 8 | **Ghost Story** | Plum Ink cardigan over Oxford White, Charcoal trousers, Oxblood Loafers; it matches Mocha's plum family, so B18's "we match!!" can fire (his choice) | swt v4 |

**Free basics in Your Look:** shirts, trousers (plain, cord, glen, tartan), the three dress shoes plus chelsea boots, glasses, the beret, boater and porkpie, the blazer, duffle, mac and field coat, knit tie, bow tie, braces and satchel. **Catalog pieces** add the knit line, the newsboy cap, the scarf, the beanie and mittens.

### State

- Build on the owner-fix look array (13+ entries).
- Append new slots after whatever the owner-fix added: `top` (layer kind), `topC`, `shirt`, `pat` (bottom pattern), `hat`, `glasses`, `neck`, `bag`.
- **If the owner-fix already created a `top`, `hat` or `bottoms` slot** (for example the white zip hoodie, khaki trousers or the KC cap), extend its value list. Never add a parallel slot.
- Value 0 is today's behaviour in every new slot.
- Old 12-entry and 13+-entry arrays migrate by appending defaults, in `fresh()`, `migrate()`, `youFix`, `LOOK_N`/`LOOK_D`, `youKeys` and the 3 saved outfits.
- Presets live in a `RAINY` table `{name, look-slot values}` and only ever set the user's own walker.

### Build on the chibi (walker at 10 draws or fewer)

- **Torso.** BODY uses the jacket material **with a map that is always present** (a 256² torso canvas redrawn on a look change), so swapping looks never changes the program. The canvas carries collar points, placket and buttons, V-necks, argyle, cardigan edges, lapels, tie or bow tie, and braces.
- **3D extras merged into BODY** with vertex colours:
  - collar points (2 flattened 4-sided cones)
  - a rib hem torus
  - a shawl-collar half torus
  - a coat-skirt frustum (r .36-.42, h .30 duffle or .42 mac)
  - a belt torus
  - 3 duffle toggles
- **Squared silhouette for the guy:** shoulder width x1.06 when the owner-fix `build` option exists.
- **Arms** take the layer colour; vest looks show the shirt colour. Elbow patches are an arm decal.
- **Legs** use the bottoms material with a pattern map that is always present (64-px tile: plain white, glen, cord, tartan).
- **Shoes** reuse the B18 shoe shell with decals (toe cap, brogue punching, loafer strap, chelsea panel at .14 tall).
- **Head accessories** (hair, hat, glasses) bake into one vertex-coloured HEAD mesh: round wire glasses are 2 tori (r .09, tube .012) plus a bridge. Hats follow refs-interior 6e: boater, beret, newsboy, fedora, porkpie.
- **Satchel and scarf** bake into BODY.
- **On a look change,** rewrite colours or rebuild a node (about 1 ms). Never add a material per colour.

### Catalog to walker

- Extend `lookOfItem` so every wearable catalog item maps to slot values (swt by variant, bkh and bnn to `hat`, scf to `neck`, mtn to a hand recolour).
- Your Look gains an **owned clothing** row, so bought items can be worn, not only tried on.
- Try on (`lookTry`) previews any slot.

### Drizzle Threads outfit wall (i1)

- The back wall becomes a walnut raised-panel wall with an original framed sepia sketch of the shop's own façade and a picture light.
- **4 stands,** 1.25 apart and .5 off the wall. Each shows a complete Rainy Term look on a garment form built from the same look tables (a torso egg at 90% of a chibi body with the look's torso canvas from a 512² wardrobe atlas). Menswear trousers fold over a hanger bar .5 below the jacket.
- **Hats** sit on brass pegs at 2.5-2.7, one per pair of stands. **Shoes** go in front of each base (shells x1.2). **Bags** sit on the floor or a side hook, with an open book as sparkle.
- **SlateTeal planters** with a fig at each end are the room's cool note.
- **Pools:** one per stand (r .9, .35), rising 17:00-19:00 for "after hours".
- **Stands are DISPLAY slots** (`surf:'rack'`). A tap opens a look card:
  - **Try the whole look** opens Your Look (CAM 'look', prio 3) with that look preloaded
  - **Buy pieces** buys the catalog pieces in the look
  - Wren's line, for example: "that's Puget Grey with a little Oxblood Ink."
- **Autonomy:** the user's taps steer only the user's walker. Mocha may browse the wall only as his own `localChoose` candidate (B27Tb STRETCH).
- **Draws:** stands, garments, hats, shoes and bags merge into the shop display (3 draws or fewer) with the wardrobe atlas.

### Cast (B27Tb STRETCH; otherwise B40)

| Character | Outfit |
|---|---|
| Rosalind | sage collared dress, camel cardigan, round glasses |
| Mabel | Fog Cream cardigan, Puget Glen pleated skirt |
| Juniper | white blouse, black bow, brown pleated skirt, apron |
| Wren | hand-knit argyle vest, white blouse, brown skirt |
| Pearl | grey pin-dot belted coat-dress, oxblood frame purse |
| Mayor Odalie | taupe cape-blazer, black bow |
| Sol | Charcoal beret |
| Basil | porkpie |
| Monty | black fedora |

These are recolours and hat parts through `makeChibi(look)`, at 8 draws or fewer.

---

## S15. The winter market (December), the Leavenworth trip and the Larch Goat

This is **B27Sb STRETCH**; if it doesn't land, B41 builds it. It runs [Dec 1, Jan 7) (S2b). B27Sa CORE already re-coloured the existing winter lights, wreaths and town tree (S2b), so Nov 27-30 is never rainbow.

**The mood.** A few warm points on deep warm browns: lights under 2% of the frame, everything else #241C14 to #6D5B4B, never navy. The only saturated colour is the bow red #A8282A. Lift the key for phones (L50 about 70-80, lights at L95 200+) and keep the ratio.

**Kit** (primitives and canvas; no lights):

| Part | Build | Draws |
|---|---|---|
| Half-timber façade | a `wallTex` option: plaster #CDB79A with timbers #3A2A20 (posts every quarter width, floor-line rails, X braces in alternate panels); upper floor jettied 5%; WLT windows in 2x3 panes | 0 |
| Snow roof | a cap slab with a rounded drip edge on the gable; colour through B41 `roofMats` | 0 |
| Hanging sign | an iron scroll bracket and painted board in the SIGN atlas, with an original emblem (a salmon, a teapot, a pretzel, a little ghost) | 0 |
| Market stall (6) | timber frame with a snow-lipped roof; a garland of #2E4A34 puffs with a red bow; 8-10 bulbs on the shared strand; 5-7 gingerbread hearts as atlas cards; 2 candles (emissive + GLOWPTS) | 0 (strand shared) |
| Town tree | **the existing `xmasTree` at `TOWNTREE`, rebuilt, never a second tree.** `firTierG` x7 tiers at 6-8 H, merged into one mesh, with snow on each tier; a 400-bulb spiral on the shared strand; an emissive star with a GLOWPTS halo replacing today's star sprite and its `hGlow`s; the B41 lighting cascade and chime | at or below today's tree (4 tier meshes, a star sprite, 4 halo sprites, 2 IMs) |
| Fountain | snow lip, ice disc #B9C4D2, a wreath and bow on the column. The statue is **an original stone heron holding a lantern** (PNW), never a saint | 0 |
| Backdrop | the mountain with a snow cap; a warm cream moon #F0DDBE with a halo 3x its size; `firTierG` silhouettes | 0 |
| Snowfall | the existing `rain` Points, which swap to `snowTex` | 0 |

**Placement.**
- **The town tree stays at `TOWNTREE`** (34.5,-9.6), by the library, where round 1's 'townlights' outing goes to look at it.
  - B8 reserved a square tree slot, `SQUARE.treeSlot` (-30,27.5).
  - Moving the tree there is a B41 decision. It must change `TOWNTREE` itself and move the 'townlights' outing's place from 'library' to 'square'.
  - There is only ever one big tree.
- 6 stalls ring the south half of Lantern Square.
- They stay clear of the fountain by at least 4 m and of NAV lines.
- Bunting becomes fir garland.
- Grade override after 16:30 (S2c).

**Leavenworth, Washington, as the December train trip.** Round 1 already has this trip; extend it, don't add one.
- `TRIPS.leavenworth` (train, a December arrival line `arrX`, December weighting in the trip picker).
- The departure-board line.
- The postcard painter `leavenworth(g,X,Y,W,H,r,xm)`.
- Restyle its December postcard to the s5 palette (S2g).
- A 3D village diorama is optional (B41 STRETCH) and must be built from the kit above.

These facts are true:
- It is a real Cascades town on the Wenatchee River, in Chelan County.
- It re-themed itself as a Bavarian village in the 1960s.
- It is known for its Christmas "Village of Lights".
- It has a Nutcracker Museum.
- Amtrak's Empire Builder stops at its Icicle Station.
- The subalpine larches above it, in the Enchantments, turn gold in October.

Verify the current timetable and festival dates before quoting them in game text (the truth rule). The trip arrives in the evening into a lit village: the s5 picture, built from this kit.

**Tamarack, the Larch Goat** (original; the spooky-cute winter cousin of the Halloween cast).
- **Who he is.** A shaggy, grumbly-polite mountain-goat spirit who rides the train down "from up the Icicle" on the evening of Dec 5. That is Krampusnacht, the eve of St. Nicholas Day, which is true Alpine folklore. "Tamarack" is a common name for some larches, a nod to Leavenworth's gold larches.
- **Look** (chibi kit, about 1.3 H, round):
  - a coat of stacked scalloped fringes that reuses `firTierG`, in fur #3A2C26 with frost tips #D9D2E4
  - a larch-gold mane
  - short curled horns with tiny brass bells
  - warm amber eyes (emissive #FFC873, no light)
  - a birch-twig bundle tied with a red ribbon
  - a garland of tin stars #C9C2B0 instead of chains
- **Behaviour:** gentle mischief, never threatening. He sweeps snow off doorsteps, jingles his bells, leaves a licorice "good coal" for grumps and a gingerbread heart for the kind, and warms his hooves by the fountain.
- **Autonomy:** he is townsfolk, so he may stop and face you. Mocha's reactions (peek from behind the tree, offer cocoa, hide giggling) are weighted `localChoose` candidates only. He is never a trigger.
- **Draws:** at most 8 when he is among the 8 nearest characters; otherwise the 1-draw LOD.

---

## S16. Performance contract

**Baseline.**
- perf1p portrait at the default view: about 658 average at 15:00 and 459 at 21:00. That is the B3-merge ledger, which faked Nov 1. It is about 2.6x the 250 budget.
- The per-view main and shadow splits are in `gap-exterior.md` §1/§11 and `gap-interior.md` §5.
- The style passes must not make this worse anywhere, and should leave it better.

**Hard rules.**
1. **No new THREE lights, ever.** Glow comes from emissive materials, GLOWPTS, POOLS, the lamp IM and WLT.
2. **Draws, measured so that small deltas are real.**
   - **Dates.** smoke.js, perf1.js and perf1p.js all fake Nov 1 today (`timeAt(h,month=10,day=1)`). That is holTheme 'muertos', not the harvest the owner sees. Seam S0 gives them a `DAY=MM-DD` env.
     - The canonical ledger is **DAY=11-03** (harvest).
     - Also run **DAY=10-20** (halloween: faces, jack halos, wisps) and **DAY=12-10** (winter: the re-coloured tree and lights).
   - **Noise.** perf runs vary by about ±30 draws (draws.json, B21 and B25). That is more than F1 (−5) or the blob, bunting and strand together (+3). So every new, merged or removed object's structural delta is measured with **the B21 method**:
     - toggle the object in the page
     - re-render the same frame
     - read `renderer.info.render.calls`, main and shadow passes separately
   - **Frozen probes.** Every fixed-view probe runs with the simulation frozen (`__mocha.freeze(true)`, seam S0), so Mocha and the townsfolk stand still between before and after.
   - **Pass:**
     - the toggle ledger's net is ≤ 0 for each sub-step
     - every frozen fixed view is ≤ BASE+S0
     - the canonical perf1p (15:00 and 21:00) and perf1 desktop (12:00) medians of 3 stay within noise of BASE+S0
3. **Tris per frame** (the perf counters include the shadow pass) at the canonical ledger views must be ≤ BASE. Report each fixed view; the sum over the fixed views must be ≤ BASE.
4. **Render paths** (S8):
   - Every static prop goes through DB, TB (before `TB.build`), PB's existing keys or `innerMerge`.
   - InstancedMeshes only for archetypes with per-instance seasonal or animated state.
   - **Never a loose `new THREE.Mesh` per prop.** That is how `market()` reached 68 draws.
   - Never a new `glow()` or `hGlow` sprite.
5. **Programs:** B27Sa + B27Sb +2 or fewer; B27Ta + B27Tb +3 or fewer (`__mocha.programs()`; precompile with `renderer.compile`). DB reuses `PBM.vc` and BAKEMI shares BAKEM's program key, so both should add 0.
6. **Textures:** S +6 MB or less, T +5 MB or less; total textures 64 MB or less; catalog geometry 6 MB or less (`catMem`).
7. **GLOWPTS** (the seam raises the cap to 512; 228 in use):
   - S adds 80 or fewer. That includes a reserved range of 40 jack halos, kept at alpha 0 outside [Oct 17, Nov 1).
   - T adds 80 or fewer.
   - The rest is reserved for B31, B36, B40 and B41.

   **POOLS** (the seam raises the cap to 160; 37 in use): S adds 24 or fewer, T adds 60 or fewer.
8. **LOW tier (`SET.saver`):**
   - no tilt-shift and no CSS room vignette
   - no window patches or shafts
   - halos and pools at 60%
   - blobs stay on
   - the dressing stays (it is static and merged)
9. **Ledger files.** Each sub-step writes only its own track's ledger:
   - `/tmp/harness/b27s/ledger.json` (B27Sa and B27Sb entries)
   - `/tmp/harness/b27t/ledger.json` (B27Ta and B27Tb entries)

   Only the merge glue appends to `/tmp/harness/draws.json`: the four sub-step entries plus one combined entry.

**B27S funding ladder.** B27Sa applies F1-F3. B27Sb applies as many of F4-F8 as its ledger needs. Record each measured toggle delta.

| # | Sub-step | Change | Expected saving |
|---|---|---|---|
| F1 | Sa | Fall litter: today's 6 InstancedMeshes (one per `SEASON.fall` colour) become 1 with instanceColor. Leaf piles and carpets later become instances of it | −5 |
| F2 | Sa | Clouds: 70 puff meshes and 14 materials become 1 InstancedMesh with 1 material | −5 to −69 |
| F3 | Sa | `market()` stalls and `grocery()` crates, fruit and carts baked with `bake()`. Their plain parts land on `BAKEM`, which stays on TOONG | −110 when in view |
| F4 | Sb | Waterfront railing posts become 1 InstancedMesh; benches go through DB | −25 to −40 |
| F5 | Sb | Roads merged into 1 mesh and sidewalks into 1; the dashes are already baked into the sett texture (Sa), so delete `DASHB` | −15 to −25 |
| F6 | Sb | Skyline boxes merged into 1 vertex-coloured mesh; the Olympic cones and caps into 2 | −20 to −40 |
| F7 | Sb | Daytime shadow box: half-extent `clamp(STYLE.effDist()*1.3, 25, 90)`, centred about 10 m ahead of the target along the view; flat casters (h < .35) `castShadow=false` | −170 to −295 shadow draws, and most of the tri budget |
| F8 | Sb | Halloween jack halos. `pumpkin()` calls `hGlow`, a `glow()` sprite, for every carved jack: one draw each, about 30 fronts plus the porch jacks. They are created at runtime, so `b8Glows` never converts them. They become the reserved GLOWPTS range, switched with `glowSet`, and the halloween pumpkins move to DB plus the face IM. STRETCH: the other static holiday `hGlow` calls (shop glows in `lights()`, muertos candles, the ofrenda, the winter tree) move to GLOWPTS too; the wisps stay sprites because they move | about −35 on DAY=10-20 (measure) |

**B27T funding ladder** (B27Ta).

| # | Change | Expected saving |
|---|---|---|
| T1 | Indoor shadow fit and freeze (`STYLE.shadowHalf`) | −300 to −520 per frame indoors |
| T2 | Room void (`STYLE.skyHooks`: far plane and fog from `STYLE.effDist()`, clear colour) | −150 to −400 |
| T3 | Bake display animals (`makePet` parts into one mesh; the Rainy Day Books cat) | −18 each |
| T4 (optional) | Mocha's house static exterior (fence, posts, roses, pumpkins, stoop, lanterns) through PB | −50 to −70 |

**What each sub-step adds** (each line measured by toggle):
- **B27Sa:**
  - the contact-blob IM (+1)
  - the tree geometry replaces trees in place inside TB (0)
  - palette, light, lens and post (0)
- **B27Sb:**
  - DB: +1 main draw per dressed cell in view, 0 shadow
  - the bunting IM (+1) and the strand IM (+1)
  - +1 main and +1 shadow for each avenue tree that opens a new leaf cell
  - DB stacks replace the harvest pumpkin and hay IMs (−2 on Nov 3)
  - the face IM replaces the halloween face IM and DB replaces its pumpkin and stem IMs (−2 in October)
  - F8 removes the jack sprites
- **B27Ta:** the LIT batch, +1 per drawn room.
- **B27Tb:** 0. The walker stays at 10 draws or fewer, the outfit wall at 3 or fewer, and catalog re-themes reuse CATB.

---

## S17. Building B27S and B27T in parallel

**Preconditions.**
- Batch 3 is merged and the owner-fixes pass has been applied (the Cozy camera from `controls-spec.md`; the guy from `owner-fixes-b3.md`). Call that file BASE.
- **B27Tb also waits until the owner has approved his guy and the owner-fix walker is verified.** It rewrites the look state that the owner-fix just changed.

**Order.** The style passes are numbered after B27 and run before B28. There are two tracks, each of two sequential sub-steps. Each sub-step is about 2-3 hours and has its own CORE, STRETCH, verification and ledger entry.

| Track | First | Then |
|---|---|---|
| S, exteriors (`/tmp/harness/b27s/index.html`) | **B27Sa, the look:** F1-F3, the autumn palette, the winter re-palette, light, post with gating, tree geometry, the lens with fovK | **B27Sb, the dressing:** ground, DB and the calendar, the prop kit, vignettes, avenues, F4-F8 |
| T, interiors and wardrobe (`/tmp/harness/b27t/index.html`) | **B27Ta, the rooms:** T1-T6 | **B27Tb, catalog and wardrobe:** T7-T8 |

- **Step files.** `step-B27S.json` holds two step objects, B27Sa and B27Sb; `step-B27T.json` holds B27Ta and B27Tb. Each is in the round2-spec.json step format. Insert all four after B27.
- If B27Tb is still blocked on the guy when the other three are done, merge Sa+Sb with Ta and ship. B27Tb then runs alone on the merged file, as a normal sequential step.
- **If the owner approved the scene mockups** (`ghost-town/previews/scene-mock/`: kit-core.js, kit-ext.js, kit-int.js and the port notes the mockup workflow writes), port those builders instead of re-authoring them. Addendum S still wins on colours, budgets, render paths and territory.

### Seam S0

A pre-fork commit, applied once to BASE by the orchestrator. Smoke 15 and 1 must pass with zero page errors, and the toggle ledger must show 0 delta. Both tracks then treat these lines as read-only.
1. **`Batcher` → `addM`:** the up-facing factor becomes `const f=(.84+.16*(v.y*.5+.5))*(geo.attributes.ao?geo.attributes.ao.getX(j):1);`. It reads a dedicated 1-component `ao` attribute, never `color`, so existing vertex-coloured geometry is untouched.
2. **`const STYLE`, on its own line immediately after `const TOONG=rampTex(PAL.toon),TOONC=rampTex(PAL.toonC);`** (about L1232). That is above T's block (`const LAYOUTS=`, L1520) and S's main block (L2183), so both may use STYLE at top level. Declaring it after the POOLS block, as the first draft did, made T's top-level `STYLE.hooks.push` throw a ReferenceError at boot.
   ```js
   const STYLE={shadowHalf:0,skyHooks:[],poolsDay:0,hooks:[],shots:{},
    fovK:1,fovAware:{talk:1,deco:1},
    noTs:{look:1,tryon:1,room:1,cabin:1,deco:1,talk:1},noVig:{room:1,cabin:1},
    post:{ts:1,vig:1},tsBand:[.12,.08,.16],freeze:false,
    effDist(){return camS.dist*(CAM.cur&&STYLE.fovAware[CAM.cur.owner]?1:STYLE.fovK)}};
   ```
   `camS` (L4249) and `CAM` (L4256) are read only when `effDist` is called, after boot.
3. **`placeCam`:** the camera position uses `const D=STYLE.effDist();` in place of `camS.dist` in the three terms of `camera.position.set(...)`. Nothing else in the camera code changes.
4. **`updateSky`:**
   - The shadow line becomes `{const se=STYLE.shadowHalf||Math.min(90,Math.max(50,Math.round(STYLE.effDist()*1.3/5)*5)),...`.
   - Its last statement is `for(let i=0;i<STYLE.skyHooks.length;i++)STYLE.skyHooks[i]();`.
5. **Caps:** POOLS `N=96` becomes 160; GLOWPTS `N=384` becomes 512.
6. **POOLS API:**
   - `poolAdd(x,z,r,color,k=1,y=.37)`: the 6 existing outdoor callers keep .37.
   - New: `poolAddM(m4,color,k=1)`, which takes a full Matrix4 (position, rotation, non-uniform scale) for wall scallops and window patches.
7. **`b8Frame` pools line:** `po.m.opacity=Math.max(.72*nightAmt,STYLE.poolsDay);po.im.visible=(nightAmt>.03||STYLE.poolsDay>0)&&po.n>0`.
8. **Stubs and call sites:**
   - `function dressTown(){}`, called immediately before `const B8CONV=b8Glows()`
   - `function styleRooms(){}`, declared immediately above `const LAYOUTS=` and called once at the end of the world build, before the boot `renderer.compile`
9. **Hooks:**
   - right after `window.__mocha={...}` is assigned: `STYLE.hooks.forEach(f=>f(window.__mocha));`
   - `window.__mocha.shotMode=n=>STYLE.shots[n]?STYLE.shots[n]():Object.keys(STYLE.shots);`
   - `window.__mocha.freeze=on=>(STYLE.freeze=!!on);`
10. **Freeze switch (tests only):** in `frame()`, the simulation gets `STYLE.freeze?0:dt` and rendering keeps dt.
    - The simulation is `updateMocha`, `updateYou` and `updateW`, plus the townsfolk, crowd, train, cloud and weather tickers.
    - Rendering is `placeCam`, the light tick and the post pass.
11. **Harness, outside index.html:**
    - smoke.js, perf1.js and perf1p.js read `DAY=MM-DD`. The default stays 11-01, so old ledgers stay comparable.
    - create `/tmp/harness/b27s/` and `/tmp/harness/b27t/`, each with an empty `ledger.json`.
    - three shared probe scripts in `/tmp/harness/style/tools/`, written once so the tracks never write the same file:
      - `toggle_probe.js`: the B21 method on a frozen frame, main and shadow passes
      - `subj_probe.js`: subject on-screen height per camera layer and viewport (S6)
      - `sep_probe.js`: the masked character-separation test (S2h)
    - The tracks may extend these only by copying them into their own folder.

### Code blocks (safe from the temporal dead zone)

A top-level `const` cannot be read until its line has run. So each block may touch, at top level, only what is declared above it. Functions declared with `function` are hoisted and may be called from anywhere, as long as what they read exists at call time.
- **S pre-block,** immediately after PAL's closing line (`rim:{...}};`, about L441):
  - only `const AUT={...}` and any `function` painter that early code calls
  - PAL's own slots, SEASONS (L1208), `grassTex` (L1324) and the roads and walks block (L1340-1348) run long before S's main block, so they may read only PAL, AUT, literal hexes and hoisted functions
- **S main block,** immediately after the line containing `const pbW=` (about L2183), so that PB, PBM, pbG and pbW already exist:
  - it holds `leafTierG`, `firTierG`, `pumpkinG`, the canvases, `addStrand`, the DB builders, `styleFootprints()`, `dressCal()` and the body of `dressTown()`
  - at top level it may use PB, PBM, POOLS, GLOWPTS, `glowPt`, `poolAdd`, PLACES and byId
  - it must not touch `blockers` (L2614), `trees` (L2633), LAMPS, HOL, CAM or camS at top level; it reaches them only inside functions called later (the tree-batch lines, `dressTown`, `holBuild`)
  - the earlier draft put this block right after `const PB=Batcher(36)`, where `PBM` (the next line) was still in the dead zone
- **T block,** immediately above `const LAYOUTS=` (about L1520):
  - it holds `INT`, `SPINES`, `TOONI`, `BAKEMI`, the pieces, fixtures, `partsToGroup`, `RAINY` and the body of `styleRooms()`
  - at top level only definitions, `STYLE.*` registrations and pure data (`rampTex`, `ToonM` and `canvasTex` are declared above it)
  - `poolAdd`, `glowPt`, PB, CAM and every scene object are reached only from `styleRooms()` and later calls
- Both tracks register hooks with `STYLE.hooks.push(m=>Object.assign(m,{...}))` and shots with `STYLE.shots[name]=fn`, and T adds its own camera layers to `STYLE.noTs`, `STYLE.noVig` and `STYLE.fovAware` from its block.
- **Boot check.** Each track's file (BASE+S0 plus only its own blocks) boots with zero page errors in smoke, in all 3 viewports. A ReferenceError at boot means a dead-zone slip. The merged file is checked the same way.

### Territory: who may edit what

| Area (search string) | Owner |
|---|---|
| `function Batcher(` / `addM`, `const STYLE`, `function placeCam` (the effDist line), `poolAdd`/`poolAddM`, the POOLS and GLOWPTS caps, the `b8Frame` pools line, the `frame()` freeze line | seam only |
| `const PAL` (all keys) and the S pre-block after it, `PAL.fam`, `const SEASONS`, `SEASON_KEY` | S |
| `rampTex` / `TOONG` / `TOONC` lines | nobody. S lerps `TOONG.image.data` from its block; T builds TOONI in its block |
| `function bake(`, `BAKEM` | nobody. S calls `bake()` as is, so exteriors stay on BAKEM and TOONG; T builds its own `BAKEMI` |
| `function updateSky` | S (plus the seam lines). T acts only through `STYLE.shadowHalf` and `STYLE.skyHooks` |
| `const post` shader, `STYLE.post` computation | S |
| `GLOWPTS` (shader profile) | S. T only calls `glowPt(...,'b27t')` |
| `POOLS` | seam. Both call `poolAdd`/`poolAddM` within quota; T sets `STYLE.poolsDay` |
| `grassTex`, ground plane, `ROADS.forEach`, `DASHB`, `walkMat`, `roadMat`, `plazaB`, `park(` | S |
| `wallTex`, `signTex`, `sign(`, `stripeTex`, `gable(`, `bladeSign` | S |
| `function shop(` body | nobody, except S may replace the `p.id==='cafe'` umbrella-table block |
| the tree batch (`const blockers=` through `TB.build(VEG)`: the footprint reservation, `const trees=[]`, `tierG`, `bigPuffG`, `firC`, the bush loop), the litter block, `const clouds`, skyline `p_sky`, Olympic cones, the waterfront railing loop, `market(`, `grocery(` | S |
| `function holBuild` (every case), `holFronts`, `wreaths`, `pumpkin(`, `xmasTree`, `presents` | S |
| `function holTheme`, `TOWNTREE`, `SQUARE.treeSlot` | nobody in B27 (B40 may move the halloween start; B41 decides any tree move) |
| `function holHide`, `doorTick`, `TUN` | T (the floating door-dressing bug) |
| `wltTick`, `WLT` | S (after-hours windows) |
| `resize()` FOV and `STYLE.fovK`; the 'overview' and 'porch' shots | S |
| `setCamMode`, the walk controls, `zoomLim`/`setDist`, `hangCam`, every `CAM.push` outside T's rooms | nobody (owner-fix territory; fovK keeps their framing) |
| `railMat`, `floorMat`, `goods`, `GOODC`, `layoutRoom`, `LAYOUTS`, `PIECE`, `innerMerge` (its plain key moves to BAKEMI), `roomFit` (stays FOV-free), `roomPush`, `LIGHTSPOTS`, `lspOn` | T |
| `function library(` | T (interior, fade set, glass opacity) |
| `function dollhouse(` | T for the interior and `b14Home`; S never edits the body (it dresses around it through DB) |
| `function cottage(` | nobody edits the body. T works through `LAYOUTS.neighbor`; S through DB |
| `function buildCabin`, `cabLights`, `dRoomDef`, `dSurfBuild`, the 'cabin' CAM push | T. S dresses the cabin lot from outside, in DB at boot (`buildCabin` disposes and rebuilds its own group) |
| `makePet` | T |
| `b18Frame` (walker lift indoors), `youParts`, `LOOKP`, `LOOK_N`, `LOOK_D`, `youFix`, `youKeys`, `ylRender`, `lookOfItem`, `lookTry` | T (B27Tb) |
| `fresh()`, `migrate()` | T only (B27Tb); S adds no state |
| `CATSRC`, `CATB`, `CATDEC`, `CATFLV`, `catMerge`, thumbnails | T (B27Tb) |
| `TRIPS.leavenworth` and its postcard painter | nobody in B27 CORE (B27Sb STRETCH S15, or B41) |
| the `window.__mocha={` literal and existing hook lines | nobody; use `STYLE.hooks` |
| `PLACES` positions and sizes, `ROADS` widths, `NAV` | nobody |
| the boot `renderer.compile` list | the merge glue |

### Merge

1. Run `git merge-file -p b27s.html BASE+S0.html b27t.html > merged.html` (a 3-way merge).
2. If the territories held, there are no code conflicts. Resolve any conflict by keeping both sides.
3. Glue, in this order:
   - re-run the precompile
   - the boot check (zero page errors in 3 viewports)
   - **re-run T's interior tone test and the phone legibility test with S's post pass active** (tilt-shift and vignette as gated), because S's warm vignette and blur did not exist in T's copy
   - the per-layer subject-height check (S6), now that fovK is live: within 8% of BASE for every non-room layer, and within 8% of T's after-shots for room and cabin
   - re-shoot the room views: each room still fills at least 80% of the width
   - the character separation test (S2h) for the default look and, if B27Tb landed, the 8 Rainy Term looks, on straw, setts, running bond and herringbone, at 15:30 and 21:00
   - the ramp check: every exterior baked mesh (`bake()` output, PB, DB) uses TOONG, and every interior batch uses TOONI through BAKEMI
   - the combined toggle ledger (the sum of the sub-step deltas should approximately equal the merged delta), then append the four sub-step entries and one combined entry to `/tmp/harness/draws.json`
   - smoke 15 and 1 at DAY=11-03, 10-20 and 12-10
   - run test-B27Sa, test-B27Sb, test-B27Ta, test-B27Tb (if landed), test-controls, and test-B8 through test-B27
4. Copy the merged file to the main path, following the batch-3 merge precedent.

---

## S18. Verification

**Fixed views.** The before set already exists: `/tmp/harness/style/now/` (Nov 3 at 15:30 and 21:00, weather clear, portrait 393x852 and desktop 1100x820).
- After shots must reuse the exact camera parameters in `tools/ext_shots.js` and `tools/int_shots.js`.
- Re-shoot BASE+S0 with the same tools as the ledger "before" (the `now/` set predates the owner fixes). Run it with the simulation frozen (`__mocha.freeze(true)`) and with DAY=11-03.
- Each sub-step shoots its own after set: Sa and Sb on the exterior views, Ta on the room views, Tb on the walker and outfit-wall views.
- `shotMode(name)` registers the same views for B42.

| View | Judged against |
|---|---|
| ext-walk-square-cozy, ext-walk-square-wide, ext-walk-square | s1, s3 |
| ext-follow-ui (exterior parts), ext-street-homes, ext-street-homes-walk | s2, s4 |
| ext-path-cemetery, ext-park-path | s4 |
| ext-shopfront-main, ext-shopfront-bakery | s1, s3 |
| ext-station | s3 |
| ext-cabin | s2 |
| ext-night-* | the autumn night targets (S2c); in December, s5 |
| int-cafe, int-cafe-side, int-bakery | i3 |
| int-threads, int-look-* | i1 |
| int-bookstore | i3, i2 |
| int-library, int-cabin-furnished | i2 |
| int-thrift, int-wendell2 | i4 |
| int-home, int-home-bed, int-home-kitchen2, int-night-home | i2, i4 (gothic) |
| int-lantern | i3, i4 fixtures |
| int-records, int-evergreen | tone only |

**Tools.**
- `tools/ext_now_stats.py`: warm, cool, green and grey shares, and luminance.
- An interior tone script, extended from `tools/int_contact.py`: 5x5-grid mean, corner/centre ratio, near-white count.
- `tools/int_draws.py` and the ext draws probe: main and shadow splits, on frozen frames.
- `tools/toggle_probe.js` (seam S0; the B21 method): hide one object, re-render the same frozen frame, and diff `renderer.info.render.calls` and triangles for the main and shadow passes.
- `perf1.js`, `perf1p.js` (`HOUR=15` and `HOUR=21`) and `smoke.js`, all with `DAY=11-03`, plus `DAY=10-20` and `DAY=12-10` for S.
- `tools/sep_probe.js` (seam S0): the masked character-separation test of S2h.
- `tools/subj_probe.js` (seam S0): subject height for the camera layers of S6.
- A contact-sheet script that lays out before | after | reference for every view.

The implementer reads every pair with Read and writes one verdict line per view in the step summary.

**Ledger entry** in the track's own ledger file (S16 rule 9): `{step, day, before, after, toggles:[{object, main, shadow, tris}], tris, progs, budget, met}`, plus a per-view table (main, shadow, total) before and after.

**Phone legibility checks** (portrait 393x852, landscape 852x393, the Duo 900x1000 and desktop), **with tilt-shift on:**
- no HUD overlap
- shop names on boards legible at 393 px wide
- the walker on the lower third
- sky 15% or less in portrait walk views
- hero props at least 40 px in portrait walk views, and room hero silhouettes at least 70 px in landscape
- no repeating texture below 4 px per element on screen
- every character separated from its ground (S2h), and Mocha the brightest object outdoors
- each camera layer's subject height within 8% of its reference (S6)

---

## S19. Do and don't

**Do**
- Borrow the feel: palettes, proportions, density, light ratios and archetypes (cone pendant, Windsor chair, outfit stand, carriage lamp).
- Build every repeatable look as a kit with seeded placement, and reuse it in every later step (porch, terrace, entrance square, garden path, room styles, fixtures, the hero kit, the Rainy Term looks).
- Keep Mocha the brightest thing in exterior frames, and keep every character separated from its ground in value, in either direction (S2h).
- Put saturated colour only on small things, repeated in triangles.
- Keep one cool note per room and the sky as the cool note outside.
- Respect the calendar (S2b follows `holTheme`): harvest props [Sep 22, Nov 27), faces [Oct 17, Nov 1), warm winter lights from Nov 27, the market [Dec 1, Jan 7).
- Use TRUE facts only (Leavenworth, Krampusnacht, larches, KC jazz) and verify dates before quoting.
- Measure every change: shots, colour stats, draws (by toggle, on frozen frames, with DAY set), tris, programs and memory.
- Keep it phone-first: test 393x852 portrait first, then landscape, the Duo and desktop.

**Don't**
- Copy anything specific from the references:
  - no villagers (the rabbit, the bears, the monkey)
  - no item designs, food-truck livery, manhole art or saint statue
  - no "Pootsie's Boutique", "After Hours Collection", creator codes, watermarks or captions
  - no "Keepsake" or "Fanny"
  - no real paintings (i2 hangs two famous ones: our frames carry procedural original art)
  - no i1-style screenshot borders or titles
- Use Nintendo or franchise names or beats anywhere.
- Add THREE lights, `glow()` or `hGlow` sprites, loose per-prop meshes, bloom passes or extra render targets.
- Read `camS.dist` to size anything in world space (use `STYLE.effDist()`), compensate the FOV anywhere but `STYLE.fovK`, or touch `BAKEM`'s ramp.
- Call `poolAdd`, `glowPt`, PB or CAM at the top level of a block declared above them, or declare anything the other track's block reads below that block (S17).
- Put seasonal props in TB or PB, or holiday props in `HOL.g` when they belong in DB.
- Use high-frequency grain, `ctx.filter`, or cool grey on large surfaces; or lime grass, white pill signs, or cream walls with cream furniture.
- Make black voids in shops (use real staff doors); a cased void is fine in homes.
- Use yellow, mustard or gold on any jacket (hue 38-68°); awnings and flowers may use mustard.
- Move PLACES, change road widths, change nav, or touch the walk controls (owner-fix territory).
- Let style code write `G.act`, `G.target` or `G.mode`, call `startAct` or `goPoint`, or add a userBias term. Visual reactions by Mocha or Tamarack are weighted candidates only.

---

## Appendix: code anchors (search strings; line numbers drift)

Line numbers are from the main index.html at batch-3 fix stage (commit bf94fae), read only. BASE adds the owner fixes, so search by string.

| Anchor | Approx. line | Why it matters |
|---|---|---|
| `const PAL` (closing `rim:{...}};`) | L433 (L441) | S pre-block goes after L441 |
| `const SEASONS` | L1208 (`SEASON_KEY` at L1214) | top-level, reads PAL |
| `rampTex` / `const TOONG` | L1231 / L1232 | seam: `const STYLE` goes right after L1232 |
| `class ToonM` | L1233 | |
| `const post` | L1274 | |
| `function canvasTex` | L1288 | |
| `function glow(` | L1295 | |
| `grassTex` | L1324 | top-level, before S's main block |
| roads and walks | L1340-1348 | top-level, before S's main block |
| `function wallTex` | L1350 | |
| `function signTex` | L1366 | |
| `function shop(` | L1373 | |
| `let BAKEM` / `function bake(` | L1420 / L1421 | shared by exteriors; T never touches it |
| `function railMat` | L1442 | |
| `function goods` | L1453 | |
| `function layoutRoom` | L1483 | |
| `function innerMerge` | L1512 | its plain key moves to BAKEMI (T) |
| `const LAYOUTS` | L1520 | T block goes right above |
| `function cottage` | L1808 | |
| `function b14Home` | L1906 | |
| `function market(` | L1957 | |
| `function library(` | L1969 | |
| `function dollhouse` | L2021 | |
| `function grocery(` | L2111 | |
| `const GLOWPTS` / `glowPt` / `glowSet` | L2160 / L2169 / L2171 | |
| `const POOLS` / `poolAdd` | L2173 / L2177 | poolAdd lays pools flat at y .37 today |
| `const PB=Batcher(36)` / `const PBM` / `const pbW` | L2180 / L2181 / L2183 | S main block goes after L2183 |
| `const SQUARE` (`treeSlot`) | L2291 | |
| `function plazaB` | L2292 | |
| `const blockers` | L2614 | footprint reservation goes right after it |
| `function Batcher(` | L2617 | |
| tree batch (`const trees=[]` … `TB.build(VEG)`) | L2633-2658 | TB is block-local and built here |
| `b8Glows` | L2704 | |
| `b8Frame` | L2715 | |
| `PB.build` (with `b8Glows`, after `dressTown()`) | L2750 | keys vc, sign, win, fogwin; only vc casts |
| `const clouds` | L2760 | |
| `makePet` | L2815 | |
| `function dayDiff` / `function holTheme` | L3087 / L3143 | the calendar's source of truth |
| `TOWNTREE` | L3238 | the one town tree |
| `TRIPS` `leavenworth:` | L3484 | the existing December trip |
| `function updateSky` | L3629 (shadow line L3636) | |
| `const hGlow` | L3681 | one sprite draw per call |
| `function pumpkin(` / `function xmasTree(` | L3693 / L3696 | |
| `holHide` / `holBuild` | L3705 / L3708 | |
| `const camS` / `const CAM` | L4249 / L4256 | read only inside `STYLE.effDist()` |
| `function camDist` / `zoomLim` | L4271 / L4272 | |
| `function youParts` | L4449 | |
| `function setCamMode` | L4538 | |
| `function placeCam` | L4907 | seam: the effDist line |
| `leavenworth(g,X,Y,W,H,r,xm)` (the postcard painter) | L5107 | |
| `resize` | L5410 | FOV today `w<h?64:50` |
| `function frame(` | L5417 | seam: the freeze line |
| `window.__mocha=` | L5478 | |
| talk camera (fov-derived) | L5964 | fovAware |
| `roomFit` / `roomPush` | L6243 / L6244 | roomFit stays FOV-free |
| `wltTick` | L6419 | |
| `function hangCam` | L6561 | reuses roomFit |
| `const CATSRC` | L6992 | |
| `CATDEC` | L7471 | |
| `function catMerge` | L7548 | |
| `function buildCabin` / the 'cabin' CAM push | L7964 / L8208 | |
| `function dCam` (fov-derived) | L8480 | fovAware |
| `function lookOfItem` | L8630 | |
