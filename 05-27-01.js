// @ts-check

import * as T from "three";
import { GrWorld } from "CS559-Framework/GrWorld.js";
import { GrLowPolyTree, ProGableRoofHouse, GrStripedStore, GrChurch } from "./05-27-01-buildings.js";

const world = new GrWorld({
    groundplanesize: 15,
    groundplanecolor: "#55a630", 
    lookfrom: new T.Vector3(15, 15, 20),
});

// Cartoon-style vibrant lighting
world.scene.background = new T.Color("#87ceeb");
world.scene.fog = new T.Fog("#87ceeb", 25, 70);

const dirLight = new T.DirectionalLight(0xffffff, 1.4);
dirLight.position.set(20, 30, 15);
dirLight.castShadow = true;
dirLight.shadow.mapSize.set(2048, 2048);
dirLight.shadow.camera.near = 1;
dirLight.shadow.camera.far = 100;
dirLight.shadow.camera.left = -20;
dirLight.shadow.camera.right = 20;
dirLight.shadow.camera.top = 20;
dirLight.shadow.camera.bottom = -20;
world.scene.add(dirLight);

const ambientLight = new T.AmbientLight(0xffffff, 0.7);
world.scene.add(ambientLight);

const hemiLight = new T.HemisphereLight(0xcae9ff, 0x55a630, 0.5);
world.scene.add(hemiLight);

const pathMat = new T.MeshStandardMaterial({ 
    color: "#dfc08a", 
    roughness: 0.8, 
    flatShading: true 
});

const riverMat = new T.MeshPhongMaterial({ 
    color: "#00b4d8", 
    transparent: true, 
    opacity: 0.85, 
    shininess: 100,
    side: T.DoubleSide
});

function createOrganicPath(w, l, x, z, ry = 0) {
    const geom = new T.BoxGeometry(w, 0.1, l);
    const mesh = new T.Mesh(geom, pathMat);
    mesh.position.set(x, 0.05, z);
    mesh.rotation.y = ry;
    mesh.rotation.z = (Math.random() - 0.5) * 0.01;
    mesh.receiveShadow = true;
    world.scene.add(mesh);
}

createOrganicPath(26, 1.2, 0, -3.2, 0.02);
createOrganicPath(26, 1.1, 0, 4.3, -0.01);
createOrganicPath(1.2, 26, -4.2, 0, 0.01);
createOrganicPath(1.1, 26, 5.1, 0, -0.02);

function createCurvyRiver(points, width, yPos) {
    const curve = new T.CatmullRomCurve3(points);
    const shape = new T.Shape();
    const curvePoints = curve.getPoints(80);
    
    const leftPoints = [];
    const rightPoints = [];
    
    curvePoints.forEach((p, i) => {
        const tangent = curve.getTangentAt(i / curvePoints.length);
        const normal = new T.Vector3(-tangent.z, 0, tangent.x).normalize();
        const w = width * (0.8 + Math.random() * 0.3);
        leftPoints.push(new T.Vector2(p.x + normal.x * w/2, p.z + normal.z * w/2));
        rightPoints.push(new T.Vector2(p.x - normal.x * w/2, p.z - normal.z * w/2));
    });
    
    shape.moveTo(leftPoints[0].x, leftPoints[0].y);
    leftPoints.forEach(p => shape.lineTo(p.x, p.y));
    for (let i = rightPoints.length - 1; i >= 0; i--) {
        shape.lineTo(rightPoints[i].x, rightPoints[i].y);
    }
    
    const mesh = new T.Mesh(new T.ShapeGeometry(shape), riverMat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = yPos;
    mesh.receiveShadow = true;
    world.scene.add(mesh);
}

createCurvyRiver([
    new T.Vector3(-15, 0, -10),
    new T.Vector3(-5, 0, -6),
    new T.Vector3(2, 0, -11),
    new T.Vector3(15, 0, -8)
], 2.2, 0.02);

const addBuilding = (Type, x, z, name, rot = 0) => {
    const b = new Type(name);
    b.objects[0].position.set(x, 0, z);
    b.objects[0].rotation.y = rot;
    b.objects[0].castShadow = true;
    b.objects[0].receiveShadow = true;
    world.add(b);
};

addBuilding(GrChurch, -8, 1, "Church1", Math.PI/12);
addBuilding(GrStripedStore, 8, 2.5, "Store1", -Math.PI/8);
addBuilding(ProGableRoofHouse, 0.5, 0.5, "House1");

for (let i = 0; i < 65; i++) {
    const x = (Math.random() - 0.5) * 28;
    const z = (Math.random() - 0.5) * 28;
    
    const distToRoadH1 = Math.abs(z + 3.2);
    const distToRoadH2 = Math.abs(z - 4.3);
    const distToRoadV1 = Math.abs(x + 4.2);
    const distToRoadV2 = Math.abs(x - 5.1);
    const onRoad = Math.min(distToRoadH1, distToRoadH2, distToRoadV1, distToRoadV2) < 1.4;
    
    const nearRiver = z < -5 && z > -13;

    if (!onRoad && (Math.abs(x) > 2.5 || Math.abs(z) > 2.5)) {
        let spawnChance = 0.25; 
        if (nearRiver) spawnChance = 0.75;

        if (Math.random() < spawnChance) {
            const tree = new GrLowPolyTree(`Tree${i}`, x, z);
            const scale = 0.8 + Math.random() * 0.7;
            tree.objects[0].scale.set(scale, scale, scale);
            tree.objects[0].rotation.y = Math.random() * Math.PI;
            world.add(tree);
        }
    } 
} 

world.go();