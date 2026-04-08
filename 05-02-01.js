// @ts-check

import { GrWorld } from "CS559-Framework/GrWorld.js";
import {
  GrSimpleSwing,
  GrColoredRoundabout,
  GrSimpleRoundabout,
  GrCarousel,
  GrFlyingChairs,
  GrFerrisWheel,
  GrRocketTower,
  GrEasterDecor
} from "./05-02-01-parkobjects.js";

let parkDiv = document.getElementById("div1");
let world = new GrWorld({
  groundplanesize: 30,
  where: parkDiv,
  renderparams: { preserveDrawingBuffer: true },
  id: "canvas"
});

// -----------------------------
// Existing rides
// -----------------------------
let roundabout1 = new GrSimpleRoundabout({ x: -8, z: -6, size: 1.2 });
world.add(roundabout1);

let roundabout2 = new GrColoredRoundabout({ x: 8, z: -6, size: 1.2 });
world.add(roundabout2);

// -----------------------------
// Swings (add at least one more)
// -----------------------------
let swing1 = new GrSimpleSwing({ x: -10, z: 6, size: 1.2 });
world.add(swing1);

let swing2 = new GrSimpleSwing({ x: -4, z: 7, size: 1.0 });
world.add(swing2);

// -----------------------------
// Carousel with poles + horses
// -----------------------------
let carousel1 = new GrCarousel({ x: 0, z: 0, size: 1.5 });
world.add(carousel1);

// Add a second carousel for a fuller park look
let carousel2 = new GrCarousel({ x: 10, z: 5, size: 1.1 });
world.add(carousel2);

// -----------------------------
// Extra ride for higher score
// -----------------------------
let flyingChairs = new GrFlyingChairs({ x: 0, z: -10, size: 1.4 });
world.add(flyingChairs);

// -----------------------------
// More hierarchical rides (advanced/creative)
// -----------------------------
let ferris = new GrFerrisWheel({ x: 12, z: -4, size: 1.4 });
world.add(ferris);

let rocket = new GrRocketTower({ x: -12, z: -4, size: 1.3 });
world.add(rocket);

// -----------------------------
// Festive lights + Easter eggs
// -----------------------------
let decor1 = new GrEasterDecor({ x: -2, z: 12, size: 1.2 });
world.add(decor1);

let decor2 = new GrEasterDecor({ x: 6, z: 11, size: 1.0 });
world.add(decor2);

let decor3 = new GrEasterDecor({ x: -8, z: -12, size: 1.1 });
world.add(decor3);

// start animation
world.go();
