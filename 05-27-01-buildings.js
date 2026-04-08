// @ts-check

import * as T from "https://unpkg.com/three@0.180.0/build/three.module.js";
import { GrObject } from "./libs/CS559-Framework/GrObject.js";

// --- 纹理加载辅助函数 ---
const textureLoader = new T.TextureLoader();
function loadTexture(path) {
    const tex = textureLoader.load(path);
    tex.colorSpace = T.SRGBColorSpace;
    return tex;
}

// --- 资源加载 ---
const doorTex = loadTexture("images/door.jpg");
const roofTex = loadTexture("images/roof.jpeg");
const churchRoofTex = loadTexture("images/church_roof.jpg");
const windowTex = loadTexture("images/window.jpg");

churchRoofTex.wrapS = T.RepeatWrapping;
churchRoofTex.wrapT = T.RepeatWrapping;
churchRoofTex.repeat.set(2, 2);

/**
 * GrLowPolyTree: 低多边形小树
 */
export class GrLowPolyTree extends GrObject {
    constructor(name = "Tree", x = 0, z = 0) {
        super(name);
        const group = new T.Group();
        const leafMat = new T.MeshStandardMaterial({ color: "#a3ff33", flatShading: true });
        const trunkMat = new T.MeshStandardMaterial({ color: "#8b4513", flatShading: true });

        const trunk = new T.Mesh(new T.CylinderGeometry(0.1, 0.2, 0.6, 8), trunkMat);
        trunk.position.y = 0.3;
        group.add(trunk);

        const createLayer = (radius, height, posY) => {
            const layer = new T.Mesh(new T.ConeGeometry(radius, height, 8), leafMat);
            layer.position.y = posY;
            layer.rotation.z = (Math.random() - 0.5) * 0.1;
            layer.rotation.y = Math.random() * Math.PI;
            return layer;
        };

        group.add(createLayer(0.7, 0.6, 0.8));
        group.add(createLayer(0.55, 0.6, 1.2));
        group.add(createLayer(0.4, 0.6, 1.6));
        group.add(createLayer(0.2, 0.7, 2.0));

        group.position.set(x, 0, z);
        const scale = 0.8 + Math.random() * 0.5;
        group.scale.set(scale, scale, scale);
        this.objects.push(group);
    }
}

/**
 * ProGableRoofHouse: 普通小房子 (屋檐已上移修�?
 */
export class ProGableRoofHouse extends GrObject {
    constructor(name = "House") {
        super(name);
        const group = new T.Group();

        const wallMat = new T.MeshStandardMaterial({ color: "#fefae0" });
        const roofMat = new T.MeshStandardMaterial({ map: roofTex });
        const baseMat = new T.MeshStandardMaterial({ color: "#444444" });
        const doorMat = new T.MeshStandardMaterial({ map: doorTex });
        const winGlassMat = new T.MeshStandardMaterial({ map: windowTex, transparent: true });

        const base = new T.Mesh(new T.BoxGeometry(2.1, 0.2, 1.6), baseMat);
        base.position.y = 0.1;
        group.add(base);

        const walls = new T.Mesh(new T.BoxGeometry(2, 1.4, 1.5), wallMat);
        walls.position.y = 0.9;
        group.add(walls);

        const chimney = new T.Mesh(new T.BoxGeometry(0.3, 0.7, 0.3), wallMat);
        chimney.position.set(-0.6, 2.2, 0); 
        group.add(chimney);
        const chimneyCap = new T.Mesh(new T.BoxGeometry(0.35, 0.1, 0.35), roofMat);
        chimneyCap.position.set(-0.6, 2.55, 0); 
        group.add(chimneyCap);

        const roofLeft = new T.Mesh(new T.BoxGeometry(2.2, 0.1, 1.1), roofMat);
        roofLeft.position.set(0, 2.0, 0.4); 
        roofLeft.rotation.x = Math.PI / 4;
        const roofRight = new T.Mesh(new T.BoxGeometry(2.2, 0.1, 1.1), roofMat);
        roofRight.position.set(0, 2.0, -0.4); 
        roofRight.rotation.x = -Math.PI / 4;
        group.add(roofLeft, roofRight);

        // Door & Step
        const doorGroup = new T.Group();
        doorGroup.add(new T.Mesh(new T.BoxGeometry(0.4, 0.9, 0.05), doorMat));
        const knob = new T.Mesh(new T.SphereGeometry(0.02), new T.MeshStandardMaterial({ color: "gold" }));
        knob.position.set(0.15, 0, 0.04);
        doorGroup.add(knob);
        doorGroup.position.set(-0.5, 0.65, 0.751);
        group.add(doorGroup);

        const step = new T.Mesh(new T.BoxGeometry(0.5, 0.1, 0.2), baseMat);
        step.position.set(-0.5, 0.05, 0.9);
        group.add(step);

        const addWin = (x, y, z, ry = 0) => {
            const win = new T.Group();
            win.add(new T.Mesh(new T.BoxGeometry(0.35, 0.45, 0.04), winGlassMat));
            const frame = new T.Mesh(new T.BoxGeometry(0.38, 0.48, 0.02), new T.MeshStandardMaterial({ color: "#ffffff" }));
            frame.position.z = -0.02;
            win.add(frame);
            win.position.set(x, y, z);
            win.rotation.y = ry;
            group.add(win);
        };
        addWin(0.1, 0.7, 0.751);
        addWin(0.7, 0.7, 0.751);
        addWin(1.001, 0.7, 0.3, Math.PI / 2);
        addWin(1.001, 0.7, -0.3, Math.PI / 2);

        this.objects.push(group);
    }
}

/**
 * GrStripedStore: 小卖�?(新增了门)
 */
export class GrStripedStore extends GrObject {
    constructor(name = "Store") {
        super(name);
        const group = new T.Group();
        const whiteMat = new T.MeshStandardMaterial({ color: "#eeeeee", flatShading: true });
        const redMat = new T.MeshStandardMaterial({ color: "#d32f2f", flatShading: true });
        const wallMat = new T.MeshStandardMaterial({ color: "#f7f1e3" });
        const glassMat = new T.MeshStandardMaterial({ map: windowTex, transparent: true });

        const base = new T.Mesh(new T.BoxGeometry(2.5, 0.1, 2.0), new T.MeshStandardMaterial({ color: "#5d4037" }));
        base.position.y = 0.05;
        group.add(base);

        const walls = new T.Mesh(new T.BoxGeometry(1.8, 1.8, 1.4), wallMat);
        walls.position.y = 1.0;
        group.add(walls);

        // 新增：小卖部的门
        const storeDoor = new T.Mesh(new T.BoxGeometry(0.45, 1.0, 0.05), new T.MeshStandardMaterial({ map: doorTex }));
        storeDoor.position.set(-0.45, 0.5, 0.71);
        group.add(storeDoor);

        const pillar = new T.Group();
        const pMain = new T.Mesh(new T.BoxGeometry(0.25, 1.8, 0.25), whiteMat);
        pillar.add(pMain);
        for (let i = 0; i < 3; i++) {
            const ridge = new T.Mesh(new T.BoxGeometry(0.28, 0.05, 0.28), whiteMat);
            ridge.position.y = 0.5 + (i * 0.2);
            pillar.add(ridge);
        }
        pillar.position.set(0.8, 1.0, 0.6);
        group.add(pillar);

        const roof = new T.Mesh(new T.BoxGeometry(2.1, 0.25, 1.7), new T.MeshStandardMaterial({ map: roofTex }));
        roof.position.y = 1.95;
        group.add(roof);

        const createAwning = (w, count, ry = 0, px, pz) => {
            const awning = new T.Group();
            const sW = w / count;
            for (let i = 0; i < count; i++) {
                const mat = i % 2 === 0 ? redMat : whiteMat;
                const stripe = new T.Mesh(new T.PlaneGeometry(sW, 0.7), mat);
                stripe.position.x = (i * sW) - (w / 2) + (sW / 2);
                stripe.rotation.x = -Math.PI / 4; 
                awning.add(stripe);

                const edge = new T.Mesh(new T.CylinderGeometry(sW / 2, sW / 2, 0.05, 16), mat);
                edge.rotation.z = Math.PI / 2;
                edge.position.set(stripe.position.x, -0.25, 0.25);
                awning.add(edge);
            }
            awning.rotation.y = ry;
            awning.position.set(px, 1.5, pz);
            group.add(awning);
        };
        createAwning(0.8, 6, 0, 0.35, 0.75); // 正面遮阳帘偏移避开�?
        createAwning(1.1, 8, Math.PI / 2, 0.85, 0);

        const winF = new T.Mesh(new T.BoxGeometry(0.8, 0.8, 0.1), glassMat);
        winF.position.set(0.35, 1.0, 0.65);
        group.add(winF);
        this.objects.push(group);
    }
}

/**
 * GrChurch: 教堂 (钟表带刻度，且随时间精准转动)
 */
export class GrChurch extends GrObject {
    constructor(name = "Church") {
        const group = new T.Group();
        super(name, group);

        const wallMat = new T.MeshStandardMaterial({ color: "#e9edc9", flatShading: true });
        const roofMat = new T.MeshStandardMaterial({ map: churchRoofTex, flatShading: true });
        const darkWoodMat = new T.MeshStandardMaterial({ color: "#5d4037" });
        const stainedGlassMat = new T.MeshStandardMaterial({ map: windowTex, color: "#ffcccc", emissive: "#331111", transparent: true });

        // Tower
        const towerGroup = new T.Group();
        const towerMain = new T.Mesh(new T.BoxGeometry(1.2, 4.0, 1.2), wallMat);
        towerMain.position.y = 2.0;
        towerGroup.add(towerMain);

        // --- Fancy Clock with Markers ---
        const clockGroup = new T.Group();
        clockGroup.position.set(0, 3.2, 0.61);
        towerGroup.add(clockGroup);
        clockGroup.add(new T.Mesh(new T.CircleGeometry(0.35, 32), new T.MeshStandardMaterial({ color: "#ffffff" })));

        // 绘制刻度
        for (let i = 0; i < 12; i++) {
            const isMajor = i % 3 === 0;
            const marker = new T.Mesh(
                new T.BoxGeometry(isMajor ? 0.02 : 0.01, isMajor ? 0.08 : 0.05, 0.01),
                new T.MeshStandardMaterial({ color: "#000000" })
            );
            const angle = (i / 12) * Math.PI * 2;
            marker.position.set(Math.sin(angle) * 0.28, Math.cos(angle) * 0.28, 0.01);
            marker.rotation.z = -angle;
            clockGroup.add(marker);
        }

        this.hourHand = new T.Mesh(new T.BoxGeometry(0.04, 0.20, 0.02), new T.MeshStandardMaterial({ color: "#333333" }));
        this.hourHand.geometry.translate(0, 0.09, 0);
        this.hourHand.position.z = 0.02;
        clockGroup.add(this.hourHand);

        this.minHand = new T.Mesh(new T.BoxGeometry(0.03, 0.28, 0.02), new T.MeshStandardMaterial({ color: "#111111" }));
        this.minHand.geometry.translate(0, 0.13, 0);
        this.minHand.position.z = 0.03;
        clockGroup.add(this.minHand);

        this.secHand = new T.Mesh(new T.BoxGeometry(0.015, 0.32, 0.01), new T.MeshStandardMaterial({ color: "#ff0000" }));
        this.secHand.geometry.translate(0, 0.15, 0);
        this.secHand.position.z = 0.04;
        clockGroup.add(this.secHand);

        const spire = new T.Mesh(new T.ConeGeometry(0.9, 2.0, 4), roofMat);
        spire.position.y = 5.0; spire.rotation.y = Math.PI / 4;
        towerGroup.add(spire);

        const crossGroup = new T.Group();
        const crossMat = new T.MeshStandardMaterial({ color: "#FFD700", metalness: 0.8, roughness: 0.2 });
        const vPart = new T.Mesh(new T.CylinderGeometry(0.03, 0.03, 0.6), crossMat);
        const hPart = new T.Mesh(new T.CylinderGeometry(0.03, 0.03, 0.4), crossMat);
        hPart.rotation.z = Math.PI / 2; hPart.position.y = 0.1;
        crossGroup.add(vPart, hPart);
        crossGroup.position.y = 6.2;
        towerGroup.add(crossGroup);
        towerGroup.position.set(-1.0, 0, 0);
        group.add(towerGroup);

        // Main Hall
        const hallGroup = new T.Group();
        const hall = new T.Mesh(new T.BoxGeometry(2.5, 2.0, 1.8), wallMat);
        hall.position.set(0.8, 1.0, 0);
        hallGroup.add(hall);

        const roofL = new T.Mesh(new T.BoxGeometry(2.7, 0.1, 1.3), roofMat);
        roofL.position.set(0.8, 2.4, 0.45);
        roofL.rotation.x = Math.PI / 6;
        const roofR = new T.Mesh(new T.BoxGeometry(2.7, 0.1, 1.3), roofMat);
        roofR.position.set(0.8, 2.4, -0.45);
        roofR.rotation.x = -Math.PI / 6;
        hallGroup.add(roofL, roofR);
        group.add(hallGroup);

        // Details
        const door = new T.Mesh(new T.BoxGeometry(0.6, 1.0, 0.1), new T.MeshStandardMaterial({ map: doorTex }));
        door.position.set(-1.0, 0.5, 0.61);
        group.add(door);

        for (let i = 0; i < 4; i++) {
            const win = new T.Mesh(new T.BoxGeometry(0.3, 0.8, 0.1), stainedGlassMat);
            win.position.set(0.0 + i * 0.55, 1.2, 0.91);
            group.add(win);
        }

        const base = new T.Mesh(new T.BoxGeometry(4.5, 0.15, 2.2), darkWoodMat);
        base.position.y = 0.075;
        group.add(base);
    }

    /**
     * stepWorld: 钟表随系统时间转�?(为了效果明显，代码中使用�?*10 加速流�?
     */
    stepWorld(delta, time) {
        // time 是毫秒，seconds 是秒
        // 如果想看真实时间，保�?seconds = time / 1000
        // 这里可以使用加速系数（比如 * 10）让指针转动更明�?
        const seconds = (time / 1000) * 1; 

        // 秒针�?分钟一�?
        this.secHand.rotation.z = -seconds * (Math.PI * 2);
        // 分针�?小时一�?
        this.minHand.rotation.z = -seconds * (Math.PI * 2 / 60);
        // 时针�?2小时一�?
        this.hourHand.rotation.z = -seconds * (Math.PI * 2 / 720);
    }
}

