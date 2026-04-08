// @ts-check

/**
 * CS559 3D World Framework Code
 *
 * Helpers for creating text sprite labels and attaching them to GrObjects.
 *
 * @module label
 */

import * as T from "https://unpkg.com/three@0.180.0/build/three.module.js";

/**
 * Build a sprite label by drawing text to a canvas and using it as a texture.
 *
 * @param {string} text
 * @returns {T.Sprite}
 */
export function makeLabel(text) {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 64;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Unable to create 2D context for label sprite.");
  }

  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "#666";
  ctx.strokeRect(0.5, 0.5, canvas.width - 1, canvas.height - 1);
  ctx.fillStyle = "#222";
  ctx.font = "28px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);

  const tex = new T.CanvasTexture(canvas);
  tex.colorSpace = T.SRGBColorSpace;
  const mat = new T.SpriteMaterial({ map: tex, transparent: true });
  const sprite = new T.Sprite(mat);
  sprite.scale.set(1.85, 0.46, 1);
  return sprite;
}

/**
 * Create and add a label above a GrObject.
 *
 * If `offset` is not provided, the y-offset is estimated from the object's
 * bounding-box height.
 *
 * @param {import("./GrObject.js").GrObject} grObject
 * @param {string} labelText
 * @param {T.Vector3 | number} [offset]
 * @returns {T.Sprite}
 */
export function addLabelToGrObject(grObject, labelText, offset) {
  if (!grObject.objects.length) {
    throw new Error("Cannot add label: GrObject has no root objects.");
  }

  const bbox = new T.Box3();
  grObject.objects.forEach((obj) => bbox.expandByObject(obj));

  const center = bbox.getCenter(new T.Vector3());
  const size = bbox.getSize(new T.Vector3());

  let offsetVec;
  if (offset instanceof T.Vector3) {
    offsetVec = offset.clone();
  } else if (typeof offset === "number") {
    offsetVec = new T.Vector3(0, offset, 0);
  } else {
    offsetVec = new T.Vector3(0, Math.max(0.25, size.y * 0.15), 0);
  }

  const label = makeLabel(labelText);
  label.position.set(
    center.x + offsetVec.x,
    bbox.max.y + offsetVec.y,
    center.z + offsetVec.z
  );

  grObject.objects.push(label);
  return label;
}
