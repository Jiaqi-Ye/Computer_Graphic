const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 600;
canvas.height = 400;

let t = 0;

const tank = {
    cx: 300,
    cy: 200,
    rx: 250,
    ry: 140,
    bottomY: 360
};

const fishes = Array.from({ length: 6 }, () => ({
    angle: Math.random() * Math.PI * 2,
    speed: 0.01 + Math.random() * 0.015,
    radiusX: 120 * (0.8 + Math.random() * 0.2),
    radiusY: 70 * (0.8 + Math.random() * 0.2)
}));

const grassCount = 10;
const grasses = Array.from({ length: grassCount }, (_, i) => {
    const spacing = (tank.rx * 2 - 40) / (grassCount - 1); // 40像素左右边距
    return {
        baseX: tank.cx - tank.rx + 20 + i * spacing,
        baseY: tank.bottomY,
        height: 50 + Math.random() * 30,
        phase: Math.random() * Math.PI * 2
    };
});

function drawTank() {
    const grad = ctx.createLinearGradient(0, tank.cy - tank.ry, 0, tank.bottomY);
    grad.addColorStop(0, "rgba(180, 240, 255, 0.5)");
    grad.addColorStop(1, "rgba(120, 220, 255, 0.2)");
    ctx.fillStyle = grad;

    ctx.beginPath();
    ctx.moveTo(tank.cx - tank.rx, tank.cy - tank.ry);
    ctx.bezierCurveTo(tank.cx - tank.rx, tank.cy - tank.ry - 40, tank.cx + tank.rx, tank.cy - tank.ry - 40, tank.cx + tank.rx, tank.cy - tank.ry);
    ctx.bezierCurveTo(tank.cx + tank.rx + 20, tank.cy, tank.cx + tank.rx, tank.bottomY, tank.cx, tank.bottomY);
    ctx.bezierCurveTo(tank.cx - tank.rx, tank.bottomY, tank.cx - tank.rx - 20, tank.cy, tank.cx - tank.rx, tank.cy - tank.ry);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.8)";
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(tank.cx, tank.cy - tank.ry + 10, tank.rx - 20, 15, 0, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(255,255,255,0.6)";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = "#FAF3E0";
    ctx.fillRect(0, tank.bottomY, canvas.width, canvas.height - tank.bottomY);
}

function drawGrass() {
    grasses.forEach(g => {
        const sway = Math.sin(t * 0.05 + g.phase) * 15;
        let topX = g.baseX + sway;
        let topY = g.baseY - g.height;
        if (topX < tank.cx - tank.rx + 20) topX = tank.cx - tank.rx + 20;
        if (topX > tank.cx + tank.rx - 20) topX = tank.cx + tank.rx - 20;
        if (topY < tank.cy - tank.ry + 20) topY = tank.cy - tank.ry + 20;
        ctx.beginPath();
        ctx.moveTo(g.baseX, g.baseY);
        ctx.quadraticCurveTo(g.baseX + sway / 2, g.baseY - g.height / 2, topX, topY);
        ctx.strokeStyle = "rgba(34,139,34,0.7)";
        ctx.lineWidth = 3;
        ctx.stroke();
    });
}

function drawFish(x, y, angle, color) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(-15, -10, -35, 0);
    ctx.quadraticCurveTo(-15, 10, 0, 0);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.beginPath();
    ctx.moveTo(-35, 0);
    ctx.lineTo(-45, -10);
    ctx.lineTo(-45, 10);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.arc(-10, -3, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

function constrainFish(x, y) {
    const dx = x - tank.cx;
    const dy = y - tank.cy;
    const angle = Math.atan2(dy, dx);
    const ellipseRadius = (dx*dx)/(tank.rx*tank.rx) + (dy*dy)/(tank.ry*tank.ry);
    if (ellipseRadius > 0.9) {
        const rX = tank.rx * Math.sqrt(0.9) * Math.cos(angle);
        const rY = tank.ry * Math.sqrt(0.9) * Math.sin(angle);
        return { x: tank.cx + rX, y: tank.cy + rY };
    }
    return { x, y };
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawTank();
    drawGrass();
    fishes.forEach(f => {
        f.angle += f.speed;
        let x = tank.cx + Math.cos(f.angle) * f.radiusX;
        let y = tank.cy + Math.sin(f.angle * 0.7) * f.radiusY;
        const dir = Math.atan2(Math.cos(f.angle * 0.7), -Math.sin(f.angle));
        const pos = constrainFish(x, y);
        drawFish(pos.x, pos.y, dir, "#FF8C00");
    });
    t++;
    requestAnimationFrame(animate);
}

animate();