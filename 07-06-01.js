// @ts-check

import * as T from "three";
import { GrWorld } from "CS559-Framework/GrWorld.js";
import { WorldUI } from "CS559-Framework/WorldUI.js";
import { GrObject } from "CS559-Framework/GrObject.js";
import {
  GrCarousel,
  GrFerrisWheel,
  GrFlyingChairs,
  GrRocketTower
} from "./05-02-01-parkobjects.js";
import {
  GrChurch,
  GrStripedStore,
  ProGableRoofHouse
} from "./05-27-01-buildings.js";

const div = document.getElementById("div1");
const uiColumn = document.getElementById("ui-column");

const COLORS = {
  snow: "#fffaf2",
  snowBlue: "#e6f4f4",
  iceSide: "#90dbda",
  iceDeep: "#62bfc6",
  deepNight: "#26214f",
  road: "#6b7197",
  roadEdge: "#d9e8ef",
  path: "#efdab6",
  warm: "#ffd88d",
  auroraGreen: "#74f1df",
  auroraBlue: "#8fc8ff",
  auroraPink: "#f4a3d2",
  pine: "#4b8c9a",
  trunk: "#7b6761",
  black: "#101219",
  red: "#d6202f",
  white: "#f7f8fb"
};

// Structured layout profile inspired by zone-based town planning.
const TOWN_LAYOUT = {
  center: { name: "Glowing Pokeball Landmark", x: 0, z: 0, scale: 1.5, rotation: -Math.PI / 10 },
  residential: [
    { name: "Village House Cluster", x: -12.2, z: 5.2, rotation: 0.34, scale: 1.06 },
    { name: "Blue Roof Festival Cottage", x: -15.0, z: 5.0, rotation: Math.PI / 2, scale: 0.6 },
    { name: "North Lantern House", x: -13.0, z: 2.0, rotation: Math.PI / 2, scale: 0.58 },
    { name: "Riverside Village House", x: -10.0, z: 4.0, rotation: Math.PI / 2, scale: 0.56 },
    { name: "Moonlit Clocktower Church", x: -16.0, z: 3.0, rotation: Math.PI / 2, scale: 0.63 },
    { name: "Striped Cocoa Market", x: -12.0, z: 7.0, rotation: Math.PI / 2, scale: 0.58 },
    { name: "Village Treat Market", x: -14.2, z: 1.2, rotation: Math.PI / 2, scale: 0.53 }
  ],
  entertainment: [
    { name: "Main Carousel", x: 10.0, z: -8.0, scale: 0.8 },
    { name: "Aurora Ferris Wheel", x: 14.0, z: -6.0, scale: 0.72, rotation: -Math.PI / 2 },
    { name: "Snowflake Flying Chairs", x: 12.0, z: -10.0, scale: 0.54 },
    { name: "North Star Drop Tower", x: 8.0, z: -9.0, scale: 0.5 },
    { name: "Festival Midway Plaza", x: 10.0, z: -9.5, rotation: -0.12 }
  ],
  infrastructure: [
    { name: "Aurora Winter Festival Entrance Sign", x: -15.4, z: 1.8, rotation: Math.PI / 3.9 },
    { name: "Ice Pond Area", x: 8.0, z: 4.0, rotation: 0.1 },
    { name: "Aurora Lookout Deck", x: 6.0, z: 10.0, rotation: -0.28 }
  ],
  nature: [
    { name: "Winter Festival Snowman", x: -9.4, z: 0.9, rotation: -Math.PI / 8, scale: 0.72 }
  ]
};

const roadPath = new T.CatmullRomCurve3(
  [
    new T.Vector3(-17.8, 0.2, -4.9),
    new T.Vector3(-15.9, 0.2, -10.8),
    new T.Vector3(-11.3, 0.2, -14.0),
    new T.Vector3(-3.8, 0.2, -15.4),
    new T.Vector3(5.7, 0.2, -14.6),
    new T.Vector3(13.2, 0.2, -11.3),
    new T.Vector3(17.4, 0.2, -5.2),
    new T.Vector3(18.3, 0.2, 2.6),
    new T.Vector3(15.8, 0.2, 9.2),
    new T.Vector3(10.0, 0.2, 13.0),
    new T.Vector3(1.8, 0.2, 14.7),
    new T.Vector3(-7.5, 0.2, 14.1),
    new T.Vector3(-14.7, 0.2, 10.2),
    new T.Vector3(-18.1, 0.2, 4.0),
    new T.Vector3(-17.8, 0.2, -4.9)
  ],
  true,
  "catmullrom",
  0.32
);

function mat(color, options = {}) {
  return new T.MeshStandardMaterial({
    color,
    roughness: 0.72,
    metalness: 0.05,
    ...options
  });
}

function glowMat(color, intensity = 0.8, options = {}) {
  return new T.MeshStandardMaterial({
    color,
    emissive: color,
    emissiveIntensity: intensity,
    roughness: 0.35,
    metalness: 0.02,
    ...options
  });
}

function markShadows(root, cast = true, receive = true) {
  root.traverse((obj) => {
    if ("isMesh" in obj && obj.isMesh) {
      obj.castShadow = cast;
      obj.receiveShadow = receive;
    }
  });
}

function placeGrObject(obj, x, z, rot = 0, scale = 1, roadClearance = 2.35, centerClearance = 0) {
  const root = obj.objects[0];
  let [safeX, safeZ] = nudgePointOffRoad(x, z, roadClearance);
  if (centerClearance > 0) {
    [safeX, safeZ] = nudgePointOffCenter(safeX, safeZ, centerClearance);
  }
  root.position.set(safeX, 0, safeZ);
  root.rotation.y = rot;
  root.scale.setScalar(scale);
  markShadows(root);
  return obj;
}

function addBox(group, size, position, material, rotationY = 0) {
  const mesh = new T.Mesh(new T.BoxGeometry(size[0], size[1], size[2]), material);
  mesh.position.set(position[0], position[1], position[2]);
  mesh.rotation.y = rotationY;
  group.add(mesh);
  return mesh;
}

function addCylinder(group, radiusTop, radiusBottom, height, position, material, segments = 16) {
  const mesh = new T.Mesh(
    new T.CylinderGeometry(radiusTop, radiusBottom, height, segments),
    material
  );
  mesh.position.set(position[0], position[1], position[2]);
  group.add(mesh);
  return mesh;
}

function makeTextTexture(lines, width = 1024, height = 256) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.fillStyle = "#102033";
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = "#7df7ff";
  ctx.lineWidth = 18;
  ctx.strokeRect(18, 18, width - 36, height - 36);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#fff4bd";
  ctx.font = "900 62px Arial";
  ctx.fillText(lines[0], width / 2, height * 0.42);
  if (lines[1]) {
    ctx.fillStyle = "#bffff2";
    ctx.font = "700 34px Arial";
    ctx.fillText(lines[1], width / 2, height * 0.68);
  }
  const texture = new T.CanvasTexture(canvas);
  texture.colorSpace = T.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

function setUniqueName(obj, name) {
  obj.name = name;
  return obj;
}

function createPathConnector(group, x1, z1, x2, z2, width = 0.82) {
  const cx = (x1 + x2) * 0.5;
  const cz = (z1 + z2) * 0.5;
  const curve = new T.CatmullRomCurve3([
    new T.Vector3(x1, 0.16, z1),
    new T.Vector3(cx, 0.16, cz + Math.sign(z2 - z1 || 1) * 0.4),
    new T.Vector3(x2, 0.16, z2)
  ]);
  group.add(makeRibbonMesh(curve, width + 0.26, mat(COLORS.snowBlue, { roughness: 0.93 }), 24, 0.14));
  group.add(makeRibbonMesh(curve, width, mat(COLORS.path, { roughness: 0.82 }), 24, 0.18));
}

function avoidOverlap(objA, objB, minDist = 2) {
  if (!objA || !objB) return;
  const a = objA.objects?.[0];
  const b = objB.objects?.[0];
  if (!a || !b) return;
  const dx = a.position.x - b.position.x;
  const dz = a.position.z - b.position.z;
  const dist = Math.hypot(dx, dz);
  if (dist < minDist) {
    b.position.x += (Math.random() - 0.5) * 2;
    b.position.z += (Math.random() - 0.5) * 2;
  }
}

function applyOptimizedLayout(sceneObjects, world) {
  const layoutEntries = [
    TOWN_LAYOUT.center,
    ...TOWN_LAYOUT.residential,
    ...TOWN_LAYOUT.entertainment,
    ...TOWN_LAYOUT.infrastructure,
    ...TOWN_LAYOUT.nature
  ];
  const byName = new Map(sceneObjects.map((obj) => [obj.name, obj]));
  layoutEntries.forEach((cfg) => {
    const obj = byName.get(cfg.name);
    if (!obj || !obj.objects || !obj.objects[0]) return;
    const root = obj.objects[0];
    const [safeX0, safeZ0] = nudgePointOffRoad(cfg.x, cfg.z, 3.1);
    const [safeX, safeZ] = nudgePointOffCenter(safeX0, safeZ0, cfg.name === "Glowing Pokeball Landmark" ? 0 : 6.6);
    root.position.set(safeX, root.position.y, safeZ);
    if (typeof cfg.rotation === "number") root.rotation.y = cfg.rotation;
    if (typeof cfg.scale === "number") root.scale.setScalar(cfg.scale);
  });

  avoidOverlap(byName.get("Blue Roof Festival Cottage"), byName.get("North Lantern House"), 2.1);
  avoidOverlap(byName.get("North Lantern House"), byName.get("Riverside Village House"), 2.1);
  avoidOverlap(byName.get("Riverside Village House"), byName.get("Moonlit Clocktower Church"), 2.4);

  const connectors = new T.Group();
  connectors.name = "Logical Path Connectors";
  const villageToCenter = new T.CatmullRomCurve3([
    new T.Vector3(-10, 0.16, 5),
    new T.Vector3(-3, 0.16, 2),
    new T.Vector3(0, 0.16, 0)
  ]);
  const centerToFestival = new T.CatmullRomCurve3([
    new T.Vector3(0, 0.16, 0),
    new T.Vector3(6, 0.16, -3),
    new T.Vector3(10, 0.16, -8)
  ]);
  connectors.add(makeRibbonMesh(villageToCenter, 1.0, mat(COLORS.snowBlue, { roughness: 0.93 }), 24, 0.14));
  connectors.add(makeRibbonMesh(villageToCenter, 0.74, mat(COLORS.path, { roughness: 0.82 }), 24, 0.18));
  connectors.add(makeRibbonMesh(centerToFestival, 0.98, mat(COLORS.snowBlue, { roughness: 0.93 }), 24, 0.14));
  connectors.add(makeRibbonMesh(centerToFestival, 0.72, mat(COLORS.path, { roughness: 0.82 }), 24, 0.18));
  markShadows(connectors, false, true);
  world.scene.add(connectors);
}

function nearestRoadPointXZ(x, z, samples = 240) {
  let bestDistSq = Infinity;
  let best = new T.Vector3();
  let bestU = 0;
  for (let i = 0; i <= samples; i++) {
    const u = i / samples;
    const p = roadPath.getPointAt(u);
    const dx = x - p.x;
    const dz = z - p.z;
    const d2 = dx * dx + dz * dz;
    if (d2 < bestDistSq) {
      bestDistSq = d2;
      best.copy(p);
      bestU = u;
    }
  }
  return { point: best, dist: Math.sqrt(bestDistSq), u: bestU };
}

function nudgePointOffRoad(x, z, clearance = 2.35) {
  let px = x;
  let pz = z;
  for (let iter = 0; iter < 4; iter++) {
    const nearest = nearestRoadPointXZ(px, pz);
    if (nearest.dist >= clearance) break;
    let vx = px - nearest.point.x;
    let vz = pz - nearest.point.z;
    let len = Math.hypot(vx, vz);
    if (len < 1e-4) {
      const tangent = roadPath.getTangentAt(nearest.u).normalize();
      vx = -tangent.z;
      vz = tangent.x;
      len = Math.hypot(vx, vz);
    }
    const push = clearance - nearest.dist + 0.2;
    px += (vx / len) * push;
    pz += (vz / len) * push;
  }
  return [px, pz];
}

function nudgePointOffCenter(x, z, radius = 6.0, cx = 0, cz = 0) {
  let px = x;
  let pz = z;
  const dx = px - cx;
  const dz = pz - cz;
  const d = Math.hypot(dx, dz);
  if (d >= radius) return [px, pz];
  const nx = d > 1e-4 ? dx / d : 1;
  const nz = d > 1e-4 ? dz / d : 0;
  px = cx + nx * (radius + 0.25);
  pz = cz + nz * (radius + 0.25);
  return [px, pz];
}

function organicRing(cx, cz, rx, rz, count = 32, phase = 0) {
  const points = [];
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2;
    const wobble =
      1 +
      0.08 * Math.sin(a * 3 + phase) +
      0.045 * Math.cos(a * 5 - phase * 0.6);
    points.push([cx + Math.cos(a) * rx * wobble, cz + Math.sin(a) * rz * wobble]);
  }
  return points;
}

function pointsToShape(points) {
  const shape = new T.Shape();
  shape.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) shape.lineTo(points[i][0], points[i][1]);
  shape.closePath();
  return shape;
}

function makeIslandTop(points, material, y = 0.04) {
  const mesh = new T.Mesh(new T.ShapeGeometry(pointsToShape(points)), material);
  mesh.rotation.x = Math.PI / 2;
  mesh.position.y = y;
  mesh.receiveShadow = true;
  return mesh;
}

function makeIslandSide(points, material, topY = 0.02, bottomY = -2.2, inset = 0.88) {
  const positions = [];
  const indices = [];
  const center = points.reduce(
    (acc, p) => [acc[0] + p[0] / points.length, acc[1] + p[1] / points.length],
    [0, 0]
  );
  for (let i = 0; i < points.length; i++) {
    const p1 = points[i];
    const p2 = points[(i + 1) % points.length];
    const b1 = [
      center[0] + (p1[0] - center[0]) * inset,
      center[1] + (p1[1] - center[1]) * inset
    ];
    const b2 = [
      center[0] + (p2[0] - center[0]) * inset,
      center[1] + (p2[1] - center[1]) * inset
    ];
    const base = positions.length / 3;
    positions.push(
      p1[0], topY, p1[1],
      p2[0], topY, p2[1],
      b2[0], bottomY, b2[1],
      b1[0], bottomY, b1[1]
    );
    indices.push(base, base + 1, base + 2, base, base + 2, base + 3);
  }
  const geom = new T.BufferGeometry();
  geom.setAttribute("position", new T.Float32BufferAttribute(positions, 3));
  geom.setIndex(indices);
  geom.computeVertexNormals();
  const mesh = new T.Mesh(geom, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function addIsland(group, points, topMat, sideMat, bottomY = -2.25, inset = 0.88) {
  group.add(makeIslandSide(points, sideMat, 0.01, bottomY, inset));
  group.add(makeIslandTop(points, topMat, 0.04));
  const linePoints = points.map((p) => new T.Vector3(p[0], 0.09, p[1]));
  const outline = new T.LineLoop(
    new T.BufferGeometry().setFromPoints(linePoints),
    new T.LineBasicMaterial({ color: COLORS.snowBlue, transparent: true, opacity: 0.8 })
  );
  group.add(outline);
}

function makeRibbonGeometry(curve, width, segments = 80, y = 0.12) {
  const positions = [];
  const uvs = [];
  const indices = [];
  for (let i = 0; i <= segments; i++) {
    const u = i / segments;
    const p = curve.getPointAt(u);
    const tangent = curve.getTangentAt(u).normalize();
    const normal = new T.Vector3(-tangent.z, 0, tangent.x).normalize();
    const left = p.clone().addScaledVector(normal, width / 2);
    const right = p.clone().addScaledVector(normal, -width / 2);
    positions.push(left.x, y, left.z, right.x, y, right.z);
    uvs.push(0, u, 1, u);
    if (i < segments) {
      const a = i * 2;
      const b = a + 1;
      const c = a + 2;
      const d = a + 3;
      indices.push(a, c, b, b, c, d);
    }
  }
  const geom = new T.BufferGeometry();
  geom.setAttribute("position", new T.Float32BufferAttribute(positions, 3));
  geom.setAttribute("uv", new T.Float32BufferAttribute(uvs, 2));
  geom.setIndex(indices);
  geom.computeVertexNormals();
  return geom;
}

function makeRibbonMesh(curve, width, material, segments = 80, y = 0.12) {
  const mesh = new T.Mesh(makeRibbonGeometry(curve, width, segments, y), material);
  mesh.receiveShadow = true;
  return mesh;
}

function addRoadDash(group, curve, u, material, length = 0.9, width = 0.12) {
  const p = curve.getPointAt(u);
  const t = curve.getTangentAt(u).normalize();
  const dash = addBox(group, [width, 0.035, length], [p.x, 0.19, p.z], material);
  dash.rotation.y = Math.atan2(t.x, t.z);
}

class StaticGroupObject extends GrObject {
  constructor(name, group, cast = true, receive = true) {
    super(name, group);
    markShadows(group, cast, receive);
  }
}

class FloatingIslandDiorama extends StaticGroupObject {
  constructor() {
    const group = new T.Group();
    const snowTop = mat(COLORS.snow, {
      roughness: 0.96,
      flatShading: true,
      side: T.DoubleSide
    });
    const sideMat = mat(COLORS.iceSide, {
      roughness: 0.84,
      metalness: 0.02,
      flatShading: true,
      emissive: "#174352",
      emissiveIntensity: 0.05
    });
    const sideDeep = mat(COLORS.iceDeep, {
      roughness: 0.9,
      flatShading: true,
      emissive: "#0d3443",
      emissiveIntensity: 0.08
    });

    addIsland(group, organicRing(0, -0.2, 23.4, 17.5, 46, 0.4), snowTop, sideMat, -3.2, 0.84);
    addIsland(group, organicRing(-11.8, 7.6, 10.0, 7.7, 30, 1.3), snowTop, sideMat, -2.25, 0.86);
    addIsland(group, organicRing(12.2, -4.4, 9.8, 8.8, 32, 2.1), snowTop, sideMat, -2.45, 0.86);
    addIsland(group, organicRing(-10.8, -8.4, 8.4, 6.0, 28, 2.7), snowTop, sideMat, -2.1, 0.88);
    addIsland(group, organicRing(3.0, 10.1, 7.2, 5.6, 26, 0.9), snowTop, sideMat, -1.85, 0.9);

    const underside = new T.Mesh(
      new T.ConeGeometry(16.8, 5.4, 9),
      mat("#5d97bd", {
        roughness: 0.88,
        flatShading: true,
        transparent: true,
        opacity: 0.74
      })
    );
    underside.position.set(0, -4.6, -0.3);
    underside.scale.set(1.12, 1, 0.84);
    underside.rotation.y = Math.PI / 9;
    group.add(underside);

    const shardMat = mat("#b6f5ff", {
      roughness: 0.42,
      flatShading: true,
      transparent: true,
      opacity: 0.72,
      emissive: "#3bd4ff",
      emissiveIntensity: 0.08
    });
    const shardData = [
      [-26.0, -10.5, 1.15], [-24.2, -13.2, 0.72], [-25.6, 10.8, 0.82],
      [24.8, 10.9, 0.96], [26.4, 8.0, 0.7], [22.6, -15.8, 0.88],
      [-18.2, 18.1, 0.74], [9.8, 20.0, 0.68]
    ];
    shardData.forEach((s, i) => {
      const shard = new T.Mesh(new T.ConeGeometry(0.5 * s[2], 1.6 * s[2], 5), shardMat);
      shard.position.set(s[0], -0.65 - (i % 3) * 0.22, s[1]);
      shard.rotation.set(0.35 + (i % 2) * 0.25, i * 0.57, -0.2);
      group.add(shard);
    });

    super("Floating Snow Island Diorama", group, true, true);
  }
}

class RoadLoopAndPlaza extends StaticGroupObject {
  constructor() {
    const group = new T.Group();
    const roadMat = mat(COLORS.road, { roughness: 0.95 });
    const shoulderMat = mat(COLORS.snowBlue, { roughness: 0.96, flatShading: true });
    const pathMat = mat(COLORS.path, { roughness: 0.82 });
    const dashMat = glowMat("#fff5d6", 0.2, { roughness: 0.55 });
    const crossMat = mat("#f4f6fb", { roughness: 0.75 });

    group.add(makeRibbonMesh(roadPath, 4.9, shoulderMat, 150, 0.11));
    group.add(makeRibbonMesh(roadPath, 2.9, roadMat, 150, 0.16));

    for (let i = 0; i < 34; i++) {
      addRoadDash(group, roadPath, (i + 0.32) / 34, dashMat, 0.84, 0.12);
    }

      const footpaths = [
        new T.CatmullRomCurve3([
          new T.Vector3(-1.3, 0.17, 3.1),
          new T.Vector3(-3.7, 0.17, 4.8),
          new T.Vector3(-5.9, 0.17, 6.2),
          new T.Vector3(-7.2, 0.17, 7.0)
        ]),
        new T.CatmullRomCurve3([
          new T.Vector3(3.1, 0.17, -1.2),
          new T.Vector3(5.2, 0.17, -3.3),
          new T.Vector3(6.8, 0.17, -5.3),
          new T.Vector3(7.7, 0.17, -6.8)
        ]),
        new T.CatmullRomCurve3([
          new T.Vector3(-2.8, 0.17, -1.3),
          new T.Vector3(-4.8, 0.17, -3.5),
          new T.Vector3(-6.2, 0.17, -5.4),
          new T.Vector3(-7.0, 0.17, -6.9)
        ]),
        new T.CatmullRomCurve3([
          new T.Vector3(2.2, 0.17, 2.4),
          new T.Vector3(4.5, 0.17, 4.1),
          new T.Vector3(6.4, 0.17, 5.8),
          new T.Vector3(7.4, 0.17, 7.0)
        ])
      ];
    footpaths.forEach((curve) => {
      group.add(makeRibbonMesh(curve, 1.02, pathMat, 36, 0.18));
      group.add(makeRibbonMesh(curve, 1.36, shoulderMat, 36, 0.14));
    });

    const plaza = new T.Mesh(
      new T.CylinderGeometry(5.8, 6.2, 0.1, 56),
      mat("#fff4e3", { roughness: 0.84, flatShading: true })
    );
    plaza.position.set(0, 0.17, 0);
    plaza.receiveShadow = true;
    group.add(plaza);

    const warmRing = new T.Mesh(
      new T.TorusGeometry(4.5, 0.065, 12, 84),
      glowMat("#ffcfa8", 0.62)
    );
    warmRing.position.set(0, 0.24, 0);
    warmRing.rotation.x = Math.PI / 2;
    group.add(warmRing);

    for (let i = -2; i <= 2; i++) {
      addBox(group, [0.24, 0.05, 1.8], [-8.9 + i * 0.56, 0.22, 3.0], crossMat, 0.48);
      addBox(group, [0.24, 0.05, 1.8], [8.3 + i * 0.56, 0.22, -4.8], crossMat, -0.44);
    }

    super("Curved Snow Road Loop and Central Plaza", group, false, true);
  }
}

class FestivalSign extends StaticGroupObject {
  constructor() {
    const group = new T.Group();
    const postMat = mat("#5b4639", { roughness: 0.65 });
    addCylinder(group, 0.09, 0.09, 2.2, [-1.25, 1.05, 0], postMat, 12);
    addCylinder(group, 0.09, 0.09, 2.2, [1.25, 1.05, 0], postMat, 12);
    const signMat = new T.MeshStandardMaterial({
      map: makeTextTexture(["AURORA WINTER", "FESTIVAL TOWN"]),
      emissive: "#1b5266",
      emissiveIntensity: 0.35,
      roughness: 0.45
    });
    const sign = new T.Mesh(new T.BoxGeometry(3.1, 1.05, 0.12), signMat);
    sign.position.y = 1.55;
    group.add(sign);
    const cap = new T.Mesh(new T.BoxGeometry(3.35, 0.16, 0.24), glowMat("#fff0a8", 0.45));
    cap.position.y = 2.17;
    group.add(cap);
    let [safeX, safeZ] = nudgePointOffRoad(1.2, 7.4, 2.8);
    [safeX, safeZ] = nudgePointOffCenter(safeX, safeZ, 6.9);
    group.position.set(safeX, 0.08, safeZ);
    group.rotation.y = -0.08;
    super("Aurora Winter Festival Entrance Sign", group);
  }
}

class StreetLamp extends StaticGroupObject {
  constructor(name, x, z, height = 2.8) {
    const group = new T.Group();
    const poleMat = mat("#33404f", { metalness: 0.35, roughness: 0.42 });
    addCylinder(group, 0.045, 0.065, height, [0, height / 2, 0], poleMat, 12);
    const arm = addBox(group, [0.85, 0.06, 0.06], [0.34, height - 0.22, 0], poleMat);
    arm.rotation.z = -0.08;
    const bulbMat = glowMat(COLORS.warm, 1.25);
    const bulb = new T.Mesh(new T.SphereGeometry(0.18, 16, 10), bulbMat);
    bulb.position.set(0.78, height - 0.31, 0);
    group.add(bulb);
    const lampLight = new T.PointLight(0xffb347, 1.0, 4.5, 2.2);
    lampLight.position.copy(bulb.position);
    lampLight.userData.timeRole = "lamp";
    lampLight.userData.baseIntensity = 1.0;
    group.add(lampLight);
    group.position.set(x, 0, z);
    super(name, group);
  }
}

class LightArch extends StaticGroupObject {
  constructor(name, x, z, rotation = 0) {
    const group = new T.Group();
    const postMat = mat("#52606d", { metalness: 0.25, roughness: 0.4 });
    const bulbColors = ["#fff0a8", "#9fffee", "#b9d7ff", "#ffc9f7"];

    addCylinder(group, 0.06, 0.08, 2.6, [-1.8, 1.3, 0], postMat, 12);
    addCylinder(group, 0.06, 0.08, 2.6, [1.8, 1.3, 0], postMat, 12);

    for (let i = 0; i <= 18; i++) {
      const t = i / 18;
      const xPos = -1.8 + 3.6 * t;
      const yPos = 2.45 + Math.sin(t * Math.PI) * 0.75;
      const bulb = new T.Mesh(
        new T.SphereGeometry(0.09, 10, 8),
        glowMat(bulbColors[i % bulbColors.length], 0.85)
      );
      bulb.position.set(xPos, yPos, 0);
      group.add(bulb);
    }

    const ribbon = new T.Mesh(
      new T.TorusGeometry(1.85, 0.025, 8, 48, Math.PI),
      mat("#d5f9ff", { metalness: 0.2, roughness: 0.35 })
    );
    ribbon.position.y = 2.45;
    ribbon.rotation.z = Math.PI;
    group.add(ribbon);

    group.position.set(x, 0, z);
    group.rotation.y = rotation;
    super(name, group);
  }
}

class SnowyPineCluster extends StaticGroupObject {
  constructor(name, x, z, count, spread) {
    const group = new T.Group();
    const trunkMat = mat(COLORS.trunk, { roughness: 0.8 });
    const pineMat = mat(COLORS.pine, { roughness: 0.9, flatShading: true });
    const snowMat = mat(COLORS.snow, { roughness: 0.95, flatShading: true });

    for (let i = 0; i < count; i++) {
      const tree = new T.Group();
      const tx = (Math.random() - 0.5) * spread;
      const tz = (Math.random() - 0.5) * spread;
      const [safeWX, safeWZ] = nudgePointOffRoad(x + tx, z + tz, 2.2);
      // Keep trees out of the lake area.
      const lakeCenterX = 2.8;
      const lakeCenterZ = -3.7;
      const lakeSafeRadius = 4.9;
      let finalWX = safeWX;
      let finalWZ = safeWZ;
      const lx = finalWX - lakeCenterX;
      const lz = finalWZ - lakeCenterZ;
      const ld = Math.hypot(lx, lz);
      if (ld < lakeSafeRadius) {
        const nx = ld > 1e-4 ? lx / ld : 1;
        const nz = ld > 1e-4 ? lz / ld : 0;
        finalWX = lakeCenterX + nx * (lakeSafeRadius + 0.35);
        finalWZ = lakeCenterZ + nz * (lakeSafeRadius + 0.35);
      }
      const s = 0.75 + Math.random() * 0.55;
      addCylinder(tree, 0.09, 0.14, 0.75, [0, 0.38, 0], trunkMat, 8);
      for (let j = 0; j < 3; j++) {
        const cone = new T.Mesh(
          new T.ConeGeometry(0.7 - j * 0.14, 0.9, 9),
          pineMat
        );
        cone.position.y = 0.95 + j * 0.48;
        cone.rotation.y = j * 0.7;
        tree.add(cone);
        const cap = new T.Mesh(
          new T.ConeGeometry(0.62 - j * 0.13, 0.34, 9),
          snowMat
        );
        cap.position.y = 1.12 + j * 0.48;
        cap.rotation.y = j * 0.7;
        tree.add(cap);
      }
      tree.position.set(finalWX - x, 0, finalWZ - z);
      tree.rotation.y = Math.random() * Math.PI * 2;
      tree.scale.setScalar(s);
      group.add(tree);
    }

    group.position.set(x, 0, z);
    super(name, group);
  }
}

class SnowPiles extends StaticGroupObject {
  constructor(name) {
    const group = new T.Group();
    const pileMat = mat(COLORS.snow, { roughness: 0.98 });
    const positions = [
      [-16.8, 0, 8.2], [-17.4, 0, 2.6], [-16.0, 0, -4.4], [-14.2, 0, -10.2],
      [-8.4, 0, -14.2], [-1.0, 0, -15.1], [8.1, 0, -14.3], [15.2, 0, -10.6],
      [18.2, 0, -3.1], [18.0, 0, 4.0], [14.1, 0, 10.6], [6.4, 0, 14.0],
      [-2.4, 0, 14.8], [-10.8, 0, 12.4], [-15.0, 0, -8.0], [10.5, 0, 7.2]
    ];
    for (let i = 0; i < positions.length; i++) {
      const radius = 0.6 + (i % 4) * 0.13;
      const [safeX, safeZ] = nudgePointOffRoad(positions[i][0], positions[i][2], 2.1);
      const pile = new T.Mesh(new T.SphereGeometry(radius, 18, 10), pileMat);
      pile.scale.set(1.4, 0.28, 0.85);
      pile.position.set(safeX, 0.12, safeZ);
      pile.rotation.y = i * 0.47;
      group.add(pile);
    }
    super(name, group);
  }
}

class FrozenPond extends GrObject {
  constructor(name = "Ice Pond Area", anchorX = 22.0, anchorZ = -10.5, roadClearance = 5.4) {
    const group = new T.Group();
    const ice = new T.Mesh(
      new T.CylinderGeometry(3.9, 4.45, 0.055, 56),
      new T.MeshStandardMaterial({
        color: "#a9eeef",
        emissive: "#5da4b1",
        emissiveIntensity: 0.25,
        transparent: true,
        opacity: 0.82,
        roughness: 0.24,
        metalness: 0.05
      })
    );
    ice.position.y = 0.08;
    ice.scale.z = 0.64;
    group.add(ice);
    const innerGlow = new T.Mesh(
      new T.CylinderGeometry(2.55, 2.95, 0.03, 48),
      new T.MeshStandardMaterial({
        color: "#c9f8f4",
        emissive: "#57c0bf",
        emissiveIntensity: 0.3,
        transparent: true,
        opacity: 0.55,
        roughness: 0.18,
        metalness: 0.04
      })
    );
    innerGlow.position.y = 0.1;
    innerGlow.scale.z = 0.52;
    group.add(innerGlow);

    const surfaceGeom = new T.PlaneGeometry(5.2, 5.2, 96, 96);
    surfaceGeom.rotateX(-Math.PI / 2);
    const surfaceMat = new T.MeshStandardMaterial({
      color: "#b8f0f5",
      emissive: "#72d2d9",
      emissiveIntensity: 0.12,
      transparent: true,
      opacity: 0.32,
      roughness: 0.15,
      metalness: 0.18,
      side: T.DoubleSide
    });
    const surface = new T.Mesh(surfaceGeom, surfaceMat);
    surface.position.y = 0.105;
    surface.receiveShadow = true;
    surface.castShadow = false;
    group.add(surface);

    const rim = new T.Mesh(
      new T.TorusGeometry(3.65, 0.09, 10, 80),
      mat(COLORS.snowBlue, { roughness: 0.9 })
    );
    rim.position.y = 0.12;
    rim.scale.z = 0.64;
    rim.rotation.x = Math.PI / 2;
    group.add(rim);
    for (let i = 0; i < 8; i++) {
      const crack = addBox(
        group,
        [0.04, 0.02, 1.1 + (i % 3) * 0.34],
        [(Math.random() - 0.5) * 4.4, 0.16, (Math.random() - 0.5) * 2.4],
        glowMat("#edf8ff", 0.1)
      );
      crack.rotation.y = Math.random() * Math.PI;
    }

    const fishMat = mat("#7d8db5", {
      roughness: 0.48,
      transparent: true,
      opacity: 0.7
    });
    const fishData = [
      [-1.9, -0.7, 0.24, 0.32],
      [0.3, 1.0, 0.2, -0.48],
      [1.7, -0.3, 0.26, 0.56],
      [-0.6, 0.25, 0.16, 0.12],
      [0.95, -0.95, 0.14, -0.25]
    ];
    fishData.forEach((fish) => {
      const fishGroup = new T.Group();
      const body = new T.Mesh(new T.SphereGeometry(fish[2], 10, 8), fishMat);
      body.scale.set(1.4, 0.32, 0.6);
      fishGroup.add(body);
      const tail = new T.Mesh(new T.ConeGeometry(fish[2] * 0.72, fish[2] * 1.05, 4), fishMat);
      tail.position.x = -fish[2] * 1.1;
      tail.rotation.z = Math.PI / 2;
      fishGroup.add(tail);
      fishGroup.position.set(fish[0], 0.12, fish[1]);
      fishGroup.rotation.y = fish[3];
      group.add(fishGroup);
    });

    // Lily pads with tiny blossoms.
    const lilyMat = mat("#8ecf8f", { roughness: 0.62, flatShading: true });
    const blossomMat = mat("#f7d7ef", { roughness: 0.48 });
    const lilyData = [
      [-1.25, 0.95, 0.24, 0.18],
      [0.95, 0.8, 0.2, -0.22],
      [1.45, -0.75, 0.17, 0.5],
      [-0.2, -1.1, 0.19, -0.4]
    ];
    lilyData.forEach((l) => {
      const pad = new T.Mesh(new T.CylinderGeometry(l[2], l[2], 0.03, 18), lilyMat);
      pad.position.set(l[0], 0.135, l[1]);
      pad.rotation.y = l[3];
      group.add(pad);
      const notch = addBox(group, [l[2] * 0.32, 0.04, l[2] * 0.18], [l[0] + l[2] * 0.63, 0.137, l[1]], mat("#a9eeef"));
      notch.rotation.y = l[3];
      const flower = new T.Mesh(new T.SphereGeometry(l[2] * 0.18, 8, 8), blossomMat);
      flower.position.set(l[0] - l[2] * 0.2, 0.17, l[1] + l[2] * 0.1);
      group.add(flower);
    });

    const bridge = new T.Group();
    const woodMat = mat("#8a6650", { roughness: 0.72 });
    const railMat = mat("#624950", { roughness: 0.7 });
    for (let i = -3; i <= 3; i++) {
      const plank = addBox(bridge, [0.38, 0.09, 1.95], [i * 0.37, 0.34, 0], woodMat);
      plank.rotation.z = Math.sin(i * 0.7) * 0.05;
    }
    addBox(bridge, [2.85, 0.11, 0.08], [0, 0.78, 0.98], railMat);
    addBox(bridge, [2.85, 0.11, 0.08], [0, 0.78, -0.98], railMat);
    for (let i = -3; i <= 3; i += 2) {
      addBox(bridge, [0.08, 0.72, 0.08], [i * 0.37, 0.62, 0.98], railMat);
      addBox(bridge, [0.08, 0.72, 0.08], [i * 0.37, 0.62, -0.98], railMat);
    }
    bridge.position.set(2.0, 0.02, 2.0);
    bridge.rotation.y = Math.PI / 3.5;
    group.add(bridge);

    const iceChunkMat = mat("#d7fbff", {
      roughness: 0.36,
      flatShading: true,
      transparent: true,
      opacity: 0.82
    });
    const chunks = [
      [-2.2, -1.1, 0.34], [-0.8, 1.1, 0.24], [1.8, -0.8, 0.3], [1.0, 0.5, 0.22]
    ];
    chunks.forEach((c, i) => {
      const chunk = new T.Mesh(new T.DodecahedronGeometry(c[2], 0), iceChunkMat);
      chunk.scale.y = 0.16;
      chunk.position.set(c[0], 0.2, c[1]);
      chunk.rotation.y = i * 0.68;
      group.add(chunk);
    });

    const bankMat = mat(COLORS.snow, { roughness: 0.94, flatShading: true });
    [
      [-4.1, -1.7, 1.0, 0.3],
      [3.8, -1.6, 1.15, -0.2],
      [-3.4, 1.4, 0.95, 0.4],
      [3.2, 1.5, 0.85, -0.3]
    ].forEach((bank) => {
      const mound = new T.Mesh(new T.SphereGeometry(bank[2], 14, 10), bankMat);
      mound.scale.set(1.45, 0.34, 0.82);
      mound.position.set(bank[0], 0.2, bank[1]);
      mound.rotation.y = bank[3];
      group.add(mound);
    });

    let [safeX, safeZ] = nudgePointOffRoad(anchorX, anchorZ, roadClearance);
    [safeX, safeZ] = nudgePointOffCenter(safeX, safeZ, 9.6);
    group.position.set(safeX, 0.08, safeZ);
    group.rotation.y = 0.12;
    group.scale.set(1.28, 1, 1.18);
    super(name, group);
    markShadows(group, true, true);
    this.surface = surface;
    this.surfaceGeom = surfaceGeom;
    this.rippleTime = 0;
  }

  stepWorld(delta) {
    this.rippleTime += delta / 1000;
    const pos = this.surfaceGeom.getAttribute("position");
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const ripple = Math.sin((x + this.rippleTime * 2.0) * 3.2) * 0.04;
      const ripple2 = Math.cos((z + this.rippleTime * 1.6) * 2.7) * 0.03;
      const ripple3 = Math.sin(Math.sqrt(x * x + z * z) * 3.4 - this.rippleTime * 1.5) * 0.01;
      pos.setY(i, ripple + ripple2 + ripple3);
    }
    pos.needsUpdate = true;
    this.surfaceGeom.computeVertexNormals();
  }
}

function addCartoonHouse(parent, x, z, rot, scale, wallColor, roofColor) {
  const house = new T.Group();
  const wallMat = mat(wallColor, { roughness: 0.78, flatShading: true });
  const roofMat = mat(roofColor, { roughness: 0.74, flatShading: true });
  const snowMat = mat(COLORS.snow, { roughness: 0.95, flatShading: true });
  const windowMat = glowMat("#ffe7a4", 1.5);
  const doorMat = mat("#4f2e32", { roughness: 0.72 });

  addBox(house, [1.75, 1.45, 1.55], [0, 0.75, 0], wallMat);
  const roof = new T.Mesh(new T.ConeGeometry(1.35, 0.95, 4), roofMat);
  roof.position.y = 1.9;
  roof.rotation.y = Math.PI / 4;
  house.add(roof);

addBox(house, [0.42, 0.78, 0.07], [-0.46, 0.43, 0.81], doorMat);
addBox(house, [0.36, 0.32, 0.08], [0.35, 0.96, 0.82], glowMat("#ffe7a4", 1.5));
addBox(house, [0.08, 0.32, 0.36], [0.91, 0.96, -0.22], glowMat("#ffe7a4", 1.5));
addBox(house, [0.42, 0.48, 0.38], [0.5, 2.42, -0.32], mat("#5f4039"));

const glow = new T.PointLight(0xffa500, 2.0, 7.0, 1.5);
glow.position.set(0.1, 1.2, 0.7);
glow.userData.timeRole = "window";
glow.userData.baseIntensity = 2.0;
house.add(glow);

  house.position.set(x, 0, z);
  house.rotation.y = rot;
  house.scale.setScalar(scale);
  parent.add(house);
  return house;
}

class VillageHouseCluster extends StaticGroupObject {
  constructor() {
    const group = new T.Group();
    const houses = [
      [-8.6, 1.3, 0.08, 1.02, "#f1e9ff", "#89a9ef"],
      [-4.6, -0.4, 0.18, 1.0, "#ffe7f3", "#94abf2"],
      [0.0, -2.1, 0.26, 1.05, "#e8f4ff", "#7fa0e8"],
      [4.5, -3.2, 0.34, 1.0, "#fff0dc", "#96b0f2"],
      [8.8, -2.0, 0.42, 0.98, "#eaf0ff", "#7a98de"]
    ];
    houses.forEach((h) => addCartoonHouse(group, h[0], h[1], h[2], h[3], h[4], h[5]));

    const pathMat = mat(COLORS.path, { roughness: 0.82 });
    const path = makeRibbonMesh(
      new T.CatmullRomCurve3([
        new T.Vector3(-9.4, 0.13, 0.6),
        new T.Vector3(-5.1, 0.13, -0.2),
        new T.Vector3(-0.2, 0.13, -1.8),
        new T.Vector3(4.4, 0.13, -2.9),
        new T.Vector3(9.5, 0.13, -2.2)
      ]),
      0.86,
      pathMat,
      30,
      0.13
    );
    group.add(path);

    const backdropTreeMat = mat("#3b6178", { roughness: 0.88, flatShading: true });
    const backdropSnowMat = mat(COLORS.snow, { roughness: 0.95, flatShading: true });
    const backdropTrunkMat = mat("#6a5247", { roughness: 0.82 });
    const addBackdropTree = (x, z, scale = 1) => {
      const tree = new T.Group();
      addCylinder(tree, 0.08, 0.1, 0.7, [0, 0.35, 0], backdropTrunkMat, 8);
      for (let j = 0; j < 3; j++) {
        const cone = new T.Mesh(new T.ConeGeometry(0.68 - j * 0.12, 0.82, 9), backdropTreeMat);
        cone.position.y = 0.82 + j * 0.42;
        tree.add(cone);
        const cap = new T.Mesh(new T.ConeGeometry(0.6 - j * 0.11, 0.26, 9), backdropSnowMat);
        cap.position.y = 0.99 + j * 0.42;
        tree.add(cap);
      }
      tree.position.set(x, 0, z);
      tree.scale.setScalar(scale);
      group.add(tree);
    };
    addBackdropTree(-10.2, 3.2, 0.92);
    addBackdropTree(-6.5, 4.2, 1.05);
    addBackdropTree(6.8, 1.7, 0.98);

    const sign = new T.Group();
    addCylinder(sign, 0.035, 0.05, 1.0, [0, 0.5, 0], mat("#5e4436"), 8);
    const signMat = new T.MeshStandardMaterial({
      map: makeTextTexture(["AURORA", "VILLAGE"], 512, 256),
      emissive: "#243b55",
      emissiveIntensity: 0.22,
      roughness: 0.5
    });
    const face = new T.Mesh(new T.BoxGeometry(1.25, 0.55, 0.08), signMat);
    face.position.y = 1.14;
    sign.add(face);
    sign.position.set(-8.8, 0, 1.6);
    sign.rotation.y = 0.12;
    group.add(sign);

    let [safeX, safeZ] = nudgePointOffRoad(-12.5, 8.2, 3.35);
    [safeX, safeZ] = nudgePointOffCenter(safeX, safeZ, 7.4);
    group.position.set(safeX, 0.08, safeZ);
    group.rotation.y = 0.42;
    group.scale.setScalar(1.04);
    super("Village House Cluster", group);
  }
}

class CocoaLodge extends StaticGroupObject {
  constructor() {
    const group = new T.Group();
    const wallMat = mat("#7b5346", { roughness: 0.78 });
    const roofMat = mat("#3f536d", { roughness: 0.8 });
    const trimMat = glowMat("#ffe0a3", 0.18);
    const base = addBox(group, [3.8, 2.1, 2.6], [0, 1.05, 0], wallMat);
    base.castShadow = true;
    const roof = new T.Mesh(new T.ConeGeometry(2.7, 1.45, 4), roofMat);
    roof.position.y = 2.8;
    roof.rotation.y = Math.PI / 4;
    group.add(roof);
    addBox(group, [0.72, 1.15, 0.09], [-1.0, 0.65, 1.34], mat("#4a2b25"));
    for (let x of [-0.15, 1.15]) {
      addBox(group, [0.55, 0.48, 0.08], [x, 1.25, 1.36], trimMat);
    }
    const chimney = addBox(group, [0.45, 1.1, 0.45], [1.05, 3.0, -0.35], mat("#5c4240"));
    chimney.rotation.y = 0.2;
    const steamMat = new T.MeshBasicMaterial({
      color: "#e9fbff",
      transparent: true,
      opacity: 0.36,
      depthWrite: false
    });
    for (let i = 0; i < 4; i++) {
      const puff = new T.Mesh(new T.SphereGeometry(0.18 + i * 0.05, 12, 8), steamMat);
      puff.position.set(1.05 + Math.sin(i) * 0.12, 3.65 + i * 0.22, -0.35);
      group.add(puff);
    }
    let [safeX, safeZ] = nudgePointOffRoad(-17.2, 6.6, 3.35);
    [safeX, safeZ] = nudgePointOffCenter(safeX, safeZ, 7.8);
    group.position.set(safeX, 0.08, safeZ);
    group.rotation.y = Math.PI / 3.8;
    group.scale.setScalar(0.82);
    super("Cozy Cocoa Lodge", group);
  }
}

class WinterSnowman extends GrObject {
  constructor(name, x, z, scale = 0.78) {
    const group = new T.Group();
    const snowMat = mat(COLORS.snow, { roughness: 0.85 });
    const redMat = mat("#c91f35", { roughness: 0.45, metalness: 0.12 });
    const blackMat = mat("#111111", { roughness: 0.5, metalness: 0.05 });
    const carrotMat = mat("#ff8a20", { roughness: 0.48 });
    const stickMat = mat("#6b4b34", { roughness: 0.72 });

    const lower = new T.Mesh(new T.SphereGeometry(1.0, 28, 18), snowMat);
    lower.position.y = 0.95;
    const middle = new T.Mesh(new T.SphereGeometry(0.72, 28, 18), snowMat);
    middle.position.y = 2.15;
    const head = new T.Mesh(new T.SphereGeometry(0.5, 24, 16), snowMat);
    head.position.y = 3.02;
    group.add(lower, middle, head);

    const brim = addCylinder(group, 0.58, 0.58, 0.08, [0, 3.48, 0], blackMat, 24);
    const top = addCylinder(group, 0.34, 0.34, 0.55, [0, 3.78, 0], blackMat, 24);
    brim.castShadow = true;
    top.castShadow = true;

    const scarf = new T.Mesh(new T.TorusGeometry(0.54, 0.08, 12, 48), redMat);
    scarf.position.y = 2.62;
    scarf.rotation.x = Math.PI / 2;
    group.add(scarf);
    addBox(group, [0.2, 0.78, 0.09], [0.36, 2.22, 0.56], redMat, 0.1);

    const leftArm = addCylinder(group, 0.035, 0.045, 1.35, [0.77, 2.33, 0], stickMat, 8);
    leftArm.rotation.z = -Math.PI / 3.4;
    const rightArm = addCylinder(group, 0.035, 0.045, 1.35, [-0.77, 2.33, 0], stickMat, 8);
    rightArm.rotation.z = Math.PI / 3.4;

    const nose = new T.Mesh(new T.ConeGeometry(0.09, 0.42, 14), carrotMat);
    nose.position.set(0, 3.03, 0.52);
    nose.rotation.x = Math.PI / 2;
    group.add(nose);
    for (let ex of [-0.16, 0.16]) {
      const eye = new T.Mesh(new T.SphereGeometry(0.055, 10, 8), blackMat);
      eye.position.set(ex, 3.17, 0.43);
      group.add(eye);
    }
    for (let i = -2; i <= 2; i++) {
      const coal = new T.Mesh(new T.SphereGeometry(0.04, 10, 8), blackMat);
      coal.position.set(i * 0.09, 2.88 - Math.abs(i) * 0.035, 0.47);
      group.add(coal);
    }
    for (let y of [2.25, 1.92, 1.58]) {
      const button = new T.Mesh(new T.SphereGeometry(0.07, 10, 8), blackMat);
      button.position.set(0, y, 0.7);
      group.add(button);
    }

    group.position.set(x, 0, z);
    group.rotation.y = -Math.PI / 8;
    group.scale.setScalar(scale);
    super(name, group);
    markShadows(group);
    this.group = group;
    this.leftArm = leftArm;
    this.rightArm = rightArm;
    this.time = 0;
  }

  stepWorld(delta) {
    this.time += delta / 1000;
    this.group.rotation.y = -Math.PI / 8 + 0.16 * Math.sin(this.time * 0.9);
    this.leftArm.rotation.z = -Math.PI / 3.4 + 0.36 * Math.sin(this.time * 3.0);
    this.rightArm.rotation.z = Math.PI / 3.4 - 0.18 * Math.sin(this.time * 2.2);
  }
}

function buildVehicleModel(variant, color) {
  const car = new T.Group();
  const bodyMat = mat(color, { roughness: 0.46, metalness: 0.18 });
  const roofMat = mat(color, { roughness: 0.38, metalness: 0.22 });
  const glassMat = new T.MeshStandardMaterial({
    color: "#96e8ff",
    emissive: "#194b65",
    emissiveIntensity: 0.08,
    roughness: 0.25,
    metalness: 0.02,
    transparent: true,
    opacity: 0.86
  });
  const tireMat = mat("#17191f", { roughness: 0.82 });
  const hubMat = mat("#b5bdc8", { roughness: 0.35, metalness: 0.5 });
  const lightMat = glowMat("#fff1ad", 1.9);
  const tailMat = glowMat("#ff4b5d", 0.95);

  let width = 1.08;
  let length = 2.45;
  let height = 0.45;

  if (variant === "bus") {
    width = 1.25;
    length = 3.35;
    height = 0.75;
  } else if (variant === "truck") {
    length = 3.1;
    height = 0.62;
  } else if (variant === "roadster") {
    length = 2.65;
    height = 0.32;
  }

  const body = addBox(car, [width, height, length], [0, 0.42, 0], bodyMat);
  body.castShadow = true;

  if (variant === "truck") {
    addBox(car, [width * 0.9, 0.8, length * 0.44], [0, 0.75, -0.52], mat("#e7f4f5"));
    addBox(car, [width * 0.88, 0.56, length * 0.28], [0, 0.66, 0.75], roofMat);
  } else if (variant === "bus") {
    addBox(car, [width * 0.96, 0.22, length * 0.94], [0, 0.92, -0.02], roofMat);
    for (let i = -3; i <= 3; i++) {
      addBox(car, [0.05, 0.26, 0.27], [width * 0.51, 0.8, i * 0.33], glassMat);
      addBox(car, [0.05, 0.26, 0.27], [-width * 0.51, 0.8, i * 0.33], glassMat);
    }
    addBox(car, [width * 1.03, 0.07, length * 0.84], [0, 0.58, 0], mat("#1e1e1e"));
  } else if (variant === "roadster") {
    addBox(car, [width * 0.62, 0.16, length * 0.36], [0, 0.64, -0.12], mat("#111822"));
    addBox(car, [0.14, 0.22, 0.72], [0, 0.72, 0.35], glassMat);
    addBox(car, [0.12, 0.04, length * 0.88], [0, 0.66, 0], mat("#f7f7f7"));
  } else {
    addBox(car, [width * 0.82, 0.38, length * 0.44], [0, 0.74, -0.1], roofMat);
    addBox(car, [width * 0.74, 0.25, 0.08], [0, 0.78, 0.54], glassMat);
    addBox(car, [width * 0.74, 0.24, 0.08], [0, 0.78, -0.74], glassMat);
  }

  const wheels = [];
  const wheelGeo = new T.CylinderGeometry(0.24, 0.24, 0.18, 18);
  const addWheel = (x, z) => {
    const wheelGroup = new T.Group();
    const tire = new T.Mesh(wheelGeo, tireMat);
    tire.rotation.z = Math.PI / 2;
    wheelGroup.add(tire);
    const hub = new T.Mesh(new T.CylinderGeometry(0.1, 0.1, 0.2, 14), hubMat);
    hub.rotation.z = Math.PI / 2;
    wheelGroup.add(hub);
    wheelGroup.position.set(x, 0.25, z);
    car.add(wheelGroup);
    wheels.push(wheelGroup);
  };
  const wheelZ = length * 0.34;
  addWheel(width * 0.57, wheelZ);
  addWheel(-width * 0.57, wheelZ);
  addWheel(width * 0.57, -wheelZ);
  addWheel(-width * 0.57, -wheelZ);

  addBox(car, [0.28, 0.12, 0.045], [width * 0.28, 0.42, length / 2 + 0.035], lightMat);
  addBox(car, [0.28, 0.12, 0.045], [-width * 0.28, 0.42, length / 2 + 0.035], lightMat);
  addBox(car, [0.23, 0.1, 0.04], [width * 0.28, 0.42, -length / 2 - 0.035], tailMat);
  addBox(car, [0.23, 0.1, 0.04], [-width * 0.28, 0.42, -length / 2 - 0.035], tailMat);

  car.userData.wheels = wheels;
  return car;
}

class FestivalPathVehicle extends GrObject {
  constructor(name, variant, color, u, speed, scale = 1) {
    const car = buildVehicleModel(variant, color);
    car.scale.setScalar(scale);
    super(name, car);
    markShadows(car);
    this.car = car;
    this.wheels = car.userData.wheels || [];
    this.u = u;
    this.baseSpeed = speed;
    this.stopU = 0.49;
    this.state = "drive";
    this.wait = 0;
    this.cooldown = 0.3 + u;
    this.ridePoint = new T.Object3D();
    this.ridePoint.position.set(0, 1.28, -0.4);
    this.ridePoint.rotation.x = -0.24;
    car.add(this.ridePoint);
    this.rideable = this.ridePoint;
    this.updatePose();
  }

  distanceAhead(target) {
    return (target - this.u + 1) % 1;
  }

  updatePose() {
    const p = roadPath.getPointAt(this.u);
    const t = roadPath.getTangentAt(this.u).normalize();
    this.car.position.set(p.x, p.y, p.z);
    this.car.rotation.y = Math.atan2(t.x, t.z);
  }

  stepWorld(delta) {
    const dt = delta / 1000;
    this.cooldown = Math.max(0, this.cooldown - dt);

    if (this.state === "stop") {
      this.wait -= dt;
      if (this.wait <= 0) {
        this.state = "restart";
        this.cooldown = 2.4;
      }
      this.updatePose();
      return;
    }

    const stopDistance = this.distanceAhead(this.stopU);
    let speedFactor = 1;

    if (this.cooldown <= 0 && stopDistance < 0.075) {
      speedFactor = Math.max(0.1, stopDistance / 0.075);
      this.state = "slow";
    } else if (this.state === "restart") {
      speedFactor = 0.55;
      if (this.cooldown < 1.1) this.state = "drive";
    } else {
      this.state = "drive";
    }

    if (this.cooldown <= 0 && stopDistance < 0.007) {
      this.u = this.stopU;
      this.state = "stop";
      this.wait = 0.9 + Math.random() * 0.7;
      this.updatePose();
      return;
    }

    this.u = (this.u + this.baseSpeed * speedFactor * dt) % 1;
    for (const wheel of this.wheels) {
      wheel.rotation.x += delta * 0.008 * speedFactor;
    }
    this.updatePose();
  }
}

class AuroraPatrolDrone extends GrObject {
  constructor(name, phase = 0, radiusScale = 1, yOffset = 0, figureEight = false) {
    const drone = new T.Group();
    const mainMat = mat("#c7f6ff", { roughness: 0.28, metalness: 0.5 });
    const darkMat = mat("#111821", { roughness: 0.3, metalness: 0.45 });
    const cyanGlow = glowMat("#50fff1", 1.6);
    const pinkGlow = glowMat("#ff9cf6", 1.15);

    const body = new T.Mesh(new T.SphereGeometry(0.55, 28, 14), mainMat);
    body.scale.set(1.55, 0.34, 0.88);
    drone.add(body);
    addBox(drone, [0.9, 0.05, 0.1], [0, 0.04, 0.43], cyanGlow);
    addBox(drone, [0.9, 0.05, 0.1], [0, 0.04, -0.43], pinkGlow);

    const propellers = [];
    for (let i = 0; i < 4; i++) {
      const armGroup = new T.Group();
      armGroup.rotation.y = Math.PI / 4 + (i * Math.PI) / 2;
      addBox(armGroup, [1.25, 0.07, 0.1], [0.58, 0, 0], mainMat);
      const motor = addCylinder(armGroup, 0.14, 0.14, 0.18, [1.18, 0.05, 0], darkMat, 18);
      motor.rotation.x = Math.PI / 2;
      const prop = addBox(
        armGroup,
        [0.9, 0.018, 0.08],
        [1.18, 0.2, 0],
        new T.MeshStandardMaterial({
          color: "#ffffff",
          transparent: true,
          opacity: 0.56,
          roughness: 0.25
        })
      );
      propellers.push(prop);
      drone.add(armGroup);
    }

    super(name, drone);
    markShadows(drone);
    this.drone = drone;
    this.propellers = propellers;
    this.time = phase;
    this.phase = phase;
    this.radiusScale = radiusScale;
    this.yOffset = yOffset;
    this.figureEight = figureEight;
    this.ridePoint = new T.Object3D();
    this.ridePoint.position.set(0, 0.62, -1.02);
    this.ridePoint.rotation.x = -0.28;
    drone.add(this.ridePoint);
    this.rideable = this.ridePoint;
  }

  stepWorld(delta) {
    this.time += delta / 1000;
    const t = this.time * 0.56 + this.phase;
    let x;
    let z;
    if (this.figureEight) {
      x = Math.sin(t * 1.1) * 14.2 * this.radiusScale;
      z = Math.sin(t * 1.1) * Math.cos(t * 0.85) * 8.2 * this.radiusScale - 0.5;
    } else {
      x = Math.cos(t) * 16.2 * this.radiusScale + Math.sin(t * 0.38) * 2.2;
      z = Math.sin(t) * 12.2 * this.radiusScale - 0.5;
    }
    const y = 11.4 + this.yOffset + Math.sin(t * 1.85) * 0.95;
    const nextT = t + 0.05;
    let nx;
    let nz;
    if (this.figureEight) {
      nx = Math.sin(nextT * 1.1) * 14.2 * this.radiusScale;
      nz = Math.sin(nextT * 1.1) * Math.cos(nextT * 0.85) * 8.2 * this.radiusScale - 0.5;
    } else {
      nx = Math.cos(nextT) * 16.2 * this.radiusScale + Math.sin(nextT * 0.38) * 2.2;
      nz = Math.sin(nextT) * 12.2 * this.radiusScale - 0.5;
    }
    const ny = 11.4 + this.yOffset + Math.sin(nextT * 1.85) * 0.95;
    this.drone.position.set(x, y, z);
    this.drone.lookAt(nx, ny, nz);
    this.drone.rotation.z += 0.16 * Math.sin(this.time * 2.0);
    for (const p of this.propellers) {
      p.rotation.y += delta * 0.08;
    }
  }
}

class PokeballLandmark extends GrObject {
  constructor(name, x, z) {
    const group = new T.Group();
    const pedestalMat = mat("#263244", { roughness: 0.45, metalness: 0.35 });
    const blackMat = mat("#0b0c11", { roughness: 0.32, metalness: 0.15 });
    const redMat = glowMat(COLORS.red, 0.2, { roughness: 0.22, metalness: 0.1 });
    const whiteMat = mat(COLORS.white, { roughness: 0.3, metalness: 0.03 });
    const buttonMat = glowMat("#fff8d8", 0.65, { roughness: 0.18, metalness: 0.05 });

    const base = addCylinder(group, 2.1, 2.45, 0.45, [0, 0.23, 0], pedestalMat, 40);
    base.castShadow = true;
    const ring = new T.Mesh(new T.TorusGeometry(2.0, 0.06, 12, 72), glowMat("#7df7ff", 0.8));
    ring.position.y = 0.52;
    ring.rotation.x = Math.PI / 2;
    group.add(ring);

    const ballGroup = new T.Group();
    ballGroup.position.y = 2.15;
    const r = 1.38;
    const top = new T.Mesh(new T.SphereGeometry(r, 48, 18, 0, Math.PI * 2, 0, Math.PI / 2), redMat);
    const bottom = new T.Mesh(new T.SphereGeometry(r, 48, 18, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), whiteMat);
    const belt = new T.Mesh(new T.TorusGeometry(r * 1.01, 0.09, 14, 72), blackMat);
    belt.rotation.x = Math.PI / 2;
    const buttonOuter = new T.Mesh(new T.CylinderGeometry(0.45, 0.45, 0.11, 36), blackMat);
    buttonOuter.position.set(0, 0, r + 0.04);
    buttonOuter.rotation.x = Math.PI / 2;
    const buttonInner = new T.Mesh(new T.CylinderGeometry(0.29, 0.29, 0.13, 36), buttonMat);
    buttonInner.position.set(0, 0, r + 0.1);
    buttonInner.rotation.x = Math.PI / 2;
    ballGroup.add(top, bottom, belt, buttonOuter, buttonInner);
    group.add(ballGroup);

    const pulseLight = new T.PointLight(0xffd700, 3.0, 12, 1.6);
    pulseLight.position.set(0, 2.4, 1.1);
    pulseLight.userData.timeRole = "accent";
    pulseLight.userData.baseIntensity = 3.0;
    group.add(pulseLight);

    group.position.set(x, 0, z);
    group.rotation.y = -Math.PI / 10;
    super(name, group);
    markShadows(group);
    this.ballGroup = ballGroup;
    this.pulseLight = pulseLight;
    this.redMat = redMat;
    this.buttonMat = buttonMat;
    this.time = 0;
  }

  stepWorld(delta) {
    this.time += delta / 1000;
    const pulse = 0.5 + 0.5 * Math.sin(this.time * 2.25);
    this.ballGroup.rotation.y += delta * 0.00055;
    this.ballGroup.scale.setScalar(1 + pulse * 0.035);
    this.redMat.emissiveIntensity = 0.15 + pulse * 0.45;
    this.buttonMat.emissiveIntensity = 0.55 + pulse * 1.3;
    this.pulseLight.intensity = 1.6 + pulse * 2.4;
  }
}

class SnowfallSystem extends GrObject {
  constructor(name, count = 1100, size = 100) {
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    const phases = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * size;
      positions[i * 3 + 1] = 3 + Math.random() * 22;
      positions[i * 3 + 2] = (Math.random() - 0.5) * size;
      speeds[i] = 1.1 + Math.random() * 2.4;
      phases[i] = Math.random() * Math.PI * 2;
    }
    const geom = new T.BufferGeometry();
    geom.setAttribute("position", new T.BufferAttribute(positions, 3));
    const material = new T.PointsMaterial({
      color: "#f7fbff",
      size: 0.12,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.92,
      depthWrite: false
    });
    const points = new T.Points(geom, material);
    super(name, points);
    this.points = points;
    this.speeds = speeds;
    this.phases = phases;
    this.bounds = size / 2;
    this.time = 0;
  }

  stepWorld(delta) {
    this.time += delta / 1000;
    const attr = this.points.geometry.getAttribute("position");
    for (let i = 0; i < attr.count; i++) {
      let x = attr.getX(i);
      let y = attr.getY(i);
      let z = attr.getZ(i);
      y -= this.speeds[i] * delta / 1000;
      x += Math.sin(this.time * 0.8 + this.phases[i]) * 0.012;
      z += Math.cos(this.time * 0.55 + this.phases[i]) * 0.009;
      if (y < 0.25) {
        y = 18 + Math.random() * 4;
        x = (Math.random() - 0.5) * this.bounds * 2;
        z = (Math.random() - 0.5) * this.bounds * 2;
      }
      attr.setXYZ(i, x, y, z);
    }
    attr.needsUpdate = true;
  }
}

class AuroraCurtain extends GrObject {
  constructor(name) {
    const group = new T.Group();
    const configs = [
      { color: COLORS.auroraGreen, x: -5.5, y: 13.5, z: -28, w: 23, h: 8.5, phase: 0.0, opacity: 0.42 },
      { color: COLORS.auroraBlue, x: 4.5, y: 15.0, z: -29.5, w: 20, h: 7.0, phase: 1.7, opacity: 0.34 },
      { color: COLORS.auroraPink, x: 0.0, y: 12.5, z: -30.5, w: 17, h: 5.5, phase: 3.1, opacity: 0.28 }
    ];
    const ribbons = [];

    for (const cfg of configs) {
      const geom = new T.PlaneGeometry(cfg.w, cfg.h, 36, 5);
      const pos = geom.getAttribute("position");
      const baseY = [];
      for (let i = 0; i < pos.count; i++) baseY.push(pos.getY(i));
      const material = new T.MeshBasicMaterial({
        color: cfg.color,
        transparent: true,
        opacity: cfg.opacity,
        side: T.DoubleSide,
        blending: T.AdditiveBlending,
        depthWrite: false
      });
      const mesh = new T.Mesh(geom, material);
      mesh.position.set(cfg.x, cfg.y, cfg.z);
      mesh.rotation.z = 0.04 * Math.sin(cfg.phase);
      group.add(mesh);
      ribbons.push({ mesh, geom, baseY, phase: cfg.phase, opacity: cfg.opacity, material, baseColor: new T.Color(cfg.color) });
    }

    super(name, group);
    this.ribbons = ribbons;
    this.time = 0;
    this.opacityScale = 1;
  }

  stepWorld(delta) {
    this.time += delta / 1000;
    for (const ribbon of this.ribbons) {
      const pos = ribbon.geom.getAttribute("position");
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const y0 = ribbon.baseY[i];
        const wave =
          Math.sin(x * 0.52 + this.time * 1.1 + ribbon.phase) * 0.46 +
          Math.sin(x * 1.17 + this.time * 0.62 + ribbon.phase) * 0.18;
        pos.setY(i, y0 + wave);
      }
      pos.needsUpdate = true;
      ribbon.material.opacity =
        Math.max(0, ribbon.opacity + Math.sin(this.time * 1.3 + ribbon.phase) * 0.08) *
        this.opacityScale;
      const hsl = { h: 0, s: 0, l: 0 };
      ribbon.baseColor.getHSL(hsl);
      const hueShift = Math.sin(this.time * 0.23 + ribbon.phase) * 0.04;
      const satShift = 0.08 + 0.08 * Math.sin(this.time * 0.31 + ribbon.phase * 1.2);
      ribbon.material.color.setHSL((hsl.h + hueShift + 1) % 1, T.MathUtils.clamp(hsl.s + satShift, 0, 1), hsl.l);
      ribbon.mesh.position.x += Math.sin(this.time * 0.65 + ribbon.phase) * 0.0015 * delta;
      if (ribbon.mesh.position.x > 7) ribbon.mesh.position.x = -7;
      if (ribbon.mesh.position.x < -7) ribbon.mesh.position.x = 7;
    }
  }
}

function addStopSign(group, x, z, rotation = 0) {
  const poleMat = mat("#aeb8c4", { metalness: 0.35, roughness: 0.5 });
  const red = glowMat("#cf2237", 0.08);
  const sign = new T.Group();
  addCylinder(sign, 0.035, 0.04, 1.2, [0, 0.6, 0], poleMat, 8);
  const face = new T.Mesh(new T.CylinderGeometry(0.28, 0.28, 0.045, 8), red);
  face.position.y = 1.3;
  face.rotation.x = Math.PI / 2;
  sign.add(face);
  addBox(sign, [0.32, 0.05, 0.02], [0, 1.31, 0.04], mat("#ffffff"), 0);
  sign.position.set(x, 0, z);
  sign.rotation.y = rotation;
  group.add(sign);
}

class RoadsideDetails extends StaticGroupObject {
  constructor() {
    const group = new T.Group();
    const fenceMat = mat("#d7eef8", { roughness: 0.78 });

    const fenceRuns = [
      { x: -15.8, z: 10.8, len: 8, rot: 0.42 },
      { x: -15.4, z: 4.8, len: 7, rot: -0.18 },
      { x: -12.8, z: -8.4, len: 6, rot: 0.14 },
      { x: 12.9, z: -12.1, len: 8, rot: 0.2 },
      { x: 16.4, z: -6.1, len: 7, rot: 1.02 }
    ];
    for (const run of fenceRuns) {
      const fence = new T.Group();
      for (let i = 0; i < run.len; i++) {
        addBox(fence, [0.08, 0.75, 0.08], [(i - run.len / 2) * 0.75, 0.38, 0], fenceMat);
      }
      addBox(fence, [run.len * 0.75, 0.08, 0.07], [-0.36, 0.62, 0], fenceMat);
      addBox(fence, [run.len * 0.75, 0.08, 0.07], [-0.36, 0.34, 0], fenceMat);
      fence.position.set(run.x, 0, run.z);
      fence.rotation.y = run.rot;
      group.add(fence);
    }

    const signAnchors = [
      [-11.6, 7.5, 0.62],
      [-10.9, -7.0, 0.24],
      [9.2, -5.1, -0.56],
      [12.5, 8.6, Math.PI]
    ];
    signAnchors.forEach((s) => {
      const [sx, sz] = nudgePointOffRoad(s[0], s[1], 1.9);
      addStopSign(group, sx, sz, s[2]);
    });

    const benchMat = mat("#8b6547", { roughness: 0.74 });
    const legMat = mat("#4e3a2f", { roughness: 0.76 });
    const addBench = (x, z, rot = 0) => {
      const bench = new T.Group();
      addBox(bench, [1.35, 0.08, 0.35], [0, 0.48, 0], benchMat);
      addBox(bench, [1.35, 0.08, 0.25], [0, 0.72, -0.11], benchMat);
      addBox(bench, [0.08, 0.44, 0.08], [-0.55, 0.24, 0], legMat);
      addBox(bench, [0.08, 0.44, 0.08], [0.55, 0.24, 0], legMat);
      const [safeX, safeZ] = nudgePointOffRoad(x, z, 2.05);
      bench.position.set(safeX, 0, safeZ);
      bench.rotation.y = rot;
      group.add(bench);
    };
    addBench(8.6, -5.2, -0.95);
    addBench(11.5, -9.5, -0.72);
    addBench(12.8, 8.6, 2.45);
    super("Procedural Fences and Traffic Details", group);
  }
}

class FestivalMidway extends StaticGroupObject {
  constructor() {
    const group = new T.Group();
    const woodMat = mat("#71584d", { roughness: 0.72 });
    const trimMat = mat("#d8e6fb", { roughness: 0.82, flatShading: true });
    const fabricMat = mat("#8f77d2", { roughness: 0.68, flatShading: true });

    const fenceLoop = [
      { x: -2.6, z: -1.8, w: 4.2, rot: 0 },
      { x: 2.6, z: -1.2, w: 3.6, rot: Math.PI / 2 },
      { x: 1.5, z: 2.2, w: 3.8, rot: 0.12 }
    ];
    fenceLoop.forEach((run) => {
      const fence = new T.Group();
      for (let i = 0; i < 6; i++) {
        addBox(fence, [0.07, 0.62, 0.07], [(i - 2.5) * 0.62, 0.32, 0], trimMat);
      }
      addBox(fence, [run.w, 0.07, 0.06], [0, 0.52, 0], trimMat);
      addBox(fence, [run.w, 0.07, 0.06], [0, 0.28, 0], trimMat);
      fence.position.set(run.x, 0, run.z);
      fence.rotation.y = run.rot;
      group.add(fence);
    });

    const kiosk = new T.Group();
    addBox(kiosk, [1.8, 0.9, 1.2], [0, 0.5, 0], mat("#e7eef7", { flatShading: true }));
    addBox(kiosk, [2.0, 0.16, 1.45], [0, 1.08, 0], fabricMat);
    addBox(kiosk, [0.75, 0.38, 0.06], [0, 0.75, 0.64], glowMat("#ffe2a1", 0.45));
    kiosk.position.set(0.5, 0, -1.35);
    kiosk.rotation.y = -0.25;
    group.add(kiosk);

    const addLantern = (x, z) => {
      const lantern = new T.Group();
      addCylinder(lantern, 0.045, 0.06, 1.9, [0, 0.95, 0], mat("#405064"), 10);
      const glow = new T.Mesh(new T.SphereGeometry(0.13, 12, 8), glowMat("#ffe4a8", 0.95));
      glow.position.set(0, 1.8, 0);
      lantern.add(glow);
      const light = new T.PointLight(0xffb347, 0.42, 5.5, 1.8);
      light.position.copy(glow.position);
      light.userData.timeRole = "lamp";
      light.userData.baseIntensity = 0.42;
      lantern.add(light);
      lantern.position.set(x, 0, z);
      group.add(lantern);
    };
    // Park lights removed per layout request.

    const addBench = (x, z, rot = 0) => {
      const bench = new T.Group();
      addBox(bench, [1.2, 0.08, 0.35], [0, 0.45, 0], woodMat);
      addBox(bench, [1.2, 0.08, 0.22], [0, 0.67, -0.12], woodMat);
      addBox(bench, [0.07, 0.38, 0.07], [-0.48, 0.19, 0], woodMat);
      addBox(bench, [0.07, 0.38, 0.07], [0.48, 0.19, 0], woodMat);
      bench.position.set(x, 0, z);
      bench.rotation.y = rot;
      group.add(bench);
    };
    addBench(-1.7, -0.2, 0.55);
    addBench(1.8, 0.5, -0.7);

    // Add festival lights to illuminate the amusement area
    addLantern(-2.0, -1.5);
    addLantern(2.0, -1.0);
    addLantern(1.0, 2.0);
    addLantern(-1.0, 1.5);

    let [safeX, safeZ] = nudgePointOffRoad(7.4, 7.9, 4.6);
    [safeX, safeZ] = nudgePointOffCenter(safeX, safeZ, 8.9);
    group.position.set(safeX, 0.02, safeZ);
    group.rotation.y = -0.12;
    super("Festival Midway Plaza", group);
  }
}

function makePenguin(scale = 1) {
  const penguin = new T.Group();
  const bodyMat = mat("#253147", { roughness: 0.48 });
  const bellyMat = mat("#f1f4fb", { roughness: 0.68 });
  const beakMat = mat("#f3b85f", { roughness: 0.55 });
  const footMat = mat("#e8a95f", { roughness: 0.55 });

  const body = new T.Mesh(new T.SphereGeometry(0.42, 16, 12), bodyMat);
  body.scale.set(0.88, 1.15, 0.8);
  penguin.add(body);
  const belly = new T.Mesh(new T.SphereGeometry(0.28, 14, 10), bellyMat);
  belly.position.set(0, -0.02, 0.22);
  belly.scale.set(0.9, 1.1, 0.55);
  penguin.add(belly);
  const head = new T.Mesh(new T.SphereGeometry(0.28, 14, 10), bodyMat);
  head.position.y = 0.48;
  penguin.add(head);
  addBox(penguin, [0.12, 0.05, 0.12], [-0.12, -0.43, 0.1], footMat);
  addBox(penguin, [0.12, 0.05, 0.12], [0.12, -0.43, 0.1], footMat);
  const beak = new T.Mesh(new T.ConeGeometry(0.06, 0.18, 10), beakMat);
  beak.position.set(0, 0.43, 0.28);
  beak.rotation.x = Math.PI / 2;
  penguin.add(beak);
  penguin.scale.setScalar(scale);
  return penguin;
}

class AuroraLookout extends StaticGroupObject {
  constructor() {
    const group = new T.Group();
    const deckMat = mat("#866655", { roughness: 0.74 });
    const trimMat = mat("#dfeeff", { roughness: 0.82, flatShading: true });
    const metalMat = mat("#8ba0bc", { roughness: 0.42, metalness: 0.45 });

    const deck = new T.Group();
    for (let i = -3; i <= 3; i++) {
      addBox(deck, [0.42, 0.08, 2.8], [i * 0.44, 0.16, 0], deckMat);
    }
    addBox(deck, [3.2, 0.12, 0.12], [0, 0.36, 1.3], deckMat);
    addBox(deck, [3.2, 0.12, 0.12], [0, 0.36, -1.3], deckMat);
    group.add(deck);

    const frame = new T.Group();
    addCylinder(frame, 0.07, 0.07, 2.5, [-1.15, 1.25, 0], trimMat, 10);
    addCylinder(frame, 0.07, 0.07, 2.5, [1.15, 1.25, 0], trimMat, 10);
    addBox(frame, [2.45, 0.12, 0.12], [0, 2.42, 0], trimMat);
    for (let i = 0; i < 9; i++) {
      const bulb = new T.Mesh(
        new T.SphereGeometry(0.08, 10, 8),
        glowMat(i % 2 === 0 ? "#ffe4a6" : "#b9d2ff", 0.75)
      );
      bulb.position.set(-1.0 + i * 0.25, 2.25 + Math.sin((i / 8) * Math.PI) * 0.15, 0.03);
      frame.add(bulb);
    }
    frame.position.set(0.25, 0, -0.9);
    group.add(frame);

    const telescope = new T.Group();
    addCylinder(telescope, 0.05, 0.06, 1.1, [0, 0.8, 0], metalMat, 10);
    const scope = addCylinder(telescope, 0.11, 0.13, 0.8, [0, 1.38, 0], mat("#465773", { metalness: 0.45 }), 12);
    scope.rotation.z = Math.PI / 2;
    telescope.rotation.z = -0.18;
    telescope.position.set(-1.35, 0, 0.8);
    group.add(telescope);

    const bench = new T.Group();
    addBox(bench, [1.25, 0.08, 0.35], [0, 0.46, 0], deckMat);
    addBox(bench, [1.25, 0.08, 0.22], [0, 0.68, -0.12], deckMat);
    addBox(bench, [0.07, 0.4, 0.07], [-0.5, 0.2, 0], deckMat);
    addBox(bench, [0.07, 0.4, 0.07], [0.5, 0.2, 0], deckMat);
    bench.position.set(1.35, 0, 0.9);
    bench.rotation.y = -0.5;
    group.add(bench);

    const penguinA = makePenguin(0.88);
    penguinA.position.set(0.15, 0.45, 0.72);
    penguinA.rotation.y = -0.4;
    group.add(penguinA);
    const penguinB = makePenguin(0.68);
    penguinB.position.set(0.85, 0.35, 0.18);
    penguinB.rotation.y = 0.5;
    group.add(penguinB);

    const sign = new T.Group();
    addCylinder(sign, 0.035, 0.05, 0.9, [0, 0.45, 0], mat("#634d41"), 8);
    const signFace = new T.Mesh(
      new T.BoxGeometry(1.25, 0.5, 0.06),
      new T.MeshStandardMaterial({
        map: makeTextTexture(["AURORA", "LOOKOUT"], 512, 256),
        emissive: "#27415f",
        emissiveIntensity: 0.2,
        roughness: 0.48
      })
    );
    signFace.position.y = 1.0;
    sign.add(signFace);
    sign.position.set(1.7, 0, -1.05);
    sign.rotation.y = -0.4;
    group.add(sign);

    let [safeX, safeZ] = nudgePointOffRoad(11.8, 9.0, 3.15);
    [safeX, safeZ] = nudgePointOffCenter(safeX, safeZ, 8.8);
    group.position.set(safeX, 0.02, safeZ);
    group.rotation.y = -0.65;
    super("Aurora Lookout Point", group);
  }
}

class VillageLakeBridge extends StaticGroupObject {
  constructor(name = "Village Lake Link Bridge", x = -4.0, z = -3.0, rotation = 0.58) {
    const group = new T.Group();
    const woodMat = mat("#866655", { roughness: 0.72 });
    const railMat = mat("#dbe9ff", { roughness: 0.8, flatShading: true });
    for (let i = -4; i <= 4; i++) {
      addBox(group, [0.38, 0.08, 2.4], [i * 0.38, 0.2, 0], woodMat);
    }
    addBox(group, [3.5, 0.1, 0.08], [0, 0.55, 1.15], railMat);
    addBox(group, [3.5, 0.1, 0.08], [0, 0.55, -1.15], railMat);
    for (let i = -4; i <= 4; i += 2) {
      addBox(group, [0.08, 0.48, 0.08], [i * 0.38, 0.35, 1.15], railMat);
      addBox(group, [0.08, 0.48, 0.08], [i * 0.38, 0.35, -1.15], railMat);
    }
    group.position.set(x, 0.03, z);
    group.rotation.y = rotation;
    super(name, group);
  }
}

class WinterCritterZone extends StaticGroupObject {
  constructor(name = "Winter Critter Zone", x = 0.2, z = 7.2) {
    const group = new T.Group();
    const snowMat = mat(COLORS.snow, { roughness: 0.95, flatShading: true });

    const mound = new T.Mesh(new T.SphereGeometry(3.0, 22, 14), snowMat);
    mound.scale.set(1.45, 0.22, 0.75);
    mound.position.set(0, 0.12, 0);
    group.add(mound);

    const snowman = new WinterSnowman("Winter Festival Snowman", 0, 0, 0.42);
    const snowmanRoot = snowman.objects[0];
    snowmanRoot.position.set(-1.55, 0.46, -0.25);
    snowmanRoot.rotation.y = -0.18;
    group.add(snowmanRoot);

    const penguinSet = [
      { x: 0.15, z: -1.35, s: 0.9, r: 0.2, y: 1.125 },
      { x: -3.1, z: -1.25, s: 0.75, r: -0.32, y: 0.945 },
      { x: -3.15, z: 1.05, s: 0.66, r: 0.58, y: 0.855 },
      { x: -0.25, z: 1.28, s: 0.58, r: -0.55, y: 0.81 },
      { x: -3.65, z: -0.05, s: 0.5, r: 0.1, y: 0.72 },
      { x: -1.55, z: -1.85, s: 0.42, r: -0.12, y: 0.63 },
      { x: -2.35, z: 1.72, s: 0.38, r: 0.72, y: 0.585 }
    ];
    penguinSet.forEach((p) => {
      const penguin = makePenguin(p.s);
      penguin.position.set(p.x, p.y, p.z);
      penguin.rotation.y = p.r;
      group.add(penguin);
    });

    // Snow bunnies in the front open area, based on 04-18-01 createRabbit style.
    const makeSnowmanFileRabbit = (scale = 1) => {
      const rabbit = new T.Group();
      const rabbitMat = mat("#eef4ff", { roughness: 0.72 });
      const earMat = mat("#9ac8f2", { roughness: 0.64, flatShading: true });

      const body = new T.Mesh(new T.SphereGeometry(0.6, 20, 20), rabbitMat);
      body.scale.set(1.3, 1, 2.2);
      rabbit.add(body);
      const head = new T.Mesh(new T.SphereGeometry(0.35, 20, 20), rabbitMat);
      head.position.set(0, 0.5, 1.1);
      rabbit.add(head);

      const eyeMat = mat("#121212", { roughness: 0.5 });
      const eyeL = new T.Mesh(new T.SphereGeometry(0.05, 10, 10), eyeMat);
      eyeL.position.set(0.15, 0.6, 1.35);
      rabbit.add(eyeL);
      const eyeR = eyeL.clone();
      eyeR.position.x = -0.15;
      rabbit.add(eyeR);

      const earProfile = [
        new T.Vector2(0, 0),
        new T.Vector2(0.12, 0.25),
        new T.Vector2(0.14, 0.55),
        new T.Vector2(0.08, 0.85),
        new T.Vector2(0.02, 1)
      ];
      const earGeo = new T.LatheGeometry(earProfile, 12);
      const ear1 = new T.Mesh(earGeo, earMat);
      ear1.scale.set(0.9, 0.9, 0.9);
      ear1.position.set(0.12, 0.7, 1.05);
      ear1.rotation.set(0.25, 0, -0.4);
      rabbit.add(ear1);
      const ear2 = new T.Mesh(earGeo, earMat);
      ear2.scale.set(0.9, 0.9, 0.9);
      ear2.position.set(-0.12, 0.7, 1.05);
      ear2.rotation.set(0.25, 0, 0.4);
      rabbit.add(ear2);

      const tail = new T.Mesh(new T.SphereGeometry(0.15, 10, 10), rabbitMat);
      tail.position.set(0, 0.3, -1.1);
      rabbit.add(tail);

      rabbit.scale.setScalar(scale);
      return rabbit;
    };
    const bunnySet = [
      { x: 0.25, z: 2.1, s: 0.74, r: -0.18, y: 0.22 },
      { x: -1.2, z: 2.45, s: 0.62, r: 0.4, y: 0.2 },
      { x: -2.75, z: 2.0, s: 0.54, r: -0.48, y: 0.18 },
      { x: -0.7, z: 2.95, s: 0.48, r: 0.15, y: 0.16 },
      { x: -3.15, z: 2.65, s: 0.58, r: 0.66, y: 0.2 },
      { x: 0.75, z: 2.8, s: 0.46, r: -0.3, y: 0.15 },
      { x: -1.95, z: 3.2, s: 0.42, r: 0.1, y: 0.14 }
    ];
    bunnySet.forEach((b) => {
      const bunny = makeSnowmanFileRabbit(b.s);
      bunny.position.set(b.x, b.y, b.z);
      bunny.rotation.y = b.r;
      group.add(bunny);
    });

    group.position.set(x, 0, z);
    super(name, group);
  }
}

class RedFishSchool extends GrObject {
  constructor(name = "Red Fish School", x = 2.8, z = -3.7) {
    const group = new T.Group();
    super(name, group);
    this.group = group;
    this.time = 0;
    this.fish = [];
    const fishMat = mat("#ff6b7f", { roughness: 0.42, emissive: "#7a1f2b", emissiveIntensity: 0.22 });
    const fishSpec = [
      { r: 1.15, rz: 0.75, a: 0.15, s: 0.95, y: 0.195 },
      { r: 1.55, rz: 0.92, a: 1.05, s: 1.1, y: 0.205 },
      { r: 1.35, rz: 0.86, a: 2.05, s: 0.82, y: 0.19 },
      { r: 1.9, rz: 1.08, a: 3.1, s: 1.0, y: 0.215 },
      { r: 1.6, rz: 0.98, a: 4.1, s: 0.9, y: 0.2 },
      { r: 2.1, rz: 1.14, a: 5.0, s: 1.05, y: 0.21 },
      { r: 1.25, rz: 0.82, a: 5.65, s: 0.78, y: 0.19 }
    ];
    fishSpec.forEach((f) => {
      const fish = new T.Group();
      const body = new T.Mesh(new T.SphereGeometry(0.13 * f.s, 10, 8), fishMat);
      body.scale.set(1.8, 0.45, 0.7);
      fish.add(body);
      const tail = new T.Mesh(new T.ConeGeometry(0.08 * f.s, 0.22 * f.s, 4), fishMat);
      tail.position.x = -0.2 * f.s;
      tail.rotation.z = Math.PI / 2;
      fish.add(tail);
      group.add(fish);
      this.fish.push({ fish, ...f });
    });
    group.position.set(x, 0, z);
  }

  stepWorld(delta) {
    this.time += delta / 1000;
    this.fish.forEach((f, i) => {
      const t = this.time * (0.55 + i * 0.06) + f.a;
      const x = Math.sin(t * 1.1) * f.r;
      const z = Math.sin(t * 1.1) * Math.cos(t * 0.85) * f.rz;
      f.fish.position.set(x, f.y + Math.sin(t * 2.2 + i) * 0.015, z);
      f.fish.rotation.y = -t * 1.1 + Math.PI / 2;
      f.fish.rotation.z = Math.sin(t * 5.2 + i) * 0.18;
    });
  }
}

class BlueRoofVariantHouse extends StaticGroupObject {
  constructor(name, x, z, variant = "gable", rot = 0, scale = 0.56) {
    const group = new T.Group();
    const wallMat = mat("#edf2ff", { roughness: 0.82, flatShading: true });
    const trimMat = mat("#dbe7ff", { roughness: 0.74, flatShading: true });
    const roofColors = {
      gable: "#76a4ef",
      hip: "#6f92df",
      steep: "#89b3ff"
    };
    const roofMat = mat(roofColors[variant] || roofColors.gable, { roughness: 0.72, flatShading: true });
    const windowMat = glowMat("#ffe7a9", 0.86);
    const doorMat = mat("#5b3b3f", { roughness: 0.7 });

    addBox(group, [1.55, 1.18, 1.38], [0, 0.62, 0], wallMat);
    addBox(group, [1.66, 0.08, 1.48], [0, 1.16, 0], trimMat);
    addBox(group, [0.34, 0.68, 0.06], [-0.38, 0.39, 0.72], doorMat);
    addBox(group, [0.29, 0.3, 0.07], [0.34, 0.82, 0.72], windowMat);
    addBox(group, [0.07, 0.3, 0.29], [0.82, 0.82, -0.2], windowMat);

    if (variant === "hip") {
      const roof = new T.Mesh(new T.ConeGeometry(1.08, 0.72, 4), roofMat);
      roof.position.y = 1.62;
      roof.rotation.y = Math.PI / 4;
      group.add(roof);
    } else if (variant === "steep") {
      const roofA = addBox(group, [1.72, 0.08, 0.96], [0, 1.6, 0.35], roofMat);
      const roofB = addBox(group, [1.72, 0.08, 0.96], [0, 1.6, -0.35], roofMat);
      roofA.rotation.x = Math.PI / 3.4;
      roofB.rotation.x = -Math.PI / 3.4;
      addBox(group, [0.3, 0.55, 0.3], [0.42, 1.9, -0.15], mat("#6078a8", { roughness: 0.72 }));
    } else {
      const roofA = addBox(group, [1.72, 0.08, 0.9], [0, 1.52, 0.32], roofMat);
      const roofB = addBox(group, [1.72, 0.08, 0.9], [0, 1.52, -0.32], roofMat);
      roofA.rotation.x = Math.PI / 4;
      roofB.rotation.x = -Math.PI / 4;
    }

    const glow = new T.PointLight(0xffa500, 1.4, 7.0, 1.5);
    glow.position.set(0.08, 1.0, 0.62);
    glow.userData.timeRole = "window";
    glow.userData.baseIntensity = 1.4;
    group.add(glow);

    group.position.set(x, 0, z);
    group.rotation.y = rot;
    group.scale.setScalar(scale);
    super(name, group);
  }
}

class SkyGradientDome extends GrObject {
  constructor(name = "Dynamic Winter Sky Dome") {
    const geom = new T.SphereGeometry(120, 48, 28);
    const colors = new Float32Array(geom.attributes.position.count * 3);
    geom.setAttribute("color", new T.BufferAttribute(colors, 3));
    const material = new T.MeshBasicMaterial({
      vertexColors: true,
      side: T.BackSide,
      depthWrite: false,
      fog: false
    });
    const dome = new T.Mesh(geom, material);
    dome.position.y = 18;
    super(name, dome);
    this.dome = dome;
    this.colorAttr = geom.getAttribute("color");
    this.positionAttr = geom.getAttribute("position");
    this.topColor = new T.Color();
    this.horizonColor = new T.Color();
    this.bottomColor = new T.Color();
  }

  updatePalette(palette) {
    this.topColor.set(palette.skyTop);
    this.horizonColor.set(palette.skyHorizon);
    this.bottomColor.set(palette.skyBottom);
    const mixed = new T.Color();
    for (let i = 0; i < this.positionAttr.count; i++) {
      const y = this.positionAttr.getY(i);
      const t = T.MathUtils.clamp((y + 60) / 120, 0, 1);
      if (t < 0.42) {
        mixed.lerpColors(this.bottomColor, this.horizonColor, t / 0.42);
      } else {
        mixed.lerpColors(this.horizonColor, this.topColor, (t - 0.42) / 0.58);
      }
      this.colorAttr.setXYZ(i, mixed.r, mixed.g, mixed.b);
    }
    this.colorAttr.needsUpdate = true;
  }
}

const DAY_KEYFRAMES = [
  {
    hour: 0,
    skyTop: "#552c7a",
    skyHorizon: "#a2509f",
    skyBottom: "#7b3a92",
    fog: "#7d3a95",
    background: "#4d1c6c",
    ambient: 0.12,
    hemi: 0.16,
    sun: 0.08,
    warmLights: 24.0,
    accentLights: 18.0,
    aurora: 1.0
  },
  {
    hour: 6,
    skyTop: "#f9bad3",
    skyHorizon: "#ffe3a8",
    skyBottom: "#97d7e3",
    fog: "#e7c7c3",
    background: "#ffd1a0",
    ambient: 1.3,
    hemi: 1.2,
    sun: 1.7,
    warmLights: 0.16,
    accentLights: 0.62,
    aurora: 0.22
  },
  {
    hour: 12,
    skyTop: "#8cc9f5",
    skyHorizon: "#e3f5ff",
    skyBottom: "#5bc7e4",
    fog: "#9ed8ec",
    background: "#7ae0f5",
    ambient: 2.4,
    hemi: 2.1,
    sun: 4.8,
    warmLights: 0.02,
    accentLights: 0.4,
    aurora: 0.08
  },
  {
    hour: 18,
    skyTop: "#e1a7c2",
    skyHorizon: "#ffd09d",
    skyBottom: "#b68dd1",
    fog: "#d4aac3",
    background: "#de86d4",
    ambient: 0.78,
    hemi: 0.8,
    sun: 1.0,
    warmLights: 1.38,
    accentLights: 1.62,
    aurora: 0.26
  },
  {
    hour: 24,
    skyTop: "#552c7a",
    skyHorizon: "#a2509f",
    skyBottom: "#7b3a92",
    fog: "#7d3a95",
    background: "#4d1c6c",
    ambient: 0.12,
    hemi: 0.16,
    sun: 0.08,
    warmLights: 24.0,
    accentLights: 18.0,
    aurora: 1.0
  }
];

function sampleDayPalette(hour) {
  const wrapped = ((hour % 24) + 24) % 24;
  let left = DAY_KEYFRAMES[0];
  let right = DAY_KEYFRAMES[DAY_KEYFRAMES.length - 1];
  for (let i = 0; i < DAY_KEYFRAMES.length - 1; i++) {
    if (wrapped >= DAY_KEYFRAMES[i].hour && wrapped <= DAY_KEYFRAMES[i + 1].hour) {
      left = DAY_KEYFRAMES[i];
      right = DAY_KEYFRAMES[i + 1];
      break;
    }
  }
  const span = right.hour - left.hour || 1;
  const t = (wrapped - left.hour) / span;
  const lerpColor = (a, b) => `#${new T.Color(a).lerp(new T.Color(b), t).getHexString()}`;
  const lerpNum = (a, b) => T.MathUtils.lerp(a, b, t);
  return {
    skyTop: lerpColor(left.skyTop, right.skyTop),
    skyHorizon: lerpColor(left.skyHorizon, right.skyHorizon),
    skyBottom: lerpColor(left.skyBottom, right.skyBottom),
    fog: lerpColor(left.fog, right.fog),
    background: lerpColor(left.background, right.background),
    ambient: lerpNum(left.ambient, right.ambient),
    hemi: lerpNum(left.hemi, right.hemi),
    sun: lerpNum(left.sun, right.sun),
    warmLights: lerpNum(left.warmLights, right.warmLights),
    accentLights: lerpNum(left.accentLights, right.accentLights),
    aurora: lerpNum(left.aurora, right.aurora)
  };
}

function describeDayPhase(hour) {
  if (hour < 5 || hour >= 21) return "Night";
  if (hour < 9) return "Sunrise";
  if (hour < 16) return "Noon";
  if (hour < 21) return "Sunset";
  return "Night";
}

function formatAmPmTime(hourFloat) {
  const wrapped = ((hourFloat % 24) + 24) % 24;
  const totalMinutes = Math.round(wrapped * 60) % (24 * 60);
  const hh24 = Math.floor(totalMinutes / 60);
  const mm = totalMinutes % 60;
  const ampm = hh24 >= 12 ? "PM" : "AM";
  const hh12 = ((hh24 + 11) % 12) + 1;
  return `${hh12}:${String(mm).padStart(2, "0")} ${ampm}`;
}

function setupLighting(world) {
  world.scene.fog = new T.FogExp2(COLORS.deepNight, 0.0072);
  world.scene.background = new T.Color(COLORS.deepNight);

  const ambient = new T.AmbientLight(0xdde9ff, 0.2);
  world.scene.add(ambient);

  const hemi = new T.HemisphereLight(0xc7e0ff, 0x101520, 0.62);
  world.scene.add(hemi);

  const moon = new T.DirectionalLight(0xf8f1df, 0.8);
  moon.position.set(-14, 22, 14);
  moon.castShadow = true;
  moon.shadow.mapSize.set(2048, 2048);
  moon.shadow.camera.left = -35;
  moon.shadow.camera.right = 35;
  moon.shadow.camera.top = 35;
  moon.shadow.camera.bottom = -35;
  moon.shadow.camera.near = 1;
  moon.shadow.camera.far = 90;
  world.scene.add(moon);

  const auroraWash = new T.PointLight(0x84fff5, 0, 72, 1.25);
  auroraWash.position.set(0, 16, -22);
  world.scene.add(auroraWash);

  return { ambient, hemi, moon, auroraWash };
}

function createEnvironmentController(world, lighting, skyDome, aurora) {
  const dynamicLights = [];
  world.scene.traverse((obj) => {
    if ((obj.isPointLight || obj.isSpotLight) && obj.userData?.timeRole) {
      dynamicLights.push(obj);
    }
  });

  return {
    update(timeOfDay) {
      const palette = sampleDayPalette(timeOfDay);
      world.scene.background.set(palette.background);
      world.scene.fog.color.set(palette.fog);
      world.scene.fog.density = T.MathUtils.lerp(0.0052, 0.0078, 1 - Math.min(1, palette.sun / 1.7));
      skyDome.updatePalette(palette);

      lighting.ambient.color.set("#eef4ff");
      lighting.ambient.intensity = palette.ambient;
      lighting.hemi.color.set(palette.skyHorizon);
      lighting.hemi.groundColor.copy(new T.Color(palette.skyBottom)).multiplyScalar(0.42);
      lighting.hemi.intensity = palette.hemi;
      lighting.moon.color.set(timeOfDay >= 7 && timeOfDay <= 19 ? "#fff2d9" : "#dcecff");
      lighting.moon.intensity = palette.sun * (timeOfDay >= 7 && timeOfDay <= 19 ? 1.0 : 1.3);
      const sunAngle = ((timeOfDay - 6) / 24) * Math.PI * 2;
      lighting.moon.position.set(
        Math.cos(sunAngle) * 22,
        10 + Math.sin(sunAngle) * 16,
        14 + Math.sin(sunAngle * 0.6) * 10
      );
      lighting.auroraWash.intensity = 0;
      // Stronger day-night shadow/readability shift.
      lighting.moon.castShadow = palette.sun > 0.42;
      if (lighting.moon.shadow) {
        lighting.moon.shadow.bias = -0.00012;
        lighting.moon.shadow.radius = 1.0 + (palette.sun > 1.3 ? 2.4 : 0.7);
        lighting.moon.shadow.camera.left = -42;
        lighting.moon.shadow.camera.right = 42;
        lighting.moon.shadow.camera.top = 42;
        lighting.moon.shadow.camera.bottom = -42;
      }
      const shadowBlend = T.MathUtils.clamp((palette.sun - 0.3) / 2.2, 0, 1);
      world.scene.fog.density = T.MathUtils.lerp(0.0112, 0.0028, shadowBlend);

      dynamicLights.forEach((light) => {
        const base = Number(light.userData.baseIntensity || light.intensity || 1);
        const factor = light.userData.timeRole === "lamp"
          ? palette.warmLights
          : light.userData.timeRole === "window"
            ? palette.warmLights * 0.92
            : palette.accentLights;
        light.intensity = base * factor;
      });

      aurora.opacityScale = palette.aurora;
      aurora.objects[0].visible = palette.aurora > 0.03;
    }
  };
}

function installTimeOfDayController(world, container, environment) {
  const controller = {
    autoCycle: true,
    timeOfDay: 22,
    hoursPerSecond: 0.32
  };

  const panel = document.createElement("div");
  panel.style.position = "relative";
  panel.style.width = "100%";
  panel.style.maxWidth = "290px";
  panel.style.boxSizing = "border-box";
  panel.style.padding = "12px 12px 10px";
  panel.style.borderRadius = "8px";
  panel.style.background = "rgba(10, 18, 36, 0.82)";
  panel.style.border = "1px solid rgba(170, 205, 255, 0.32)";
  panel.style.backdropFilter = "blur(10px)";
  panel.style.boxShadow = "0 10px 24px rgba(0, 0, 0, 0.22)";
  panel.style.color = "#eef5ff";
  panel.style.fontFamily = "system-ui, sans-serif";
  panel.style.margin = "0 0 10px 0";
  container.appendChild(panel);

  const title = document.createElement("div");
  title.textContent = "Day / Night";
  title.style.fontSize = "14px";
  title.style.fontWeight = "700";
  panel.appendChild(title);

  const phase = document.createElement("div");
  phase.style.marginTop = "4px";
  phase.style.fontSize = "12px";
  phase.style.color = "#bed3ff";
  panel.appendChild(phase);

  const slider = document.createElement("input");
  slider.type = "range";
  slider.min = "0";
  slider.max = "24";
  slider.step = "0.1";
  slider.value = String(controller.timeOfDay);
  slider.style.width = "100%";
  slider.style.margin = "10px 0 6px";
  panel.appendChild(slider);

  const readout = document.createElement("div");
  readout.style.display = "flex";
  readout.style.justifyContent = "space-between";
  readout.style.fontSize = "12px";
  readout.style.color = "#d7e3ff";
  panel.appendChild(readout);

  const toggleRow = document.createElement("label");
  toggleRow.style.display = "flex";
  toggleRow.style.alignItems = "center";
  toggleRow.style.gap = "8px";
  toggleRow.style.marginTop = "10px";
  toggleRow.style.fontSize = "12px";
  toggleRow.style.cursor = "pointer";
  panel.appendChild(toggleRow);

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = controller.autoCycle;
  toggleRow.appendChild(checkbox);
  toggleRow.appendChild(document.createTextNode("Auto cycle"));

  const syncPanel = () => {
    slider.value = String(controller.timeOfDay);
    readout.innerHTML = `<span>${formatAmPmTime(controller.timeOfDay)}</span><span>${describeDayPhase(controller.timeOfDay)}</span>`;
    phase.textContent = controller.autoCycle ? "Looping winter sky" : "Manual lighting";
  };

  checkbox.addEventListener("change", () => {
    controller.autoCycle = checkbox.checked;
    syncPanel();
  });

  slider.addEventListener("input", () => {
    controller.timeOfDay = Number(slider.value);
    controller.autoCycle = false;
    checkbox.checked = false;
    syncPanel();
    world.lastTimeOfDay = controller.timeOfDay;
    environment.update(controller.timeOfDay);
    world.draw();
  });

  const originalStepWorld = world.stepWorld.bind(world);
  world.stepWorld = (delta) => {
    if (controller.autoCycle) {
      controller.timeOfDay = (controller.timeOfDay + (delta / 1000) * controller.hoursPerSecond) % 24;
    }
    world.lastTimeOfDay = controller.timeOfDay;
    if (world.gui) world.gui.time = Number(controller.timeOfDay.toFixed(1));
    originalStepWorld(delta, controller.timeOfDay);
    environment.update(controller.timeOfDay);
    syncPanel();
  };

  environment.update(controller.timeOfDay);
  syncPanel();
}

function addVillage(world, addObject) {
  addObject(new VillageHouseCluster(), true);

  const church = placeGrObject(
    new GrChurch("Moonlit Clocktower Church"),
    -15.8,
    11.7,
    Math.PI / 4.3,
    0.6,
    3.45,
    8.7
  );
  addObject(church);

  const store = placeGrObject(
    new GrStripedStore("Striped Cocoa Market"),
    -9.8,
    10.5,
    Math.PI / 4.0,
    0.56,
    3.15,
    8.1
  );
  addObject(store);
  const supplyShop = placeGrObject(
    new GrStripedStore("Village Treat Market"),
    -16.8,
    5.8,
    Math.PI / 4.9,
    0.5,
    3.35,
    8.1
  );
  addObject(supplyShop);

  const houseData = [
    ["Blue Roof Festival Cottage", -17.4, 4.4, Math.PI / 4.9, 0.56, 3.25, 8.2],
    ["North Lantern House", -12.2, 4.2, Math.PI / 4.45, 0.54, 3.2, 8.0],
    ["Riverside Village House", -7.6, 7.5, Math.PI / 4.1, 0.53, 3.25, 8.2]
  ];
  for (const h of houseData) {
    addObject(placeGrObject(new ProGableRoofHouse(h[0]), h[1], h[2], h[3], h[4], h[5], h[6]));
  }

  addObject(new CocoaLodge());
}

function addFestivalPark(world, addObject) {
  let [carouselX, carouselZ] = nudgePointOffRoad(4.2, 10.2, 4.7);
  [carouselX, carouselZ] = nudgePointOffCenter(carouselX, carouselZ, 8.8);
  const carousel = setUniqueName(new GrCarousel({ x: carouselX, z: carouselZ, size: 0.62 }), "Main Carousel");
  addObject(carousel, true);

  let [ferrisX, ferrisZ] = nudgePointOffRoad(9.2, 8.1, 4.8);
  [ferrisX, ferrisZ] = nudgePointOffCenter(ferrisX, ferrisZ, 9.2);
  const ferris = setUniqueName(new GrFerrisWheel({ x: ferrisX, z: ferrisZ, size: 0.68 }), "Aurora Ferris Wheel");
  ferris.objects[0].rotation.y = -Math.PI / 2;
  addObject(ferris);

  let [chairsX, chairsZ] = nudgePointOffRoad(1.2, 6.6, 4.6);
  [chairsX, chairsZ] = nudgePointOffCenter(chairsX, chairsZ, 8.8);
  const chairs = setUniqueName(new GrFlyingChairs({ x: chairsX, z: chairsZ, size: 0.52 }), "Snowflake Flying Chairs");
  addObject(chairs);

  let [rocketX, rocketZ] = nudgePointOffRoad(6.7, 5.3, 4.7);
  [rocketX, rocketZ] = nudgePointOffCenter(rocketX, rocketZ, 9.0);
  const rocket = setUniqueName(new GrRocketTower({ x: rocketX, z: rocketZ, size: 0.48 }), "North Star Drop Tower");
  addObject(rocket);
  addObject(new FestivalMidway());

  const festivalLight1 = new T.PointLight(0xffd700, 2.0, 15, 1.5);
  festivalLight1.position.set(carouselX, 3, carouselZ);
  festivalLight1.userData.timeRole = "accent";
  festivalLight1.userData.baseIntensity = 2.0;
  world.scene.add(festivalLight1);

  const festivalLight2 = new T.PointLight(0xffd700, 2.0, 15, 1.5);
  festivalLight2.position.set(ferrisX, 4, ferrisZ);
  festivalLight2.userData.timeRole = "accent";
  festivalLight2.userData.baseIntensity = 2.0;
  world.scene.add(festivalLight2);

  const festivalLight3 = new T.PointLight(0xffd700, 1.5, 12, 1.5);
  festivalLight3.position.set(chairsX, 2.5, chairsZ);
  festivalLight3.userData.timeRole = "accent";
  festivalLight3.userData.baseIntensity = 1.5;
  world.scene.add(festivalLight3);

  const festivalLight4 = new T.PointLight(0xffd700, 1.5, 12, 1.5);
  festivalLight4.position.set(rocketX, 3.5, rocketZ);
  festivalLight4.userData.timeRole = "accent";
  festivalLight4.userData.baseIntensity = 1.5;
  world.scene.add(festivalLight4);
}

function addLamps(world, addObject) {
  const lampPositions = [
    [-4.7, 4.7], [4.8, 4.6], [-4.7, -4.6], [4.8, -4.8],
    [-15.8, 10.7], [-16.3, 5.8], [-11.2, 10.2], [-8.4, 7.5],
    [9.0, -8.6], [14.6, -11.3], [17.2, -6.7], [14.6, -3.5],
    [-11.6, -9.1], [-8.3, -11.3], [11.3, 9.4], [14.7, 10.7]
  ];
  lampPositions.forEach((p, i) => {
    let [safeX, safeZ] = nudgePointOffRoad(p[0], p[1], 2.25);
    [safeX, safeZ] = nudgePointOffCenter(safeX, safeZ, 5.8);
    addObject(new StreetLamp(`Warm Street Lamp ${String(i + 1).padStart(2, "0")}`, safeX, safeZ));
  });
}

function addNature(world, addObject) {
  addObject(new SnowyPineCluster("North Snowy Pine Grove", -3.0, -14.4, 8, 5.0));
  addObject(new SnowyPineCluster("East Snowy Pine Grove", 17.0, 3.0, 7, 4.2));
  addObject(new SnowyPineCluster("Village Back Snowy Pines", -18.2, 13.2, 9, 4.9));
  addObject(new SnowyPineCluster("Pond Edge Snowy Pines", -14.5, -10.9, 7, 4.2));
  addObject(new SnowyPineCluster("Quiet Lake Pines", -7.2, -10.8, 5, 3.2));
  addObject(new SnowPiles("Procedural Snow Piles"));
  addObject(new FrozenPond("Ice Pond Area", 10.8, 0.7, 4.9), true);
}

function setSubtreeVisible(root, visible) {
  root.visible = visible;
  root.children.forEach((child) => setSubtreeVisible(child, visible));
}

function applyCameraWorldPose(camera, worldPosition, worldTarget) {
  if (camera.parent) {
    const localPos = camera.parent.worldToLocal(worldPosition.clone());
    const localTarget = camera.parent.worldToLocal(worldTarget.clone());
    camera.position.copy(localPos);
    camera.lookAt(localTarget);
  } else {
    camera.position.copy(worldPosition);
    camera.lookAt(worldTarget);
  }
}

function installFollowRideCameraRig(world) {
  const box = new T.Box3();
  const center = new T.Vector3();
  const size = new T.Vector3();
  const q = new T.Quaternion();
  const forward = new T.Vector3();
  const flatForward = new T.Vector3();
  const target = new T.Vector3();
  const desired = new T.Vector3();
  const ridePos = new T.Vector3();
  const rideQuat = new T.Quaternion();
  const groundSafeY = 1.7;
  const pitch = Math.PI / 6; // 30 deg down
  const liftByDistance = Math.tan(pitch);
  const smoothState = new WeakMap();

  return () => {
    const mode = world.view_mode;
    if (mode !== "Follow Object" && mode !== "Drive Object") return;
    const active = world.active_object;
    if (!active || !active.objects || !active.objects[0]) return;
    if (!active.rideable) return;
    const isDrone = String(active.name || "").toLowerCase().includes("drone");

    const root = active.objects[0];
    box.setFromObject(root);
    box.getCenter(center);
    box.getSize(size);

    const isAir = center.y > 4.2;
    const radius = Math.max(1.2, size.x * 0.5, size.z * 0.5);
    const baseDist = mode === "Drive Object"
      ? (isAir ? 6.2 : 4.8)
      : (isAir ? 8.4 : 6.6);
    const dist = Math.max(baseDist, radius * 3.15);
    const lookYOffset = Math.max(0.62, size.y * (isAir ? 0.2 : 0.32));

    root.getWorldQuaternion(q);
    forward.set(0, 0, 1).applyQuaternion(q).normalize();
    if (forward.lengthSq() < 1e-6) forward.set(0, 0, 1);
    flatForward.set(forward.x, 0, forward.z);
    if (flatForward.lengthSq() < 1e-6) flatForward.set(0, 0, 1);
    flatForward.normalize();

    if (mode === "Drive Object") {
      // Drive mode = first-person
      active.rideable.getWorldPosition(ridePos);
      active.rideable.getWorldQuaternion(rideQuat);
      const viewDir = new T.Vector3(0, 0, 1).applyQuaternion(rideQuat).normalize();
      desired.copy(ridePos);
      target.copy(ridePos).addScaledVector(viewDir, 14);
    } else {
      // Follow mode = third-person behind target object
      target.set(center.x, center.y + lookYOffset, center.z);
      desired.copy(target).addScaledVector(forward, -dist);
      if (isDrone) {
        const followDist = 7.0;
        const followHeight = 3.0;
        desired.copy(center)
          .addScaledVector(flatForward, -followDist)
          .add(new T.Vector3(0, followHeight, 0));
        target.copy(center).add(new T.Vector3(0, -0.15, 0));
      } else {
        desired.y = target.y + dist * liftByDistance + (isAir ? 0.42 : 0);
      }
      desired.y = Math.max(desired.y, groundSafeY);
    }

    const cameras = [world.camera, world.solo_camera];
    cameras.forEach((camera) => {
      if (!camera) return;
      let smoothPos = smoothState.get(camera);
      if (!smoothPos) {
        smoothPos = desired.clone();
      } else {
        const alpha = mode === "Drive Object" ? 0.34 : (isDrone ? 0.28 : 0.19);
        smoothPos.lerp(desired, alpha);
      }
      smoothState.set(camera, smoothPos);
      applyCameraWorldPose(camera, smoothPos, target);
    });
  };
}

function ensureHighlightRig(grObj) {
  const root = grObj?.objects?.[0];
  if (!root) return null;
  if (root.userData.highlightRig) return root.userData.highlightRig;

  const ring = new T.Mesh(
    new T.TorusGeometry(1.4, 0.08, 12, 56),
    new T.MeshStandardMaterial({
      color: "#8ee7ff",
      emissive: "#7de3ff",
      emissiveIntensity: 1.1,
      transparent: true,
      opacity: 0.92,
      depthWrite: false
    })
  );
  ring.rotation.x = Math.PI / 2;
  ring.visible = false;
  root.add(ring);

  const glow = new T.PointLight(0x9be9ff, 1.4, 7.0, 1.5);
  glow.visible = false;
  root.add(glow);

  const rig = { ring, glow };
  root.userData.highlightRig = rig;
  return rig;
}

function setHighlightVisualState(grObj, on) {
  const root = grObj?.objects?.[0];
  if (!root) return;
  const rig = ensureHighlightRig(grObj);
  if (!rig) return;

  // Ring placement from object bounds (world -> local conversion).
  const box = new T.Box3().setFromObject(root);
  const centerW = new T.Vector3();
  const size = new T.Vector3();
  box.getCenter(centerW);
  box.getSize(size);
  const localCenter = root.worldToLocal(centerW.clone());
  const ringRadius = Math.max(0.9, Math.max(size.x, size.z) * 0.55);
  rig.ring.geometry.dispose();
  rig.ring.geometry = new T.TorusGeometry(ringRadius, Math.max(0.06, ringRadius * 0.06), 12, 56);
  rig.ring.position.set(localCenter.x, Math.max(0.08, box.min.y - root.position.y + 0.12), localCenter.z);
  rig.glow.position.set(localCenter.x, localCenter.y + Math.max(0.8, size.y * 0.35), localCenter.z);

  rig.ring.visible = on;
  rig.glow.visible = on;
  rig.glow.intensity = on ? 0.22 : 0;

  root.traverse((obj) => {
    if (!obj.isMesh || !obj.material) return;
    const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
    mats.forEach((m) => {
      if (!m.userData) m.userData = {};
      if (m.userData.__hlBaseEmissiveIntensity === undefined) {
        m.userData.__hlBaseEmissiveIntensity = Number(m.emissiveIntensity || 0);
      }
      if (m.emissive && m.emissive.isColor) {
        if (on) {
          m.emissiveIntensity = m.userData.__hlBaseEmissiveIntensity + 0.45;
        } else {
          m.emissiveIntensity = m.userData.__hlBaseEmissiveIntensity;
        }
      }
    });
  });
}

function installHighlightFeedback(world) {
  let lastName = "";
  return () => {
    const active = world.active_object;
    const activeName = active?.name || "";
    if (activeName === lastName) return;
    if (lastName) {
      const prev = world.objects.find((o) => o.name === lastName);
      if (prev) setHighlightVisualState(prev, false);
    }
    if (active && active.highlighted) {
      setHighlightVisualState(active, true);
    }
    lastName = activeName;
  };
}

async function buildTown() {
  if (!div) {
    alert("Can't find Div for GrTown!");
    return;
  }
  if (!uiColumn) {
    alert("Can't find UI column for GrTown!");
    return;
  }

  const world = await GrWorld.new({
    where: div,
    width: 1100,
    height: 720,
    webgpu: false,
    groundplane: false,
    background: COLORS.deepNight,
    lookfrom: new T.Vector3(31, 25, 43),
    lookat: new T.Vector3(-1.2, 2.0, -1.6),
    fov: 44,
    renderparams: { preserveDrawingBuffer: true, antialias: true }
  });

  world.renderer.shadowMap.enabled = true;
  world.renderer.shadowMap.type = T.PCFSoftShadowMap;
  world.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  world.renderer.toneMapping = T.ACESFilmicToneMapping;
  world.renderer.toneMappingExposure = 0.5;
  if ("outputColorSpace" in world.renderer) {
    world.renderer.outputColorSpace = T.SRGBColorSpace;
  }

  const lighting = setupLighting(world);
  const sceneObjects = [];

  function addObject(obj, highlighted = false) {
    obj.highlighted = Boolean(highlighted);
    world.add(obj);
    sceneObjects.push(obj);
    return obj;
  }

  addObject(new FloatingIslandDiorama());
  const skyDome = new SkyGradientDome();
  world.scene.add(skyDome.objects[0]);
  addObject(new RoadLoopAndPlaza());
  addObject(new RoadsideDetails());
  addObject(new FestivalSign());
  addObject(new LightArch("Village Festival Light Arch", -8.8, -4.6, Math.PI / 2.5));

  // Center focal
  const pokeball = new PokeballLandmark("Glowing Pokeball Landmark", 0, 0);
  addObject(pokeball, true);

  // Village zone (left)
  addObject(placeGrObject(new ProGableRoofHouse("Village House A"), -8.3, -0.1, Math.PI / 2.2, 0.68, 3.0, 5.9));
  addObject(placeGrObject(new ProGableRoofHouse("Village House B"), -9.0, 2.1, Math.PI / 2.3, 0.66, 3.0, 5.9));
  addObject(placeGrObject(new ProGableRoofHouse("Village House C"), -7.4, 2.9, Math.PI / 2.1, 0.67, 3.0, 5.9));
  addObject(placeGrObject(new ProGableRoofHouse("Village House D"), -10.9, 3.8, Math.PI / 2.25, 0.7, 3.1, 6.1));
  addObject(placeGrObject(new ProGableRoofHouse("Village House E"), -10.2, -1.4, Math.PI / 2.0, 0.69, 3.1, 6.0));
  addObject(new BlueRoofVariantHouse("Blue Roof Cottage A", -12.4, -0.4, "gable", Math.PI / 2.05, 0.68));
  addObject(new BlueRoofVariantHouse("Blue Roof Cottage B", -7.2, -2.0, "hip", Math.PI / 2.15, 0.66));
  addObject(new BlueRoofVariantHouse("Blue Roof Cottage C", -11.9, 5.2, "steep", Math.PI / 2.3, 0.7));
  addObject(new BlueRoofVariantHouse("Blue Roof Cottage D", -8.6, 5.4, "gable", Math.PI / 2.45, 0.64));
  addObject(placeGrObject(new GrChurch("Village Clock Church"), -12.2, 1.2, Math.PI / 1.95, 0.7, 3.0, 6.6), true);
  addObject(placeGrObject(new GrStripedStore("Village Cocoa Shop"), -15.8, 1.0, Math.PI / 2.05, 0.55, 3.0, 7.1));
  addObject(placeGrObject(new GrStripedStore("Village Souvenir Stall"), -12.4, 5.8, Math.PI / 2.2, 0.5, 2.95, 7.1));
  addObject(new SnowPiles("Village and Plaza Snow Piles"));

  // Lake zone (upper middle-right) + bridge link
  addObject(new FrozenPond("Ice Pond Area", 2.8, -3.7, 3.0), true);

  // Amusement zone (right)
  const carousel = setUniqueName(new GrCarousel({ x: 9.5, z: 1.1, size: 1 }), "Main Carousel");
  carousel.objects[0].scale.setScalar(0.433);
  addObject(carousel, true);
  const ferris = setUniqueName(new GrFerrisWheel({ x: 12.6, z: 3.3, size: 0.8 }), "Aurora Ferris Wheel");
  ferris.objects[0].rotation.y = -Math.PI / 2;
  addObject(ferris, true);
  addObject(setUniqueName(new GrFlyingChairs({ x: 12.3, z: 6.2, size: 0.46 }), "Snowflake Flying Chairs"));
  addObject(setUniqueName(new GrRocketTower({ x: 8.2, z: 3.7, size: 0.44 }), "North Star Drop Tower"));
  addObject(setUniqueName(new GrFlyingChairs({ x: 12.9, z: 0.2, size: 0.31 }), "Mini Flying Chairs"));
  addObject(new FestivalMidway());

  // Add amusement area lighting
  const amusementLight1 = new T.PointLight(0xffd700, 3.0, 18, 1.5);
  amusementLight1.position.set(9.5, 4, 1.1);
  amusementLight1.userData.timeRole = "accent";
  amusementLight1.userData.baseIntensity = 3.0;
  world.scene.add(amusementLight1);

  const amusementLight2 = new T.PointLight(0xffd700, 3.0, 18, 1.5);
  amusementLight2.position.set(12.6, 5, 3.3);
  amusementLight2.userData.timeRole = "accent";
  amusementLight2.userData.baseIntensity = 3.0;
  world.scene.add(amusementLight2);

  const amusementLight3 = new T.PointLight(0xffd700, 2.0, 15, 1.5);
  amusementLight3.position.set(12.3, 3, 6.2);
  amusementLight3.userData.timeRole = "accent";
  amusementLight3.userData.baseIntensity = 2.0;
  world.scene.add(amusementLight3);

  const amusementLight4 = new T.PointLight(0xffd700, 2.0, 15, 1.5);
  amusementLight4.position.set(8.2, 4, 3.7);
  amusementLight4.userData.timeRole = "accent";
  amusementLight4.userData.baseIntensity = 2.0;
  world.scene.add(amusementLight4);

  const amusementLight5 = new T.PointLight(0xffd700, 1.5, 12, 1.5);
  amusementLight5.position.set(12.9, 2, 0.2);
  amusementLight5.userData.timeRole = "accent";
  amusementLight5.userData.baseIntensity = 1.5;
  world.scene.add(amusementLight5);

  // Bottom center critter area: snowman + bunny + penguin
  addObject(new WinterCritterZone("Winter Critter Zone", 0.2, 7.2), true);
  addObject(new RedFishSchool("Red Fish School", 5.8, -7.7), true);

  // Edge trees (left / right)
  addObject(new SnowyPineCluster("West Edge Trees", -19.3, 3.8, 7, 4.0));
  addObject(new SnowyPineCluster("East Edge Trees", 19.2, 0.2, 7, 3.8));
  addObject(new SnowyPineCluster("North Quiet Pines", 0.8, -10.2, 6, 3.6));
  addObject(new SnowyPineCluster("Southwest Festival Pines", -17.8, -4.2, 6, 3.2));
  addObject(new SnowyPineCluster("Southeast Festival Pines", 16.4, 6.8, 6, 3.2));
  addObject(new SnowyPineCluster("Village Backline Pines", -14.4, 9.0, 5, 2.8));
  addObject(new SnowyPineCluster("Lake Rim Pines", 1.8, -7.8, 5, 2.8));
  addObject(new SnowyPineCluster("Far North Fringe Pines", -3.2, -14.6, 6, 3.0));
  addObject(new SnowyPineCluster("Far East Fringe Pines", 18.4, -8.6, 5, 2.8));
  addObject(new SnowyPineCluster("Midwest Gap Pines", -18.6, -0.8, 5, 2.6));
  addObject(new SnowyPineCluster("Northeast Gap Pines", 13.8, -2.2, 4, 2.2));

  // Right-bottom functional zone: lookout / photo point
  addObject(new StreetLamp("Lookout Warm Lamp A", 10.2, 10.8));

  // Connector lamps and path readability
  addObject(new StreetLamp("Village Connector Lamp", -5.8, -1.8));
  addObject(new StreetLamp("Lake Connector Lamp", -0.8, -3.1));

  const cars = [
    new FestivalPathVehicle("Rideable Festival Car", "sedan", "#ea7fb2", 0.05, 0.041, 0.9),
    new FestivalPathVehicle("Cocoa Delivery Truck", "truck", "#79d7e8", 0.31, 0.034, 0.88),
    new FestivalPathVehicle("Snow Shuttle Bus", "bus", "#ffd18e", 0.56, 0.029, 0.86),
    new FestivalPathVehicle("Red Aurora Roadster", "roadster", "#ff668b", 0.77, 0.046, 0.86)
  ];
  cars.forEach((car, idx) => addObject(car, idx === 0));

  const drone = new AuroraPatrolDrone("Aurora Patrol Drone", 0.0, 1.0, 0.0);
  addObject(drone, true);
  const drone2 = new AuroraPatrolDrone("Aurora Scout Drone", Math.PI * 0.9, 0.86, 1.1, true);
  addObject(drone2);

  const aurora = new AuroraCurtain("Animated Aurora Curtain");
  addObject(aurora, true);

  const snow = new SnowfallSystem("Continuous Particle Snowfall", 1100, 100);
  addObject(snow, true);

  const environment = createEnvironmentController(world, lighting, skyDome, aurora);

  // Expose a read-only convenience handle for local debugging/verification.
  // The workbook and WorldUI do not depend on this.
  // @ts-ignore
  window.auroraFestivalWorld = world;

  // Build the WorldUI after every GrObject exists so lookat, highlight,
  // ride, and follow lists include all meaningful town objects.
  // @ts-ignore
  world.ui = new WorldUI(world, 290, uiColumn);
  const focusNames = new Set([
    "Glowing Pokeball Landmark",
    "Rideable Festival Car",
    "Aurora Patrol Drone",
    "Aurora Scout Drone",
    "Main Carousel",
    "Aurora Ferris Wheel",
    "Winter Festival Snowman",
    "Ice Pond Area",
    "Village Clock Church"
  ]);
  world.objects.forEach((o) => {
    o.highlighted = focusNames.has(o.name);
  });
  const rewriteSelectOptions = (selectEl, names) => {
    if (!selectEl) return;
    while (selectEl.firstChild) selectEl.removeChild(selectEl.firstChild);
    names.forEach((n) => {
      const opt = document.createElement("option");
      opt.value = n;
      opt.textContent = n;
      selectEl.appendChild(opt);
    });
  };
  const focusList = world.objects
    .map((o) => o.name)
    .filter((n) => focusNames.has(n))
    .sort();
  // keep LookAt/Highlight focused on key objects only
  rewriteSelectOptions(world.selectLook, focusList);
  if (world.selectLookHigh) rewriteSelectOptions(world.selectLookHigh, focusList);
  if (focusList.length) {
    world.setActiveObject(focusList[0]);
    world.selectLook.value = focusList[0];
    if (world.selectLookHigh) world.selectLookHigh.value = focusList[0];
  }
  installTimeOfDayController(world, uiColumn, environment);
  const enhanceCamera = installFollowRideCameraRig(world);
  const highlightFeedback = installHighlightFeedback(world);
  world.go({
    predraw: () => {
      enhanceCamera();
      highlightFeedback();
    }
  });
}

buildTown();

// 2026 Workbook
