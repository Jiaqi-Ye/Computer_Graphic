import * as T from "three";
import { GrWorld } from "CS559-Framework/GrWorld.js";
import { GrObject } from "CS559-Framework/GrObject.js";

const bodyMat = new T.MeshPhongMaterial({ shininess: 25, flatShading: true });
const wheelMat = new T.MeshPhongMaterial({ color: "#222222", shininess: 0, flatShading: true });
const windowMat = new T.MeshPhongMaterial({
    color: "#8fd8ff",
    transparent: true,
    opacity: 0.85,
    flatShading: true
});
const wheelCapMat = new T.MeshPhongMaterial({ color: "#8b8f96", shininess: 5, flatShading: true });

function makeSchoolBusSignTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 64;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.fillStyle = "#1d1d1d";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = "bold 42px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#ffffff";
    ctx.fillText("SCHOOL BUS", canvas.width / 2, canvas.height / 2 + 1);
    const tex = new T.CanvasTexture(canvas);
    tex.wrapS = T.ClampToEdgeWrapping;
    tex.wrapT = T.ClampToEdgeWrapping;
    return tex;
}

function makeSchoolBusSideTextTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = 768;
    canvas.height = 160;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const label = "SCHOOL BUS";
    // Fit text to canvas to avoid clipping on both sides.
    let fontSize = 100;
    do {
        ctx.font = `900 ${fontSize}px Arial`;
        fontSize -= 2;
    } while (ctx.measureText(label).width > canvas.width * 0.86 && fontSize > 40);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    // Solid bold black text.
    ctx.fillStyle = "#000000";
    ctx.fillText(label, cx, cy);
    const tex = new T.CanvasTexture(canvas);
    tex.wrapS = T.ClampToEdgeWrapping;
    tex.wrapT = T.ClampToEdgeWrapping;
    return tex;
}

function makeCargoPrintTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.fillStyle = "#d6f2f4";
    ctx.fillRect(0, 0, 256, 256);
    ctx.fillStyle = "#c86a5a";
    ctx.fillRect(0, 0, 256, 12);
    ctx.fillRect(0, 244, 256, 12);
    ctx.fillStyle = "#5bb7b1";
    for (let x = -26; x < 300; x += 38) {
        ctx.fillRect(x, 90, 16, 74);
    }
    ctx.fillStyle = "#e9f8f9";
    ctx.fillRect(24, 58, 208, 140);
    ctx.strokeStyle = "#be5f4f";
    ctx.lineWidth = 5;
    ctx.strokeRect(24, 58, 208, 140);
    ctx.lineWidth = 8;
    for (let i = -40; i < 250; i += 34) {
        ctx.strokeStyle = "#4ca9a4";
        ctx.beginPath();
        ctx.moveTo(24 + i, 198);
        ctx.lineTo(24 + i + 52, 58);
        ctx.stroke();
    }
    ctx.fillStyle = "#4ca9a4";
    ctx.fillRect(168, 68, 50, 20);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(174, 74, 38, 8);
    const tex = new T.CanvasTexture(canvas);
    tex.wrapS = T.RepeatWrapping;
    tex.wrapT = T.RepeatWrapping;
    tex.repeat.set(1, 1);
    return tex;
}

class IsometricTruck extends GrObject {
    constructor(name, x, z) {
        const truck = new T.Group();
        const cargoMat = new T.MeshStandardMaterial({
            color: "#ffffff",
            roughness: 0.16,
            metalness: 0.42
        });
        cargoMat.map = makeCargoPrintTexture();
        cargoMat.needsUpdate = true;
        const cargo = new T.Mesh(new T.BoxGeometry(2.2, 1.22, 1.16), cargoMat);
        cargo.position.set(-0.05, 0.71, 0);
        truck.add(cargo);
        const cabMat = new T.MeshPhongMaterial({ color: "#76e0e3", shininess: 25, flatShading: true });
        const cabLow = new T.Mesh(new T.BoxGeometry(0.74, 0.58, 1.02), cabMat);
        cabLow.position.set(1.46, 0.33, 0);
        truck.add(cabLow);
        const cabTop = new T.Mesh(new T.BoxGeometry(0.56, 0.34, 0.96), cabMat);
        cabTop.position.set(1.32, 0.78, 0);
        truck.add(cabTop);
        const frontWindow = new T.Mesh(new T.BoxGeometry(0.03, 0.26, 0.74), windowMat);
        frontWindow.position.set(1.605, 0.79, 0);
        truck.add(frontWindow);
        const sideWindow = new T.Mesh(new T.BoxGeometry(0.3, 0.25, 0.05), windowMat);
        sideWindow.position.set(1.38, 0.72, 0.52);
        truck.add(sideWindow);
        const sideWindow2 = sideWindow.clone();
        sideWindow2.position.set(1.38, 0.72, -0.52);
        truck.add(sideWindow2);
        const trimMat = new T.MeshPhongMaterial({ color: "#d97d72", shininess: 10, flatShading: true });
        const trimTop = new T.Mesh(new T.BoxGeometry(2.21, 0.03, 0.03), trimMat);
        trimTop.position.set(-0.05, 1.325, 0.595);
        truck.add(trimTop);
        const trimTop2 = trimTop.clone();
        trimTop2.position.z = -0.595;
        truck.add(trimTop2);
        const trimBack = new T.Mesh(new T.BoxGeometry(0.03, 1.22, 0.03), trimMat);
        trimBack.position.set(-1.15, 0.71, 0.595);
        truck.add(trimBack);
        const trimBack2 = trimBack.clone();
        trimBack2.position.z = -0.595;
        truck.add(trimBack2);
        const wheelGeo = new T.CylinderGeometry(0.25, 0.25, 0.2, 18);
        const addWheel = (wx, wz) => {
            const wg = new T.Group();
            const w = new T.Mesh(wheelGeo, wheelMat);
            w.rotation.x = Math.PI / 2;
            wg.add(w);
            const cap = new T.Mesh(new T.CylinderGeometry(0.12, 0.12, 0.22, 14), wheelCapMat);
            cap.rotation.x = Math.PI / 2;
            wg.add(cap);
            wg.position.set(wx, 0.25, wz);
            truck.add(wg);
        };
        addWheel(-0.85, 0.63);
        addWheel(1.38, 0.63);
        addWheel(-0.85, -0.63);
        addWheel(1.38, -0.63);
        const bumper = new T.Mesh(
            new T.BoxGeometry(0.08, 0.08, 0.96),
            new T.MeshPhongMaterial({ color: "#6f757d", shininess: 35, flatShading: true })
        );
        bumper.position.set(1.86, 0.12, 0);
        truck.add(bumper);
        const headlightMat = new T.MeshPhongMaterial({ color: "#f4be2a", shininess: 60, flatShading: true });
        const headlightL = new T.Mesh(new T.BoxGeometry(0.05, 0.06, 0.12), headlightMat);
        headlightL.position.set(1.86, 0.2, 0.45);
        truck.add(headlightL);
        const headlightR = headlightL.clone();
        headlightR.position.z = -0.45;
        truck.add(headlightR);
        super(name, truck);
        this.setPos(x, 0, z);
    }
}

class IsometricSedan extends GrObject {
    constructor(name, x, z) {
        const sedan = new T.Group();
        const sedanMat = bodyMat.clone();
        sedanMat.color.set("#ee7eb4");
        sedanMat.shininess = 10;
        sedanMat.specular = new T.Color("#2a1e2a");
        const roofMat = new T.MeshPhongMaterial({ color: "#f189bf", shininess: 16, specular: "#3e2a3e", flatShading: true });
        const hoodMat = new T.MeshPhongMaterial({ color: "#e878ad", shininess: 20, specular: "#4a324a", flatShading: true });
        const body = new T.Mesh(new T.BoxGeometry(2.4, 0.42, 1.08), sedanMat);
        body.position.set(-0.15, 0.34, 0);
        sedan.add(body);
        const roof = new T.Mesh(new T.BoxGeometry(1.16, 0.35, 0.9), roofMat);
        roof.position.set(-0.1, 0.73, 0);
        sedan.add(roof);
        const rearDeck = new T.Mesh(new T.BoxGeometry(0.8, 0.2, 0.88), roofMat);
        rearDeck.position.set(0.65, 0.58, 0);
        sedan.add(rearDeck);
        const hood = new T.Mesh(new T.BoxGeometry(0.7, 0.18, 0.9), hoodMat);
        hood.position.set(-1.0, 0.5, 0);
        hood.rotation.z = -0.02;
        sedan.add(hood);
        const windshield = new T.Mesh(new T.BoxGeometry(0.3, 0.28, 0.78), windowMat);
        windshield.position.set(-0.65, 0.72, 0);
        windshield.rotation.z = -0.35;
        sedan.add(windshield);
        const winLeft = new T.Mesh(new T.BoxGeometry(0.52, 0.25, 0.05), windowMat);
        winLeft.position.set(-0.1, 0.75, 0.45);
        sedan.add(winLeft);
        const winRight = winLeft.clone();
        winRight.position.set(-0.1, 0.75, -0.45);
        sedan.add(winRight);
        const frontBumper = new T.Mesh(
            new T.BoxGeometry(0.09, 0.08, 0.95),
            new T.MeshPhongMaterial({ color: "#c1c5c9", shininess: 30, flatShading: true })
        );
        frontBumper.position.set(-1.35, 0.13, 0);
        sedan.add(frontBumper);
        const headlightMat = new T.MeshPhongMaterial({
            color: "#fff4cc",
            emissive: "#fff2aa",
            emissiveIntensity: 0.6,
            shininess: 80,
            flatShading: true
        });
        const headlightL = new T.Mesh(new T.BoxGeometry(0.04, 0.08, 0.16), headlightMat);
        headlightL.position.set(-1.34, 0.25, 0.38);
        sedan.add(headlightL);
        const headlightR = headlightL.clone();
        headlightR.position.z = -0.38;
        sedan.add(headlightR);
        const wheelGeo = new T.CylinderGeometry(0.25, 0.25, 0.2, 18);
        const addWheel = (wx, wz) => {
            const wg = new T.Group();
            const w = new T.Mesh(wheelGeo, wheelMat);
            w.rotation.x = Math.PI / 2;
            wg.add(w);
            const cap = new T.Mesh(new T.CylinderGeometry(0.12, 0.12, 0.22, 14), wheelCapMat);
            cap.rotation.x = Math.PI / 2;
            wg.add(cap);
            wg.position.set(wx, 0.25, wz);
            sedan.add(wg);
        };
        addWheel(-0.72, 0.61);
        addWheel(0.95, 0.61);
        addWheel(-0.72, -0.61);
        addWheel(0.95, -0.61);
        const rearBumper = new T.Mesh(
            new T.BoxGeometry(0.09, 0.08, 0.95),
            new T.MeshPhongMaterial({ color: "#c1c5c9", shininess: 30, flatShading: true })
        );
        rearBumper.position.set(1.065, 0.13, 0);
        sedan.add(rearBumper);
        const taillightMat = new T.MeshPhongMaterial({ color: "#d84040", shininess: 20, flatShading: true });
        const taillightL = new T.Mesh(new T.BoxGeometry(0.03, 0.08, 0.16), taillightMat);
        taillightL.position.set(1.055, 0.24, 0.38);
        sedan.add(taillightL);
        const taillightR = taillightL.clone();
        taillightR.position.z = -0.38;
        sedan.add(taillightR);
        super(name, sedan);
        this.setPos(x, 0, z);
    }
}

// Added per request: a different car model kept "unused" by default.
class IsometricRoadster extends GrObject {
    constructor(name, x, z) {
        const roadster = new T.Group();
        const bodyMain = new T.MeshPhongMaterial({ color: "#b31919", shininess: 40, flatShading: true });
        const bodyAccent = new T.MeshPhongMaterial({ color: "#d62828", shininess: 35, flatShading: true });
        const cockpitMat = new T.MeshPhongMaterial({ color: "#0c1118", shininess: 5, flatShading: true });
        const seatMat = new T.MeshPhongMaterial({ color: "#1a1a1a", shininess: 8, flatShading: true });
        const stripeMat = new T.MeshPhongMaterial({ color: "#f8f9fc", shininess: 20, flatShading: true });

        const floor = new T.Mesh(new T.BoxGeometry(2.34, 0.2, 1.08), bodyMain);
        floor.position.set(0, 0.24, 0);
        roadster.add(floor);

        const frontNose = new T.Mesh(new T.BoxGeometry(0.92, 0.13, 0.9), bodyAccent);
        frontNose.position.set(-0.92, 0.36, 0);
        frontNose.rotation.z = -0.12;
        roadster.add(frontNose);
        const noseTip = new T.Mesh(new T.BoxGeometry(0.26, 0.1, 0.84), bodyAccent);
        noseTip.position.set(-1.26, 0.3, 0);
        noseTip.rotation.z = -0.2;
        roadster.add(noseTip);

        const rearDeck = new T.Mesh(new T.BoxGeometry(1.12, 0.2, 1.18), bodyAccent);
        rearDeck.position.set(0.74, 0.44, 0);
        roadster.add(rearDeck);

        const cockpit = new T.Mesh(new T.BoxGeometry(1.02, 0.14, 0.72), cockpitMat);
        cockpit.position.set(0.12, 0.51, 0);
        roadster.add(cockpit);

        const windscreen = new T.Mesh(new T.BoxGeometry(0.06, 0.2, 0.72), windowMat);
        windscreen.position.set(-0.36, 0.66, 0);
        windscreen.rotation.z = -0.52;
        roadster.add(windscreen);

        const seatL = new T.Mesh(new T.BoxGeometry(0.22, 0.14, 0.26), seatMat);
        seatL.position.set(0.2, 0.62, 0.2);
        roadster.add(seatL);
        const seatR = seatL.clone();
        seatR.position.z = -0.2;
        roadster.add(seatR);

        const headrestL = new T.Mesh(new T.BoxGeometry(0.12, 0.12, 0.12), seatMat);
        headrestL.position.set(0.45, 0.7, 0.2);
        roadster.add(headrestL);
        const headrestR = headrestL.clone();
        headrestR.position.z = -0.2;
        roadster.add(headrestR);

        const rearHumpL = new T.Mesh(new T.BoxGeometry(0.42, 0.12, 0.22), bodyAccent);
        rearHumpL.position.set(0.72, 0.62, 0.22);
        roadster.add(rearHumpL);
        const rearHumpR = rearHumpL.clone();
        rearHumpR.position.z = -0.22;
        roadster.add(rearHumpR);

        const centerStripe = new T.Mesh(new T.BoxGeometry(2.26, 0.01, 0.16), stripeMat);
        centerStripe.position.set(0.02, 0.38, 0);
        roadster.add(centerStripe);
        const sideSill = new T.Mesh(new T.BoxGeometry(2.24, 0.06, 0.06), stripeMat);
        sideSill.position.set(0.03, 0.28, 0.54);
        roadster.add(sideSill);
        const sideSill2 = sideSill.clone();
        sideSill2.position.z = -0.54;
        roadster.add(sideSill2);

        const wheelGeo = new T.CylinderGeometry(0.27, 0.27, 0.22, 20);
        const addWheel = (wx, wz) => {
            const wg = new T.Group();
            const tire = new T.Mesh(wheelGeo, wheelMat);
            tire.rotation.x = Math.PI / 2;
            wg.add(tire);
            const hub = new T.Mesh(new T.CylinderGeometry(0.12, 0.12, 0.24, 12), wheelCapMat);
            hub.rotation.x = Math.PI / 2;
            wg.add(hub);
            wg.position.set(wx, 0.27, wz);
            roadster.add(wg);
        };
        addWheel(-0.86, 0.62);
        addWheel(0.86, 0.62);
        addWheel(-0.86, -0.62);
        addWheel(0.86, -0.62);

        const rearLightMat = new T.MeshPhongMaterial({
            color: "#d33f3f",
            emissive: "#8a1212",
            emissiveIntensity: 0.5,
            shininess: 45,
            flatShading: true
        });
        const rearL = new T.Mesh(new T.BoxGeometry(0.05, 0.09, 0.17), rearLightMat);
        rearL.position.set(1.16, 0.36, 0.38);
        roadster.add(rearL);
        const rearR = rearL.clone();
        rearR.position.z = -0.38;
        roadster.add(rearR);

        const frontLightMat = new T.MeshPhongMaterial({
            color: "#fff3bf",
            emissive: "#ffe79a",
            emissiveIntensity: 0.55,
            shininess: 90,
            flatShading: true
        });
        const frontL = new T.Mesh(new T.BoxGeometry(0.05, 0.08, 0.17), frontLightMat);
        frontL.position.set(-1.40, 0.30, 0.38);
        roadster.add(frontL);
        const frontR = frontL.clone();
        frontR.position.z = -0.38;
        roadster.add(frontR);

        super(name, roadster);
        this.setPos(x, 0, z);
    }
}

class IsometricSchoolBus extends GrObject {
    constructor(name, x, z) {
        const bus = new T.Group();
        const busYellow = new T.MeshPhongMaterial({ color: "#f2c230", shininess: 28, flatShading: true });
        const busYellowDark = new T.MeshPhongMaterial({ color: "#d8aa24", shininess: 18, flatShading: true });
        const blackTrim = new T.MeshPhongMaterial({ color: "#1e1e1e", shininess: 4, flatShading: true });
        const lightGray = new T.MeshPhongMaterial({ color: "#bcc1c7", shininess: 20, flatShading: true });

        const body = new T.Mesh(new T.BoxGeometry(3.2, 0.8, 1.18), busYellow);
        body.position.set(0, 0.68, 0);
        bus.add(body);

        const roof = new T.Mesh(new T.BoxGeometry(3.04, 0.20, 1.12), busYellowDark);
        roof.position.set(0, 1.2, 0);
        bus.add(roof);
        const roofStripeMat = new T.MeshPhongMaterial({ color: "#c79d22", shininess: 18, flatShading: false });
        const roofStripeCenter = new T.Mesh(new T.BoxGeometry(2.35, 0.01, 0.06), roofStripeMat);
        roofStripeCenter.position.set(0, 1.305, 0);
        bus.add(roofStripeCenter);
        const roofStripeL = new T.Mesh(new T.BoxGeometry(2.3, 0.01, 0.045), roofStripeMat);
        roofStripeL.position.set(0, 1.305, 0.23);
        bus.add(roofStripeL);
        const roofStripeR = roofStripeL.clone();
        roofStripeR.position.z = -0.23;
        bus.add(roofStripeR);
        // Rounded roof edges/corners for softer school-bus silhouette.
        const roofRoundMat = busYellowDark;
        const roofFrontEdge = new T.Mesh(new T.CylinderGeometry(0.13, 0.13, 1.12, 28), roofRoundMat);
        roofFrontEdge.rotation.x = Math.PI / 2;
        roofFrontEdge.position.set(1.52, 1.2, 0);
        bus.add(roofFrontEdge);
        const roofBackEdge = roofFrontEdge.clone();
        roofBackEdge.position.x = -1.52;
        bus.add(roofBackEdge);
        const roofLeftEdge = new T.Mesh(new T.CylinderGeometry(0.13, 0.13, 3.04, 28), roofRoundMat);
        roofLeftEdge.rotation.z = Math.PI / 2;
        roofLeftEdge.position.set(0, 1.2, 0.56);
        bus.add(roofLeftEdge);
        const roofRightEdge = roofLeftEdge.clone();
        roofRightEdge.position.z = -0.56;
        bus.add(roofRightEdge);
        const roofCornerFL = new T.Mesh(new T.SphereGeometry(0.13, 24, 18), roofRoundMat);
        roofCornerFL.position.set(1.52, 1.2, 0.56);
        bus.add(roofCornerFL);
        const roofCornerFR = roofCornerFL.clone();
        roofCornerFR.position.z = -0.56;
        bus.add(roofCornerFR);
        const roofCornerBL = roofCornerFL.clone();
        roofCornerBL.position.x = -1.52;
        bus.add(roofCornerBL);
        const roofCornerBR = roofCornerBL.clone();
        roofCornerBR.position.z = -0.56;
        bus.add(roofCornerBR);

        const nose = new T.Mesh(new T.BoxGeometry(0.55, 0.52, 1.08), busYellowDark);
        nose.position.set(1.86, 0.45, 0);
        bus.add(nose);

        const signMat = new T.MeshPhongMaterial({ color: "#1d1d1d", shininess: 5, flatShading: true });
        signMat.map = makeSchoolBusSignTexture();
        signMat.needsUpdate = true;
        const frontSign = new T.Mesh(new T.BoxGeometry(0.06, 0.09, 0.9), signMat);
        frontSign.position.set(2.045, 0.72, 0);
        bus.add(frontSign);
        // Front windshield in the same style as the truck.
        const frontWindshield = new T.Mesh(new T.BoxGeometry(0.03, 0.26, 0.74), windowMat);
        frontWindshield.position.set(1.615, 0.88, 0);
        bus.add(frontWindshield);

        const grill = new T.Mesh(new T.BoxGeometry(0.04, 0.22, 0.86), lightGray);
        grill.position.set(2.13, 0.42, 0);
        bus.add(grill);
        for (let i = -3; i <= 3; i++) {
            const slit = new T.Mesh(new T.BoxGeometry(0.01, 0.2, 0.05), blackTrim);
            slit.position.set(2.16, 0.42, i * 0.11);
            bus.add(slit);
        }

        const stripe = new T.Mesh(new T.BoxGeometry(3.18, 0.08, 0.06), blackTrim);
        stripe.position.set(0, 0.76, 0.545);
        bus.add(stripe);
        const stripe2 = stripe.clone();
        stripe2.position.z = -0.545;
        bus.add(stripe2);
        const sideSignMat = new T.MeshPhongMaterial({
            color: "#ffffff",
            shininess: 5,
            transparent: true,
            opacity: 1,
            flatShading: true
        });
        sideSignMat.map = makeSchoolBusSideTextTexture();
        sideSignMat.needsUpdate = true;
        const sideSignL = new T.Mesh(new T.BoxGeometry(1.02, 0.16, 0.005), sideSignMat);
        sideSignL.position.set(0.62, 0.62, 0.61);
        bus.add(sideSignL);
        const sideSignR = sideSignL.clone();
        sideSignR.position.z = -0.61;
        bus.add(sideSignR);

        // Side windows: square-ish panes with black frames.
        const sideWindowXs = [-1.0, -0.64, -0.28, 0.08, 0.44, 0.8];
        for (const wx of sideWindowXs) {
            const frameL = new T.Mesh(new T.BoxGeometry(0.29, 0.29, 0.03), blackTrim);
            frameL.position.set(wx, 0.92, 0.615);
            bus.add(frameL);
            const paneL = new T.Mesh(new T.BoxGeometry(0.23, 0.23, 0.02), windowMat);
            paneL.position.set(wx, 0.92, 0.631);
            bus.add(paneL);

            const frameR = frameL.clone();
            frameR.position.z = -0.615;
            bus.add(frameR);
            const paneR = paneL.clone();
            paneR.position.z = -0.631;
            bus.add(paneR);
        }

        const driverFrameL = new T.Mesh(new T.BoxGeometry(0.31, 0.29, 0.03), blackTrim);
        driverFrameL.position.set(1.34, 0.86, 0.615);
        bus.add(driverFrameL);
        const driverPaneL = new T.Mesh(new T.BoxGeometry(0.25, 0.23, 0.02), windowMat);
        driverPaneL.position.set(1.34, 0.86, 0.631);
        bus.add(driverPaneL);
        const driverFrameR = driverFrameL.clone();
        driverFrameR.position.z = -0.615;
        bus.add(driverFrameR);
        const driverPaneR = driverPaneL.clone();
        driverPaneR.position.z = -0.631;
        bus.add(driverPaneR);

        const door = new T.Mesh(new T.BoxGeometry(0.05, 0.5, 0.62), lightGray);
        door.position.set(1.18, 0.52, 0.28);
        bus.add(door);

        const headMat = new T.MeshPhongMaterial({
            color: "#fff1bd",
            emissive: "#ffdd8c",
            emissiveIntensity: 0.55,
            shininess: 80,
            flatShading: true
        });
        const headL = new T.Mesh(new T.SphereGeometry(0.09, 14, 10), headMat);
        headL.position.set(2.045, 0.40, 0.38);
        bus.add(headL);
        const headR = headL.clone();
        headR.position.z = -0.38;
        bus.add(headR);
        const headHousingL = new T.Mesh(new T.CylinderGeometry(0.1, 0.1, 0.03, 14), blackTrim);
        headHousingL.rotation.z = Math.PI / 2;
        headHousingL.position.set(2.03, 0.40, 0.38);
        bus.add(headHousingL);
        const headHousingR = headHousingL.clone();
        headHousingR.position.z = -0.38;
        bus.add(headHousingR);

        // Rear tail lights.
        const tailMat = new T.MeshPhongMaterial({
            color: "#e14646",
            emissive: "#8d1717",
            emissiveIntensity: 0.5,
            shininess: 50,
            flatShading: true
        });
        const tailL = new T.Mesh(new T.SphereGeometry(0.07, 12, 10), tailMat);
        tailL.position.set(-1.62, 0.47, 0.43);
        bus.add(tailL);
        const tailR = tailL.clone();
        tailR.position.z = -0.43;
        bus.add(tailR);

        const markerMat = new T.MeshPhongMaterial({ color: "#ff8d35", emissive: "#a74a12", emissiveIntensity: 0.35, shininess: 40, flatShading: true });
        const marker1 = new T.Mesh(new T.SphereGeometry(0.045, 10, 8), markerMat);
        marker1.position.set(2.07, 0.82, -0.2);
        bus.add(marker1);
        const marker2 = marker1.clone();
        marker2.position.z = 0.0;
        bus.add(marker2);
        const marker3 = marker1.clone();
        marker3.position.z = 0.2;
        bus.add(marker3);

        // Front side mirrors (left/right).
        const mirrorMat = new T.MeshPhongMaterial({ color: "#2a2a2a", shininess: 20, flatShading: true });
        const mirrorStemL = new T.Mesh(new T.CylinderGeometry(0.015, 0.015, 0.22, 12), mirrorMat);
        mirrorStemL.position.set(1.84, 0.67, 0.58);
        mirrorStemL.rotation.z = -0.38;
        bus.add(mirrorStemL);
        const mirrorHeadL = new T.Mesh(new T.SphereGeometry(0.07, 14, 10), mirrorMat);
        mirrorHeadL.position.set(1.79, 0.72, 0.64);
        bus.add(mirrorHeadL);
        const mirrorStemR = mirrorStemL.clone();
        mirrorStemR.position.z = -0.58;
        bus.add(mirrorStemR);
        const mirrorHeadR = mirrorHeadL.clone();
        mirrorHeadR.position.z = -0.64;
        bus.add(mirrorHeadR);

        const wheelGeo = new T.CylinderGeometry(0.28, 0.28, 0.24, 18);
        const addWheel = (wx, wz) => {
            const wg = new T.Group();
            const tire = new T.Mesh(wheelGeo, wheelMat);
            tire.rotation.x = Math.PI / 2;
            wg.add(tire);
            const hub = new T.Mesh(new T.CylinderGeometry(0.13, 0.13, 0.26, 14), wheelCapMat);
            hub.rotation.x = Math.PI / 2;
            wg.add(hub);
            wg.position.set(wx, 0.28, wz);
            bus.add(wg);
        };
        addWheel(-1.1, 0.64);
        addWheel(1.15, 0.64);
        addWheel(-1.1, -0.64);
        addWheel(1.15, -0.64);

        super(name, bus);
        this.setPos(x, 0, z);
    }
}

const world = await GrWorld.new({ groundplanecolor: "lightgray", antialias: true });
const ambientLight = new T.AmbientLight(0xffffff, 0.9);
world.scene.add(ambientLight);
const keyLight = new T.DirectionalLight(0xffffff, 0.65);
keyLight.position.set(3, 5, 2);
world.scene.add(keyLight);
world.add(new IsometricTruck("IsometricTruck", -1.8, 0));
world.add(new IsometricSedan("IsometricSedan", 1.8, 0));
world.add(new IsometricRoadster("IsometricRoadster", 0, 2));
world.add(new IsometricSchoolBus("IsometricSchoolBus", 0, -2.3));
world.go();
