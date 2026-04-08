// Minimal OrbitControls type definition for Option B
import { Camera } from "./index";
export class OrbitControls {
  constructor(object: Camera, domElement?: HTMLElement);
  object: Camera;
  enabled: boolean;
  target: { set(x: number, y: number, z: number): void };
  keys: Record<string, number>;
  maxDistance: number;
  update(): void;
  saveState(): void;
  reset(): void;
}
