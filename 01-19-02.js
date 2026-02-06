// JavaScript file to be filled in by the student for Box 4-2
// we'll give you something to get started...

// you should start by getting the canvas, then draw whatever you want!
// Be sure to use the Canvas drawing API, not SVG!

/** @type {HTMLCanvasElement} */
let canvas = document.getElementById("canvas1");
let ctx = canvas.getContext("2d");

let sky = ctx.createLinearGradient(0, 0, 0, 330);
sky.addColorStop(0, "#c4edff");
sky.addColorStop(1, "#7cd8ff");
ctx.fillStyle = sky;
ctx.fillRect(0, 0, 500, 330);


let groundGradient = ctx.createLinearGradient(0, 330, 0, 500);
groundGradient.addColorStop(0, "#c2eeba");
groundGradient.addColorStop(1, "#66c361");
ctx.fillStyle = groundGradient;
ctx.fillRect(0, 330, 500, 170);

function drawGrassTuft(x, y) {
    ctx.save();
    ctx.strokeStyle = "rgba(40,90,40,0.2)";
    ctx.lineWidth = 1.5;
    ctx.lineCap = "round";
    for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(x + i * 3, y);
        ctx.quadraticCurveTo(
            x + i * 3,
            y - 8,
            x + i * 3 - 3 + Math.random() * 6,
            y - 12
        );
        ctx.stroke();
    }
    ctx.restore();
}

for (let i = 0; i < 30; i++) {
    drawGrassTuft(
        Math.random() * 500,
        340 + Math.random() * 140
    );
}

function drawTinyFlower(x, y) {
    const petalColors = ["#FFB6C1", "#FFD966", "#E2C3F0", "#B5E5FF", "#E2C6FF"];
    const petalColor = petalColors[Math.floor(Math.random() * petalColors.length)];
    const petalCount = Math.floor(Math.random() * 3) + 4;
    const radius = Math.random() * 3 + 3;
    const spread = Math.random() * 4 + 6;
    const rotation = Math.random() * Math.PI;

    ctx.fillStyle = petalColor;

    for (let i = 0; i < petalCount; i++) {
        const angle = (i / petalCount) * Math.PI * 2 + rotation;
        ctx.beginPath();
        ctx.arc(
            x + Math.cos(angle) * spread,
            y + Math.sin(angle) * spread,
            radius,
            0,
            Math.PI * 2
        );
        ctx.fill();
    }

    ctx.fillStyle = "#FFF44F";
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fill();
}

for (let i = 0; i < 35; i++) {
    drawTinyFlower(
        Math.random() * 500,
        350 + Math.random() * 130
    );
}

for (let i = 0; i < 20; i++) {
    ctx.beginPath();
    ctx.arc(
        Math.random() * 500,
        Math.random() * 300,
        Math.random() * 6 + 2,
        0,
        Math.PI * 2
    );
}

ctx.fillStyle = "rgba(29,39,33,0.15)";
ctx.beginPath();
ctx.ellipse(250, 425, 110, 18, 0, 0, Math.PI * 2);
ctx.fill();

const COLORS = {
    body: "#FDF5E6",
    spot: "#D2691E",
    collar: "#FF6347",
    dark: "#3E2723",
    shadow: "#dcc9a4"
};

ctx.fillStyle = COLORS.shadow;
ctx.beginPath();
ctx.roundRect(250, 310, 55, 100, [0, 0, 25, 25]);
ctx.fill();

ctx.beginPath();
ctx.moveTo(140, 265);
ctx.lineTo(130, 410);
ctx.arcTo(130, 420, 170, 420, 10);
ctx.lineTo(210, 420);
ctx.lineTo(210, 350);
ctx.lineTo(330, 350);
ctx.lineTo(330, 410);
ctx.arcTo(330, 420, 320, 420, 10);
ctx.lineTo(280, 420);
ctx.lineTo(280, 280);
ctx.closePath();
ctx.fillStyle = COLORS.body;
ctx.fill();

ctx.fillStyle = COLORS.shadow;
ctx.beginPath();
ctx.roundRect(170, 350, 45, 70, [0, 0, 10, 10]);
ctx.fill();

ctx.save();
ctx.globalAlpha = 0.5;
ctx.fillStyle = COLORS.body;
ctx.beginPath();
ctx.moveTo(240, 230);
ctx.lineTo(315, 230);
ctx.lineTo(330, 350);
ctx.lineTo(225, 350);
ctx.closePath();
ctx.fill();
ctx.restore();

ctx.save();
ctx.beginPath();
ctx.arc(170, 300, 40, 0, Math.PI * 2);
ctx.clip();
ctx.fillStyle = COLORS.spot;
ctx.fillRect(100, 200, 200, 200);
ctx.restore();

ctx.beginPath();
ctx.moveTo(140, 270);
ctx.quadraticCurveTo(100, 250, 120, 200);
ctx.quadraticCurveTo(150, 260, 150, 300);
ctx.closePath();
ctx.fillStyle = COLORS.spot;
ctx.fill();

ctx.save();
ctx.translate(225, 240);
ctx.rotate(-0.1);
ctx.fillStyle = COLORS.collar;
ctx.beginPath();
ctx.roundRect(0, 0, 95, 22, 11);
ctx.fill();

ctx.fillStyle = "#ffd000";
ctx.beginPath();
ctx.arc(80, 35, 10, 0, Math.PI * 2);
ctx.fill();
ctx.restore();

ctx.fillStyle = COLORS.spot;

ctx.save();
ctx.beginPath();
ctx.arc(250, 330, 13, 0, Math.PI * 2);
ctx.clip();
ctx.fillRect(200, 300, 80, 80);
ctx.restore();

ctx.save();
ctx.beginPath();
ctx.arc(280, 330, 24, 0, Math.PI * 2);
ctx.clip();
ctx.fillRect(200, 300, 80, 80);
ctx.restore();

function drawHead() {
    ctx.beginPath();
    ctx.moveTo(235, 240);
    ctx.lineTo(335, 240);
    ctx.quadraticCurveTo(365, 240, 365, 210);
    ctx.lineTo(365, 185);
    ctx.lineTo(270, 140);
    ctx.quadraticCurveTo(235, 150, 235, 240);
    ctx.fillStyle = COLORS.body;
    ctx.fill();

    ctx.save();
    ctx.beginPath();
    ctx.arc(280, 180, 40, 0, Math.PI * 2);
    ctx.clip();
    ctx.fillStyle = COLORS.spot;
    ctx.fillRect(200, 100, 200, 150);
    ctx.restore();

    ctx.fillStyle = COLORS.dark;
    ctx.beginPath();
    ctx.arc(305, 185, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.ellipse(360, 190, 12, 15, -0.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = COLORS.body;
    ctx.beginPath();
    ctx.moveTo(280, 145);
    ctx.quadraticCurveTo(295, 90, 320, 165);
    ctx.fill();

    ctx.fillStyle = COLORS.spot;
    ctx.beginPath();
    ctx.moveTo(245, 165);
    ctx.quadraticCurveTo(255, 80, 290, 155);
    ctx.fill();

    ctx.strokeStyle = COLORS.dark;
    ctx.lineWidth = 2;
    ctx.lineCap = "round";

    ctx.beginPath();
    ctx.moveTo(290, 130);
    ctx.quadraticCurveTo(300, 100, 325, 115);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(305, 135);
    ctx.quadraticCurveTo(315, 110, 340, 125);
    ctx.stroke();
}

drawHead();

ctx.strokeStyle = "rgba(0,0,0,0.12)";
ctx.lineWidth = 2;
ctx.lineJoin = "round";
ctx.stroke();

function drawCloud(x, y, size) {
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.arc(x + size * 0.6, y - size * 0.4, size * 0.8, 0, Math.PI * 2);
    ctx.arc(x + size * 1.2, y, size, 0, Math.PI * 2);
    ctx.fill();
}

drawCloud(100, 80, 25);
drawCloud(50, 200, 20);
drawCloud(260, 60, 18);
drawCloud(400, 120, 30);


// 2026 Workbook
