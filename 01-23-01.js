
let canvas = /** @type {HTMLCanvasElement} */ (document.getElementById("box2canvas"));
let ctx = canvas.getContext('2d');

let mouseX = -10;
let mouseY = -10;

let fireworks = [];
let particles = [];

canvas.onmousemove = function(event){
    let rect = canvas.getBoundingClientRect();
    mouseX = event.clientX - rect.left;
    mouseY = event.clientY - rect.top;
};

canvas.onmouseleave = function(){
    mouseX = -10;
    mouseY = -10;
};

canvas.onclick = function(){
    if(mouseX >=0 && mouseY >=0){
        spawnFirework(mouseX, mouseY);
    }
}

// spawn a new firework to target coordinates
function spawnFirework(targetX, targetY){
    let startX = canvas.width * Math.random();
    let startY = canvas.height;
    let color = randomColor();
    fireworks.push({x:startX, y:startY, targetX, targetY, color, exploded:false, trail: [], radius: 8}); 
}

// create explosion particles at x,y with given color
function spawnParticles(x, y, color){
    let count = 80 + Math.floor(Math.random()*50);
    for(let i=0;i<count;i++){
        let angle = Math.random()*Math.PI*2;
        let speed = 2 + Math.random()*4;
        particles.push({
            x:x, y:y,
            vx: Math.cos(angle)*speed,
            vy: Math.sin(angle)*speed,
            colorStart: color,
            colorEnd: 'white',
            life: 70 + Math.floor(Math.random()*40),
            trail: [],
            size: 4 + Math.random()*3 
        });
    }
}

// generate a random HSL color
function randomColor(){
    return 'hsl(' + Math.floor(Math.random()*360) + ', 100%, 70%)';
}

// interpolate between two colors
function interpolateColor(start, end, t){
    let h1 = parseInt(start.match(/hsl\((\d+),/)[1]);
    let h2 = end === 'white' ? 0 : parseInt(end.match(/hsl\((\d+),/)[1]);
    let h = h1 + (h2 - h1) * t;
    return `hsl(${h},100%,${50 + 50*(1-t)}%)`; 
}

// animation loop
function animate(){
    ctx.fillStyle = 'rgba(6, 12, 55, 0.2)';
    ctx.fillRect(0,0,canvas.width,canvas.height);

    for(let i=fireworks.length-1;i>=0;i--){
        let f = fireworks[i];

        f.trail.push({x: f.x, y: f.y});
        if(f.trail.length > 12) f.trail.shift();

        let dx = f.targetX - f.x;
        let dy = f.targetY - f.y;
        let dist = Math.sqrt(dx*dx + dy*dy);

        if(dist < 2 && !f.exploded){
            f.exploded = true;
            spawnParticles(f.x, f.y, f.color);
        }

        if(!f.exploded){
            f.x += dx*0.03; 
            f.y += dy*0.03;

            for(let j=0;j<f.trail.length;j++){
                let t = f.trail[j];
                ctx.fillStyle = `hsla(${parseInt(f.color.slice(4))},100%,50%,${j/f.trail.length})`;
                ctx.beginPath();
                ctx.arc(t.x, t.y, f.radius/2, 0, Math.PI*2); 
                ctx.fill();
            }

            ctx.fillStyle = f.color;
            ctx.beginPath();
            ctx.arc(f.x,f.y,f.radius,0,Math.PI*2); 
            ctx.fill();
        }else{
            fireworks.splice(i,1);
        }
    }

    for(let i=particles.length-1;i>=0;i--){
        let p = particles[i];

        p.trail.push({x: p.x, y: p.y});
        if(p.trail.length > 8) p.trail.shift();

        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.05; 
        p.life--;

        for(let j=0;j<p.trail.length;j++){
            let t = p.trail[j];
            let alpha = j/p.trail.length * p.life/80;
            let color = interpolateColor(p.colorStart, p.colorEnd, j/p.trail.length);
            ctx.fillStyle = `hsla(${color.match(/\d+/g)[0]},100%,50%,${alpha})`;
            ctx.fillRect(t.x-p.size/2, t.y-p.size/2, p.size, p.size);
        }

        if(p.life<=0){
            particles.splice(i,1);
        }
    }

    if(Math.random() < 0.02){
        let x = canvas.width * Math.random();
        let y = canvas.height * Math.random() * 0.5;
        spawnFirework(x, y);
    }

    requestAnimationFrame(animate);
}

animate();
