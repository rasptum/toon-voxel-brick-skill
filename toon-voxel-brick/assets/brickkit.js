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

  // 2x2 stud tile, row-major from the top. 1 = filled (raised), 0 = hollow (sunk).
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
    var HALF = 0.5, RAD = 0.09, BEV = 0.1;   // in half-cell units
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
      var up = cells[cy * 2 + cx] ? 1 : -1;
      var ramp = Math.min(1, Math.max(0, -sd / BEV));       // 0 outside, 1 on the plateau
      H[y * S + x] = up * ramp + (rnd() - 0.5) * 0.012;
      AO[y * S + x] = sd > 0 ? 1 - 0.11 * Math.exp(-sd * sd / 0.03)
                             : (up > 0 ? 0.89 + 0.11 * ramp : 0.89 - 0.06 * ramp);
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

  var outlineMat = new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.BackSide });

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
