// @ts-check
export {};

let canvas = document.getElementById("canvas1");
if (!(canvas instanceof HTMLCanvasElement))
    throw new Error("Canvas is not HTML Element");

const ctx = canvas.getContext("2d");
if (!ctx) throw new Error("Could not get 2D context");

const scale = 0.35;
const offsetX = 35;
const offsetY = 80;
const STROKE_COLOR = "#3b2c22";

// Draw eyes with highlights
const drawBlackEyeWithHighlight = (x, y) => {
    ctx.fillStyle = "rgba(0,0,0,0.9)";
    ctx.beginPath();
    ctx.ellipse(x, y, 8, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.ellipse(x - 2, y - 4, 3, 3, 0, 0, Math.PI * 2);
    ctx.fill();
};

// Draw mouth
const drawMouth = (features) => {
    ctx.strokeStyle = features.mouthColor;
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.beginPath();
    ctx.moveTo(80, 20);
    ctx.bezierCurveTo(80, 40, 100, 40, 100, 20);
    ctx.bezierCurveTo(100, 40, 120, 40, 120, 20);
    ctx.stroke();

    if (features.expression === "tongue") {
        ctx.fillStyle = "#FF9AA2";
        ctx.beginPath();
        ctx.ellipse(100, 35, 8, 10, 0, 0, Math.PI);
        ctx.fill();
        ctx.stroke();
    }
};

/**
 * Define cat head shape with rounded ears
 */
const defineCatShape = (hasM) => {
    ctx.beginPath();

    // Bottom curve
    ctx.moveTo(20, 0);
    ctx.bezierCurveTo(20, 60, 180, 60, 180, 0);

    // Right lower side
    ctx.bezierCurveTo(210, -50, 190, -90, 170, -100);

    // Rounded right ear
    ctx.lineTo(185, -140);
    ctx.quadraticCurveTo(190, -155, 170, -135);
    ctx.lineTo(150, -120);

    // Top of head
    if (hasM) {
        ctx.bezierCurveTo(140, -135, 100, -135, 100, -135);
        ctx.bezierCurveTo(100, -135, 60, -135, 50, -120);
    } else {
        ctx.bezierCurveTo(100, -110, 100, -110, 50, -120);
    }

    // Rounded left ear
    ctx.lineTo(30, -135);
    ctx.quadraticCurveTo(10, -155, 15, -140);
    ctx.lineTo(30, -100);

    // Left lower side
    ctx.bezierCurveTo(10, -90, -10, -50, 20, 0);

    ctx.closePath();
};

// Draw a single cat
const drawCat = (startX, startY, features) => {
    ctx.save();
    ctx.translate(startX * scale + offsetX, startY * scale + offsetY);
    ctx.scale(scale, scale);

    const hasM = (features.pattern === "stripe");
    defineCatShape(hasM);

    ctx.save();
    ctx.clip();

    ctx.fillStyle = features.color;
    ctx.fill();

    // Inner ears
    ctx.fillStyle = "rgba(255, 154, 162, 0.4)";
    ctx.beginPath();
    ctx.moveTo(35, -105);
    ctx.lineTo(22, -130);
    ctx.lineTo(45, -115);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(165, -105);
    ctx.lineTo(178, -130);
    ctx.lineTo(155, -115);
    ctx.fill();

    // Stripes
    if (features.pattern === "stripe") {
        ctx.strokeStyle = "#b55d00";
        ctx.lineWidth = 5;
        ctx.lineCap = "round";

        const verticalStripes = [
            { start: [100, -125], cp1: [95, -105], cp2: [95, -85], end: [100, -65] },
            { start: [75, -110], cp1: [70, -90], cp2: [70, -70], end: [75, -50] },
            { start: [125, -110], cp1: [130, -90], cp2: [130, -70], end: [125, -50] }
        ];

        verticalStripes.forEach(s => {
            ctx.beginPath();
            ctx.moveTo(s.start[0], s.start[1]);
            ctx.bezierCurveTo(s.cp1[0], s.cp1[1], s.cp2[0], s.cp2[1], s.end[0], s.end[1]);
            ctx.stroke();
        });
    }

    ctx.restore();

    // Blush
    ctx.fillStyle = "rgba(255, 192, 203, 0.5)";
    ctx.beginPath();
    ctx.ellipse(50, 10, 15, 10, Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.ellipse(150, 10, 15, 10, -Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();

    // Outline
    defineCatShape(hasM);
    ctx.strokeStyle = STROKE_COLOR;
    ctx.lineWidth = 3;
    ctx.stroke();

    drawBlackEyeWithHighlight(60, -20);
    drawBlackEyeWithHighlight(140, -20);

    // Whiskers
    ctx.strokeStyle = STROKE_COLOR;
    ctx.lineWidth = 2;
    [[ -1, 35 ], [ 1, 165 ]].forEach(([ dir, startX ]) => {
        for (let i = -1; i <= 1; i++) {
            ctx.beginPath();
            ctx.moveTo(startX, i * 20);
            ctx.quadraticCurveTo(startX + (dir * 40), i * 20 - 10, startX + (dir * 60), i * 30);
            ctx.stroke();
        }
    });

    drawMouth(features);

    ctx.restore();
};

// Draw cats
const drawAllCats = () => {
    const cats = [
        { foreheadType: 'v', expression: 'smile', color: '#FFA84D', mouthColor: '#7B4B3A', pattern: 'stripe' },
        { foreheadType: 'plain', expression: 'normal', color: '#F8F9FA', mouthColor: '#4A4A4A', pattern: 'none' },
        { foreheadType: 'plain', expression: 'normal', color: '#FFA84D', mouthColor: '#7B4B3A', pattern: 'stripe' },
        { foreheadType: 'v', expression: 'normal', color: '#F8F9FA', mouthColor: '#4A4A4A', pattern: 'none' },
        { foreheadType: 'hatch', expression: 'tongue', color: '#FFA84D', mouthColor: '#7B4B3A', pattern: 'stripe' },
        { foreheadType: 'plain', expression: 'smile', color: '#F8F9FA', mouthColor: '#4A4A4A', pattern: 'none' },
        { foreheadType: 'v', expression: 'smile', color: '#FFA84D', mouthColor: '#7B4B3A', pattern: 'stripe' },
        { foreheadType: 'plain', expression: 'normal', color: '#F8F9FA', mouthColor: '#4A4A4A', pattern: 'none' },
        { foreheadType: 'hatch', expression: 'tongue', color: '#050301', mouthColor: '#7B4B3A', pattern: 'stripe' }
    ];

    cats.forEach((c, i) => {
        const row = Math.floor(i / 3);
        const col = i % 3;
        drawCat(col * 400, row * 400, c);
    });
};

// Better mint gradient background
const drawBackground = () => {

    // Soft vertical gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, "#D8FFF1");
    gradient.addColorStop(1, "#B8F2E6");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Thin subtle diagonal stripes
    ctx.strokeStyle = "rgba(255,255,255,0.25)";
    ctx.lineWidth = 8;

    const spacing = 50;

    for (let i = -canvas.height; i < canvas.width; i += spacing) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i + canvas.height, canvas.height);
        ctx.stroke();
    }
};

drawBackground();
drawAllCats();
