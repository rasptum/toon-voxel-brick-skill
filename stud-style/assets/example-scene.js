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
