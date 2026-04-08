// Ambient module declarations for three examples/addons paths used in workbook code.
// Keep these permissive for JS teaching code while still enabling module resolution.

declare module "three/examples/jsm/libs/lil-gui.module.min.js" {
  export class GUI {
    constructor(options?: any);
    domElement: any;
    addFolder(name: string): GUI;
    add(obj: any, prop: string, ...args: any[]): any;
    close(): void;
    open(): void;
  }
}

declare module "three/examples/jsm/controls/FlyControls.js" {
  export class FlyControls {
    constructor(object: any, domElement?: any);
    object: any;
    enabled: boolean;
    dragToLook: boolean;
    rollSpeed: number;
    connect(): void;
    disconnect(): void;
    update(dt: number): void;
    saveState?(): void;
    reset?(): void;
  }
}

declare module "three/examples/jsm/controls/TransformControls.js" {
  export class TransformControls {
    constructor(camera: any, domElement?: any);
    attach(object: any): void;
    detach(): void;
    setMode(mode: string): void;
    setSpace(space: string): void;
    setSize(size: number): void;
  }
}

declare module "three/examples/jsm/controls/PointerLockControls.js" {
  export class PointerLockControls {
    constructor(camera: any, domElement?: any);
    isLocked: boolean;
    lock(unadjustedMovement?: boolean): void;
    unlock(): void;
    moveForward(distance: number): void;
    moveRight(distance: number): void;
  }
}

declare module "three/examples/jsm/helpers/VertexNormalsHelper.js" {
  export class VertexNormalsHelper {
    constructor(object: any, size?: number, color?: any, linewidth?: number);
    update(): void;
  }
}

declare module "three/examples/jsm/loaders/OBJLoader.js" {
  export class OBJLoader {
    setMaterials(materials: any): this;
    load(url: string, onLoad: (obj: any) => void, onProgress?: (e: any) => void, onError?: (e: any) => void): void;
    loadAsync(url: string, onProgress?: (e: any) => void): Promise<any>;
    parse(data: string | ArrayBuffer): any;
  }
}

declare module "three/examples/jsm/loaders/MTLLoader.js" {
  export class MTLLoader {
    setMaterialOptions(options: any): this;
    load(url: string, onLoad: (materials: any) => void, onProgress?: (e: any) => void, onError?: (e: any) => void): void;
  }
}

declare module "three/examples/jsm/loaders/FBXLoader.js" {
  export class FBXLoader {
    load(url: string, onLoad: (obj: any) => void, onProgress?: (e: any) => void, onError?: (e: any) => void): void;
    loadAsync(url: string, onProgress?: (e: any) => void): Promise<any>;
  }
}

declare module "three/examples/jsm/loaders/GLTFLoader.js" {
  export class GLTFLoader {
    setDRACOLoader(loader: any): this;
    setKTX2Loader(loader: any): this;
    setMeshoptDecoder(decoder: any): this;
    load(url: string, onLoad: (gltf: any) => void, onProgress?: (e: any) => void, onError?: (e: any) => void): void;
    loadAsync(url: string, onProgress?: (e: any) => void): Promise<any>;
    parse(data: ArrayBuffer | string, path: string, onLoad: (gltf: any) => void, onError?: (e: any) => void): void;
  }
}

declare module "three/examples/jsm/loaders/DRACOLoader.js" {
  export class DRACOLoader {
    setDecoderPath(path: string): this;
    setDecoderConfig(config: any): this;
    preload(): this;
    dispose(): this;
  }
}

declare module "three/examples/jsm/loaders/KTX2Loader.js" {
  export class KTX2Loader {
    setTranscoderPath(path: string): this;
    detectSupport(renderer: any): this;
    dispose(): this;
  }
}

declare module "three/examples/jsm/loaders/RGBELoader.js" {
  export class RGBELoader {
    setDataType(type: number): this;
    load(url: string, onLoad: (texture: any) => void, onProgress?: (e: any) => void, onError?: (e: any) => void): void;
  }
}

declare module "three/examples/jsm/loaders/EXRLoader.js" {
  export class EXRLoader {
    setDataType(type: number): this;
    load(url: string, onLoad: (texture: any) => void, onProgress?: (e: any) => void, onError?: (e: any) => void): void;
  }
}

declare module "three/examples/jsm/loaders/STLLoader.js" {
  export class STLLoader {
    load(url: string, onLoad: (geometry: any) => void, onProgress?: (e: any) => void, onError?: (e: any) => void): void;
    parse(data: ArrayBuffer): any;
  }
}

declare module "three/examples/jsm/loaders/PLYLoader.js" {
  export class PLYLoader {
    load(url: string, onLoad: (geometry: any) => void, onProgress?: (e: any) => void, onError?: (e: any) => void): void;
    parse(data: string | ArrayBuffer): any;
    setPropertyNameMapping(mapping: Record<string, string>): this;
  }
}

declare module "three/examples/jsm/loaders/ColladaLoader.js" {
  export class ColladaLoader {
    load(url: string, onLoad: (collada: any) => void, onProgress?: (e: any) => void, onError?: (e: any) => void): void;
  }
}

declare module "three/examples/jsm/loaders/FontLoader.js" {
  export class FontLoader {
    load(url: string, onLoad: (font: any) => void, onProgress?: (e: any) => void, onError?: (e: any) => void): void;
    parse(json: any): any;
  }
}

declare module "three/examples/jsm/webxr/VRButton.js" {
  export class VRButton {
    static createButton(renderer: any, options?: any): HTMLElement;
  }
}

declare module "three/examples/jsm/webxr/ARButton.js" {
  export class ARButton {
    static createButton(renderer: any, sessionInit?: any): HTMLElement;
  }
}

declare module "three/examples/jsm/webxr/XRControllerModelFactory.js" {
  export class XRControllerModelFactory {
    createControllerModel(controllerGrip: any): any;
  }
}

declare module "three/examples/jsm/nodes/Nodes.js" {
  export * from "three/tsl";
}

declare module "three/tsl" {
  export type TSLNode = any;
  export const Fn: any;
  export const If: any;
  export const Loop: any;
  export const uniform: any;
  export const varying: any;
  export const attribute: any;
  export const texture: any;
  export const float: any;
  export const vec2: any;
  export const vec3: any;
  export const vec4: any;
  export const color: any;
  export const uv: any;
  export const normalWorld: any;
  export const positionWorld: any;
  export const modelWorldMatrix: any;
  export const cameraPosition: any;
  export const time: any;
}

declare module "three/webgpu" {
  export * from "three";
  export class WebGPURenderer {
    constructor(parameters?: any);
    domElement: HTMLCanvasElement;
    setPixelRatio(value: number): void;
    setSize(width: number, height: number, updateStyle?: boolean): void;
    setAnimationLoop(callback: ((time: number) => void) | null): void;
    render(scene: any, camera: any): void;
  }
}
