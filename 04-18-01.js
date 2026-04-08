// @ts-check
import * as T from "https://unpkg.com/three@0.180.0/build/three.module.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

let renderer = new T.WebGLRenderer({ preserveDrawingBuffer: true, antialias: true });
renderer.setSize(500, 500);
renderer.shadowMap.enabled = true;
document.getElementById("div1").appendChild(renderer.domElement);

let scene = new T.Scene();
let loader = new T.TextureLoader();
loader.load("./bg.jpg", (t) => {
    t.wrapS = T.RepeatWrapping;
    t.wrapT = T.RepeatWrapping;
    t.offset.set(0, -0.15);
    scene.background = t;
});

let camera = new T.PerspectiveCamera(75, 1, 0.1, 1000);
camera.position.set(0, 4.5, 9.5);
let controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 3.5, 0);
controls.update();

scene.add(new T.AmbientLight(0xffffff, 0.9));
let dirLight = new T.DirectionalLight(0xffffff, 1.5);
dirLight.position.set(6, 14, 10);
dirLight.castShadow = true;
dirLight.shadow.mapSize.width = 2048;
dirLight.shadow.mapSize.height = 2048;
scene.add(dirLight);
scene.add(new T.DirectionalLight(0x99ccff, 0.6));

const snowMat = new T.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8 });
const scarfMat = new T.MeshStandardMaterial({ color: 0xc62828, roughness: 0.4, metalness: 0.3 });
const carrotMat = new T.MeshStandardMaterial({ color: 0xff7f11, roughness: 0.4 });
const charcoalMat = new T.MeshStandardMaterial({ color: 0x000000, roughness: 0.7 });
const leafGreenMat = new T.MeshStandardMaterial({ color: 0x3cb371, roughness: 0.6 });
const hatMat = new T.MeshStandardMaterial({ color: 0x222222, roughness: 0.2, metalness: 0.7 });
const rabbitMat = new T.MeshStandardMaterial({ color: 0xe0e0e0, roughness: 0.8 });

let groundGeo = new T.CircleGeometry(6, 65);
let groundMat = new T.MeshStandardMaterial({ color: 0xffffff, roughness: 0.7 });
let ground = new T.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.25;
ground.receiveShadow = true;
scene.add(ground);

let snowman = new T.Group();
let bodyBottom = new T.Mesh(new T.SphereGeometry(1.5, 32, 32), snowMat); bodyBottom.position.y = 1.5; bodyBottom.castShadow = true; snowman.add(bodyBottom);
let bodyMid = new T.Mesh(new T.SphereGeometry(1.1, 32, 32), snowMat); bodyMid.position.y = 3.6; bodyMid.castShadow = true; snowman.add(bodyMid);
let head = new T.Mesh(new T.SphereGeometry(0.8, 32, 32), snowMat); head.position.y = 5.1; head.castShadow = true; snowman.add(head);

let hatBrim = new T.Mesh(new T.CylinderGeometry(0.9, 0.9, 0.1, 32), hatMat); hatBrim.position.y = 5.9; snowman.add(hatBrim);
let hatTop = new T.Mesh(new T.CylinderGeometry(0.5, 0.5, 1.0, 32), hatMat); hatTop.position.y = 6.5; snowman.add(hatTop);

let leftArm = new T.Mesh(new T.CylinderGeometry(0.04, 0.04, 2.2), new T.MeshStandardMaterial({ color: 0x6d4c41, roughness: 0.2, metalness: 0.6 }));
leftArm.position.set(1.3, 3.8, 0); leftArm.rotation.z = -Math.PI / 3.5; snowman.add(leftArm);
let rightArm = leftArm.clone(); rightArm.position.x = -1.3; rightArm.rotation.z = Math.PI / 3.5; snowman.add(rightArm);

let scarfNeck = new T.Mesh(new T.TorusGeometry(0.8, 0.16, 16, 100), scarfMat); scarfNeck.position.y = 4.5; scarfNeck.rotation.x = Math.PI / 2; snowman.add(scarfNeck);

let scarfGroup = new T.Group();
let scarfMain = new T.Mesh(new T.BoxGeometry(0.35, 2.2, 0.12), scarfMat); scarfMain.position.set(0.55, 3.6, 1.15); scarfGroup.add(scarfMain);
let scarfLayer = new T.Mesh(new T.BoxGeometry(0.28, 1.8, 0.1), scarfMat); scarfLayer.position.set(0.25, 3.7, 1.25); scarfGroup.add(scarfLayer);
for (let i = 0; i < 6; i++) {
    let fringe1 = new T.Mesh(new T.BoxGeometry(0.04, 0.8, 0.04), scarfMat);
    fringe1.position.set(0.55 + (i - 2.5) * 0.06, 2.5, 1.15); scarfGroup.add(fringe1);
    let fringe2 = new T.Mesh(new T.BoxGeometry(0.04, 0.8, 0.04), scarfMat);
    fringe2.position.set(0.25 + (i - 2.5) * 0.06, 2.7, 1.25); scarfGroup.add(fringe2);
}
snowman.add(scarfGroup);

let nose = new T.Mesh(new T.ConeGeometry(0.12, 0.6, 16), carrotMat); nose.position.set(0, 5.1, 0.85); nose.rotation.x = Math.PI / 2; snowman.add(nose);
let eyeL = new T.Mesh(new T.SphereGeometry(0.08, 12, 12), charcoalMat); eyeL.position.set(0.25, 5.3, 0.7); snowman.add(eyeL);
let eyeR = eyeL.clone(); eyeR.position.x = -0.25; snowman.add(eyeR);

let mouthGroup = new T.Group();
for (let i = -2; i <= 2; i++) {
    let m = new T.Mesh(new T.SphereGeometry(0.05, 12, 12), charcoalMat);
    m.position.set(i * 0.12, 4.85, 0.7);
    mouthGroup.add(m);
}
snowman.add(mouthGroup);

for (let i = 0; i < 5; i++) {
    let b = new T.Mesh(new T.SphereGeometry(0.12, 12, 12), charcoalMat);
    b.position.set(0, 4.0 - i * 0.5, 0.95);
    snowman.add(b);
}
scene.add(snowman);

function createRabbit() {
    let rabbit = new T.Group();
    let scale = 0.8 + Math.random() * 0.4;
    rabbit.scale.set(scale, scale, scale);

    let body = new T.Mesh(new T.SphereGeometry(0.6, 24, 24), rabbitMat);
    body.scale.set(1.3, 1, 2.2); rabbit.add(body);
    let rHead = new T.Mesh(new T.SphereGeometry(0.35, 24, 24), rabbitMat); rHead.position.set(0, 0.5, 1.1); rabbit.add(rHead);

    let eyeColor = new T.MeshStandardMaterial({ color: 0x000000 });
    let eyeR1 = new T.Mesh(new T.SphereGeometry(0.05), eyeColor); eyeR1.position.set(0.15, 0.6, 1.35); rabbit.add(eyeR1);
    let eyeR2 = eyeR1.clone(); eyeR2.position.x = -0.15; rabbit.add(eyeR2);

    function createEar() {
        let pts = [new T.Vector2(0,0), new T.Vector2(0.12,0.25), new T.Vector2(0.14,0.55), new T.Vector2(0.08,0.85), new T.Vector2(0.02,1)];
        return new T.Mesh(new T.LatheGeometry(pts, 12), leafGreenMat);
    }
    let ear1 = createEar(); ear1.scale.set(0.9,0.9,0.9); ear1.position.set(0.12,0.7,1.05); ear1.rotation.z=-0.4; ear1.rotation.x=0.25; rabbit.add(ear1);
    let ear2 = createEar(); ear2.scale.set(0.9,0.9,0.9); ear2.position.set(-0.12,0.7,1.05); ear2.rotation.z=0.4; ear2.rotation.x=0.25; rabbit.add(ear2);

    let tail = new T.Mesh(new T.SphereGeometry(0.15), rabbitMat); tail.position.set(0,0.3,-1.1); rabbit.add(tail);

    rabbit.rotation.y = 0;

    return rabbit;
}

for (let i = 0; i < 6; i++) {
    let r = createRabbit();
    let angle = (i / 6) * Math.PI * 2;
    let radius = 3 + Math.random() * 0.5;
    r.position.set(Math.cos(angle) * radius, 0.2, Math.sin(angle) * radius);
    r.rotation.y = 0;
    scene.add(r);
}

let clock = new T.Clock();
function animate() {
    requestAnimationFrame(animate);
    let t = clock.getElapsedTime();
    snowman.position.y = 0.05 * Math.sin(t * 2);
    leftArm.rotation.z = -Math.PI / 3.5 + 0.3 * Math.sin(t * 3);
    rightArm.rotation.z = Math.PI / 3.5 - 0.3 * Math.sin(t * 3);

    controls.update();
    renderer.render(scene, camera);
}
animate();
