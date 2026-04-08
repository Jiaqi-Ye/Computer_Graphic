// @ts-check

import * as T from "three";
import { GrWorld } from "CS559-Framework/GrWorld.js";
import { GrObject } from "CS559-Framework/GrObject.js";

let parentOfCanvas = document.getElementById("div1");
let world = new GrWorld({
    where: parentOfCanvas,
    groundplane: false,
    background: "black",
    lookfrom: new T.Vector3(5, 3.2, 7),
    lookat: new T.Vector3(1, 0.6, 0),
});

// Ensure consistent color output for textures.
if (world.renderer && "outputColorSpace" in world.renderer) {
    world.renderer.outputColorSpace = T.SRGBColorSpace;
}

// Add a little direct light so the object is visible even if envMap fails.
const hemi = new T.HemisphereLight(0xffffff, 0x333333, 0.4);
world.scene.add(hemi);
const dir = new T.DirectionalLight(0xffffff, 0.6);
dir.position.set(3, 5, 2);
world.scene.add(dir);

const textureLoader = new T.TextureLoader();

// Additional maps for the advanced requirement (combined with env map).
const baseColor = textureLoader.load("../textures/simple/check_16x16.png");
baseColor.colorSpace = T.SRGBColorSpace;
baseColor.wrapS = T.RepeatWrapping;
baseColor.wrapT = T.RepeatWrapping;
baseColor.repeat.set(2, 2);

const normalMap = textureLoader.load("../images/normal-map2.jpg");
normalMap.wrapS = T.RepeatWrapping;
normalMap.wrapT = T.RepeatWrapping;
normalMap.repeat.set(2, 2);

const roughnessMap = textureLoader.load("../textures/simple/check_16x16.png");
roughnessMap.wrapS = T.RepeatWrapping;
roughnessMap.wrapT = T.RepeatWrapping;
roughnessMap.repeat.set(2, 2);

class EnvTorus extends GrObject {
    constructor(envMap) {
        const geom = new T.TorusKnotGeometry(0.7, 0.25, 200, 32);
        const mat = new T.MeshStandardMaterial({
            metalness: 1.0,
            roughness: 0.05,
            envMap: envMap,
            envMapIntensity: 2.0,
        });
        const mesh = new T.Mesh(geom, mat);
        mesh.position.set(-0.6, 0.5, 0.2);
        super("EnvTorus", mesh);
        this.mesh = mesh;
    }

    update(delta) {
        const speed = delta ? delta / 1000 : 0.016;
        this.mesh.rotateY(speed * 0.6);
        this.mesh.rotateX(speed * 0.2);
    }
}

class EnvSphere extends GrObject {
    constructor(envMap) {
        const geom = new T.SphereGeometry(0.55, 48, 32);
        const mat = new T.MeshStandardMaterial({
            map: baseColor,
            normalMap: normalMap,
            roughnessMap: roughnessMap,
            metalness: 0.6,
            roughness: 0.35,
            envMap: envMap,
            envMapIntensity: 1.2,
        });
        const mesh = new T.Mesh(geom, mat);
        mesh.position.set(2.8, 0.6, -1.4);
        super("EnvSphere", mesh);
        this.mesh = mesh;
    }
}

// Load environment map (evn2.jpg) and apply it to scene + object.
textureLoader.load(
    "../images/evn2.jpg",
    (envMap) => {
        envMap.mapping = T.EquirectangularReflectionMapping;
        envMap.colorSpace = T.SRGBColorSpace;
        world.scene.environment = envMap;
        world.scene.background = envMap;
        world.add(new EnvTorus(envMap));
        world.add(new EnvSphere(envMap));
    }
);

world.go();

// 2026 Workbook
