const canvas = /** @type {HTMLCanvasElement} */ (document.getElementById("canvas1"));
const ctx = canvas.getContext("2d");

const config = {
    orbitRadius: 140,
    armLength: 50,
    bodySize: 36,
    rotorRadius: 38,
    scrollSpeed: 0.6, 
    colors: {
        frame: "#f0f9ff",
        accent: "#00f2ff",
        arrow: "#e100ff",
        accentGlow: "#00f2ff",
        core: "#0f172a",
        propeller: "rgba(0, 242, 255, 0.15)",
        bg: "#020617",
        grid: "rgba(0, 242, 255, 0.08)",
        land: ["#020617", "#0f172a", "#1e293b", "#0f172a"],
        spiderBody: "#7c3aed",
        spiderCore: "#fbbf24",
    }
};

const bullets = [];
const bulletSpeed = 8;

// spider
const spiderSystem = {
    spiders: [],
    particles: [],
    config: {
        bodyColor: "#7c3aed",
        coreColor: "#fbbf24",
        spawnRate: 0.02,
        maxSpiders: 15
    },
    spawn(canvas) {
        if (Math.random() < this.config.spawnRate && this.spiders.length < this.config.maxSpiders) {
            this.spiders.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: 14 + Math.random() * 8,
                angle: Math.random() * Math.PI * 2,
                speed: 0.5 + Math.random() * 1.5,
                phase: Math.random() * 100,
                hp: 1
            });
        }
    },
    explode(x, y) {
        for (let i = 0; i < 25; i++) {
            this.particles.push({
                x, y,
                vx: (Math.random() - 0.5) * 12,
                vy: (Math.random() - 0.5) * 12,
                size: Math.random() * 4 + 2,
                life: 1.0,
                color: Math.random() > 0.5 ? this.config.bodyColor : this.config.coreColor
            });
        }
    },
    updateAndDraw(ctx, timestamp, canvasWidth, canvasHeight) {
        const t = timestamp / 1000;

        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.025;
            if (p.life <= 0) { this.particles.splice(i, 1); continue; }
            
            ctx.save();
            ctx.globalAlpha = p.life;
            ctx.shadowBlur = 10;
            ctx.shadowColor = p.color;
            ctx.fillStyle = p.color;
            ctx.fillRect(p.x, p.y, p.size, p.size);
            ctx.restore();
        }

        for (let i = this.spiders.length - 1; i >= 0; i--) {
            const s = this.spiders[i];
            s.x += Math.cos(s.angle) * s.speed;
            s.y += Math.sin(s.angle) * s.speed;
            if (s.x < 0 || s.x > canvasWidth) s.angle = Math.PI - s.angle;
            if (s.y < 0 || s.y > canvasHeight) s.angle = -s.angle;

            ctx.save();
            ctx.translate(s.x, s.y);
            ctx.rotate(s.angle + Math.PI / 2);

            ctx.strokeStyle = this.config.bodyColor;
            ctx.lineWidth = 2;
            for (let j = 0; j < 8; j++) {
                const isRight = j < 4;
                const walk = Math.sin(t * 12 + s.phase + j) * 0.5;
                const legAngle = isRight ? (j * 0.4 - 0.6) : ((j - 4) * 0.4 + Math.PI - 0.6);
                ctx.beginPath();
                ctx.moveTo(0, 0);
                const x1 = Math.cos(legAngle + walk) * s.size;
                const y1 = Math.sin(legAngle + walk) * s.size;
                ctx.lineTo(x1, y1);
                ctx.stroke();
            }

            ctx.shadowBlur = 10;
            ctx.shadowColor = this.config.bodyColor;
            ctx.fillStyle = this.config.bodyColor;
            ctx.beginPath();
            ctx.ellipse(0, 0, s.size * 0.4, s.size * 0.6, 0, 0, Math.PI * 2);
            ctx.fill();

            const pulse = Math.abs(Math.sin(t * 5 + s.phase));
            ctx.shadowBlur = 15 * pulse;
            ctx.shadowColor = this.config.coreColor;
            ctx.fillStyle = this.config.coreColor;
            ctx.beginPath();
            ctx.arc(0, -s.size * 0.2, 4 * pulse, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }
};

// background
const mapSize = { w: 1400, h: 1400 };
const mapElements = {
    blocks: Array.from({ length: 40 }, () => ({
        x: Math.random() * mapSize.w,
        y: Math.random() * mapSize.h,
        w: 100 + Math.random() * 200,
        h: 100 + Math.random() * 200,
        depth: Math.random() * 5 + 2,
        color: config.colors.land[Math.floor(Math.random() * config.colors.land.length)]
    })),
    lightBands: Array.from({ length: 8 }, () => ({
        y: Math.random() * mapSize.h,
        h: 2 + Math.random() * 4,
        speed: 2 + Math.random() * 5,
        opacity: 0.1 + Math.random() * 0.2
    }))
};

function drawBackground(timestamp) {
    const offsetX = (timestamp * config.scrollSpeed / 10) % mapSize.w;
    const offsetY = (timestamp * config.scrollSpeed / 15) % mapSize.h;
    ctx.fillStyle = config.colors.bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(-offsetX, offsetY);

    for (let i = 0; i < 2; i++) {
        for (let j = -1; j < 1; j++) {
            ctx.save();
            ctx.translate(i * mapSize.w, j * mapSize.h);
            
            mapElements.lightBands.forEach(lb => {
                const bandX = (timestamp * lb.speed) % mapSize.w;
                ctx.fillStyle = config.colors.accent;
                ctx.globalAlpha = lb.opacity;
                ctx.fillRect(0, lb.y, mapSize.w, lb.h);
                ctx.fillRect(bandX, lb.y, 100, lb.h);
            });
            ctx.globalAlpha = 1.0;

            ctx.strokeStyle = config.colors.grid;
            ctx.beginPath();
            for(let x=0; x<mapSize.w; x+=70) { ctx.moveTo(x, 0); ctx.lineTo(x, mapSize.h); }
            for(let y=0; y<mapSize.h; y+=70) { ctx.moveTo(0, y); ctx.lineTo(mapSize.w, y); }
            ctx.stroke();

            mapElements.blocks.forEach(b => {
                ctx.fillStyle = "rgba(0,0,0,0.3)";
                ctx.fillRect(b.x + b.depth, b.y + b.depth, b.w, b.h);
                ctx.fillStyle = b.color;
                ctx.fillRect(b.x, b.y, b.w, b.h);
            });
            ctx.restore();
        }
    }
    ctx.restore();
}

// shoot
canvas.addEventListener("click", (e) => {
    const t = performance.now() / 1000;
    const x = canvas.width / 2 + Math.cos(t * 0.7) * config.orbitRadius;
    const y = canvas.height / 2 + Math.sin(t * 0.5) * (config.orbitRadius * 0.6);
    const dx = -Math.sin(t * 0.7) * 0.7 * config.orbitRadius;
    const dy = Math.cos(t * 0.5) * 0.5 * (config.orbitRadius * 0.6);
    const baseAngle = Math.atan2(dy, dx);

    for(let i = -1; i <= 1; i++) {
        const angle = baseAngle + (i * 0.15);
        bullets.push({ 
            x, y, 
            vx: Math.cos(angle) * bulletSpeed, 
            vy: Math.sin(angle) * bulletSpeed,
            bounces: 0 
        });
    }
});

// bullets
function drawBullets(ctx) {
    ctx.shadowBlur = 8;
    ctx.shadowColor = "#fb00ff";
    ctx.fillStyle = "#fb00ff";
    for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];
        ctx.beginPath();
        ctx.arc(b.x, b.y, 4, 0, Math.PI * 2);
        ctx.fill();
        
        b.x += b.vx;
        b.y += b.vy;

        if (b.x < 0 || b.x > canvas.width) {
            b.vx *= -1;
            b.bounces++;
        }
        if (b.y < 0 || b.y > canvas.height) {
            b.vy *= -1;
            b.bounces++;
        }

        if (b.bounces > 3) bullets.splice(i, 1);
    }
    ctx.shadowBlur = 0;
}

function checkCollisions() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];
        for (let j = spiderSystem.spiders.length - 1; j >= 0; j--) {
            const s = spiderSystem.spiders[j];
            const dx = b.x - s.x;
            const dy = b.y - s.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < s.size) {
                spiderSystem.explode(s.x, s.y);
                bullets.splice(i, 1);
                spiderSystem.spiders.splice(j, 1);
                break;
            }
        }
    }
}

// drone1
function drawDrone(ctx, timestamp) {
    const t = timestamp / 1000;
    const radiusX = config.orbitRadius;
    const radiusY = config.orbitRadius * 0.6;
    const x = canvas.width / 2 + Math.cos(t * 0.7) * radiusX;
    const y = canvas.height / 2 + Math.sin(t * 0.5) * radiusY;
    const dx = -Math.sin(t * 0.7) * 0.7 * radiusX;
    const dy = Math.cos(t * 0.5) * 0.5 * radiusY;
    const angle = Math.atan2(dy, dx);

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.strokeStyle = config.colors.frame;
    ctx.lineWidth = 8;
    const positions = [{x:1,y:1}, {x:-1,y:1}, {x:-1,y:-1}, {x:1,y:-1}];
    positions.forEach((pos, i) => {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(pos.x * config.armLength, pos.y * config.armLength);
        ctx.stroke();
        ctx.save();
        ctx.translate(pos.x * config.armLength, pos.y * config.armLength);
        ctx.fillStyle = config.colors.propeller;
        ctx.beginPath();
        ctx.arc(0, 0, config.rotorRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.rotate(t * [10, 80, 40, 20][i]);
        ctx.strokeStyle = config.colors.accent;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-config.rotorRadius, 0);
        ctx.lineTo(config.rotorRadius, 0);
        ctx.stroke();
        ctx.restore();
    });
    ctx.shadowBlur = 20;
    ctx.shadowColor = config.colors.accentGlow;
    ctx.fillStyle = config.colors.frame;
    ctx.beginPath();
    ctx.moveTo(-20, -10); ctx.lineTo(0, -22); ctx.lineTo(20, -10); ctx.lineTo(20, 10); ctx.lineTo(0, 22); ctx.lineTo(-20, 10);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = config.colors.core;
    ctx.fillRect(-12, -8, 24, 16);
    ctx.fillStyle = `rgba(0, 242, 255, ${Math.abs(Math.sin(t * 3))})`;
    ctx.beginPath(); ctx.arc(0, 0, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = config.colors.arrow;
    ctx.beginPath();
    ctx.moveTo(config.bodySize / 2 + 8, 0); ctx.lineTo(config.bodySize / 2, -10); ctx.lineTo(config.bodySize / 2, 10);
    ctx.closePath(); ctx.fill();
    ctx.restore();
}

//drone2
function drawDrone2(ctx, timestamp) {
    const t = timestamp / 1000;
    const outerRadius = config.orbitRadius * 1.8;
    const x = canvas.width / 2 + Math.cos(-t * 0.4) * outerRadius;
    const y = canvas.height / 2 + Math.sin(-t * 0.4) * outerRadius + Math.sin(t * 2) * 30;

    const dx = Math.sin(-t * 0.4) * outerRadius;
    const dy = -Math.cos(-t * 0.4) * outerRadius;
    const angle = Math.atan2(dy, dx);

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    const drone2Colors = { frame: "#334155", accent: "#fb923c", glow: "#ea580c" };
    ctx.strokeStyle = drone2Colors.frame;
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(-22, -12); ctx.lineTo(-22, 12);
    ctx.moveTo(22, -12); ctx.lineTo(22, 12);
    ctx.stroke();

    const motorPos = [
        {x: -22, y: -18, s: 1}, {x: -22, y: 18, s: -1.2},
        {x: 22, y: -18, s: 1.5}, {x: 22, y: 18, s: -1}
    ];
    motorPos.forEach((m) => {
        ctx.save();
        ctx.translate(m.x, m.y);
        ctx.strokeStyle = "rgba(251, 146, 60, 0.2)";
        ctx.beginPath();
        ctx.arc(0, 0, 20, 0, Math.PI * 2);
        ctx.stroke();
        ctx.rotate(t * 12 * m.s);
        ctx.strokeStyle = drone2Colors.accent;
        ctx.lineWidth = 3;
        for(let j=0; j<2; j++){
            ctx.rotate(Math.PI);
            ctx.beginPath();
            ctx.moveTo(8, 0); ctx.lineTo(18, 0);
            ctx.stroke();
        }
        ctx.restore();
    });

    ctx.shadowBlur = 15;
    ctx.shadowColor = drone2Colors.glow;
    ctx.fillStyle = "#fef3c7"; 
    ctx.beginPath();
    ctx.moveTo(-30, 0); ctx.lineTo(0, -10); ctx.lineTo(35, 0); ctx.lineTo(0, 10);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
}

// animate
function animate(timestamp) {
    drawBackground(timestamp);
    spiderSystem.spawn(canvas);
    spiderSystem.updateAndDraw(ctx, timestamp, canvas.width, canvas.height);
    drawDrone(ctx, timestamp);
    drawDrone2(ctx, timestamp);
    drawBullets(ctx);
    checkCollisions();
    requestAnimationFrame(animate);
}

requestAnimationFrame(animate);