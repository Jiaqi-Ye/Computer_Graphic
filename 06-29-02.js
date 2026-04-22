// @ts-check

import * as T from "three";
import { GrWorld } from "CS559-Framework/GrWorld.js";
import { GrObject } from "CS559-Framework/GrObject.js";
import * as InputHelpers from "CS559/inputHelpers.js";
import * as SimpleObjects from "CS559-Framework/SimpleObjects.js";
import { shaderMaterial } from "CS559-Framework/shaderHelper.js";

{
  let mydiv = document.getElementById("div1");

  let world = await GrWorld.new({
    width: mydiv ? 600 : 800,
    where: mydiv,
    webgpu: false,
    groundplanecolor: "lightgray",
  });

  let sphereMat = shaderMaterial("./06-29-02.vs", "./06-29-02.fs", {
    side: T.DoubleSide,
    uniforms: {
      time: { value: 0.0 },
      energy: { value: 1.0 },
      bands: { value: 10.0 },
      isPlane: { value: 0.0 },
    },
  });

  let planeMat = shaderMaterial("./06-29-02.vs", "./06-29-02.fs", {
    side: T.DoubleSide,
    uniforms: {
      time: { value: 0.0 },
      energy: { value: 1.0 },
      bands: { value: 10.0 },
      isPlane: { value: 1.0 },
    },
  });

  let s1 = new InputHelpers.LabelSlider("energy", {
    width: 400,
    min: 0.2,
    max: 1.8,
    step: 0.01,
    initial: 1.0,
    where: mydiv,
  });

  let s2 = new InputHelpers.LabelSlider("bands", {
    width: 400,
    min: 4.0,
    max: 24.0,
    step: 0.1,
    initial: 10.0,
    where: mydiv,
  });

  function onchange() {
    let e = s1.value();
    let b = s2.value();
    sphereMat.uniforms.energy.value = e;
    planeMat.uniforms.energy.value = e;
    sphereMat.uniforms.bands.value = b;
    planeMat.uniforms.bands.value = b;
  }

  s1.oninput = onchange;
  s2.oninput = onchange;
  onchange();

  let sphere = new SimpleObjects.GrSphere({
    x: -2.0,
    y: 1.1,
    material: sphereMat,
    widthSegments: 80,
    heightSegments: 50,
  });

  let planeMesh = new T.Mesh(new T.PlaneGeometry(3.0, 3.0, 180, 180), planeMat);
  planeMesh.position.set(2.0, 1.1, 0.0);
  planeMesh.rotation.y = -0.25;

  let planeObj = new GrObject("plasma-plane", planeMesh);

  world.add(sphere);
  world.add(planeObj);

  const clock = new T.Clock();
  function tick() {
    const t = clock.getElapsedTime();
    sphereMat.uniforms.time.value = t;
    planeMat.uniforms.time.value = t;
    sphere.objects[0].rotation.y = t * 0.25;
    sphere.objects[0].rotation.x = 0.15 * Math.sin(t * 0.4);
    requestAnimationFrame(tick);
  }

  tick();
  world.go();
}

// 2026 Workbook
