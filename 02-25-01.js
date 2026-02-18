// @ts-check
export {};

const canvas = /** @type {HTMLCanvasElement} */ (document.getElementById("canvas"));
const ctx = canvas.getContext("2d");

function drawSpiderWeb(time) {
    if (!ctx) return;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const numSpokes = 14;
    const numRings = 10;
    const maxRadius = 350;

    ctx.save();
    ctx.strokeStyle = `rgba(0,0,0,${0.08 + Math.sin(time) * 0.03})`;
    ctx.lineWidth = 1;

    const spokeAngles = [];
    for (let i = 0; i < numSpokes; i++) {
        spokeAngles.push((i / numSpokes) * Math.PI * 2 + Math.sin(time * 0.5 + i) * 0.02);
    }

    for (let i = 0; i < numSpokes; i++) {
        const angle = spokeAngles[i];
        const targetX = centerX + Math.cos(angle) * maxRadius;
        const targetY = centerY + Math.sin(angle) * maxRadius;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(targetX, targetY);
        ctx.stroke();
    }

    for (let r = 1; r <= numRings; r++) {
        const radius = (r / numRings) * maxRadius;
        ctx.beginPath();
        for (let i = 0; i <= numSpokes; i++) {
            const idx = i % numSpokes;
            const angle = spokeAngles[idx];
            const cpFactor = 0.92;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            const cpX = centerX + Math.cos(angle) * radius * cpFactor;
            const cpY = centerY + Math.sin(angle) * radius * cpFactor;

            if (i === 0) ctx.moveTo(x, y);
            else ctx.quadraticCurveTo(cpX, cpY, x, y);
        }
        ctx.stroke();
    }
    ctx.restore();
}

function drawCat(time) {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#fdf5e6";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawSpiderWeb(time);

    ctx.save();
    ctx.strokeStyle = "rgba(0,0,0,0.15)";
    ctx.lineWidth = 1;
    const ropeSwing = Math.sin(time * 1.5) * 15;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2 + ropeSwing, 0);
    ctx.lineTo(canvas.width / 2, canvas.height / 2 - 50);
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2 + Math.sin(time * 3) * 12);

    const drawSpiderLeg = (x, y, side, index) => {
        ctx.save();
        ctx.translate(x, y);
        let baseAngle = side === -1 ? Math.PI : 0;
        baseAngle += side * (index - 1.5) * 0.45;

        let segmentLength = 28;
        ctx.lineWidth = 8;
        ctx.strokeStyle = "#1a1a1a";
        ctx.lineCap = "round";

        let curX = 0, curY = 0;
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.moveTo(curX, curY);
            const swing = Math.sin(time * 3 + index * 0.7 + i * 0.2) * 0.2;
            let bend = (i * 0.6 + 0.2) * -side;
            if (i === 0) bend = -0.6 * side;
            const angle = baseAngle + bend + swing;
            let nextX = curX + Math.cos(angle) * segmentLength;
            let nextY = curY + Math.sin(angle) * segmentLength;
            ctx.lineTo(nextX, nextY);
            ctx.stroke();
            curX = nextX; curY = nextY;
            segmentLength *= 0.85;
        }
        ctx.restore();
    };

    for (let i = 0; i < 4; i++) {
        let yPos = -20 + i * 18;
        drawSpiderLeg(-35, yPos, -1, i);
        drawSpiderLeg(35, yPos, 1, i);
    }

    ctx.save();
    ctx.translate(0, 50);
    ctx.rotate(Math.sin(time * 2) * 0.5);
    ctx.fillStyle = "#1a1a1a";
    ctx.beginPath(); ctx.roundRect(-25, -8, 50, 16, 8); ctx.fill();
    ctx.restore();

    ctx.fillStyle = "#1a1a1a";
    ctx.beginPath(); ctx.ellipse(0, 10, 55, 65, 0, 0, Math.PI * 2); ctx.fill();

    ctx.save();
    ctx.translate(0, -25);
    ctx.rotate(Math.sin(time * 2) * 0.05);
    const sw = 80;
    ctx.fillStyle = "#4caf50";
    ctx.beginPath(); ctx.roundRect(-sw/2, -10, sw, 20, 10); ctx.fill();
    ctx.fillStyle = "#ffeb3b";
    for(let i = -sw/2 + 5; i < sw/2; i += 20) ctx.fillRect(i, -10, 10, 20);
    ctx.save();
    ctx.translate(15, 10);
    ctx.rotate(0.2 + Math.sin(time * 3) * 0.2);
    ctx.fillStyle = "#4caf50"; ctx.fillRect(0, 0, 15, 30);
    ctx.fillStyle = "#ffeb3b"; ctx.fillRect(0, 10, 15, 10);
    ctx.restore();
    ctx.restore();

    ctx.save();
    ctx.translate(0, -50);
    ctx.fillStyle = "#1a1a1a";
    ctx.beginPath(); ctx.ellipse(0, 0, 45, 38, 0, 0, Math.PI * 2); ctx.fill();

    const drawEar = (s) => {
        ctx.save();
        ctx.translate(s * 25, -25); ctx.rotate(s * 0.2);
        ctx.fillStyle = "#1a1a1a";
        ctx.beginPath(); ctx.moveTo(-12, 10); ctx.lineTo(0, -18); ctx.lineTo(12, 10); ctx.fill();
        ctx.fillStyle = "#ffeb3b";
        ctx.beginPath(); ctx.moveTo(-5, 5); ctx.lineTo(0, -8); ctx.lineTo(5, 5); ctx.fill();
        ctx.restore();
    };
    drawEar(-1); drawEar(1);

    ctx.fillStyle = "white";
    ctx.beginPath(); ctx.arc(-15, -2, 8, 0, Math.PI * 2); ctx.arc(15, -2, 8, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "black";
    ctx.beginPath(); ctx.arc(-15, -2, 3.5, 0, Math.PI * 2); ctx.arc(15, -2, 3.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#ffc0cb";
    ctx.beginPath(); ctx.arc(0, 5, 3, 0, Math.PI * 2); ctx.fill();

    ctx.strokeStyle = "white"; ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-35, 2); ctx.lineTo(-50, 0); ctx.moveTo(-35, 6); ctx.lineTo(-48, 8);
    ctx.moveTo(35, 2); ctx.lineTo(50, 0); ctx.moveTo(35, 6); ctx.lineTo(48, 8);
    ctx.stroke();
    
    ctx.restore();
    ctx.restore();
}

/** @param {DOMHighResTimeStamp} timestamp */
function loop(timestamp) {
    const time = timestamp * 0.002;
    drawCat(time);
    window.requestAnimationFrame(loop);
}

window.requestAnimationFrame(loop);