---
name: toon-voxel-brick
description: Build any 3D object in the "Toon voxel brick" style, a blocky toy-plastic look with square studs on every face and a thick black cartoon outline, close to classic Roblox and toy-brick figures. Use this skill whenever the user asks for a 3D model, character, creature, prop, vehicle, building, food item, weapon, pet or scene in a blocky, voxel, brick, stud, toy-plastic, Roblox-like or "toon brick" look, or says "in my style", "same style as before" or "toon voxel brick", even if they only name the object ("make me a dragon"). Includes a tested three.js helper kit that handles studs, bevel slabs and outlines, so use it rather than writing those from scratch.
---

# Toon voxel brick

A style for 3D objects that look like chunky printed toys: everything is a box, every face of every piece carries square toy-brick studs, and every block has a black cartoon rim. It works for characters, but also for props, vehicles, buildings, food, plants and effects. This skill gives the style rules, the reasons behind them, and a small three.js kit that does the fiddly parts.

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
<script>/* the full contents of assets/brickkit.js, pasted inline, unmodified */</script>
<script>/* your scene */</script>
</body></html>
```

Paste `assets/brickkit.js` inline rather than linking it, because the page has to run on its own. Keep three.js at r128: the kit's light levels and colour handling were tuned and checked on it. Include a "Studs: Default / HD" toggle button wired to `BK.setHD`.

Read `assets/example-scene.js` before writing your first scene. It is a short, working object (a sleepy potted cactus) that shows every pattern below in about 70 lines. Use it for the patterns, then write a fresh scene for the object requested; don't reshape the cactus into the new object.

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
- **Seams, never gaps.** Background must never be visible between two parts that are attached to each other. Static neighbours may sit up to 0.2 units apart, because the two black outlines fill that seam and it reads as a drawn line. Anything wider is a hole, and anything that rotates is a hole waiting to open: a block swung on a bare pivot pulls away from its parent and leaves a floating arm. So every rotating connection uses `BK.limb` or `BK.joint`, with the child overlapping about 0.3 past the pivot:

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

- **Studs are square.** Each stud is a rounded square with a flat bevelled edge, about half a cell wide, either raised (filled) or sunk (hollow), with a soft shadow around it. Never circles, domes or toy-brick cylinders. The kit generates exactly this as a diffuse plus normal map; if you ever write studs yourself or describe them for another tool, keep them square.
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

Every block gets an inverted-hull outline: a slightly larger flat-black copy with flipped faces, so only a rim shows around the silhouette. The kit adds it automatically at 0.15 units on blocks and 0.1 on details. Don't switch it off to tidy up a busy area. The line around each step and joint is the cartoon-print look; if an area is too busy, use fewer, bigger pieces.

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
