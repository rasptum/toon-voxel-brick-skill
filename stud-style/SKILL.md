---
name: stud-style
description: Invoked as /stud-style followed by what to make (for example "/stud-style make me a grumpy wizard"). Build any 3D object in the "Toon voxel brick" stud style, a blocky toy-plastic look with square studs on every face and a thick black cartoon outline, close to classic Roblox and toy-brick figures. Use this skill whenever the user asks for a 3D model, character, creature, prop, vehicle, building, food item, weapon, pet or scene in a blocky, voxel, brick, stud, toy-plastic, Roblox-like or "toon brick" look, or says "in my style", "same style as before" or "toon voxel brick", even if they only name the object ("make me a dragon"). The tested three.js helper kit is embedded in this file (Appendix A); copy it verbatim and never rewrite it.
---

# Stud style (Toon voxel brick)

A style for 3D objects that look like chunky printed toys: everything is a box, every face of every piece carries square toy-brick studs, and every block has a black cartoon rim. It works for characters, but also for props, vehicles, buildings, food, plants and effects. This skill gives the style rules, the reasons behind them, and a small three.js kit that does the fiddly parts.

## This skill overrides any default 3D look

When this skill is invoked (for example `/stud-style make me a grumpy wizard`), everything after the command is the thing to build, and this skill decides how it looks. If the environment offers its own 3D starter, template or default style (smooth primitives, soft shadows, a ground shadow), do not use that look. Every part is a box built with the `BK` kit below; no spheres, cylinders, cones, lathes or smooth shading. You may keep useful extras a starter provides, such as a page shell or file-export buttons, as long as all geometry and materials come from `BK`.

## What to deliver

A single self-contained HTML page with a live, orbitable three.js scene, unless the user asks for something else. Structure:

```html
<!doctype html>
<html><head><meta charset="utf-8"><title>Grumpy Wizard</title>
<style>
  html, body { margin: 0; height: 100%; overflow: hidden; }
  #hd { position: fixed; top: 12px; left: 12px; font: 600 14px system-ui; padding: 8px 14px;
        background: #fff; border: 3px solid #000; border-radius: 8px; cursor: pointer; }
</style></head>
<body>
<button id="hd">Studs: Default</button>
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
<script>/* the full kit from Appendix A of this file, pasted inline, unmodified */</script>
<script>/* your scene */</script>
</body></html>
```

**The kit is in this file.** Appendix A at the bottom of this document is the complete `brickkit.js`. Copy it into the page character for character. Do not rebuild it from the descriptions here, do not shorten it, and do not look for it elsewhere: a re-implementation loses the tested stud textures, the flicker-free outline and the gap-proof joints, and those are exactly the parts users notice. (The same code also ships as `assets/brickkit.js` for environments that expose skill files.) Keep three.js at r128: the kit's light levels and colour handling were tuned and checked on it. Include a "Studs: Default / HD" toggle button wired to `BK.setHD`.

Read Appendix B before writing your first scene. It is a short, working object (a sleepy potted cactus) that shows every pattern below in about 70 lines. Use it for the patterns, then write a fresh scene for the object requested; don't reshape the cactus into the new object.

If the user wants the style in another tool (Blender, Roblox Studio, a written spec), the rules below still apply; only the kit is three.js-specific.

## Vague prompts are the normal case

Expect requests like "a wizard" or "a dog" with nothing about style, colour or pose. The user wants a finished model in this style on the first try, so don't ask questions and don't play it safe. Invent what is missing: pick one emotion or story, a pose that shows it, a prop if it helps, and a palette that suits the subject. The user never has to mention studs, outlines or blocks; all of that is implied by this skill. A named character or real object ("a pirate ship", "my cat, orange and fat") is a reference to translate into the style, keeping its most recognisable two or three features and exaggerating them.

## The kit in one minute

All sizes are in grid units. One unit is one stud at Default density and stands for about 3 cm.

| Call | Use it for |
|---|---|
| `BK.stage({yaw, pitch})` | Renderer, camera, flat lights, drag-orbit, frame loop. Returns `{scene, renderer, onFrame}`. The background is white and the camera frames the whole model automatically; don't pass a target or distance, and pass `background` only when the user asks for a colour. |
| `BK.pivot(parent, [x,y,z])` | An empty group for holding static parts together. Not for anything that rotates. |
| `BK.joint(parent, [x,y,z], {color, size})` | The pivot for any part that rotates against its parent (neck, tail, lid, wheel arm). Adds a hidden filler block so tilting can't open a see-through gap. |
| `BK.limb({parent, at, segments})` | A jointed chain: arms, legs, tails, necks, booms. Segments overlap and every joint is filled, so no pose opens a gap. Returns `{joints, tip}`. |
| `BK.block({size, color, studs, anchor, at, rot, parent, bevel, outline})` | Every main mass. Adds studs on all faces, the light top slab, the dark bottom slab and the outline for you. |
| `BK.detail({size, color, studs, anchor, at, rot, parent})` | Small raised boxes: eyes, brows, buttons, trims, bolts. Studded too (studs shrink to fit), thinner outline. |
| `BK.zigzag({count, cube, color, pattern, at, rot, parent})` | A run of tiny cubes along +x with a height pattern, default 0-1-2-1. Use `rot` to run it along another side. |
| `BK.burst(parent, {at, colors, count})` | Tumbling-cube effect. `at` is in the parent's local space. |
| `BK.shade(color, ±amount)` | A lighter or darker step of a palette colour. |
| `BK.keepUpright(pivot)` | Call each frame on a held prop's pivot to keep it vertical while the arm moves. |
| `BK.strike(phase)` | Animation curve for phase 0 to 1: dips to about -0.35 (wind-up), snaps to 1 (strike), settles to 0. |

`anchor: 'bottom'` puts the block's origin on its underside (things that stand on something); `anchor: 'top'` puts it on the top face (limbs hanging from a joint). `studs` takes `'solid'`, `'checker'`, `'rows'`, `'columns'` or `'hollow'`. There is no smooth option. `bevel: false` drops the light and dark slabs (the kit also drops them by itself on anything under 1.5 units); use it for tiny or striped pieces. `outline` overrides the rim thickness and rarely needs touching.

**Directions.** +y is up and the model's front faces +z; the default camera looks at the front and one side. Rotations are in radians, right-handed: positive `rotation.x` tips the top forward (a nod toward the viewer), positive `rotation.z` leans the top toward -x, positive `rotation.y` turns the front toward +x. Long subjects (ships, cars, trains, four-legged animals) foreshorten badly head-on: lay their length along x with the nose toward +x, pass `yaw: 0.95`, and turn an animal's head toward the camera.

## How to build an object

Work in this order. Each step sets up the next, and skipping ahead to details before the big masses are right is the usual way these come out muddy.

### 1. Break the object into boxes on the grid

Sketch the object as 5 to 15 main boxes before writing code, and write the list as a comment at the top of the scene. Sizes are multiples or simple fractions (halves, quarters) of one unit, so studs land cleanly and parts line up.

- **Boxes only.** No spheres, cylinders, cones or bevel modifiers. A curve becomes a staircase: a wheel is a plus-shaped stack of three boxes, a dome is two or three shrinking slabs, a tail is segments stepping down in size.
- **Chunky toy proportions.** Exaggerate the feature that identifies the object and thicken everything thin. On a character the head is about a quarter of total height, the torso wide and flat-fronted, limbs thick and in two segments. On a car the wheels and cab are oversized; on a sword the blade is a fat slab. Thin parts vanish behind their own outline, so nothing main should be under about 1.5 units thick. Things that are flat by nature (sails, flags, capes, wings, blades) are the exception: make them slabs at least 0.5 thick.
- **Joints are steps.** Where two segments meet, make one slightly wider or narrower than the other (3 next to 2.5, say). That step is what tells the eye "elbow" or "hinge" without any rounding.
- **Seams, never gaps.** Background must never be visible between two parts that are attached to each other. Static parts that touch sit flush against each other or overlap slightly; the step in size between them is what draws the line, so no spacing is needed. Anything that rotates is a hole waiting to open: a block swung on a bare pivot pulls away from its parent and leaves a floating arm. So every rotating connection uses `BK.limb` or `BK.joint`, with the child overlapping about 0.3 past the pivot:

  ```js
  // at = a point ON the body's surface where the limb attaches
  var arm = BK.limb({ parent: body, at: [4.3, 6, 0], segments: [
    { size: [2.5, 3.5, 2.5], color: DARK, studs: 'rows' },      // upper arm
    { size: [2.2, 3.0, 2.2], color: DARK, studs: 'rows' } ] }); // forearm, narrower = elbow step
  arm.joints[0].rotation.z = 0.75;    // shoulder
  arm.joints[1].rotation.z = -0.35;   // elbow
  var hand = BK.pivot(arm.tip);       // attach mittens or a held prop here

  var neck = BK.joint(body, [0, 9, 0], { color: SKIN, size: 3 });   // head tilts on this
  BK.block({ parent: neck, size: [7, 6, 6], color: SKIN, anchor: 'bottom', at: [0, -0.3, 0] });
  ```

  Limbs hang down by default; rotate `joints[0]` to aim them. After posing, picture each joint from the default camera and from behind: if you could see sky through it, move the attachment point inward.

- **Common parts.** Legs are an upper block plus a foot. A robe or dress is one wide block in place of legs. Hair, beards and fur are their own stepped blocks stuck onto the head, not painted. A ground base (baseplate, patch of water or grass) is optional; keep it small so the model stays the subject.
- **Four-legged animals.** Body block along x, four legs at its corners, head overhanging the front on a neck `BK.joint`, legs and tail as `BK.limb` chains.
- **Bands.** Belts, hat bands, cuffs and collars are thin blocks about 0.3 units larger than the part they wrap, so they sit proud all round.
- **Held props.** Put a pivot on the limb's `tip` and build the prop as its child, so it follows the arm. For props that must stay vertical (staff, cane, lantern), call `BK.keepUpright(propPivot)` each frame instead of working out counter-rotations; a prop that rests on the ground can simply be a child of the root, with the arm posed to reach it. Hold props out to the side or low: nothing may cross in front of the face from the default camera, because the face carries the emotion. Small overlaps where a rotated limb meets the body are fine; large ones mean the pose needs a different angle.

Anything that will move gets a `BK.limb` or `BK.joint`. Decide this now; retrofitting joints means re-deriving every position.

### 2. Pick a small flat palette

Three to five base colours for the whole object, plus one or two pure accents (white, and saturated candy colours) reserved for details. Fewer colours is what keeps it looking like a moulded toy and not a texture-mapped model. Near-black "ink" for eyes, brows and noses is free and doesn't count. Neither does a ground base. A prop may use an accent as its main colour when it is the focal point (a crystal, a gem, a flag), and a striped prop's two colours count as one. Keep large masses lighter than about `#33333c`: on anything darker the black outline disappears, and the outline is the style.

Shading is baked into geometry, not left to the lights: `BK.block` already puts a lighter inset slab on top and a darker one underneath, which gives both the pixel-chamfer edge and the shading. For extra depth add your own darker slab (`BK.shade(color, -0.2)`) along lower edges. Materials stay matte plastic (the kit uses roughness 0.75, no metalness); don't add gloss, emissive glow or transparency. "Metal" and "glass" are just grey and pale blue plastic here.

### 3. Stud every face, with a pattern per area

Two rules define the stud look, and getting either wrong breaks the style:

- **Studs are square, in two variants.** Variant A, *filled*: a solid raised rounded square with a flat bevelled edge. Variant B, *hollow*: the same square as a raised rim with a sunk centre, like an open-topped stud. Both are about half a cell wide with a soft shadow around them. Never circles, domes or toy-brick cylinders. The kit generates both as a diffuse plus normal map; if you ever describe studs for another tool, keep them square.
- **Use both variants on every model.** The five patterns are just arrangements of the two: `solid` is all filled, `hollow` is all hollow, and `checker`, `rows` and `columns` alternate them. A model that uses one pattern everywhere looks flat and cheap; contrast between variants is what makes it look crafted. Aim for at least three different patterns per model, put `solid` on the focal part so it reads cleanest, and use `hollow` or a mixed pattern next to it so neighbouring parts separate even in the same colour.
- **Every face has studs.** Top, bottom, all four sides, of every piece: main blocks, bevel slabs, trims, face features, props and effect cubes. No face is left smooth. The kit does this automatically, so there is nothing to switch on, and nothing should be switched off.

Studs tile at world scale, one per unit (two per unit in HD), so they are the same size on every block and a whole number fits each face. A face thinner than one stud gets half-size or quarter-size studs instead of none, which is how slabs and tiny details stay studded. Sizing parts in multiples of 0.5 units keeps studs perfectly square; odd sizes get stretched slightly to avoid half studs.

Give each kind of part its own pattern so areas read apart even when they share a colour:

| Pattern | Characters | Other objects |
|---|---|---|
| `solid` | head, hat, snout | the focal mass: cab, blade, roof, treasure lid |
| `checker` | torso | the main body or hull |
| `rows` | arms, hair, beards, tails, ears, belts, collars | horizontal parts: wings, planks, bumpers, branches |
| `columns` | legs, robes, skirts | vertical parts: posts, trunks, masts, staffs, handles |
| `hollow` | feet | whatever touches the ground: wheels, bases, pots, plinths, water |

Slabs inherit their block's pattern. Details default to `solid`. Where a face carries features, keep it studded and let the features win by contrast: make them at least 0.3 units proud, in a pure accent colour, and big enough to read over the stud grid.

### 4. Add surface detail as raised geometry

Nothing is painted on. Faces, trims, logos, windows, buttons and patterns are small `BK.detail` boxes sitting about 0.2 to 0.4 units proud of the surface. Zigzags and wavy lines are `BK.zigzag` runs. This matters because raised pieces catch the outline, and the outline is what makes it look printed.

Expressions use two or three bars per feature, and the brows do most of the acting: outer ends down reads tired or sad, inner ends down reads angry, both raised reads surprised. Objects that aren't characters can still carry a mood through the same trick (headlights as eyes, a grille as a mouth) when the user wants personality; otherwise let the trims do the work.

### 5. Outline everything

Every block gets an inverted-hull outline: a slightly larger flat-black copy with flipped faces, so only a rim shows around the silhouette. The kit adds it automatically at 0.15 units on blocks and 0.1 on details. Don't switch it off to tidy up a busy area, and don't re-create it with your own materials: the kit's outline is depth-biased so it cannot flicker against the surfaces it touches.

Flickering black patches (most often on wide flat parts such as a hat brim, a table top or a deck) come from geometry, so avoid the two causes. First, never tilt a wide part so its underside skims a flat surface below it; keep the piece that rests on a brim or deck level, and put the tilt in a narrower piece higher up, on a `BK.joint`. Second, never give two blocks the same face plane; if a band wraps a part, make it clearly larger (0.3 or more), not equal. The line around each step and joint is the cartoon-print look; if an area is too busy, use fewer, bigger pieces.

### 6. Give it one idea

A model in this style needs a single strong read. For a character that is one emotion with big features and a pose that tells a story: a slouch, a lean, a prop held a certain way. For an object it is one piece of story: the chest is slightly open with coins stepping out, the car leans back on its rear wheels, the tower has one crooked block. Props follow all the same rules (blocky, stepped, outlined).

### 7. Animate with rigid rotations

Parts are rigid blocks, so animate only by rotating joints (or moving whole groups). No scaling to fake squash, no bending.

- **Idle:** slow breathing (a small sway or bob, around 1 to 2 degrees) plus one personality beat on a longer loop, like a sleepy droop that snaps back, a lid that peeks open, or an antenna twitch.
- **Actions:** big and exaggerated, slow wind-up then fast strike. `BK.strike(phase)` gives that curve; multiply it by the joint's swing angle.
- **Effects:** `BK.burst` with the object's theme colours. Tiny tumbling cubes, never smooth particles, sprites or glows.

Register animation with `stage.onFrame(function (t, dt) { ... })`.

## Check before you hand it over

Look at the result (screenshot it if you can) and check, in this order:

1. **Silhouette:** is the object recognisable from the black outline shape alone? If not, the proportions need more exaggeration, not more detail.
2. **Boxes only:** no rounded or diagonal-cut geometry slipped in. Rotated boxes are fine for pose, not as a way to fake slopes.
3. **Every joint shows a step, and no joint shows a gap:** every rotating part is on a `BK.limb` or `BK.joint`, and no background shows between attached parts in any pose the animation reaches.
4. **Palette:** five base colours or fewer; accents only on details.
5. **Studs:** square, and present on every face of every piece (check slabs, trims, undersides and small details); different areas use different patterns; no half studs.
6. **Outline present on every piece**, including small details.
7. **White background** unless the user asked for a colour.
8. **One clear idea** in the pose or arrangement, and an idle animation that has a personality beat.
9. **Face and framing:** the front faces +z and no prop or limb crosses the face. The camera frames the model by itself; a large ground base makes the model small, so keep bases tight.

Tell the user what the object's palette, stud assignments and personality beat are in a line or two, so they can ask for changes in the style's own terms.

---

## Appendix A: brickkit.js

Copy this whole block into an inline `<script>` after three.js, unmodified.

```js
/* brickkit.js: Toon voxel brick helpers for three.js (global THREE, r128 or newer).
 * Every face of every piece is studded; studs are rounded squares, raised or sunk.
 * Paste this whole file into an inline <script> after three.js. Everything hangs off `BK`.
 * All sizes are in grid units (1 unit = one stud at Default density, nominally 3 cm).
 *
 *   BK.stage(opts)      renderer + auto-framing camera + flat lights + drag-orbit + frame loop
 *   BK.pivot(parent,at) empty Group for grouping static parts
 *   BK.joint(parent,at,o) pivot for a ROTATING part, with a gap-proof filler
 *   BK.limb(opts)       jointed chain (arm, leg, tail) that cannot open gaps
 *   BK.block(opts)      main building block: studs + bevel slabs + outline
 *   BK.detail(opts)     small raised box (faces, trims, buttons), studs shrink to fit
 *   BK.zigzag(opts)     run of tiny cubes following a height pattern
 *   BK.burst(parent,o)  tumbling-cube effect
 *   BK.setHD(bool)      switch stud density (Default / HD = double)
 *   BK.keepUpright(p)   keeps a held prop's pivot vertical while the arm rotates
 *   BK.strike(p)        0..1 phase -> slow wind-up, fast strike, settle
 */
(function (global) {
  'use strict';
  var THREE = global.THREE;
  var BK = { hd: false };
  var studded = [];   // meshes whose UVs depend on stud density
  var bursts = [];
  var texCache = {};
  var matCache = {};

  // 2x2 stud tile, row-major from the top. Two stud variants: 1 = filled (solid raised
  // square), 0 = hollow (raised square rim with a sunk centre). Patterns mix the two.
  BK.PATTERNS = {
    solid:   [1, 1, 1, 1],
    checker: [1, 0, 0, 1],
    rows:    [1, 1, 0, 0],
    columns: [1, 0, 1, 0],
    hollow:  [0, 0, 0, 0]
  };

  function smooth(a, b, x) {
    var t = Math.min(1, Math.max(0, (x - a) / (b - a)));
    return t * t * (3 - 2 * t);
  }

  function makeCanvasTexture(canvas, srgb) {
    var tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.anisotropy = 8;
    if (srgb) {
      if ('colorSpace' in tex) tex.colorSpace = 'srgb';
      else tex.encoding = 3001; // sRGBEncoding on older three
    }
    return tex;
  }

  // Diffuse + normal map for one pattern, generated from a height field.
  // Studs are rounded SQUARES with a flat bevelled edge, half a cell wide, with a soft
  // ambient-occlusion halo and a fine plastic grain (matches classic HD stud textures).
  function studTextures(pattern) {
    if (texCache[pattern]) return texCache[pattern];
    var cells = BK.PATTERNS[pattern] || BK.PATTERNS.solid;
    var S = 512, C = S / 2;
    var HALF = 0.5, RAD = 0.09, BEV = 0.1, RIM = 0.17;   // in half-cell units
    var H = new Float32Array(S * S), AO = new Float32Array(S * S);
    var seed = 1337;
    function rnd() { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }
    var x, y;
    for (y = 0; y < S; y++) for (x = 0; x < S; x++) {
      var cx = Math.floor(x / C), cy = Math.floor(y / C);
      var px = Math.abs((x + 0.5 - (cx + 0.5) * C) / (C / 2)) - (HALF - RAD);
      var py = Math.abs((y + 0.5 - (cy + 0.5) * C) / (C / 2)) - (HALF - RAD);
      var qx = Math.max(px, 0), qy = Math.max(py, 0);
      var sd = Math.sqrt(qx * qx + qy * qy) + Math.min(Math.max(px, py), 0) - RAD; // <0 inside
      var filled = cells[cy * 2 + cx];
      var ramp = Math.min(1, Math.max(0, -sd / BEV));       // 0 outside, 1 on the plateau
      // Variant A (filled): a solid raised square. Variant B (hollow): the same square
      // outline as a raised rim with a sunk centre, like an open-topped stud.
      var pit = filled ? 0 : Math.min(1, Math.max(0, (-sd - RIM) / BEV));
      H[y * S + x] = ramp - 1.4 * pit + (rnd() - 0.5) * 0.012;
      AO[y * S + x] = sd > 0 ? 1 - 0.11 * Math.exp(-sd * sd / 0.03)
                             : 0.89 + 0.11 * ramp - 0.22 * pit;
    }
    var K = BEV * (C / 2) / 2;   // makes the bevel read as a 45-degree face
    var dc = document.createElement('canvas'), nc = document.createElement('canvas');
    dc.width = dc.height = nc.width = nc.height = S;
    var dctx = dc.getContext('2d'), nctx = nc.getContext('2d');
    var dimg = dctx.createImageData(S, S), nimg = nctx.createImageData(S, S);
    for (y = 0; y < S; y++) for (x = 0; x < S; x++) {
      var i = y * S + x, o = i * 4;
      var hx = H[y * S + (x + 1) % S] - H[y * S + (x + S - 1) % S];
      var hy = H[((y + 1) % S) * S + x] - H[((y + S - 1) % S) * S + x];
      var nx = -hx * K, ny = hy * K, nz = 1;
      var len = Math.sqrt(nx * nx + ny * ny + nz * nz);
      nx /= len; ny /= len; nz /= len;
      nimg.data[o] = (nx * 0.5 + 0.5) * 255;
      nimg.data[o + 1] = (ny * 0.5 + 0.5) * 255;
      nimg.data[o + 2] = (nz * 0.5 + 0.5) * 255;
      nimg.data[o + 3] = 255;
      // AO plus a little baked top-left light so studs read from any orbit angle
      var lum = AO[i] + 0.13 * (-nx * 0.7 + ny * 0.7);
      var v = Math.min(255, Math.max(140, lum * 255));
      dimg.data[o] = dimg.data[o + 1] = dimg.data[o + 2] = v;
      dimg.data[o + 3] = 255;
    }
    dctx.putImageData(dimg, 0, 0);
    nctx.putImageData(nimg, 0, 0);
    texCache[pattern] = { map: makeCanvasTexture(dc, true), normalMap: makeCanvasTexture(nc, false) };
    return texCache[pattern];
  }

  // Older three (before colour management) needs hex colours converted by hand,
  // otherwise the palette renders washed out.
  var managed = !!(THREE.ColorManagement && (THREE.ColorManagement.enabled || THREE.ColorManagement.legacyMode === false));
  function toLinear(c) { return managed ? c : c.convertSRGBToLinear(); }

  function material(color, pattern) {
    pattern = BK.PATTERNS[pattern] ? pattern : 'solid';
    var c = new THREE.Color(color);
    var key = c.getHexString() + '|' + pattern;
    if (matCache[key]) return matCache[key];
    var t = studTextures(pattern);
    matCache[key] = new THREE.MeshStandardMaterial({
      color: toLinear(c), roughness: 0.75, metalness: 0,
      map: t.map, normalMap: t.normalMap, normalScale: new THREE.Vector2(1, 1)
    });
    return matCache[key];
  }

  // polygonOffset pushes the black hull slightly back in depth, so wherever a hull lies on or
  // skims another block's surface the coloured face wins cleanly instead of flickering.
  var outlineMat = new THREE.MeshBasicMaterial({
    color: 0x000000, side: THREE.BackSide,
    polygonOffset: true, polygonOffsetFactor: 3, polygonOffsetUnits: 12
  });
  var pieceCount = 0;

  // Every face of every box carries a whole number of studs. Pitch is the world-scale
  // stud size (1 unit, or 0.5 in HD); faces too thin for that halve it until a stud fits,
  // so slabs and tiny details get smaller studs instead of none.
  function applyStudUVs(geo, w, h, d) {
    var dims = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];      // +x -x +y -y +z -z
    var base = new THREE.BoxGeometry(1, 1, 1).attributes.uv, uv = geo.attributes.uv;
    for (var f = 0; f < 6; f++) {
      var p = BK.hd ? 0.5 : 1, fu = dims[f][0], fv = dims[f][1];
      while (Math.min(fu, fv) < p * 0.75 && p > 0.07) p /= 2;
      var nu = Math.max(1, Math.round(fu / p)) / 2, nv = Math.max(1, Math.round(fv / p)) / 2; // tile = 2 studs
      for (var i = 0; i < 4; i++) {
        var k = f * 4 + i;
        uv.setXY(k, base.getX(k) * nu, base.getY(k) * nv);
      }
    }
    uv.needsUpdate = true;
  }

  // One studded box plus its inverted-hull outline.
  function piece(group, w, h, d, y, color, pattern, outline) {
    var geo = new THREE.BoxGeometry(w, h, d);
    applyStudUVs(geo, w, h, d);
    var mesh = new THREE.Mesh(geo, material(color, pattern));
    mesh.position.y = y;
    // A hair of per-piece size variation, far too small to see, stops two blocks that
    // share a face plane from flickering against each other.
    mesh.scale.setScalar(1 + (pieceCount++ % 7) * 0.0005);
    mesh.userData.bkDims = [w, h, d];
    group.add(mesh);
    studded.push(mesh);
    if (outline > 0) {
      var hull = new THREE.Mesh(
        new THREE.BoxGeometry(w + 2 * outline, h + 2 * outline, d + 2 * outline), outlineMat);
      hull.position.y = y;
      hull.userData.bkOutline = true;
      group.add(hull);
    }
    return mesh;
  }

  BK.shade = function (color, amount) { // amount > 0 lightens, < 0 darkens
    var c = new THREE.Color(color);
    return amount >= 0 ? c.lerp(new THREE.Color(0xffffff), amount)
                       : c.lerp(new THREE.Color(0x000000), -amount);
  };

  BK.pivot = function (parent, at) {
    var g = new THREE.Group();
    if (at) g.position.set(at[0], at[1], at[2]);
    if (parent) parent.add(g);
    return g;
  };

  /* BK.block({
   *   size: [w, h, d], color,
   *   studs: 'solid' | 'checker' | 'rows' | 'columns' | 'hollow'   (default 'solid')
   *          every face is studded; there is no smooth option
   *   bevel: true      inset lighter slab on top, darker slab below (pixel chamfer + baked shading)
   *   outline: 0.15    hull thickness in units, 0 for none
   *   anchor: 'center' | 'top' | 'bottom'   where the group's origin sits on the block
   *   at: [x, y, z], rot: [rx, ry, rz], parent
   * }) -> THREE.Group */
  BK.block = function (o) {
    var w = o.size[0], h = o.size[1], d = o.size[2];
    var outline = o.outline === undefined ? 0.15 : o.outline;
    var studs = o.studs || 'solid';
    var bevel = o.bevel !== false && h >= 1.5 && Math.min(w, d) >= 1.5;
    var slab = bevel ? Math.min(0.5, h * 0.2) : 0;
    var inset = bevel ? Math.min(0.25, w * 0.1, d * 0.1) : 0;
    var off = o.anchor === 'top' ? -h / 2 : o.anchor === 'bottom' ? h / 2 : 0;
    var g = new THREE.Group();
    piece(g, w, h - 2 * slab, d, off, o.color, studs, outline);
    if (bevel) {
      piece(g, w - 2 * inset, slab, d - 2 * inset, off + (h - slab) / 2, BK.shade(o.color, 0.22), studs, outline);
      piece(g, w - 2 * inset, slab, d - 2 * inset, off - (h - slab) / 2, BK.shade(o.color, -0.25), studs, outline);
    }
    if (o.at) g.position.set(o.at[0], o.at[1], o.at[2]);
    if (o.rot) g.rotation.set(o.rot[0], o.rot[1], o.rot[2]);
    if (o.parent) o.parent.add(g);
    return g;
  };

  /* BK.joint(parent, at, { color, size, studs }) -> pivot Group
   * A pivot for anything that ROTATES against its parent (neck, shoulder, tail, lid hinge).
   * It also plants a small darker filler block at the pivot, fixed to the parent, so when the
   * child tilts the wedge that opens shows solid plastic and never see-through background.
   * Make `size` (number or [w,h,d]) a bit narrower than both parts so it hides inside them
   * at rest. Overlap the child about 0.3 past the pivot as well. */
  BK.joint = function (parent, at, o) {
    o = o || {};
    var g = BK.pivot(parent, at);
    if (o.color) {
      var z = o.size || 1.5;
      BK.block({
        parent: parent, at: at, size: typeof z === 'number' ? [z, z, z] : z,
        color: BK.shade(o.color, -0.15), studs: o.studs, bevel: false, outline: 0.1
      });
    }
    return g;
  };

  /* BK.limb({ parent, at, overlap: 0.3, segments: [{ size: [w, length, d], color, studs }, ...] })
   * -> { joints: [pivot0, pivot1, ...], tip: pivot }
   * A jointed chain (arm, leg, tail, neck, crane boom) hanging down -y from `at`. Each segment
   * overlaps its neighbour and every joint gets a filler, so no pose can open a gap. Put `at`
   * ON the surface of the body the limb attaches to. Rotate joints[i] to pose; attach hands
   * and held props to `tip` (the far end of the last segment). */
  BK.limb = function (o) {
    var ov = o.overlap === undefined ? 0.3 : o.overlap;
    var parent = o.parent, at = o.at || [0, 0, 0], joints = [], prev = null;
    o.segments.forEach(function (seg) {
      var w = seg.size[0], len = seg.size[1], d = seg.size[2];
      var n = Math.min(w, d, prev ? Math.min(prev.size[0], prev.size[2]) : Infinity) * 0.8;
      var j = BK.joint(parent, at, { color: seg.color, size: n, studs: seg.studs });
      BK.block({ parent: j, size: seg.size, color: seg.color, studs: seg.studs, anchor: 'top', at: [0, ov, 0] });
      joints.push(j);
      parent = j; at = [0, 2 * ov - len, 0]; prev = seg;
    });
    return { joints: joints, tip: BK.pivot(parent, [0, ov - prev.size[1], 0]) };
  };

  // Small raised box: face features, trims, buttons. Studded like everything else
  // (studs shrink to fit), no bevel slabs, thinner outline. Same options as block.
  BK.detail = function (o) {
    return BK.block({
      size: o.size, color: o.color, at: o.at, rot: o.rot, parent: o.parent, anchor: o.anchor,
      studs: o.studs || 'solid', bevel: false, outline: o.outline === undefined ? 0.1 : o.outline
    });
  };

  /* BK.zigzag({ count, cube: 0.5, color, pattern: [0,1,2,1], at, rot, parent })
   * A run of cubes along +x, centred, each lifted by pattern[i] * cube. */
  BK.zigzag = function (o) {
    var cube = o.cube || 0.5, pat = o.pattern || [0, 1, 2, 1];
    var g = BK.pivot(o.parent, o.at);
    if (o.rot) g.rotation.set(o.rot[0], o.rot[1], o.rot[2]);
    for (var i = 0; i < o.count; i++) {
      BK.detail({
        size: [cube, cube, cube], color: o.color, parent: g, outline: o.outline === undefined ? 0.08 : o.outline,
        at: [(i - (o.count - 1) / 2) * cube, pat[i % pat.length] * cube, 0]
      });
    }
    return g;
  };

  /* BK.burst(parent, { at, colors: [...], count: 14, size: 0.45, speed: 9, life: 1.1 })
   * Tiny tumbling cubes. Advanced automatically by the stage loop (or call BK.update(dt)). */
  BK.burst = function (parent, o) {
    o = o || {};
    var colors = o.colors || ['#ffffff'], count = o.count || 14, size = o.size || 0.45;
    var speed = o.speed || 9, at = o.at || [0, 0, 0];
    for (var i = 0; i < count; i++) {
      var s = size * (0.6 + Math.random() * 0.8);
      var c = BK.detail({ size: [s, s, s], color: colors[i % colors.length], parent: parent, at: at, outline: 0.07 });
      var a = Math.random() * Math.PI * 2, up = 0.5 + Math.random() * 0.9;
      bursts.push({
        obj: c, life: o.life || 1.1, age: 0,
        vel: new THREE.Vector3(Math.cos(a) * speed * 0.5, up * speed, Math.sin(a) * speed * 0.5),
        spin: new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).multiplyScalar(14)
      });
    }
  };

  BK.update = function (dt) {
    for (var i = bursts.length - 1; i >= 0; i--) {
      var b = bursts[i];
      b.age += dt;
      b.vel.y -= 28 * dt;
      b.obj.position.addScaledVector(b.vel, dt);
      b.obj.rotation.x += b.spin.x * dt; b.obj.rotation.y += b.spin.y * dt; b.obj.rotation.z += b.spin.z * dt;
      var k = Math.max(0.001, 1 - Math.pow(b.age / b.life, 3));
      b.obj.scale.setScalar(k);
      if (b.age >= b.life) {
        if (b.obj.parent) b.obj.parent.remove(b.obj);
        b.obj.children.forEach(function (m) { var n = studded.indexOf(m); if (n >= 0) studded.splice(n, 1); });
        bursts.splice(i, 1);
      }
    }
  };

  // Default = 1 stud per unit, HD = 2 per unit. Re-fits whole studs to every face.
  BK.setHD = function (on) {
    BK.hd = !!on;
    studded.forEach(function (m) {
      var d = m.userData.bkDims;
      applyStudUVs(m.geometry, d[0], d[1], d[2]);
    });
  };

  // Keep a pivot world-upright whatever its parents are doing. Call it inside onFrame, after
  // posing the arm, on the pivot that holds a staff, cane, lantern or anything that should
  // hang or stand straight from a hand.
  BK.keepUpright = function (pivot) {
    if (!pivot.parent) return;
    var q = new THREE.Quaternion();
    pivot.parent.getWorldQuaternion(q);
    pivot.quaternion.copy(q.invert ? q.invert() : q.inverse());
  };

  // Phase 0..1 -> about -0.35 (slow wind-up), snaps to 1 (strike), eases back to 0.
  BK.strike = function (p) {
    p = ((p % 1) + 1) % 1;
    if (p < 0.6) return -0.35 * Math.sin((p / 0.6) * Math.PI / 2);
    if (p < 0.7) { var a = (p - 0.6) / 0.1; return -0.35 + 1.35 * (1 - Math.pow(1 - a, 3)); }
    return 1 - smooth(0, 1, (p - 0.7) / 0.3);
  };

  /* BK.stage({ container, background: '#ffffff', yaw: 0.6, pitch: 0.25, fov: 30 })
   * -> { scene, camera, renderer, onFrame(fn(time, dt)), frame(object) }
   * The camera frames the whole scene automatically so the model fills the view; do not
   * pass a target or distance. (autoFrame: false + target/distance turns that off.)
   * The model's FRONT is +z; the default yaw shows the front and its right-hand side. */
  BK.stage = function (o) {
    o = o || {};
    var el = o.container || document.body;
    var renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(2, global.devicePixelRatio || 1));
    if (!('outputColorSpace' in renderer)) renderer.outputEncoding = 3001;
    el.appendChild(renderer.domElement);
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.touchAction = 'none';

    var scene = new THREE.Scene();
    scene.background = toLinear(new THREE.Color(o.background || '#ffffff'));
    // Flat, even light: the shading lives in the slabs, light only reveals the studs.
    scene.add(new THREE.HemisphereLight(0xffffff, 0x9a9aaa, 1.0));
    var sun = new THREE.DirectionalLight(0xffffff, 0.5);
    sun.position.set(-6, 12, 9);
    scene.add(sun);

    var camera = new THREE.PerspectiveCamera(o.fov || 30, 1, 0.5, 2000);
    var target = new THREE.Vector3().fromArray(o.target || [0, 8, 0]);
    var yaw = o.yaw === undefined ? 0.6 : o.yaw, pitch = o.pitch === undefined ? 0.25 : o.pitch;
    var dist = o.distance || 60;
    function place() {
      camera.position.set(
        target.x + dist * Math.sin(yaw) * Math.cos(pitch),
        target.y + dist * Math.sin(pitch),
        target.z + dist * Math.cos(yaw) * Math.cos(pitch));
      camera.lookAt(target);
    }
    var auto = o.autoFrame !== false, framed = false, touched = false;
    function frame(obj) {
      var box = new THREE.Box3().setFromObject(obj || scene);
      if (box.isEmpty()) return;
      var sph = box.getBoundingSphere(new THREE.Sphere());
      var v = camera.fov * Math.PI / 360, h = Math.atan(Math.tan(v) * camera.aspect);
      target.copy(sph.center);
      dist = 1.12 * sph.radius / Math.sin(Math.min(v, h));
    }
    var drag = null, dom = renderer.domElement;
    dom.addEventListener('pointerdown', function (e) { drag = [e.clientX, e.clientY]; });
    global.addEventListener('pointerup', function () { drag = null; });
    global.addEventListener('pointermove', function (e) {
      if (!drag) return;
      yaw -= (e.clientX - drag[0]) * 0.008;
      pitch = Math.min(1.4, Math.max(-0.3, pitch + (e.clientY - drag[1]) * 0.006));
      drag = [e.clientX, e.clientY];
    });
    dom.addEventListener('wheel', function (e) {
      e.preventDefault();
      touched = true;
      dist = Math.min(400, Math.max(8, dist * (e.deltaY > 0 ? 1.08 : 0.92)));
    }, { passive: false });

    function resize() {
      var w = el.clientWidth || global.innerWidth, h = el.clientHeight || global.innerHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      if (auto && framed && !touched) frame();
    }
    global.addEventListener('resize', resize);
    resize();

    var fns = [], last = performance.now(), time = 0;
    (function loop(now) {
      requestAnimationFrame(loop);
      var dt = Math.min(0.05, ((now || last) - last) / 1000);
      last = now || last;
      time += dt;
      for (var i = 0; i < fns.length; i++) fns[i](time, dt);
      if (auto && !framed && now) { frame(); framed = true; }   // first real frame: scene is built
      BK.update(dt);
      place();
      renderer.render(scene, camera);
    })();

    return { scene: scene, camera: camera, renderer: renderer, frame: frame, onFrame: function (fn) { fns.push(fn); } };
  };

  global.BK = BK;
})(window);
```

## Appendix B: example-scene.js

A worked example scene. Learn the patterns from it; write a new scene for each request.

```js
/* example-scene.js: a sleepy potted cactus, built with brickkit.js.
 * A worked example of the style on a non-character object. Read it for the patterns
 * (gap-proof joints, stepped curves, studs on every face, raised trims, idle beat, burst),
 * then write a fresh scene for the object you were asked for. */
var stage = BK.stage();   // white background and auto-framing camera by default
var root = BK.pivot(stage.scene);

// Palette: 4 base colours + pure accents.
var POT = '#c8643c', GREEN = '#4caf50', DARKGREEN = '#2f8f46', SOIL = '#6b4226';
var WHITE = '#ffffff', PINK = '#ff5fa2', YELLOW = '#ffd23f';

// Pot: a narrower base and a wider rim, so the taper reads as steps. Static parts stack
// flush; the size step between them is what draws the outline.
BK.block({ parent: root, size: [7, 2, 7], color: POT, studs: 'hollow', anchor: 'bottom', at: [0, 0, 0] });
BK.block({ parent: root, size: [8, 3, 8], color: POT, studs: 'hollow', anchor: 'bottom', at: [0, 2, 0] });
BK.block({ parent: root, size: [9, 1.5, 9], color: BK.shade(POT, 0.1), studs: 'hollow', anchor: 'bottom', at: [0, 5, 0] });
BK.block({ parent: root, size: [7, 0.6, 7], color: SOIL, studs: 'checker', bevel: false, anchor: 'bottom', at: [0, 6.5, 0] });
// Icing-style zigzag trim: raised cubes, not paint.
BK.zigzag({ parent: root, count: 14, cube: 0.5, color: WHITE, at: [0, 3, 4.25] });

// Body rotates at the soil line, so it hangs off a BK.joint (pivot + filler block) and sinks
// 0.3 past the pivot: the droop can never open a see-through gap.
var body = BK.joint(root, [0, 7.1, 0], { color: GREEN, size: 4.5 });
BK.block({ parent: body, size: [6, 11.3, 6], color: GREEN, studs: 'columns', anchor: 'bottom', at: [0, -0.3, 0] });
// Rounded top becomes a two-step staircase.
BK.block({ parent: body, size: [5, 1.2, 5], color: GREEN, studs: 'solid', anchor: 'bottom', at: [0, 11.2, 0] });
BK.block({ parent: body, size: [3.5, 1, 3.5], color: GREEN, studs: 'solid', bevel: false, anchor: 'bottom', at: [0, 12.6, 0] });
// Flower: a few candy cubes.
BK.detail({ parent: body, size: [1.5, 1, 1.5], color: PINK, at: [0, 14.3, 0] });
BK.detail({ parent: body, size: [0.7, 0.5, 0.7], color: YELLOW, at: [0, 15.05, 0] });

// Arms: two segments each, the second narrower so the elbow shows as a step. The stub is
// static, so it sits flush against the body; the elbow rotates, so it is a BK.joint.
// For ordinary hanging arms, legs and tails use BK.limb, which does all of this for you.
function arm(side, y, upper) {
  var shoulder = BK.pivot(body, [side * 3, y, 0]);
  BK.block({ parent: shoulder, size: [3, 2.5, 3], color: DARKGREEN, studs: 'rows', at: [side * 1.5, 0, 0] });
  var elbow = BK.joint(shoulder, [side * 1.75, 1.25, 0], { color: DARKGREEN, size: 2 });
  BK.block({ parent: elbow, size: [2.5, upper, 2.5], color: DARKGREEN, studs: 'rows', anchor: 'bottom', at: [0, -0.3, 0] });
  return elbow;
}
var armL = arm(-1, 5, 4.5);
var armR = arm(1, 3.5, 3);

// Face: bars sitting proud of the studded front. Outer brow ends down = tired.
var face = BK.pivot(body, [0, 7, 3.2]);
[-1, 1].forEach(function (s) {
  BK.detail({ parent: face, size: [1.3, 0.45, 0.4], color: WHITE, at: [s * 1.4, 0, 0] });                      // half-shut eye
  BK.detail({ parent: face, size: [1.6, 0.4, 0.4], color: '#1b3d24', at: [s * 1.5, 1, 0], rot: [0, 0, -s * 0.35] }); // brow
});
BK.detail({ parent: face, size: [1.2, 0.4, 0.4], color: WHITE, at: [0, -1.6, 0] });

// Idle: slow breathing sway plus one personality beat, a nod-off droop that snaps back.
stage.onFrame(function (t) {
  body.rotation.z = Math.sin(t * 1.2) * 0.02;
  var p = (t % 6) / 6;
  var droop = p < 0.8 ? Math.pow(p / 0.8, 2) : 1 - Math.pow((p - 0.8) / 0.2, 0.4);
  body.rotation.x = droop * 0.22;
  armL.rotation.z = Math.sin(t * 1.2 + 1) * 0.05;
  armR.rotation.z = -Math.sin(t * 1.2) * 0.05;
});

// Effect: theme-coloured tumbling cubes, never smooth particles.
stage.renderer.domElement.addEventListener('dblclick', function () {
  BK.burst(root, { at: [0, 22, 0], colors: [PINK, YELLOW, WHITE, GREEN] });
});

// Stud density toggle (expects <button id="hd">).
var hdBtn = document.getElementById('hd');
if (hdBtn) hdBtn.onclick = function () {
  BK.setHD(!BK.hd);
  hdBtn.textContent = BK.hd ? 'Studs: HD' : 'Studs: Default';
};
```
