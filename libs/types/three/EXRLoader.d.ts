declare module "three/addons/loaders/EXRLoader.js" {
  import { DataTextureLoader, LoadingManager } from "three";

  export class EXRLoader extends DataTextureLoader {
    constructor(manager?: LoadingManager);
    setDataType(type: number): this;
  }
}
