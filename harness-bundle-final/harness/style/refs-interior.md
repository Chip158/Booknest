# Interior and wardrobe references i1 to i4: buildable analysis (for B27T)

Interior and wardrobe reference analyst, 2026-11-03. I only read index.html (batch 3 is in its fix stage). Every number below was measured with PIL or read from the zoomed crops.

- Crops (Read them): `/tmp/harness/style/crops/i1-*.png`, `i2-*.png`, `i3-*.png`, `i4-*.png`
- Sample-box overlays: `boxes-i1.png` to `boxes-i4.png`
- Swatch sheets: `i-palette-authored.png` (section 1c) and `i-wardrobe-palette.png` (section 6)

Scale used throughout: the chibi character is 1.95 units tall (B18). Doors are 1.8x3.0 (B12). Counters are 1.1 to 1.3 high, and islands stay at or under 1.3.

Room sizes from PLACES:
- Drizzle & Bean Café (Juniper): 12x10, h7
- Rainy Day Books (Mabel): 13x10, h8
- Emerald Public Library (Rosalind): 20x14, h14
- Drizzle Threads (Wren): 10x9, h7.5
- Second Story Thrift (Pearl): 12x9, h9
- Evergreen Home & Hearth (Otis): 18x12, h8
- Wendell's cottage: 13x10, h5.5
- Mocha's house: 28x14, h6

---

## 0. What the four pictures are, and the one-line look

- **i1, boutique outfit wall.** Two panels show 8 complete outfits on black stands in a row against a dark walnut raised-panel wall. Two berets hang on the wall above. Shoe pairs and handbags sit on the floor below. A framed picture is centred above, and dark teal planters stand at the ends. It is very low key: mean luminance 20%.
- **i2, library-study.**
  - Room: three tall round-headed windows with fan-and-lattice muntins, milky glass, open mahogany bookcases with colour-blocked spines, and a reddish chestnut herringbone floor.
  - Furniture: a pedestal desk carrying a green typewriter, a cream paperback stack, a green mug and a chess set; a spindle rocking chair; a wooden flower cart with spoked wheels.
  - Plants and curios: hanging planters spilling red maple leaves, a monstera in a red woven basket, a globe on an iron cart, an asymmetric teaware wall shelf.
  - Architecture: a dark wainscot dado, a cased doorway into a black void, and two steps down at the left.
- **i3, book café** (two shots).
  - Architecture: double-height book walls with a light-wood mezzanine rail and a steep open ladder stair, square timber posts, and glazed double doors.
  - Lighting: black cone pendants plus one frilly glass pendant over the counter.
  - Furniture: round tables with white square cloths over dark plaid underskirts, whitewashed Windsor chairs, a bakery case, and a wooden counter with a register and a sale sign.
  - Corner: a chalkboard A-frame, a blush plaid sofa on a rose gingham rug, a schefflera in a wicker pot, and a coat tree hung with a hat and a scarf.
  - People: villagers seated with coffee and cake in a boater, a beret, a black fedora and a porkpie.
- **i4, Victorian study / curio parlour.**
  - Room: cream wide-plank walls.
  - Seating: tufted carved armchairs and a cream camelback sofa around a coffee table with cups, on a round shag rug.
  - Curios: a globe, an antique wall telephone, a gramophone, a wall ladder-shelf and a glass-front cabinet.
  - Lighting: a triple globe pendant, a bare-bulb pendant and wall sconces.
  - Dressing: sepia framed sketches, a ficus in a pot, twine-tied book bundles and cardboard boxes.

**The look in one line:** a warm, low-key room in one hue family, lit by a few visible warm sources. Colour lives only on small things (spines, flowers, a green typewriter, a red bag). Walls are layered: wainscot, then shelves or panels or windows, then a darker upper band. The room is dense on the walls and open on the floor, with one clear hero piece.

**IP and originality.**
- All four images are fan screenshots from a Nintendo life-sim (i3 carries a creator watermark; i1 carries a creator code and a shop name).
- We take archetypes (cone pendant, Windsor chair, outfit stand), never item designs, names, the "After Hours Collection" title or the villagers.
- i2 hangs two real famous paintings (a Renaissance Venus and a 16th-century fruit-and-vegetable face portrait). Never reproduce a real painting; our frames carry procedural original art (item 38).
- i3's bakery case is a flat illustrated panel. Ours is a real glass case with primitive loaves.

---

## 1. Interior palette

### 1a. Measured palettes

PIL median-cut, 12 colours each, with area share. HSL is given as h/s/l.

| Image (region) | 12 colours by area |
|---|---|
| i1 top scene (45,30,365,235) | #200D08 11% · #6D544A 10% · #0B0201 9% · #39150D 9% · #54362A 9% · #2B110B 9% · #100705 8% · #8F7C6F 8% · #4A2217 8% · #33231D 7% · #130C09 7% · #CABEB7 5% |
| i1 bottom scene | #64463C 11% · #230E08 11% · #0B0302 10% · #2F140B 10% · #563021 9% · #3F170E 8% · #49281A 8% · #130704 7% · #3B241A 7% · #170B07 7% · #B69B88 6% · #856A5A 6% |
| i2 whole | #48241C 12% · #5B392A 11% · #371A15 10% · #7B3F2F 10% · #522920 10% · #21100E 9% · #774C3A 8% · #9E5D43 8% · #9B4F3C 7% · #36241B 5% · #682A20 5% · #BD805F 5% |
| i3 top shot | #4C342D 11% · #875E55 10% · #35211C 10% · #1D1210 10% · #41251E 9% · #251713 9% · #A0837B 9% · #5F3B31 8% · #53291E 7% · #723E32 7% · #281D19 7% · #CEB6AC 5% |
| i3 bottom shot | #4B2C24 12% · #996B5F 10% · #724235 9% · #1C1210 9% · #3E2721 9% · #271B17 8% · #BB9587 8% · #2E231E 8% · #5C3D35 7% · #8B4B3A 7% · #5A2E22 7% · #D9C3BB 6% |
| i4 whole | #B08B7B 10% · #C39F8E 10% · #120302 9% · #64463B 9% · #1F0B06 9% · #361A12 9% · #462319 9% · #9B7464 8% · #26140E 8% · #5C2B1E 8% · #895847 6% · #DEC6BA 5% |

Targeted median samples (selected; the full list was printed during the analysis):

| Material | Measured | Material | Measured |
|---|---|---|---|
| i1 panel wall field | #3D1C0E | i1 floor | #431A14 |
| i2 plaster (upper wall) | #734532 | i2 wainscot dado | #4E2922 |
| i2 herringbone (dark 15 / median / light 85) | #6C3D35 / #85473E / #904C3F | i2 pedestal desk | #391816 |
| i2 bookcase frame | #451F19 | i2 window glass (lightest 30%) | #C39C84 (milky, warm-graded) |
| i2 oxblood spines | #962824 | i2 ochre spines | #CC6335 |
| i2 "sage" spines | #6E4F39 (really olive-brown) | i2 "navy" spines | #372324 (really mauve-black) |
| i2 typewriter / mug | #29351C / #2E3619 | i2 maple leaves | #A73524 (light #CA3D33) |
| i2 globe | #D58246 | i2 monstera | #232A13 |
| i3 window glass (lightest 40%) | **#898A91 (the only cool colour in the set)** | i3 timber post | #4F312A |
| i3 white tablecloth | #DACACD | i3 plaid underskirt (dark / light) | #1A100E / #895858 |
| i3 gingham rug (dark / light) | #78432F / #E0BCB0 | i3 plaid sofa (lines / light) | #211C0F / #B98881 |
| i3 Windsor chair | #97776E | i3 floor planks | #783D2B |
| i3 mezzanine rail (lit) | #896555 | i3 cone pendant | #231619 |
| i3 frilly pendant | #D6C0B0 | i3 counter front / top | #692D1C / #BF8884 |
| i3 boater straw | #B6896E | i3 sale sign gold text | #B88E6C |
| i4 plank wall (light half) | #D6A992 | i4 tufted upholstery | #B8A49A |
| i4 dark sideboard | #2E110D | i4 globe pendants / bulb | #F5F6F7 / #F6F6F3 |
| i4 brass horn | #B5805A | i4 round shag rug | #A1857D |
| i4 dark floor | #32160F | i4 wall telephone | #501811 |

### 1b. What the numbers say

1. **One hue family.** In all four images the dominant colours sit at hue 6 to 25 degrees (red-brown to orange-brown), saturation 20 to 60%. The rooms are effectively monochrome warm.
2. **Low key.** Mean luminance runs from 20% (i1) to 33% (i4). Corners measure 0.55 to 0.75 of the centre's luminance (5x5 grid). The brightest blocks are lamps, windows and cream walls.
3. **The colours are relative.**
   - The spines that read sage-green and navy in i2 measure #6E4F39 and #372324: olive-brown and mauve-black. A scan of i2 found no green pixels in the bookcases and no blue pixels anywhere except the pansies.
   - The only true hues are small: the typewriter and mug (dark forest, hue 72 to 77), the monstera, the pansies (#3F264F), the oxblood spines, the maple leaves and the ochre spines.
   - In our renderer, which grades far less, we must author **true but muted** greens and navies, or they will look grey.
4. **Temperature contrast.**
   - The only cool area in the set is i3's daylight window glass, #898A91 against an all-amber room.
   - i2's windows are milky white, i4's lamps burn out to white, and every "white" textile is warm pink (#DACACD, #D6C0B0).
   - This warm room with cool windows is the core of the mood.
5. **Accent placement.** Saturated colour appears only on objects smaller than about a quarter of the character's height. Large surfaces are brown or cream, never saturated.

### 1c. Authored interior palette `INT`

Proposed constant; swatches are in `crops/i-palette-authored.png`. These are lifted 10 to 25% above the measured values because phones are viewed in bright places and our toon ramp darkens again.

**Woods**

| Token | Hex | From | Use |
|---|---|---|---|
| walnut | #4B2A1F | panels #3D1C0E, desk #391816 | panelling, bookcase frames, pedestal desk, wainscot field |
| walnutHi | #6E412E | panel bevels | raised-panel tops, edge highlights (vertex colour) |
| mahogany | #5E2620 | telephone #501811, carved frames | Victorian carved frames, wall telephone, curio cabinet |
| chocolate | #3A1E16 | i4 floor #32160F, i1 floor #431A14 | dark plank floors (parlour, boutique) |
| timber | #5A372C | i3 posts #4F312A | posts, beams, ladder stair stringers |
| chestnut | #8E4A36 | herringbone median #85473E | herringbone mid board, counter front |
| chestnutLt | #A85E44 | herringbone light boards | herringbone light board |
| chestnutDk | #6E3528 | herringbone dark boards | herringbone dark board |
| seam | #3A1A14 | | floor seams, grooves |
| honey | #A87B5E | i3 rail lit #896555 | mezzanine deck and rail, counter tops, sills |
| oakPale | #CDB8A6 | i3 Windsor #97776E | whitewashed Windsor chairs, café side tables |

**Walls**

| Token | Hex | From | Use |
|---|---|---|---|
| plaster | #A9765E | i2 #734532 | warm taupe plaster above the wainscot |
| plasterBand | #7A4E3E | | the darker band above the picture rail at 4.6 (B12) |
| beadCream | #E9D3BE | i4 #D6A992 | plank and beadboard walls |
| beadGroove | #9C7462 | | plank grooves |
| ivoryTrim | #EFE3D6 | i3 white doors | painted doors, crown moulding in cream rooms |

**Textiles**

| Token | Hex | From | Use |
|---|---|---|---|
| cloth | #F3E9E4 | #DACACD | tablecloths (warm white, never #FFF) |
| plaidChoc / plaidRose / plaidLine | #3A2420 / #8E5E58 / #E8D5CC | underskirt | café tartan (1d) |
| sofaBlush / sofaCream | #C99A90 / #F0DDD3 | sofa | plaid sofa |
| ginghamRose / ginghamCream / ginghamMix | #C48C80 / #F4E4DA / #DCB8AC | rug | gingham rug |
| shagCream | #E8DCD2 | i4 rug | round shag rug |
| oyster | #D8CBC2 | tufting #B8A49A | tufted upholstery |
| linen | #E3D3C3 | | camelback sofa |

**Accents** (small objects only; 2 to 3 per room)

| Token | Hex | From | Use |
|---|---|---|---|
| oxblood | #8C2C24 | spines #962824, bags #6A160E | spines, bags, a basket, a book stack |
| maple | #C2412C | leaves #A73524 | autumn branches (Nov swap slot) |
| ember | #D0683A | ochre spines #CC6335 | spines, the suitcase record player |
| parchment | #E2B07E | globe #D58246 | globes, paper, maps |
| brass | #B5804A (hue 30, mustard-free) | horn #B5805A | horns, lamp caps, bells, pulls, rails |
| straw | #D6B48E | boater | boaters, wicker |
| marigold | #E8A050 (hue 32) | yellow roses | flower-cart blooms (not mustard) |
| forestInk | #35512F | typewriter #29351C | typewriter, mugs, banker's-lamp shade |
| leaf | #2E4A26 | monstera #232A13 | monstera, ficus, schefflera |
| sageSpine | #6C7A5A | | "green" spines (author it truly green) |
| navyInk | #333A55 | | "navy" spines |
| plumInk | #4E3450 | | spines in Mocha's gothic rooms |
| pansy | #5A3A78 | #3F264F | pansies in the flower cart |
| slateTeal | #2F4A4E | i1 planters | the one cool planter in the boutique |

**Light and glass** (MeshBasic or emissive; never lit)

| Token | Hex | Use |
|---|---|---|
| bulb | #FFF6E6 | bulb cores |
| globeGlass | #FFF3E0 | globe pendants |
| frilly | #F2E2D6 | frilly shade |
| coneOut | #1E1A1C | cone pendant exterior (toon) |
| coneIn | #FFC27A | cone mouth disc |
| pool | #FFB070 | POOLS colour |
| sconce | #FFD9A0 | sconces |
| winDay | #C9CDD8 | clear glass by day (the cool note) |
| winMilk | #EADBC8 | frosted lattice glass by day |
| winNight | #2A3260 | glass at night |
| muntin | #2A1C18 | muntins |
| moonShaft | #8A96D8 | moonlight patch |
| cabGlow | #FFDDB0 | glass-cabinet back glow |

### 1d. Plaid and gingham colourways (canvas recipes, one 128 px atlas cell each, tiled by UV)

Each is drawn once into the B24 decal atlas; tile by setting UVs to 0..n.

- **Cocoa Tartan** (café underskirts):
  - Fill plaidChoc.
  - A horizontal band of 40 px plaidRose at 60% alpha from y 44 to 84, then the same band vertically: the crossing goes lighter.
  - 3 px plaidLine lines at 1/6 and 5/6 on both axes.
  - A 2 px #241411 line through the band centre.
- **Blush Windowpane** (plaid sofa): fill sofaBlush; 10 px sofaCream bands every 64 px on both axes; a 2 px #4A2E26 line beside each band.
- **Rose Gingham** (rug): 16 px squares. Fill ginghamCream; draw rose stripes at 55% alpha on both axes. Crossings come out full rose and singles ginghamMix.
- **Puget Glen** (glen check for trousers and skirts):
  - Base #D8CCBE.
  - Groups of 2 px #6E625A hairlines, alternating 4 on and 4 off, rotated 90 degrees in alternating 32 px blocks.
  - A 2 px Oxblood Ink overcheck every 64 px.
- **Ferry Tartan** (i3's navy skirt, recut for the guy's trousers and scarf): base #2E3A55; 24 px #4A5A7A bands; a 2 px #B98E62 camel line.
- **Corduroy wale:** vertical 3 px stripes at plus or minus 8% lightness of the base colour. It reads as cord at phone size.

### 1e. Interior grade and day/night, with no new lights

- **TOONI warm ramp** (interior only).
  - Add a second 8-texel DataTexture beside `TOONG`: #4A2C2C x3, #7A4E44, #C99A80, #FFEBD6 x3. Give it to the interior batch materials (Batcher parent-mode output under `p.inner`).
  - r128 keys MeshToonMaterial programs on whether a gradientMap exists, not on which one, so this should add **no programs**. Confirm with `__mocha.programs()`.
  - Result: shadows inside go warm cocoa like the references, exteriors keep B15's lavender, and characters keep `TOONC`.
- **RIM:** keep B15's interior value, #FFC88A at .3.
- **Windows (unlit glass plane, see 2.6):**
  - Day: colour winDay (clear) or winMilk (frosted lattice).
  - Golden hour: lerp toward #FFD9B0.
  - Blue hour: #3A4A8A.
  - Night: winNight, with two faint warm reflection streaks baked into the texture.
- **Lamps stay on all day.** November in the PNW is overcast, and the references are lamp-lit. Emissive level is .7 by day and 1.0 at night. POOLS opacity: day .12 to .18, golden hour .30, night .45 to .55.
- **Window floor patches** (POOLS instances, elongated): day #FFF1DC at .16 (.24 on the sunny side); off at night. On full-moon nights, a moonShaft patch at .10.
- **Dim corners:** vertex AO (3b.4) plus a CSS vignette while `CAM` 'room' is on top. The vignette is a radial-gradient div under the HUD with pointer-events none, transparent at 55% and rgba(30,14,10,.32) at the corners. It costs zero GPU draws.
- **Targets for the B42 critique.**
  - Interior mean luminance 30 to 40%: lighter than the references' 20 to 33%, for phones in daylight.
  - Corners at 0.65 to 0.8 of the centre.
  - At least one near-white highlight (a bulb) in every room framing.
  - The window is the only cool area.

---

## 2. Architecture kit

General rules for every piece:
- Static, merged by the existing `Batcher` in parent mode per material (B12 6). Do not write a second merge helper.
- Vertex-coloured, using `rbox()` for rounded edges, with TOONI.
- Triangle counts are approximate.

**2.1 Wainscot dado** (i2, i1). Cap height 1.25. Per 1.2-wide bay:

| Part | Size | Colour |
|---|---|---|
| baseboard box | bay x .22 x .06 | walnut |
| field box | bay x .9 x .03 | walnut |
| raised panel, rbox (bevel .02) | (bay-.24) x .62 x .04 | walnutHi top edge via vertex colour |
| chair-rail cap box | bay x .07 x .09 | walnut |

About 44 tris per bay, so a 12-wide wall is about 440. Plaster above. In cream rooms (Wendell, Mocha's kitchen), use the narrow beadboard texture (2.3) below a walnut cap instead.

**2.2 Raised-panel full wall** (i1, i4 cabinetry).
- Lower tier: panels 1.0 tall. Upper tier: panels 2.6 tall. Mid rail at 1.2. Stiles .16 wide.
- Fields inset .03, with a walnutHi bevel on the top and left edges (vertex colour) and walnut elsewhere.
- Above the 4.6 picture rail: flat walnut or plasterBand.
- Use for the Drizzle Threads outfit wall, Town Hall upstairs and Mocha's study wall. About 200 tris per 6 units.

**2.3 Plank wall and beadboard** (i4). Texture, not geometry.
- Tile: canvas 256x256 = 4 planks of .4 units each, so 1 tile = 1.6 units.
- Base beadCream, 2 px beadGroove grooves, per-plank lightness jitter of plus or minus 4%, and 1 to 2 faint grain strokes.
- Narrow-beadboard variant: 8 grooves per tile, used under a chair rail (Wendell's cottage wainscot).
- One shared texture (about 0.35 MB with mips). If the interior wall material has no map today, this adds one program for all interiors (within B15's +8).

**2.4 Herringbone floor** (i2): new LAYOUTS floor kind `['herring', c1, c2]` beside carpet, check, plank and tile.
- Canvas 512x512 representing 2.6 x 2.6 units.
- Boards .32 x 1.3 at 45 degrees in a herringbone. Each board takes a random tone from chestnutLt, chestnut or chestnutDk; 2 px seam lines; one faint grain stroke per board.
- Make it seamless by drawing on a 2x canvas and cropping the centre.
- One texture for every room, about 1.3 MB.
- Use in the library, Rainy Day Books, Mocha's study and Town Hall upstairs.

**2.5 Plank floors** (retune the existing 'plank' kind):
- Wide plank (i3): chestnut boards .5 wide, staggered butt joints, seam #4A2218. Use in the café and Wendell's cottage.
- Dark plank (i4, i1): chocolate boards .35 wide, low-contrast seams #2A140E. Use in Drizzle Threads, the thrift shop and Mocha's parlour.

**2.6 Tall arched windows with lattice muntins** (i2, i3): the signature piece.
- **Size.** In h7 to h8 rooms: 1.6 wide x 4.4 tall, with a semicircular head of radius w/2 and the sill at .9. In the library (h14): 2.4 x 7.5, three in a row (i2's triptych).
- **Casing.** A walnut arch ring: ExtrudeGeometry of an arch shape with a hole (outer w+.36, inner w, depth .25), cached the way `rbox()` is (`rarch(w,h,t)`). About 150 tris.
- **Glass and muntins.** One arch-topped ShapeGeometry plane per window, MeshBasic (unlit), mapped to a cell of a small **window atlas** (512x512 holding 4 designs at 128x256).
  - Lower part: a 4x6 lattice grid with the nested-square motif from i2/i3.
  - Arch: a 6-spoke fan plus two concentric arcs.
  - Draw the glass white (slightly lighter at the top) and the muntins black. Then `material.color` = winDay, winMilk or winNight tints the glass while the muntins stay black. One material, retinted at the 4 Hz light tick (B16).
- **Sill.** A box (w+.2) x .06 x .3 in honey. It is a seasonal swap slot (pumpkins, maple sprig).
- Interior only; the exterior shell keeps the existing WLT windows.

**2.7 Double-height wall with mezzanine rail and ladder stair** (i3). For Rainy Day Books (h8) and the library (h14); a lite version for the café (h7).
- **Deck.** Runs along the back wall (optionally one side too), depth 1.1. The top sits at y 3.5 in h7 to h8 rooms and at 5.0 in the library. Build it as a honey box (len x .22 x 1.1) plus a walnut fascia .3 tall.
- **Rail.**
  - Rails: top rail .08 x .1 at deck + .95; bottom rail at deck + .12.
  - Balusters: boxes .07 x .8 x .07 every .36 (i3's rhythm).
  - Cost: a 12-long rail is about 33 balusters, about 400 tris.
  - Colour: honey, the same light wood as i3. Against the dark books it reads as a bright horizontal band.
- **Book walls.** Lower: floor to deck. Upper: deck to ceiling minus .3. Use bookcase modules (item 1) with spine decals.
- **Ladder stair.** A steep (60 degree) open stair against a side wall, rising to the deck, about 250 tris:
  - 2 timber stringers (box .08 x .3 x L)
  - 10 to 12 treads (box .9 x .06 x .28), with nothing between them
  - 1 handrail and 5 balusters
  - Footprint .9 x 2.0. Decorative, unless B11's vertical transport later registers it. Put a `browse` spot at its foot.
- **Camera fit.** The room camera (pitch .62 to 1.0, `roomPush`) looks down on the back wall, so the deck and rail read as the band at y 3.5 to 4.5, exactly where B12's picture rail sits. In rooms with a mezzanine, **the rail replaces the picture rail** as the cosy band.

**2.8 Timber posts and beams** (i3).
- Posts .42 square in timber, `rbox` r .04 chamfer, a .1 base plinth and a capital (box .55 x .12 x .55). Beams .35 x .45.
- One post every 4 to 5 units, used to split zones (counter vs seating; stacks vs reading nook).
- Never in a 1.8 aisle or the entry zone (`layoutLint`).

**2.9 Crown moulding and picture rail.**
- Cove: two stepped boxes at the ceiling joint (.12 x .12 and .08 x .2). Walnut in dark rooms, ivoryTrim in cream rooms.
- Picture rail at 4.6 (B12, box .06 x .08), with plasterBand above it.
- Hang framed art from the rail on two thin cords (cyl r .008, 2 tris each in a 3-sided cylinder). It reads as an old house instantly.

**2.10 Interior doors with glazed panels** (i3).
- Double leaves 3.2 wide x 3.0 tall (B12 double). Each leaf:
  - a box frame
  - a lower raised panel (`rbox`)
  - an upper glazed section of 2x3 panes, using a window-atlas cell on the glass plane
  - a brass lever at 1.05
- Walnut in book rooms; ivoryTrim painted in the café and Wendell's.
- Use for STAFF ONLY doors and the library's double glass doors (B12 fix 2).
- When the room behind is lit, tint that glass cabGlow at .25: it reads as more house back there.

**2.11 Cased opening into a void** (i2).
- A doorway-sized opening with .25 walnut casing, leading to a #0A0A0A plane set 1.0 deep.
- It fakes another room at almost no cost: about 12 tris, no draw (it joins the static batch).
- Use in Mocha's house, the library and Town Hall upstairs. Not in shops (B12 wants a real staff door).

**2.12 Two-step level change** (i2). Steps .2 high with walnut nosing. Use only where B11 handles steps. Low priority.

---

## 3. Lighting

### 3a. Fixtures

All fixtures are emissive geometry with **no THREE lights**. Halos go into GLOWPTS and pools into POOLS. Each fixture registers a `LIGHTSPOTS` entry `{pid,lx,ly,lz,color,kind}`, so B16 can switch it by occupancy.

| Fixture (ref) | Build | Glow | Halo (GLOWPTS) | Pool (POOLS) | Where |
|---|---|---|---|---|---|
| Black cone pendant (i3) | cord cyl r .015; shade cone r .38 to .06, h .5, coneOut (toon static batch, takes rim); mouth disc r .34, coneIn (Basic); bulb sph r .09, bulb, just below the mouth | coneIn disc; bulb | size 1.2, alpha .35 | r 1.5 under each | café and book-room tables. Hang at 3.4 to 3.8 over seating clusters (lower than B12's 4.2 standard there) |
| Frilly glass pendant (i3) | brass cap cyl r .07 h .1; shade = 12-segment open cone r .1 to .36, h .22, with alternate bottom-ring vertices moved plus or minus .05 in y (scallop; build once, cache); twisted cord = 2 thin cyls | whole shade frilly at .85 (it's glass); bulb tip | 1.5, .45 | r 1.6 | over the café counter, Wendell's kitchen table, Lantern & Wick stock |
| Triple globe pendant (i4) | brass stem cyl; 3 arms = torus quarter (r .25, tube .02); 3 globes sph r .2 | globeGlass | 2.0, .5 | r 2.2 | Mocha's parlour, the thrift curio corner, Town Hall upstairs |
| Wall sconce (i4) | back plate cyl r .07 h .03 brass; arm cyl; tulip shade = sph r .1, scaleY .8 | sconce | .9, .4 | vertical wall scallop (rotated POOLS instance, 1.0w x 1.6h), .3 | in pairs at y 2.4 beside art, mirrors and doors |
| Bare-bulb pendant (i4) | cord; brass socket cyl; sph r .1 | bulb | .8, .35 | r 1.0 | thrift back room, Wendell's workroom, the cabin porch inside |
| Picture light (i1) | brass bar cyl .6 long over a frame; emissive underside strip (box .5 x .02 x .04) | sconce | .7, .3 | wall scallop down the frame | the Drizzle Threads outfit wall, the library portrait, Mocha's ancestor portrait |
| Banker's desk lamp (fits i2's desk) | brass stem; half-cyl shade in forestInk with a lit underside strip | #FFE0B0 underside | .6, .3 | r .9 on the desk | Rosalind's desk, the cabin desk |
| Glass cabinet glow (i4) | back panel inside the cabinet | cabGlow at .35 | none | none | thrift, Mocha's parlour |

### 3b. How to fake it (no runtime lights)

1. **One LIT batch per interior.** Merge every emissive part (bulbs, shade mouths, frilly shades, globes, sconce tulips, lit strips, window glass and glazed-door panes) into one MeshBasicMaterial with vertexColors and the window atlas as its map. Parts with no texture point their UVs at a white texel in that atlas.
   - Day/night brightness: `material.color.setScalar(k)` at the 4 Hz light tick.
   - Cost: one draw per interior, and at most 1 to 2 new programs (basic with map and vertexColors).
2. **Move every interior halo into GLOWPTS** (one Points draw for the town, N=384).
   - Today `layoutRoom` gives each pendant a `glow(c,2.4,.5)` Sprite. Each Sprite carries its own SpriteMaterial, so each is a separate draw whenever the interior is visible.
   - Moving them saves one draw per pendant: café 3, most shops 2 to 4.
   - **These savings pay for this whole kit.** The same applies to any other static interior `glow()`.
3. **Floor pools and wall scallops in POOLS** (the existing instanced additive radial pool, N=96).
   - Per room, at most 6 pools: one per table cluster or pendant, one at the counter, one at the hero piece.
   - Radii 1.0 to 2.2, colour #FFB070, opacity by time of day (1e).
   - **Wall scallops** for sconces and picture lights are the same instances with a matrix rotated vertical. InstancedMesh matrices carry rotation, so they cost 0 new draws.
4. **Vertex-colour AO, baked at merge time.** Extend `Batcher.addM` with an optional per-vertex shade callback in parent mode; do not write a second helper. Factors:

   | Where | Factor |
   |---|---|
   | furniture vertices in the bottom 15% of their own height | x.78 (contact shadow on the piece) |
   | wall vertices within .5 of the floor | x.82 |
   | within 1.2 of two walls (corners) | x.75 at the corner, fading out |
   | wall above 4.6 | x.80 |
   | ceiling and beams | x.60 |
   | bookcase inner backs | x.55 (book voids read deep) |

   It costs build time only (about 1 ms per room) and zero at runtime.
5. **Window light.**
   - By day the glass is unlit bright winDay or winMilk, and each window gets one elongated POOLS patch on the floor (scale 1 : 2.5, rotated along the light) at .16.
   - At night the patches go off and the room pools rise.
   - Optional HIGH-tier extra: one shared InstancedMesh of slanted "shaft" quads (vertical gradient, additive) for all interiors. That is +1 draw only while an interior is drawn, paid for by point 2. LOW tier (`SET.saver`) drops shafts and window patches.
6. **Dim corners.** AO (point 4), plus the CSS vignette (1e), plus the rule that corner props are dark walnut (bookcases, cabinets), never cream.
7. **Pendants above heads.** The lowest shade bottom is 3.3, so the dollhouse camera never hides a seated character's head behind a shade.

### 3c. Per-room light recipe

| Room | Sources (max 6 pools) | Day window | Night mood |
|---|---|---|---|
| Café (i3) | 3 cone pendants over tables; 1 frilly over the counter; 1 bakery-case strip | clear winDay, cool | amber pools, dark book band above |
| Rainy Day Books (i3/i2) | 2 cone pendants; 1 globe trio over the reading nook; picture light on the stair wall | milky lattice | mezzanine band dark, pools on tables |
| Library (i2) | banker's lamp on the desk; 2 globe trios; 2 sconce pairs; 3 tall windows | milky lattice triptych, floor patches | windows indigo, desk pool the hero |
| Drizzle Threads (i1) | 1 pool per outfit stand (4); picture light over the frame | street window only | "after hours": stands lit, room dim |
| Thrift curio (i4) | triple globe; 1 bare bulb; cabinet glow | cafe-curtain window | cabinet glows, warm centre |
| Mocha's house (i4, gothic) | triple globe over the tufted chairs; sconces either side of the ancestor portrait | milky | plum walls, amber centre |
| Wendell's cottage | frilly over the table; sconce pair | clear | cosy, beadboard catches the light |
| Owner's log cabin | banker's lamp on the desk; bare bulb; fire (existing) | clear | desk pool plus hearth |

---

## 4. Furniture and prop kit: the 40 most characteristic items

**Parts vocabulary** (B24 builders): box, cyl, sph, cone, torus, decal (atlas cell), rbox.

**Sizes** are W x D x H in units (character 1.95 tall).

**Where codes:**
- CAFE: Drizzle & Bean
- BOOKS: Rainy Day Books
- LIB: Emerald Public Library
- THREADS: Drizzle Threads
- THRIFT: Second Story Thrift, the antique/curio shop
- BAKE: Puddle & Crumb
- MOCHA: Mocha's gothic house
- WEN: Wendell's cottage
- CABIN: the owner's log cabin
- HALL: Town Hall upstairs (Mayor Odalie)
- EVER: Evergreen showroom vignettes
- LANT: Lantern & Wick

**Catalog fit** (last column) names the B24 set or category it suits. B24 has exactly 150 items, so these are proposals for **variants or swaps**, not additions; the batch planner decides. "Dressing" means fixed shop décor, not for sale.

| # | Item (ref) | Build note (primitive parts) | Size | Tris | Where | Catalog fit |
|---|---|---|---|---|---|---|
| 1 | Bookcase, mixed spines (i2, i3, i4) | walnut frame: 2 sides, top, plinth, 4 to 5 shelves (boxes); back x.55 AO; per shelf ONE decal quad from a spine-strip atlas cell (strips of 5 to 9 spine blocks, each block the same colour in a set, with a 2 px brass band at 15% and 85% height). 6 strip variants; random u-offset per row so repeats hide. Spine colours: oxblood, ember, sageSpine, navyInk, beadCream, chestnutDk (plumInk in MOCHA) | 1.4 x .5 x 3.0 (tall 3.4 for double height) | ~90 | BOOKS, LIB, CAFE, CABIN, MOCHA, THRIFT, HALL | storage (Gothic Parlor / Cabin Rustic) |
| 2 | Glass-front display cabinet (i4) | mahogany box carcass with crown and plinth; 2 glazed doors (glass batch) with muntin texture; 4 shelves holding 10 to 14 tiny bottles and jars (cyl and sph, merged, vertex colours); back panel cabGlow at .35 | 1.0 x .45 x 2.1 | ~260 | THRIFT, MOCHA, HALL | storage (Gothic Parlor) |
| 3 | Sideboard with raised-panel doors (i4) | box carcass, 3 door fronts as rbox raised panels, brass pull sph; top overhang; plinth | 1.8 x .5 x .9 | ~110 | THRIFT, HALL, MOCHA, BOOKS (under the stair) | storage |
| 4 | Wall ladder-shelf (i4) | 2 slim posts box .06 x 2.4, leaned 4 degrees against the wall; 4 shelves box .7 x .04 x .26 on bracket triangles; holds book trio, canisters (cyl), tiny plant (sph cluster) | .8 x .3 x 2.4 | ~120 | WEN, THRIFT, CABIN | storage (Cottage Bloom) |
| 5 | Asymmetric teaware wall shelf (i2) | 5 interlocking open box frames (thin walnut boxes) at staggered heights; teapot (sph + cyl spout + torus handle), 2 cups (cyl), bud vase (cyl) with a blossom twig (cyl + 5 tiny sph), plate disc (cyl decal) | 1.3 x .25 x 1.0, hung at 3.0 | ~220 | WEN, CAFE, MOCHA kitchen | wall (Coffeehouse) |
| 6 | Bakery case (i3) | walnut base cabinet with raised panels; glass case box (glass batch) on top; 2 inner shelves: loaves (sph scaled 1 : .5 : .45, chestnutLt with scored decal), round cakes (cyl cream + 4 red sph berries), roll cake (cyl with a spiral decal), pie slices; price-tag decals; a lit strip under the top shelf (LIT batch) | 1.9 x .75 x 1.6 | ~380 | CAFE (hero), BAKE | dressing; kitchen variant |
| 7 | Rolling library ladder (i3) | 2 rails box .06 x .06 x 3.2, 9 rungs cyl r .025, top hooks torus quarter on a brass rail (cyl r .03 along the bookcase at 3.1), 2 floor wheels cyl; leaned 15 degrees | .55 x .1 x 3.2 | ~140 | BOOKS, LIB | dressing |
| 8 | Pedestal executive desk (i2) | rbox top 2.0 x .08 x 1.0 with .06 overhang; 2 pedestals with raised-panel drawer fronts; recessed knee panel; plinth; brass pull dots (decal) | 2.0 x 1.0 x 1.05 | ~180 | LIB (Rosalind's desk), HALL, CABIN | tables (Gothic Parlor) |
| 9 | Writing desk with drawers and papers (i4) | box body, 2 drawer rows (rbox fronts), turned legs (cyl), loose papers (thin boxes at angles), inkwell (cyl) and quill (cone) | 1.4 x .6 x 1.0 | ~130 | THRIFT, MOCHA, WEN | tables |
| 10 | Round café table with white cloth over plaid (i3) | pedestal cyl r .06, base disc cyl r .3; underskirt = open cyl r .55 h .95 with Cocoa Tartan decal (UV wraps 3x); top = thin box .95 x .02 x .95 rotated 45 degrees to the chairs, in cloth; 4 corner drops = 3-sided cones (r .12 h .25) pointing down in cloth | .95 x .95 x 1.0 | ~120 | CAFE (x4 to 6), BOOKS reading corner, BAKE (x2) | tables (Coffeehouse) |
| 11 | Coffee table with slatted lower shelf (i4) | mahogany rbox top 1.2 x .06 x .7; 4 turned legs (cyl with a sph bulge); lower shelf = 5 slats box | 1.2 x .7 x .55 | ~110 | MOCHA, THRIFT, WEN, HALL | tables |
| 12 | Chess side table (i2) | small rbox table .7 x .7 x .8; board decal (8x8 in walnut and oakPale); 6 to 8 pieces (cone + sph, cream and walnut) | .7 x .7 x .85 | ~120 | LIB, CABIN, HALL | toys (collectible) |
| 13 | Industrial book cart (i2) | honey plank top box 1.3 x .06 x .6; black iron frame (thin boxes #1E1A1C); 4 caster wheels cyl r .1; bookends (L boxes) holding 6 books | 1.3 x .6 x .8 | ~160 | LIB (replaces the B12 leftover boxes as low carts), BOOKS | storage (Cabin Rustic) |
| 14 | Windsor chair (i3) | saddle seat rbox .5 x .06 x .48 in oakPale; 4 splayed legs cyl r .03 (8 degrees out); H stretchers; bow back = torus half (r .24, tube .025); 5 spindles cyl r .015 | .52 x .5 x 1.25 (seat .55) | ~170 | CAFE (x8 to 12), BAKE, WEN, CABIN | seating (Coffeehouse) |
| 15 | Rocking chair (i2) | spindle back: 2 posts cyl, top rail rbox, 5 spindles; seat box; arms; 2 rockers = torus arc (r 1.2, 40 degrees, tube .03); rocks .05 rad on its own at 0.3 Hz while someone sits (sin, no allocation) | .6 x .9 x 1.35 | ~200 | LIB reading nook, WEN (hero), CABIN | seating (Cabin Rustic) |
| 16 | Tufted carved armchair (i4) | mahogany shield back (rbox .62 x .78 x .08, crest = flattened sph); oyster back pad with tufting decal (dot grid); seat rbox; arm rails cyl; 4 cabriole legs (2 cyl each, angled) | .7 x .65 x 1.3 | ~240 | MOCHA (hero pair), THRIFT, HALL | seating (Gothic Parlor) |
| 17 | Cream camelback sofa (i4) | mahogany carved top rail (arched rbox); linen seat rbox and back; rolled arms = horizontal cyl r .14; 4 bun feet (sph); 2 cushions | 2.0 x .8 x 1.15 | ~220 | MOCHA, THRIFT, HALL | seating (Gothic Parlor) |
| 18 | Plaid sofa (i3) | boxy rbox base, 2 seat cushions, 2 back cushions, square arms, all with Blush Windowpane decal (vertex colour on legs) | 2.0 x .85 x 1.0 | ~150 | CAFE corner, WEN, CABIN | seating (Cottage Bloom) |
| 19 | Coat tree with hats and scarf (i3) | pole cyl r .04 h 2.2; 6 hook cyls angled up; tripod base (3 cyl); a hung boater (cyl crown + torus brim, straw with a black band) and fedora; a scarf = 2 long thin boxes with stripes | .6 x .6 x 2.3 | ~180 | CAFE by the door, THREADS, HALL, CABIN | storage (Rainy Day) |
| 20 | Wooden counter with register (i3) | honey rbox top; chestnut front with raised panels (2.1); register = box with an angled top box, emissive teal screen #3FBF9A (LIT), drawer line decal, tiny keys decal | 2.4 to 4.6 x .9 x 1.15 | ~200 | CAFE, BOOKS, BAKE, THREADS | dressing (B12 counter standard) |
| 21 | Chalkboard A-frame plus counter sign (i3) | 2 boards box .6 x .9 x .04 (slate #2B2A2E) with chalk decals (cup icon, "Soup of the Day", menu lines), hinged at the top, oakPale frame; small sign on a brass stand: "Day-old loaves 1/2 price" (original, not "-50%") | .65 x .5 x 1.0 | ~60 | CAFE door, BAKE, BOOKS ("Story hour Wed") | dressing |
| 22 | Black cone pendant (i3) | see 3a | r .38 x h .5 | ~70 | CAFE, BOOKS | lighting |
| 23 | Frilly glass pendant (i3) | see 3a | r .36 x h .3 | ~90 | CAFE counter, WEN, LANT | lighting (Cottage Bloom) |
| 24 | Triple globe pendant (i4) | see 3a | .8 x .8 x .6 | ~260 | MOCHA, THRIFT, HALL, LANT | lighting (Gothic Parlor) |
| 25 | Wall sconce (i4) | see 3a | .2 x .25 x .35 | ~60 | all rooms, in pairs | lighting |
| 26 | Bare-bulb pendant (i4) | see 3a | r .1 | ~40 | THRIFT, WEN, CABIN | lighting |
| 27 | Globe on stand (i2, i4) | sph r .28 in parchment with an original stylized-continents decal; brass meridian = torus half (r .31, tube .015); tripod stand (3 cyl) or iron cart (i2) | .6 x .6 x 1.2 | ~200 | LIB, BOOKS, THRIFT, HALL, CABIN | misc (Gothic Parlor) |
| 28 | Gramophone (i4) | mahogany box .5 x .45 x .25; platter cyl r .18 with a dark disc; tonearm (2 cyl); brass horn = open cone (mouth r .3, length .55) plus torus lip; tilted up 25 degrees | .55 x .5 x .9 | ~180 | MOCHA (hero; plays his records, B21), THRIFT | misc: a "record player" variant |
| 29 | Antique wall telephone (i4) | mahogany box .32 x .14 x .6; 2 brass bells (half sph); crank (cyl + box); mouthpiece horn (cone on an arm); black earpiece cyl hung on a hook | .35 x .2 x .65, hung at 1.6 | ~110 | THRIFT, HALL, MOCHA hall, WEN | wall (Gothic Parlor) |
| 30 | Typewriter (i2) | forestInk body: box .5 x .4 x .12 plus a tilted box keyboard bed; platen cyl r .05 l .5; keys = decal; paper = thin white box sticking up | .5 x .42 x .25 | ~70 | LIB desk, CABIN desk, Mabel's counter | electronics or misc (Rainy Day) |
| 31 | Suitcase record player (i2) | ember case box .5 x .38 x .14 with an open lid box at 70 degrees; dark platter cyl; brass latch dots | .5 x .4 x .5 | ~60 | CABIN, BOOKS listening corner | misc (record player variant) |
| 32 | Pendulum wall clock (i4) | mahogany box .35 x .12 x .9 with a round face (cyl decal) and glass door; brass pendulum disc (cyl) swinging at 0.5 Hz | .35 x .12 x .9 | ~70 | THRIFT, HALL, WEN | misc (grandfather clock sibling) |
| 33 | Flower cart (i2) | box .9 x .45 x .4 (walnut) with brass corner straps (thin boxes); 2 spoked wheels = torus rim (r .3) + 8 box spokes + hub cyl; handles (2 cyl); blooms: about 24 sph in marigold, pansy, oxblood and #F4ECE6 baby's-breath, plus an ivy decal trailing | 1.3 x .6 x 1.0 | ~420 | LIB entry, WEN porch inside, nursery, CAFE door | plants (Cottage Bloom) |
| 34 | Hanging planter with maple branches (i2) | half-sph walnut basket r .25 on 3 cords; 5 to 7 twig cyls drooping; leaf clusters = 3 to 5-point star decals (maple and ember, alpha-tested) or squashed sph clusters; shelf-top "spill" variant without the basket | .8 x .8 x .9 | ~150 | LIB, BOOKS, CAFE, MOCHA. **November swap slot** (Dec: pine and bows) | seasonal (Harvest) |
| 35 | Monstera in woven basket (i2) | basket cyl r .2 h .3 in oxblood with a weave decal; 6 to 8 leaf planes (alpha monstera cell, leaf colour) on curved stems (2 cyl each) | .9 x .9 x 1.4 | ~120 | LIB, BOOKS, CABIN, THREADS | plants |
| 36 | Fig or schefflera tree in pot (i3, i4) | terracotta (#8E4A36) or wicker (straw) cyl pot r .28; soil disc; trunk cyl; 4 to 6 squashed leaf-cluster sph (leaf) with a leaf-dot decal; schefflera uses star-leaf decals | .9 x .9 x 2.0 | ~160 | CAFE corner, THRIFT, MOCHA, HALL, THREADS | plants |
| 37 | Book stacks and twine bundles (i2, i4) | 4 to 8 boxes with plus or minus 6 degree jitter in beadCream, ember and oxblood; bundle variant = stack plus 2 thin cross boxes (twine #C9A27E) | .4 x .3 x .2 to .6 | ~60 | everywhere, as sparkle on desks, floors and stair treads | toys/misc (Rainy Day) |
| 38 | Framed original art (i2, i4) | frame = rbox ring or 4 boxes (walnut or brass); canvas = an atlas cell from a procedural ART generator. Subjects: sepia sketches (a ferry, a lighthouse, a cedar, Rainier's silhouette, the shop's own façade); oils (Mocha's ghost ancestor in a ruff, for MOCHA; a raccoon gentleman, for WEN). **Never a real painting.** Hung from the picture rail on cords (2.9) | .6 to 1.2 wide | ~30 | all rooms | wall (procedural art) |
| 39 | Coffee and cake service (i3) | cup on saucer: cyl + disc + torus handle + dark coffee disc; iced coffee: cone glass + cyl stem + red cyl straw; cake slice: triangular prism (3-sided cyl) on a dark plate; scone plate: 2 squashed cyl | .2 to .35 | 20 to 40 each | CAFE tables (1 to 2 per table), MOCHA and WEN coffee tables, BAKE | food (Coffeehouse) |
| 40 | Rugs: round shag, gingham, wrought doormat (i4, i3) | round shag = cyl r 1.4 h .03 in shagCream plus a fuzz-ring torus (tube .03); gingham = flat box 2.4 x 1.6 with a Rose Gingham decal; doormat = box with a scroll decal (black on #3D2923) | per type | 20 to 60 | MOCHA and THRIFT (shag), CAFE corner (gingham), every door (mat, B12) | rugs |

Wardrobe display furniture (outfit stand, hat rail, shoe pairs, handbags) is in section 6g.

**Budgets.**
- A fully dressed café of about 45 items is roughly 7 to 9k tris of furniture plus 3k of architecture.
- It merges into the draws listed in Appendix B. B24 caps catalog items at 4 draws per decorated room and 3 per shop display; the fixed dressing above goes in the room's static and LIT batches.

---

## 5. Composition rules for rooms (phone-first)

**Camera facts.**
- The main camera has a vertical FOV of 50. `roomFit` = hypot(w,d) x 1.05 in portrait (x .75 landscape), clamped to 7..22.
- Café in portrait: distance 16.4, about 56 px per unit at the target. The 393 px width shows only **about 7 units across** of a 12-wide room.
- Landscape: about 36 px per unit. The character is about 108 px tall in portrait and about 70 px in landscape.

Rules:
1. **One hero per room.** Put it on the back wall or back corner, on the door axis, inside the first portrait framing (the camera target sits at 60% walker, 40% room centre).

   | Room | Hero |
   |---|---|
   | Café | bakery case and counter under the frilly pendant |
   | Rainy Day Books | the mezzanine with the ladder stair |
   | Library | the triple arched lattice windows behind Rosalind's desk |
   | Drizzle Threads | the outfit wall |
   | Thrift | the glass cabinet with the gramophone |
   | Mocha's house | the tufted pair under the globe trio with his ancestor's portrait |
   | Wendell's cottage | the rocking chair by the teaware shelf |
   | Cabin | the desk with the typewriter under the window |

2. **Portrait slices.** Every 7-unit-wide slice of a room must contain one complete vignette: a wall layer, a piece of furniture, a light and a pool. Nothing important may sit only at the far side walls.
3. **Three wall layers on every visible wall:**
   - base, 0 to 1.25 (wainscot, cabinet bottoms, sofa backs)
   - middle, 1.25 to 4.6 (shelves, windows, art, outfit stands)
   - top, 4.6 and up (picture rail or mezzanine band, darker upper)

   No bare plaster run longer than 2.5 units.
4. **Walls dense, floor open.**
   - About 60% of props stand against or hang on walls.
   - 35 to 50% of the floor stays visible in the cutaway (i2 shows about 35% floor, i3 about 30%).
   - Rugs define zones. Islands stay at or under 1.3 (B12). Aisles at least 1.8. The entry zone stays clear.
5. **Seating vignettes, about 2.4 x 2.4 each.**
   - One round table, 2 to 3 chairs, a pendant above at 3.4 to 3.8, a pool below, and 1 to 2 cups.
   - Chairs turn 20 to 35 degrees off square, never parallel to the walls (i3).
   - Seated characters face each other or the camera at three-quarter view.
   - In the café, 2 vignettes are always occupied by townsfolk during open hours (B22 work stations and seats); characters, not empty sets, make the room feel alive.
6. **Readability.**
   - Anything under .35 units is decal or texture (spines, keys, labels, tufting), not geometry.
   - Cups (.18) only appear on tables, as sparkle.
   - Every hero silhouette (horn, globe, rocking chair, cone shade, outfit stand) must read at 70 px in landscape.
7. **Colour discipline.**
   - Walls, floor and big furniture stay in the 6 to 25 degree brown band.
   - Exactly 1 large cream surface per room for value contrast: cloths, sofa or beadboard.
   - 2 to 3 saturated accents (oxblood, forest, ember), only on objects .6 units or smaller, each repeated 3 times in a triangle across the room.
   - 1 cool note: the window by day, or the slateTeal planter in Threads.
8. **Light layout.** Each vignette gets one source and the hero gets the brightest. Corners get none. 3 to 6 sources per room. Pendants never hang below 3.3.
9. **Foreground depth.** One low object near the cutaway edge partly overlaps the view (i2's book cart, i3's chair backs and tree): a plant, a cart or a chair back. It stays under 1.3 tall and outside the faded wall plane.
10. **Diagonals and curves break the box.** Herringbone floors, angled chairs, arches, the stair's slope, the round rug.
11. **Seasonal swap slots, 2 to 4 per room:** shelf tops, hanging planters, the sill and a table centrepiece.
    - November (today): maple branches, a small pumpkin trio, wheat in a jug.
    - December: fir garland with red bows, and a mini tree on the counter.
    - These connect to the B40 and B41 holiday layers.
12. **Don'ts.**
    - No tables in the entry path.
    - No cream walls with cream furniture.
    - No more than 3 accent hues.
    - No black voids in shops: use real staff doors.
    - No mezzanine pretending to be walkable.
    - No real paintings.
    - No i1-style screenshot borders or titles.

---

## 6. Wardrobe: the Rainy Term collection (i1, plus the hats in i3)

### 6a. What i1 actually shows (decoded; colours sampled, then de-graded)

| Look | Pieces (as seen) | Measured | Re-cut for the GUY |
|---|---|---|---|
| A | grey belted coat-dress, white pin dots, waist bow; satchel on a side hook | #4B423A | Puget Grey belted mac with a birdseye texture, satchel |
| B | long camel open cardigan over a sage dress with a white Peter Pan collar | #695243 / #72695A | camel shawl-collar cardigan over a sage oxford shirt, cocoa cords |
| C | cream cardigan over a blue-grey collared blouse, brown skirt with cream dots; red frame purse | #997D68 / #5C4235 / #682C18 | oatmeal cable cardigan, chambray shirt, glen-check trousers |
| D | taupe cape-blazer, black bow, white blouse, belt, cream pleated plaid skirt | #5A412F / #796457 | tweed blazer, white shirt, black knit tie, cream-flannel trousers |
| E | camel cape over a chocolate polka-dot skirt | #7B5C47 | camel duffle coat (hood: B18's hood-up mechanic), cocoa trousers |
| F | white blouse with a black bow, brown pleated skirt; dark ankle boots | #5E4431 / #27211E | white shirt, black bow tie, brown pleated trousers with braces, black oxfords |
| G | brown argyle vest over a white blouse, brown pleated skirt; rust ankle boots | #7B6149 / #4F271E | **hero look:** argyle sweater vest, white shirt, chocolate trousers, chestnut brogues |
| H | taupe coat with cream collar over a brown floral dress; grey structured bag | #5F4534 | taupe field coat with a cream cord collar, check shirt, olive cords |
| Hats | cream and charcoal berets on wall pegs | #BE9F88 / #403730 | berets (both), plus the i3 hats below |
| Shoes | orange-red loafers, black oxfords, dark and rust ankle boots | #552317 / #221914 | oxblood loafers, black oxfords, chestnut brogues, dark chelsea boots |
| Bags | red handbag, grey structured bag, red frame purse | #6A160E / #4A3B33 | leather satchel (chestnut), book strap; the bags stay for the cast |

### 6b. The line

**Rainy Term** at Drizzle Threads, Wren's dark-academia line. Wren names colours poetically (B13), and every outerwear colour below clears the jacket hue block (38 to 68 degrees). I verified each one with a script; swatches are in `crops/i-wardrobe-palette.png`.

| Wren's name | Hex | Hue | Used for |
|---|---|---|---|
| Puget Grey | #7A7570 | 30 | mac, trousers, beret |
| Fog Cream | #E8D8C8 | 30 | cardigan, cable knit |
| Oatmeal Knit | #D9C6B4 | 29 | cardigan, vest base |
| Lamplight Camel | #B98E62 | 30 | duffle, trench, cardigan |
| Cedar Bark | #6B4632 | 21 | vest, blazer |
| Tweed Brown | #6B5442 | 26 | blazer, newsboy cap |
| Chestnut Leaf | #8A4A2E | 18 | cardigan, corduroy |
| Taupe Field | #8A7462 | 27 | field coat |
| Ferry Navy | #2E3A55 | 222 | duffle, blazer, tartan |
| Oxblood Ink | #6E2A2A | 0 | cardigan, tie, beret, loafers |
| Moss Stitch | #4E5E44 | 97 | cardigan, vest |
| Charcoal Wool | #3A3638 | 330 | overcoat, beret |
| Plum Ink | #5A3A5E | 293 | Mocha-twinning cardigan |

- Shirts: Oxford White #F2EEE8, Chambray #9FB0C8, Sage #A8B49A, Ecru #EADFD2.
- Bottoms: Glen Check (base #6E625A), Cocoa Cord #5A3A2A, Chestnut Cord #7A4A32, Olive Cord #5E6248, Cream Flannel #D8CCBE.
- Shoes: Black Oxford #221C1A, Chestnut Brogue #7A4128, Oxblood Loafer #6A2420.
- Accessories: Brass #B5804A for glasses and buckles; Tortoise #5A3A28.
- Note for implementers: creams naturally fall at hue 36 to 45 and would trip the B24 parser. Keep them pink-leaning (hue 28 to 33) as above.

### 6c. Eight complete looks for the owner's GUY

His default stays the forest rain jacket (B18). Rainy Term is the "evening and library" wardrobe. All looks use trousers and squared, straight silhouettes, so he reads clearly masculine.

| # | Look name | Pieces |
|---|---|---|
| 1 | **Stacks** (hero, from G) | Oxford White shirt, Cedar Bark argyle sweater vest (Oxblood and Fog Cream diamonds), Cocoa Cord trousers, Chestnut Brogues, round brass glasses, Tweed newsboy cap |
| 2 | **Reading Room** (from B) | Sage shirt, Lamplight Camel shawl-collar cardigan, Chestnut Cord trousers, Oxblood loafers, tortoise glasses |
| 3 | **Seminar** (from D) | Oxford White shirt, black knit tie, Tweed Brown blazer with elbow patches, Cream Flannel trousers, Black Oxfords, satchel |
| 4 | **Ferry Night** (from E) | Ferry Navy duffle coat with horn toggles (hood flips up in rain, reusing B18's hood shell), Fog Cream cable sweater, Glen Check trousers, dark chelsea boots |
| 5 | **Jazz Hour** (from F) | Oxford White shirt, black bow tie, Puget Grey pleated trousers with Oxblood braces, Black Oxfords, porkpie with a check band. Optional flavour line, TRUE: Kansas City jazz grew up around 18th and Vine in the 1920s and 1930s |
| 6 | **Puget Mac** (from A) | Puget Grey belted mac (birdseye texture), Chambray shirt, Charcoal trousers, satchel, umbrella (B24) |
| 7 | **Field Notes** (from H) | Taupe Field coat with a Fog Cream cord collar, Ferry Tartan shirt, Olive Cord trousers, chelsea boots, beret (Charcoal) |
| 8 | **Ghost Story** (twin look) | Plum Ink cardigan over Oxford White, Charcoal trousers, Oxblood loafers. It matches Mocha's plum family, so B18's "we match!!" twinning can fire (his choice) |

### 6d. Cast pieces (skirts, dresses, unisex)

Suggested owners, mapped to the B19 cast. These are suggestions; species rules come from B18 and B19.

| Character | Outfit | From |
|---|---|---|
| Rosalind (library) | sage collared dress, long camel cardigan, round glasses | look B |
| Mabel (books) | Fog Cream cardigan, Puget Glen pleated skirt, glasses pushed up on her head (spec trait) | |
| Juniper (café) | white blouse with a black bow, brown pleated skirt, apron | look F |
| Wren (Threads) | her own hand-knit argyle vest over a white blouse, brown pleated skirt | look G, fitting for a knitter |
| Pearl (curio and thrift) | grey pin-dot belted coat-dress, oxblood frame purse | look A |
| Mayor Odalie | taupe cape-blazer, black bow, cream pleated skirt | look D |
| Sol (studio) | Charcoal beret, smock | |
| Basil (records) | porkpie with a check band | |
| Monty (cinema) | black fedora (i3) | |
| Tabitha and others | chocolate polka-dot A-line skirt, Peter Pan collar blouse, pinafore over a blouse | |

### 6e. Hats (i3 and i1)

All hats are merged into the HEAD node (vertex colours) and sit on the head sphere (r .40).

| Hat | Build |
|---|---|
| Boater | crown cyl r .30 h .16 (straw, weave decal) + brim torus/flat cyl r .44 h .02 + black band cyl r .305 h .05 |
| Beret | squashed sph r .36, scaleY .32, tilted 12 degrees, with a .03 stem on top |
| Newsboy cap | 8-panel crown = sph r .40, scaleY .45, with a panel-seam decal; button sph r .03; bill = half-disc cyl .2 deep, angled down 15 degrees |
| Fedora or trilby | crown cyl r .28 with a pinched-top decal + brim torus r .42 snapped up at the back + band |
| Porkpie | flat-top cyl r .30 h .14 + narrow brim + Puget Glen band (i3's brown hat) |

### 6f. Building it on the chibi (B18 makeChibi, walker at 10 draws or fewer)

- **Torso.**
  - The walker's BODY uses a "top" material with a map: a 256x256 canvas redrawn on a Your Look change.
  - It holds the layer and shirt artwork: collar points, placket and buttons, V-neck showing the shirt, argyle diamonds, cardigan front edges and buttons, lapels, tie or bow, braces straps.
  - 3D extras merged into BODY with vertex colours:
    - collar points: 2 flattened 4-sided cones
    - cardigan rib hem: thin torus at the hip
    - shawl collar: half torus
    - coat skirt: frustum cyl r .36 to .42, h .30 (duffle) or .42 (trench, mac)
    - trench belt: flattened torus at the waist
    - duffle toggles: 3 cyl r .02 in #E6D2C0
- **Sleeves.** The ARM nodes take the layer colour (cardigan, blazer, coat) or the shirt colour (vest looks). Elbow patches are an arm decal.
- **Bottoms.** Legs use the bottoms material **with a pattern map** (64 px tile: plain white, glen, cord, tartan). A map must always be present so swapping patterns never changes the program.
- **Shoes.** The B18 shoe shell (.11 x .08 x .16), with decals:
  - oxfords: toe-cap line
  - brogues: punch dots
  - loafers: a lighter strap band
  - chelsea boots: taller (.14) with an elastic panel
- **Accessories.**
  - Glasses: round wire = 2 torus (r .09, tube .012) + a bridge.
  - Satchel: box .22 x .18 x .07 + strap torus band + 2 brass buckle boxes.
  - Scarf: neck torus + 2 hanging boxes in stripes.
  - Hats: 6e.
  - To stay at 10 draws or fewer, bake hair, hat and glasses into ONE vertex-coloured HEAD-ACC mesh, and satchel and scarf into BODY. On a Your Look change, rewrite only the colour attribute (or rebuild, about 1 ms). Never add a material per colour.
- **State proposal.** `S.you.fit = [top, layer, bottom, pattern, hat, glasses, shoes, bag, neck]` as small ints.
  - B18 already reserves `fit:[]`; an empty array means the default rain-jacket look.
  - Rainy Term looks are presets that fill `fit`.
  - Goes in `fresh()` and `migrate()`, and joins the 3 saved outfits.
- **Catalog.** B24 has exactly 14 clothing items, so this line either becomes outfit presets built from a few garment builders (shirt, vest, cardigan, blazer, duffle, trench/mac, trousers, skirt, hat set) or replaces clothing slots. That is the batch planner's call; I flag it here.

### 6g. Boutique display: complete outfits on stands, hats above, shoes below (i1)

The back wall of Drizzle Threads becomes the **Rainy Term wall** (the hero). The wall is 10 wide; the stands need about 6.

1. **Wall.** A 2.2 raised-panel wall in walnut. A central framed print (original: a sepia sketch of the shop's own façade) hangs from the picture rail, with a picture light (3a).
2. **Four outfit stands in a row,** 1.25 apart, .5 off the wall. Each stand:
   - base disc cyl r .26 h .04 (#1E1A1C)
   - pole cyl r .022 h 1.55
   - head knob sph r .06
   - shoulder hanger: half torus r .2
3. **The garment form** (the same textures as Your Look):
   - torso egg .31 x .38 x .27 (90% of a chibi body), with the outfit's torso canvas in a wardrobe atlas cell
   - sleeves hanging: cyl r .07, .26 long, 10 degrees out
   - skirt looks: a frustum
   - menswear: trousers folded over a hanger bar 0.5 below the jacket (box .30 x .36 x .04 with the pattern), which reads as "suit on a hanger"
   - garment centre at y 1.25, eye level for a 1.95 character
4. **Hats above:** brass wall pegs (cyl r .03, .12 long) at y 2.5 to 2.7, one hat per pair of stands (berets as in i1, plus a boater and a newsboy cap).
5. **Shoes below:** one pair in front of each base (z +.35), shells scaled 1.2, .14 apart, toes out.
6. **Bags:** on the floor between stands or hung on a stand's side hook (i1: satchel and frame purse). An open book lies on the floor as sparkle.
7. **Ends:** a slateTeal planter with a fig or schefflera at each end (the room's one cool note).
8. **Light:** one POOLS pool per stand (r .9, .35) plus the picture-light scallop; the rest of the room stays dimmer. From 17:00 to 19:00 (the shop closes at 19), the pools rise: "after hours".
9. **Interaction** (B25 and B18):
   - Each stand is a DISPLAY slot (surf 'rack'). Tapping it opens a look card with "Try the whole look", which opens Your Look (`CAM` 'look', prio 3) with that `fit` preloaded, and "Buy pieces" (wallet).
   - Wren's line: "that's Puget Grey with a little Oxblood Ink."
   - The user's taps steer only the user's walker; Mocha may wander in and browse the wall as his own localChoose candidate.
10. **Draws:** stands, garments, hats, shoes and bags merge into the shop display batch (B24: 3 or fewer) with the wardrobe atlas.

---

## 7. The 15 highest-impact interior traits, ranked

| Rank | Trait | Why it matters most | Cost | Owner |
|---|---|---|---|---|
| 1 | **Warm low-key grade with lamps on all day** (TOONI ramp, interior RIM, POOLS at .12 to .18 by day) | Shared by all 4 references; turns every room cosy at once | 0 draws, 0 programs (verify), about 2 KB | B27T |
| 2 | **Visible warm sources plus pools** (cone, frilly, globe trio, sconces), halos moved to GLOWPTS | The pendants and their pools define the mood; the move saves 2 to 4 draws per room | net negative draws | B27T |
| 3 | **Book walls with colour-blocked spines** (decal strips) | The most repeated texture in i2, i3 and i4; instantly reads "library and café" | 1 atlas cell set; 0 new draws | B27T |
| 4 | **Tall arched lattice windows, cool by day and indigo by night** | The only cool note; gives the warm/cool contrast and the silhouette | window atlas 1.3 MB; joins the LIT batch | B27T |
| 5 | **Layered walls:** wainscot, mid layer, picture rail and darker upper band | Kills bare walls; matches B12's picture rail standard | about 500 tris per wall, merged | B27T |
| 6 | **Herringbone and plank wood floors with tonal boards** | Big area, big payoff, adds a diagonal | 1 texture, about 1.3 MB | B27T |
| 7 | **Café vignettes:** round table, white cloth over tartan, Windsor chairs, seated characters with cups | The single most charming image in the set (i3) | about 400 tris per vignette | B27T, B22 seats |
| 8 | **One hero per room on the door axis, clear 1.8 path** | Readable on a 393 px phone | layout only | B27T with layoutLint |
| 9 | **Mezzanine rail and ladder stair** in Rainy Day Books and the library | Double height reads "grand library" in the dollhouse cam; the rail doubles as the cosy band | about 1.2k tris | B27T |
| 10 | **Vertex-colour AO and dim corners** (plus the CSS vignette) | Gives the refs' 0.6 to 0.75 corner falloff with no lights | build-time only | B27T (Batcher hook) |
| 11 | **One cream surface per room against dark wood** | Value contrast keeps a dark room legible | palette rule | B27T, B42 |
| 12 | **Small saturated accents in triangles** (oxblood, forest typewriter, ember, maple) | Where the colour lives; guards against mud | palette rule | B27T, B42 |
| 13 | **Curio silhouettes:** globe, gramophone, wall telephone, typewriter | Instantly antique and readable at 70 px; feeds the thrift shop, Mocha's parlour and his record-player want (B21) | about 150 tris each | B27T, B24 variants |
| 14 | **Plants and seasonal swap slots** (monstera, fig, schefflera, hanging maple, flower cart) | Softens the wood boxes; November maple now, December garland next | about 150 tris each | B27T, B40, B41 |
| 15 | **Rainy Term outfit wall feeding Your Look** (i1 display, i3 hats) | Gives the owner's guy a real wardrobe and the boutique a hero | 3 draws or fewer (shop display), wardrobe atlas | B27T, B18, B25 |

**Do first (cheapest wins):** 2, 1, 3, 6, 5. Together they change every interior for net-negative draws.

---

## Appendix A: room-by-room assignment

| Room (size) | Ref | Hero | Walls | Floor | Lights | Key props (item #) | Nov slot |
|---|---|---|---|---|---|---|---|
| Drizzle & Bean Café, Juniper (12x10, h7) | i3 | bakery case and counter under the frilly pendant | wainscot; lite mezzanine with a book wall above 3.5 on the back wall | wide chestnut plank, gingham corner rug | 3 cones, 1 frilly | 6, 10, 14, 18, 19, 20, 21, 36, 39, 40 | maple spill on the book wall, pumpkins on the counter |
| Rainy Day Books, Mabel (13x10, h8) | i3, i2 | mezzanine with the ladder stair | full book walls, deck at 3.5 | herringbone | 2 cones, globe trio over the nook | 1, 7, 13, 15, 20, 27, 31, 34, 37 | hanging maple |
| Emerald Public Library, Rosalind (20x14, h14) | i2, i3 | 3 tall lattice windows behind Rosalind's pedestal desk | wainscot, book walls, mezzanine at 5.0, cased openings | herringbone | banker's lamp, 2 globe trios, sconce pairs | 1, 7, 8, 12, 13, 15, 27, 30, 33, 34, 35 | maple planters, a flower cart by the doors |
| Drizzle Threads, Wren (10x9, h7.5) | i1 | Rainy Term outfit wall | walnut raised panels | dark plank | stand pools, picture light | 6g stands, 19, 36, 38 | plaid scarves on the hat rail |
| Second Story Thrift, Pearl (12x9, h9) | i4 | glass cabinet with the gramophone | cream plank walls, picture rail | dark plank, shag rug | globe trio, bare bulb, cabinet glow | 2, 3, 9, 11, 16, 17, 24, 28, 29, 32, 37, 40 | maple in a jug |
| Mocha's house (28x14, h6) | i4 (gothic) | tufted pair under the globe trio, ancestor portrait, gramophone | wainscot with plum-tinted plaster (Gothic family #3B3446 upper), picture rail | dark plank, round shag rug | globe trio, sconce pair | 2, 11, 16, 17, 24, 25, 28, 38 | pumpkins, maple spill |
| Wendell's cottage (13x10, h5.5) | i4 cream, i3 | rocking chair by the teaware shelf | narrow beadboard wainscot, cream plank | wide plank, gingham | frilly, sconces | 4, 5, 15, 18, 23, 29, 32, 33, 39 | knitting basket, mustard-free marigold mums |
| Owner's log cabin (14x10) | i2 | desk with typewriter under the window | log walls (keep) plus a bookcase wall | plank, rug | banker's lamp, bare bulb | 1, 8, 12, 15, 18, 27, 30, 31, 35 | maple branch on the desk |
| Town Hall upstairs (Odalie) | i4, i2 | pedestal desk under a portrait | raised panels | herringbone | globe trio, sconces | 2, 3, 8, 16, 27, 29, 32 | flags, maple |
| Evergreen showroom (Otis) | all | 3 weekly vignettes: "Reading Room", "Parlour", "Book Café" (B27 rotation) | per vignette | per vignette | 1 pendant each | from this kit | |
| Lantern & Wick (Luma) | i3, i4 | wall of fixtures | | | frilly, globe trios, sconces as stock (emissive) | 22 to 26 | |
| Puddle & Crumb Bakery, Pippin | i3 | bakery case | wainscot | plank | frilly | 6, 10, 14, 21, 39 | pies |

## Appendix B: draw and memory sketch for a fully dressed room (café)

| Batch | Material | Draws |
|---|---|---|
| floor (herringbone or plank texture) | ToonM + map, TOONI | 1 |
| static architecture plus furniture (walls, wainscot, posts, rail, furniture) | ToonM vertexColors, TOONI | 1 to 2 |
| decal batch (spines, tartan, gingham, chalkboard, art, register screen) | ToonM + B24 atlas, TOONI | 1 |
| LIT batch (bulbs, shades, window glass, door panes) | MeshBasic + window atlas, vertexColors | 1 |
| glass (bakery case, cabinet fronts) | existing `B12M.glass` | 1 |
| halos | GLOWPTS (shared) | 0 new |
| pools, patches, wall scallops | POOLS (shared) | 0 new |
| catalog items | B24 merged | 3 or fewer per display |

- **Total:** about 5 to 6 draws per dressed interior, against B12's cap of 12. Moving the current per-pendant glow sprites saves 2 to 4 draws per visible interior, so the kit is draw-neutral or better.
- **Programs:** plus 1 to 3 at most (LIT basic+map+vertexColors; wall map if new). Within B15's +8; report via `__mocha.programs()`.
- **Texture memory:** herringbone about 1.3 MB, plank and beadboard about 0.35 MB each, window atlas about 1.3 MB, wardrobe atlas (512x512) about 1.3 MB; patterns live in B24's 1024 atlas. Under 5 MB in all.
- **Triangles:** about 10 to 14k per dressed room. Interiors are culled by B12, so only one is drawn at a time.
- **LOW tier (`SET.saver`):** drop window shafts and patches, wall scallops and the CSS vignette. Keep pools at 60%.
