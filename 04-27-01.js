import * as T from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

let renderer = new T.WebGLRenderer({ antialias: true });
renderer.setSize(800, 600);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = T.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

let scene = new T.Scene();
scene.fog = new T.FogExp2(0x0a0a1a, 0.04);

let camera = new T.PerspectiveCamera(45, 800/600, 1, 1000);
camera.position.set(8, 8, 12); 
let controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

scene.add(new T.AmbientLight(0xffffff, 0.6)); 

let mainLight = new T.DirectionalLight(0xffffff, 1.8);
mainLight.position.set(10, 20, 10);
mainLight.castShadow = true;
scene.add(mainLight);

let mountainLight = new T.PointLight(0x88aaff, 1.2, 30);
mountainLight.position.set(-5, 5, -5);
scene.add(mountainLight);

let loader = new T.TextureLoader();
loader.load('./bg.jpg', texture => {
    scene.background = texture;
});

let groundSize = 22;
let segments = 128;
let groundGeom = new T.PlaneGeometry(groundSize, groundSize, segments, segments);
const vertices = groundGeom.attributes.position.array;
for (let i = 0; i < vertices.length; i += 3) {
    let x = vertices[i];
    let y = vertices[i + 1];
    let z = Math.sin(x * 0.6) * Math.cos(y * 0.6) * 1.2; 
    z += Math.sin(x * 2.0) * 0.15;
    vertices[i + 2] = z;
}
groundGeom.computeVertexNormals();

let groundMat = new T.MeshStandardMaterial({ 
    color: 0xffffff, 
    roughness: 0.5, 
    metalness: 0.1,
});
let ground = new T.Mesh(groundGeom, groundMat);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
ground.position.y = -1; 
scene.add(ground);

function createDrone(colorHex, emissiveColor) {
    let drone = new T.Group();
    let matMain = new T.MeshStandardMaterial({ color: colorHex, metalness: 0.8, roughness: 0.2 });
    let matDark = new T.MeshStandardMaterial({ color: 0x111111, metalness: 0.9 });
    
    let body = new T.Mesh(new T.SphereGeometry(0.5, 32, 16), matMain);
    body.scale.set(1.4, 0.25, 0.8);
    body.castShadow = true;
    drone.add(body);

    let stripeGeom = new T.BoxGeometry(0.8, 0.05, 0.1);
    let stripeMat = new T.MeshStandardMaterial({ color: emissiveColor, emissive: emissiveColor, emissiveIntensity: 2 });
    let s1 = new T.Mesh(stripeGeom, stripeMat); s1.position.set(0, 0, 0.35);
    let s2 = s1.clone(); s2.position.z = -0.35;
    drone.add(s1, s2);

    let headLight = new T.Mesh(
        new T.SphereGeometry(0.12),
        new T.MeshStandardMaterial({ color: emissiveColor, emissive: emissiveColor, emissiveIntensity: 5 })
    );
    headLight.position.set(0.65, 0, 0);
    drone.add(headLight);

    drone.propellers = [];
    const angles = [Math.PI/4, 3*Math.PI/4, 5*Math.PI/4, 7*Math.PI/4];
    angles.forEach(a => {
        let armGroup = new T.Group();
        armGroup.rotation.y = a;
        let arm = new T.Mesh(new T.BoxGeometry(0.8, 0.06, 0.12), matMain);
        arm.position.set(0.5, 0, 0);
        armGroup.add(arm);
        let motor = new T.Mesh(new T.CylinderGeometry(0.1, 0.1, 0.15, 16), matDark);
        motor.position.set(0.9, 0.05, 0);
        armGroup.add(motor);
        let prop = new T.Mesh(
            new T.BoxGeometry(0.8, 0.01, 0.06), 
            new T.MeshStandardMaterial({color: 0xffffff, transparent:true, opacity:0.7})
        );
        prop.position.set(0.9, 0.15, 0);
        armGroup.add(prop);
        drone.propellers.push(prop);
        drone.add(armGroup);
    });
    scene.add(drone);
    return drone;
}

function createRadar(x, z, beamColor) {
    let group = new T.Group();
    group.position.set(x, 0, z);
    let base = new T.Mesh(new T.CylinderGeometry(0.4, 0.5, 0.4), new T.MeshStandardMaterial({color: 0x222222}));
    group.add(base);
    let dishGroup = new T.Group();
    dishGroup.position.y = 0.4;
    let dish = new T.Mesh(new T.SphereGeometry(0.4, 16, 8, 0, Math.PI*2, 0, Math.PI/2), new T.MeshStandardMaterial({color: 0x444444, side: T.DoubleSide}));
    dish.rotation.x = -Math.PI/2;
    dishGroup.add(dish);
    let beam = new T.Mesh(new T.CylinderGeometry(0.01, 0.01, 30), new T.MeshStandardMaterial({color: beamColor, transparent:true, opacity:0.2, emissive:beamColor, emissiveIntensity:1}));
    beam.rotation.x = -Math.PI/2; beam.position.z = 15;
    dishGroup.add(beam);
    group.add(dishGroup);
    group.pointer = dishGroup;
    scene.add(group);
    return group;
}

let drone1 = createDrone(0xccffff, 0x00ffff);
let radar1 = createRadar(4, 4, 0x00ffff);
let drone2 = createDrone(0xffccff, 0xff00ff);
let radar2 = createRadar(-4, -4, 0xff00ff);

function animateLoop(ts) {
    let t = ts * 0.001;

    let x1 = Math.cos(t * 0.6) * 5;
    let z1 = Math.sin(t * 0.6) * 5;
    drone1.position.set(x1, 3.5 + Math.sin(t) * 0.6, z1);
    drone1.lookAt(Math.cos((t + 0.1) * 0.6) * 5, 3.5 + Math.sin(t + 0.1) * 0.6, Math.sin((t + 0.1) * 0.6) * 5);
    drone1.rotation.z = Math.sin(t * 0.6) * 0.3;

    let x2 = Math.sin(t) * 5;
    let z2 = Math.sin(t * 0.5) * 6;
    drone2.position.set(x2, 2.5, z2);
    drone2.lookAt(Math.sin(t + 0.1) * 5, 2.5, Math.sin((t + 0.1) * 0.5) * 6);
    drone2.rotation.z = Math.cos(t) * 0.4;

    [drone1, drone2].forEach(d => {
        d.propellers.forEach(p => p.rotation.y += 1.5);
    });

    radar1.pointer.lookAt(drone1.position);
    radar2.pointer.lookAt(drone2.position);

    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animateLoop);
}
requestAnimationFrame(animateLoop);