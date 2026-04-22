// @ts-check

import * as T from "three";
import { GrWorld } from "CS559-Framework/GrWorld.js";
import * as SimpleObjects from "CS559-Framework/SimpleObjects.js";
import * as InputHelpers from "CS559/inputHelpers.js";
import { MeshStandardNodeMaterial } from "three/webgpu";
import { attribute, uniform, vec3 } from "three/tsl";

let mydiv = document.getElementById("div1");
let world = await GrWorld.new({
  width: mydiv ? 600 : 800,
  where: mydiv,
  webgpu: true,
  lightColoring: "white",
  groundplanecolor: "lightgray",
});

// Front key light so the main object is lit from the viewer side.
const frontLight = new T.DirectionalLight(0xffffff, 1.35);
frontLight.position.set(0, 2.2, 6.5);
world.scene.add(frontLight);

const timeU = uniform(0.0);
const seamU = uniform(0.055);
const pulseU = uniform(0.012);

const pos = attribute("position", "vec3");
const nLocal = attribute("normal", "vec3").normalize();

// ---------- Sphere shader: intrinsic-color Pokeball ----------
const topMask = nLocal.y.smoothstep(-0.01, 0.01);
const band = nLocal.y.abs().smoothstep(seamU, seamU.add(0.03)).oneMinus();

const r2 = nLocal.x.mul(nLocal.x).add(nLocal.y.mul(nLocal.y));
const front = nLocal.z.smoothstep(-0.02, 0.08);
const outerBtn = r2.smoothstep(0.060, 0.110).oneMinus().mul(front);
const innerBtn = r2.smoothstep(0.020, 0.048).oneMinus().mul(front);
const coreBtn = r2.smoothstep(0.002, 0.030).oneMinus().mul(front);
const outlineOuter = r2.smoothstep(0.110, 0.145).oneMinus().mul(front);
const outlineBtn = outlineOuter.sub(outerBtn).clamp(0.0, 1.0);
const ringBtn = outerBtn.sub(innerBtn).clamp(0.0, 1.0);

const topRed = vec3(0.90, 0.03, 0.06);
const bottomWhite = vec3(0.97, 0.97, 0.98);
const black = vec3(0.02, 0.02, 0.02);
const ringGray = vec3(0.98, 0.98, 0.99);
const coreDark = vec3(0.02, 0.02, 0.02);

let baseColor = bottomWhite.mul(topMask.oneMinus()).add(topRed.mul(topMask));
baseColor = baseColor.mul(band.oneMinus()).add(black.mul(band));
baseColor = baseColor.mul(outlineBtn.oneMinus()).add(black.mul(outlineBtn));
baseColor = baseColor.mul(ringBtn.oneMinus()).add(ringGray.mul(ringBtn));
baseColor = baseColor.mul(innerBtn.oneMinus()).add(bottomWhite.mul(innerBtn));
baseColor = baseColor.mul(coreBtn.oneMinus()).add(coreDark.mul(coreBtn));

const sphereColor = baseColor.mul(1.28).clamp(0.0, 1.0);

const wobble = pos.x.mul(3.2).add(pos.z.mul(2.6)).add(timeU.mul(1.6)).sin().mul(pulseU);
const ringBump = ringBtn.mul(0.028);
const coreInset = coreBtn.mul(0.010);
const buttonBump = outerBtn.mul(0.006).add(ringBump).sub(coreInset);
const spherePosNode = pos.add(nLocal.mul(wobble.add(buttonBump)));

const sphereMaterial = new MeshStandardNodeMaterial();
sphereMaterial.side = T.DoubleSide;
sphereMaterial.colorNode = sphereColor;
sphereMaterial.positionNode = spherePosNode;
const topGlossRough = 0.08;
const bottomMatteRough = 0.88;
const roughnessSplit = topMask.mul(topGlossRough).add(topMask.oneMinus().mul(bottomMatteRough));
const topMetal = 0.42;
const bottomMetal = 0.06;
const metalnessSplit = topMask.mul(topMetal).add(topMask.oneMinus().mul(bottomMetal));
const latchMask = outlineBtn.add(ringBtn).add(innerBtn).add(coreBtn).clamp(0.0, 1.0);
const latchMatteRough = 0.96;
const latchMatteMetal = 0.02;
const roughnessFinal = roughnessSplit.mul(latchMask.oneMinus()).add(latchMask.mul(latchMatteRough));
const metalnessFinal = metalnessSplit.mul(latchMask.oneMinus()).add(latchMask.mul(latchMatteMetal));
sphereMaterial.roughnessNode = roughnessFinal;
sphereMaterial.metalnessNode = metalnessFinal;

// ---------- Sign shader: 2D Pokeball decal (reference-like) ----------
const uv = attribute("uv", "vec2");
const p = uv.mul(2.0).sub(1.0);
const rr = p.x.mul(p.x).add(p.y.mul(p.y));
const disc = rr.smoothstep(0.93, 1.0).oneMinus();

const top2 = p.y.smoothstep(-0.01, 0.01);
const band2 = p.y.abs().smoothstep(0.05, 0.085).oneMinus();

const outer2 = rr.smoothstep(0.055, 0.095).oneMinus();
const inner2 = rr.smoothstep(0.020, 0.048).oneMinus();
const core2 = rr.smoothstep(0.003, 0.030).oneMinus();
const outlineOuter2 = rr.smoothstep(0.095, 0.125).oneMinus();
const outline2 = outlineOuter2.sub(outer2).clamp(0.0, 1.0);
const ring2 = outer2.sub(inner2).clamp(0.0, 1.0);

let ball2D = bottomWhite.mul(top2.oneMinus()).add(topRed.mul(top2));
ball2D = ball2D.mul(band2.oneMinus()).add(black.mul(band2));
ball2D = ball2D.mul(outline2.oneMinus()).add(black.mul(outline2));
ball2D = ball2D.mul(ring2.oneMinus()).add(ringGray.mul(ring2));
ball2D = ball2D.mul(inner2.oneMinus()).add(bottomWhite.mul(inner2));
ball2D = ball2D.mul(core2.oneMinus()).add(coreDark.mul(core2));

const bg = vec3(0.0, 0.0, 0.0);
const signColor = bg.mul(disc.oneMinus()).add(ball2D.mul(1.22).clamp(0.0, 1.0).mul(disc));

const signMaterial = new MeshStandardNodeMaterial();
signMaterial.side = T.DoubleSide;
signMaterial.colorNode = signColor;
signMaterial.roughness = 0.18;
signMaterial.metalness = 0.0;

const sphere = new SimpleObjects.GrSphere({
  x: -2,
  y: 1,
  widthSegments: 96,
  heightSegments: 64,
  material: sphereMaterial,
});
const sign = new SimpleObjects.GrSquareSign({ x: 2, y: 1, size: 1, material: signMaterial });

world.add(sphere);
world.add(sign);

const s1 = new InputHelpers.LabelSlider("seam", {
  width: 400,
  min: 0.03,
  max: 0.10,
  step: 0.002,
  initial: 0.055,
  where: mydiv,
});
const s2 = new InputHelpers.LabelSlider("pulse", {
  width: 400,
  min: 0.0,
  max: 0.05,
  step: 0.001,
  initial: 0.012,
  where: mydiv,
});

function onChange() {
  seamU.value = Number(s1.value());
  pulseU.value = Number(s2.value());
}
s1.oninput = onChange;
s2.oninput = onChange;
onChange();

if (mydiv) {
  const explain = document.createElement("p");
  explain.style.maxWidth = "560px";
  explain.style.margin = "8px 0 0 0";
  explain.style.fontSize = "14px";
  explain.textContent =
    "Creative explanation: The sphere uses a procedural Pokeball shader in TSL with intrinsic colors only (normal-based red/white split, equator band, and concentric front button masks). The white latch ring is intentionally raised with position-node displacement, a slight center inset, and an extra black outer outline for clearer lock-button definition. Material response is split by hemisphere: glossy on top (low roughness) and matte on bottom (high roughness). The side plane is a clean 2D Pokeball decal from UV masks with matching ring outline and no extra white-dot highlight.";
  mydiv.appendChild(explain);
}

const clock = new T.Clock();
function tick() {
  const t = clock.getElapsedTime();
  timeU.value = t;
  sphere.objects[0].rotation.y = t * 0.35;
  requestAnimationFrame(tick);
}
tick();

world.go();
// 2026 Workbook
