let canvas = document.getElementById("creative1canvas");
let ctx = canvas.getContext("2d");

let clouds = [];
for (let i = 0; i < 6; i++) {
    clouds.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: 20 + Math.random() * 30,
        speed: 0.3 + Math.random() * 0.5
    });
}

let plane = {
    x: 50,
    y: canvas.height / 2 - 30,
    width: 60,
    height: 60
};

let missiles = [];
let tailParticles = [];
let score = 0;
let gameOver = false;

let scoreDisplay = document.getElementById("score");
let restartBtn = document.getElementById("restartBtn");

let mouseY = plane.y;
canvas.addEventListener("mousemove", e => {
    let rect = canvas.getBoundingClientRect();
    mouseY = e.clientY - rect.top - plane.height / 2;
});

function drawBackground() {
    let gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, "#87CEEB");
    gradient.addColorStop(1, "#E0F6FF");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    clouds.forEach(c => {
        c.x -= c.speed;
        if (c.x + c.r * 2 < 0) {
            c.x = canvas.width + c.r * 2;
            c.y = Math.random() * canvas.height;
        }
        ctx.fillStyle = "rgba(255,255,255,0.8)";
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
        ctx.arc(c.x + c.r, c.y + 5, c.r * 0.8, 0, Math.PI * 2);
        ctx.arc(c.x - c.r, c.y + 5, c.r * 0.8, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawPlane() {
    let x = plane.x;
    let y = plane.y;
    let w = plane.width;
    let h = plane.height;

    ctx.save();

    let bodyGradient = ctx.createLinearGradient(x, y, x + w, y + h);
    bodyGradient.addColorStop(0, "#4fc3f7");
    bodyGradient.addColorStop(1, "#0288d1");
    ctx.fillStyle = bodyGradient;
    ctx.beginPath();
    ctx.moveTo(x, y + h * 0.4);
    ctx.quadraticCurveTo(x + w * 0.5, y, x + w, y + h * 0.5);
    ctx.quadraticCurveTo(x + w * 0.5, y + h, x, y + h * 0.6);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#7b1fa2";
    ctx.beginPath();
    ctx.moveTo(x + 5, y + h * 0.4);
    ctx.lineTo(x - 5, y - 5);
    ctx.lineTo(x + 15, y + h * 0.4);
    ctx.fill();

    let wingGradient = ctx.createLinearGradient(x, y, x, y + h);
    wingGradient.addColorStop(0, "#ff80ab");
    wingGradient.addColorStop(1, "#f50057");
    ctx.fillStyle = wingGradient;
    ctx.beginPath();
    ctx.moveTo(x + w * 0.3, y + h * 0.5);
    ctx.lineTo(x + w * 0.1, y + h + 5);
    ctx.lineTo(x + w * 0.6, y + h * 0.5);
    ctx.fill();

    ctx.fillStyle = "#00e5ff";
    ctx.beginPath();
    ctx.ellipse(x + w * 0.7, y + h * 0.4, w * 0.15, h * 0.1, Math.PI / -10, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(255, 255, 255, 0.83)";
    ctx.beginPath();
    ctx.arc(x + w * 0.72, y + h * 0.38, 2, 0, Math.PI * 2);
    ctx.fill();

    if (!gameOver) {
        let flameLength = 15 + Math.random() * 5;
        let flameWidth = 6 + Math.random() * 3;

        let flameGradient = ctx.createLinearGradient(x - flameLength, y + h * 0.5, x, y + h * 0.5);
        flameGradient.addColorStop(0, "rgba(255, 87, 34, 0)");
        flameGradient.addColorStop(0.3, "rgba(255, 152, 0, 0.6)");
        flameGradient.addColorStop(0.6, "rgba(255, 235, 59, 0.8)");
        flameGradient.addColorStop(1, "rgba(255, 255, 255, 1)");
        ctx.fillStyle = flameGradient;
        ctx.beginPath();
        ctx.moveTo(x, y + h * 0.5 - flameWidth / 2);
        ctx.lineTo(x - flameLength, y + h * 0.5);
        ctx.lineTo(x, y + h * 0.5 + flameWidth / 2);
        ctx.closePath();
        ctx.fill();

        let glow = ctx.createRadialGradient(x, y + h * 0.5, 0, x, y + h * 0.5, flameLength * 1.2);
        glow.addColorStop(0, "rgba(255, 152, 0, 0.6)");
        glow.addColorStop(1, "rgba(255, 87, 34, 0)");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(x, y + h * 0.5, flameLength, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.restore();
}

function spawnMissile() {
    let y = Math.random() * (canvas.height - 30);
    let speed = 3 + Math.random() * 3;
    let type = Math.floor(Math.random() * 3);
    missiles.push({ x: canvas.width, y, width: 30, height: 15, speed, type });
}

function isCollide(a, b) {
    return !(a.x + a.width < b.x || a.x > b.x + b.width || a.y + a.height < b.y || a.y > b.y + b.height);
}

function createTailParticle() {
    let x = plane.x;
    let y = plane.y + plane.height / 2 + (Math.random() * 10 - 5);
    let size = 4 + Math.random() * 3;
    let speedX = -2 - Math.random() * 2;
    let alpha = 1;
    tailParticles.push({ x, y, size, speedX, alpha });
}

function drawMissile(m) {
    m.x -= m.speed;

    ctx.save();
    let angle = (Math.random() - 0.5) * 0.1;
    ctx.translate(m.x + m.width / 2, m.y + m.height / 2);
    ctx.rotate(angle);
    ctx.translate(-m.x - m.width / 2, -m.y - m.height / 2);

    let missileGradient = ctx.createLinearGradient(m.x, m.y, m.x + m.width, m.y);
    missileGradient.addColorStop(0, "#ff5722");
    missileGradient.addColorStop(1, "#d50000");
    ctx.fillStyle = missileGradient;

    ctx.beginPath();
    if (m.type === 0) {
        ctx.ellipse(m.x + m.width / 2, m.y + m.height / 2, m.width / 2, m.height / 2, 0, 0, Math.PI * 2);
    } else if (m.type === 1) {
        ctx.moveTo(m.x, m.y);
        ctx.lineTo(m.x + m.width, m.y + m.height / 2);
        ctx.lineTo(m.x, m.y + m.height);
        ctx.closePath();
    } else if (m.type === 2) {
        ctx.moveTo(m.x, m.y + m.height / 2);
        ctx.lineTo(m.x + m.width * 0.8, m.y);
        ctx.lineTo(m.x + m.width * 0.8, m.y + m.height);
        ctx.closePath();
        ctx.moveTo(m.x + m.width * 0.8, m.y + m.height * 0.25);
        ctx.lineTo(m.x + m.width, m.y + m.height * 0.35);
        ctx.lineTo(m.x + m.width * 0.8, m.y + m.height * 0.45);
        ctx.fill();
        ctx.beginPath();
    }
    ctx.fill();
    ctx.restore();
}

function animate() {
    drawBackground();

    plane.y += (mouseY - plane.y) * 0.2;
    if (plane.y < 0) plane.y = 0;
    if (plane.y + plane.height > canvas.height) plane.y = canvas.height - plane.height;

    if (!gameOver) createTailParticle();

    tailParticles.forEach(p => {
        p.x += p.speedX;
        p.alpha -= 0.03;
        ctx.fillStyle = `rgba(255, 165, 0, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
    });
    tailParticles = tailParticles.filter(p => p.alpha > 0);

    drawPlane();

    if (Math.random() < 0.02) spawnMissile();
    missiles.forEach(missile => {
        drawMissile(missile);
        if (isCollide(plane, missile)) gameOver = true;
    });
    missiles = missiles.filter(m => m.x + m.width > 0);

    if (!gameOver) {
        score++;
        scoreDisplay.textContent = "Score: " + score;
        requestAnimationFrame(animate);
    } else {
        ctx.fillStyle = "black";
        ctx.font = "30px Arial";
        ctx.fillText("Game Over!", canvas.width / 2 - 80, canvas.height / 2);
    }
}

restartBtn.addEventListener("click", () => {
    plane.y = canvas.height / 2 - 30;
    missiles = [];
    tailParticles = [];
    score = 0;
    gameOver = false;
    scoreDisplay.textContent = "Score: " + score;
    animate();
});

animate();

