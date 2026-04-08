// @ts-check
import * as T from "https://unpkg.com/three@0.180.0/build/three.module.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { setupBasicScene } from "./04-19-01-helpers.js";

let wid = 670;
let ht = 500;
let renderer = new T.WebGLRenderer({ preserveDrawingBuffer: true, antialias: true });
renderer.setSize(wid, ht);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = T.PCFSoftShadowMap;

document.getElementById("museum_area").appendChild(renderer.domElement);
renderer.domElement.id = "canvas";

let scene = setupBasicScene();

let loader = new T.TextureLoader();
loader.load("./bg2.jpg", function (texture) {
    scene.background = texture;
});

let hemiLight = new T.HemisphereLight(0x4444ff, 0x440044, 1.5);
scene.add(hemiLight);

let globalPoint = new T.PointLight(0xffffff, 0.8, 20);
globalPoint.position.set(0, 5, 0);
scene.add(globalPoint);


let pulsarGroup = new T.Group();
let centerCore = new T.Mesh(new T.SphereGeometry(0.2, 32, 32), new T.MeshStandardMaterial({ color: 0xffffff, emissive: 0x00ffff, emissiveIntensity: 2 }));
let ringMat = new T.MeshStandardMaterial({ color: 0xffffff, metalness: 1, roughness: 0.1 });
let ring1 = new T.Mesh(new T.TorusGeometry(0.4, 0.015, 16, 100), ringMat);
let ring2 = ring1.clone(); ring2.rotation.x = Math.PI / 2;
pulsarGroup.add(centerCore, ring1, ring2); pulsarGroup.position.set(2, 1.4, 2); scene.add(pulsarGroup);

let knot = new T.Mesh(new T.TorusKnotGeometry(0.25, 0.08, 128, 16, 2, 3), new T.MeshStandardMaterial({ color: 0xffcc00, metalness: 1, roughness: 0.05, emissive: 0xff6600, emissiveIntensity: 0.5 }));
knot.position.set(-2, 1.4, 2); scene.add(knot);

let arrayGroup = new T.Group();
let boxMat = new T.MeshStandardMaterial({ color: 0x00ff88, emissive: 0x00ff88, emissiveIntensity: 1.2, metalness: 1, roughness: 0 });
for (let i = 0; i < 8; i++) {
    let box = new T.Mesh(new T.BoxGeometry(0.12, 0.12, 0.12), boxMat);
    box.userData.offset = i * (Math.PI / 4); arrayGroup.add(box);
}
arrayGroup.position.set(2, 1.4, -2); scene.add(arrayGroup);


const particleCount = 5000;
const particleGeometry = new T.BufferGeometry();
const positions = new Float32Array(particleCount * 3);
const initialPositions = new Float32Array(particleCount * 3); 

for (let i = 0; i < particleCount; i++) {
    let r = Math.random() * 0.5;
    let theta = Math.random() * Math.PI * 2;
    let phi = Math.random() * Math.PI;
    
    let x = r * Math.sin(phi) * Math.cos(theta);
    let y = r * Math.sin(phi) * Math.sin(theta);
    let z = r * Math.cos(phi);

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
    
    initialPositions[i * 3] = x;
    initialPositions[i * 3 + 1] = y;
    initialPositions[i * 3 + 2] = z;
}

particleGeometry.setAttribute('position', new T.BufferAttribute(positions, 3));
const particleMaterial = new T.PointsMaterial({
    color: 0xaa00ff,
    size: 0.015,
    transparent: true,
    opacity: 0.9,
    blending: T.AdditiveBlending
});

const flowCloud = new T.Points(particleGeometry, particleMaterial);
const flowGroup = new T.Group();
flowGroup.add(flowCloud);
flowGroup.position.set(-2, 1.4, -2);
scene.add(flowGroup);

function addTechSpotlight(x, z, target, color) {
    let spot = new T.SpotLight(color, 8, 12, Math.PI / 10, 0.5);
    spot.position.set(x, 4.8, z); spot.target = target;
    spot.castShadow = true; scene.add(spot); scene.add(spot.target);
}
addTechSpotlight(2, 2, pulsarGroup, 0x00ffff);
addTechSpotlight(-2, 2, knot, 0xffaa00);
addTechSpotlight(-2, -2, flowGroup, 0xaa00ff);
addTechSpotlight(2, -2, arrayGroup, 0x00ff00);

let main_camera = new T.PerspectiveCamera(60, wid / ht, 1, 100);
main_camera.position.set(0, 5, 8);
let active_camera = main_camera;

let camPositions = [
    { x: 4, y: 3, z: 4, look: pulsarGroup.position },
    { x: -4, y: 3, z: 4, look: knot.position },
    { x: -4, y: 3, z: -4, look: flowGroup.position },
    { x: 4, y: 3, z: -4, look: arrayGroup.position }
];
let cams = camPositions.map(p => {
    let c = new T.PerspectiveCamera(60, wid / ht, 0.1, 100);
    c.position.set(p.x, p.y, p.z); c.lookAt(p.look); return c;
});

let controls = new OrbitControls(main_camera, renderer.domElement);
function setupCamButton(name, cam) {
    const btn = document.getElementById(name);
    if (btn) btn.onclick = () => { active_camera = cam; };
}
setupCamButton("main_cam", main_camera);
setupCamButton("cam_1", cams[0]); setupCamButton("cam_2", cams[1]);
setupCamButton("cam_3", cams[2]); setupCamButton("cam_4", cams[3]);


let lastTimestamp = 0;
function animate(timestamp) {
    let timeDelta = 0.001 * (lastTimestamp ? timestamp - lastTimestamp : 0);
    lastTimestamp = timestamp;
    let t = timestamp * 0.001;

    ring1.rotation.y += timeDelta * 4;
    ring2.rotation.z += timeDelta * 3;
    centerCore.scale.setScalar(1 + Math.sin(t * 6) * 0.25);
    pulsarGroup.position.y = 1.45 + Math.sin(t * 2.5) * 0.15;

    knot.rotation.y += timeDelta * 0.8;
    knot.rotation.z += timeDelta * 0.5;
    knot.material.emissiveIntensity = 0.6 + Math.sin(t * 4) * 0.4;
    knot.position.y = 1.45 + Math.cos(t * 2) * 0.1;

    arrayGroup.children.forEach((b, i) => {
        let angle = t * 2.5 + b.userData.offset;
        b.position.set(Math.cos(angle) * 0.45, Math.sin(angle * 2) * 0.15, Math.sin(angle) * 0.45);
        b.rotation.y += 0.1;
    });
    arrayGroup.position.y = 1.45 + Math.sin(t * 2.2) * 0.1;

    const posAttr = particleGeometry.attributes.position;
    for (let i = 0; i < particleCount; i++) {
        let ix = initialPositions[i * 3];
        let iy = initialPositions[i * 3 + 1];
        let iz = initialPositions[i * 3 + 2];

        let angle = t + (iy * 4); 
        let currentX = ix * Math.cos(angle) - iz * Math.sin(angle);
        let currentZ = ix * Math.sin(angle) + iz * Math.cos(angle);
        let currentY = iy + Math.sin(t * 2 + ix * 10) * 0.1;

        posAttr.setXYZ(i, currentX, currentY, currentZ);
    }
    posAttr.needsUpdate = true;
    flowCloud.rotation.y += timeDelta * 0.5;
    flowGroup.position.y = 1.45 + Math.sin(t * 1.5) * 0.1;

    if (active_camera === main_camera) controls.update();
    renderer.render(scene, active_camera);
    window.requestAnimationFrame(animate);
}
window.requestAnimationFrame(animate);
