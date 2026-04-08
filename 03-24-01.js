// @ts-check
import { draggablePoints } from "/libs/CS559/dragPoints.js";
import { RunCanvas } from "/libs/CS559/runCanvas.js";

/** @type {Array<[number,number]>} */
let thePoints = [[100,250],[150,500],[350,550],[500,400],[500,150],[300,50]];
let arcTable = [];
let totalLength = 0;

/** Spline Math */
function getPointAt(t, isBSpline = false) {
    const n = thePoints.length;
    const i = Math.floor(t) % n;
    const u = t - Math.floor(t);
    const p0 = thePoints[(i + n - 1) % n],
          p1 = thePoints[i],
          p2 = thePoints[(i + 1) % n],
          p3 = thePoints[(i + 2) % n];

    if (isBSpline) {
        const b0 = (1-u)**3/6, b1 = (3*u**3-6*u**2+4)/6, b2 = (-3*u**3+3*u**2+3*u+1)/6, b3 = u**3/6;
        return [b0*p0[0]+b1*p1[0]+b2*p2[0]+b3*p3[0], b0*p0[1]+b1*p1[1]+b2*p2[1]+b3*p3[1]];
    } else {
        const s = 0.5;
        const b0 = -s*u**3+2*s*u**2-s*u,
              b1 = (2-s)*u**3+(s-3)*u**2+1,
              b2 = (s-2)*u**3+(3-2*s)*u**2+s*u,
              b3 = s*u**3-s*u**2;
        return [b0*p0[0]+b1*p1[0]+b2*p2[0]+b3*p3[0], b0*p0[1]+b1*p1[1]+b2*p2[1]+b3*p3[1]];
    }
}

function buildArcTable(isBSpline) {
    arcTable = [{ s: 0, t: 0 }];
    totalLength = 0;
    const steps = 200;
    let prev = getPointAt(0, isBSpline);
    for (let i=1; i<=steps; i++){
        let t = (i/steps)*thePoints.length;
        let curr = getPointAt(t, isBSpline);
        totalLength += Math.hypot(curr[0]-prev[0], curr[1]-prev[1]);
        arcTable.push({ s: totalLength, t: t });
        prev = curr;
    }
}

function getTFromS(s) {
    s = s % totalLength;
    for(let i=0;i<arcTable.length-1;i++){
        if(s >= arcTable[i].s && s <= arcTable[i+1].s){
            let ratio = (s - arcTable[i].s)/(arcTable[i+1].s - arcTable[i].s);
            return arcTable[i].t + ratio*(arcTable[i+1].t - arcTable[i].t);
        }
    }
    return 0;
}

/** Scenery */
function drawCloud(ctx, x, y, scale) {
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(x, y, 20 * scale, 0, Math.PI * 2);
    ctx.arc(x + 25 * scale, y - 10 * scale, 25 * scale, 0, Math.PI * 2);
    ctx.arc(x + 50 * scale, y, 20 * scale, 0, Math.PI * 2);
    ctx.arc(x + 25 * scale, y + 10 * scale, 20 * scale, 0, Math.PI * 2);
    ctx.fill();
}

function drawTree(ctx, x, y) {
    ctx.fillStyle = "#5D4037"; ctx.fillRect(x-5,y,10,20);
    ctx.fillStyle = "#2E7D32";
    ctx.beginPath(); ctx.arc(x, y-5, 15,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(x-10,y+5,12,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(x+10,y+5,12,0,Math.PI*2); ctx.fill();
}

function drawHouse(ctx, x, y) {
    ctx.fillStyle = "#FFCCBC"; ctx.fillRect(x,y,40,30);
    ctx.fillStyle = "#D84315";
    ctx.beginPath(); ctx.moveTo(x-5,y); ctx.lineTo(x+20,y-15); ctx.lineTo(x+45,y); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#795548"; ctx.fillRect(x+15,y+15,10,15);
}

function drawFlower(ctx, x, y, color) {
    ctx.fillStyle = color;
    for(let i=0;i<5;i++){
        ctx.beginPath(); ctx.arc(x+Math.cos(i*72)*4, y+Math.sin(i*72)*4, 3, 0, Math.PI*2); ctx.fill();
    }
    ctx.fillStyle="yellow"; ctx.beginPath(); ctx.arc(x,y,2,0,Math.PI*2); ctx.fill();
}

function drawScenery(ctx){
    let skyGrd=ctx.createLinearGradient(0,0,0,350);
    skyGrd.addColorStop(0,"#89CFF0"); skyGrd.addColorStop(1,"#C8E6C9");
    ctx.fillStyle=skyGrd; ctx.fillRect(0,0,600,600);

    drawCloud(ctx,100,80,1); drawCloud(ctx,350,50,0.8); drawCloud(ctx,500,120,1.2);

    ctx.fillStyle="#81C784"; ctx.beginPath(); ctx.moveTo(0,400);
    for(let x=0;x<=600;x+=50) ctx.lineTo(x,350+Math.sin(x*0.02)*30);
    ctx.lineTo(600,600); ctx.lineTo(0,600); ctx.fill();

    ctx.fillStyle="#A5D6A7"; ctx.fillRect(0,420,600,180);

    drawHouse(ctx,50,380); drawTree(ctx,150,410); drawTree(ctx,450,390); drawTree(ctx,550,430);

    const flowers = [
        [120,550,"red"],[200,480,"pink"],[380,520,"white"],[520,570,"purple"],
        [250,500,"orange"],[300,540,"yellow"],[420,460,"magenta"],[470,500,"cyan"]
    ];
    flowers.forEach(f=>drawFlower(ctx,f[0],f[1],f[2]));
}

/** Track */
function drawTrack(ctx,isBSpline){
    const showTies=document.getElementById("check-rail-ties").checked;
    const showRails=document.getElementById("check-parallel").checked;

    if(showTies){
        ctx.strokeStyle="#6D4C41"; ctx.lineWidth=4;
        for(let s=0;s<totalLength;s+=15){
            let t=getTFromS(s), p=getPointAt(t,isBSpline), pNext=getPointAt(getTFromS(s+1),isBSpline);
            let dx=pNext[0]-p[0], dy=pNext[1]-p[1], len=Math.hypot(dx,dy);
            let nx=-dy/len, ny=dx/len;
            ctx.beginPath(); ctx.moveTo(p[0]+12*nx,p[1]+12*ny); ctx.lineTo(p[0]-12*nx,p[1]-12*ny); ctx.stroke();
        }
    }

    if(showRails){
        ctx.strokeStyle="#757575"; ctx.lineWidth=2;
        [8,-8].forEach(offset=>{
            ctx.beginPath();
            for(let s=0;s<=totalLength;s+=2){
                let t=getTFromS(s),p=getPointAt(t,isBSpline),pNext=getPointAt(getTFromS(s+1),isBSpline);
                let dx=pNext[0]-p[0], dy=pNext[1]-p[1], len=Math.hypot(dx,dy);
                let nx=-dy/len, ny=dx/len;
                ctx.lineTo(p[0]+offset*nx,p[1]+offset*ny);
            }
            ctx.stroke();
        });
    }
}

/** Train */
function drawTrainCar(ctx,t,isBSpline,isEngine,time){
    let p=getPointAt(t,isBSpline),pNext=getPointAt(t+0.01,isBSpline);
    let angle=Math.atan2(pNext[1]-p[1],pNext[0]-p[0]);

    ctx.save();
    ctx.translate(p[0],p[1]);
    ctx.rotate(angle);
    ctx.scale(1.4,1.4);

    if(isEngine){
        ctx.fillStyle="#C62828"; ctx.fillRect(-18,-12,36,24);
        ctx.fillStyle="#37474F"; ctx.fillRect(6,-14,16,28);
        ctx.fillStyle="#212121"; ctx.fillRect(-14,-18,8,12);
        ctx.strokeStyle="#212121"; ctx.lineWidth=2;
        [-12,0,12].forEach(x=>{ctx.beginPath();ctx.arc(x,12,6,0,Math.PI*2);ctx.stroke();});

        if(document.getElementById("check-smoke").checked){
            for(let j=0;j<5;j++){
                ctx.fillStyle=`rgba(255,255,255,${0.3+Math.sin(time*0.002+j*0.5)*0.25})`;
                ctx.beginPath(); ctx.arc(-10 - (j*5), -25 - (j*10), 6 + j*3, 0, Math.PI*2); ctx.fill();
            }
        }
    } else {
        ctx.fillStyle="#1565C0"; ctx.fillRect(-15,-10,30,20);
        ctx.fillStyle="#E3F2FD"; ctx.fillRect(-9,-6,8,6); ctx.fillRect(1,-6,8,6);
        ctx.strokeStyle="#1A237E"; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(0,11,5,0,Math.PI*2); ctx.stroke();
    }
    ctx.restore();
}

/** Main Draw */
function draw(canvas, tParam) {
    const ctx = canvas.getContext("2d");
    const isBSpline = document.getElementById("check-bspline").checked;
    const useArc = document.getElementById("check-arc-length").checked;

    ctx.clearRect(0, 0, 600, 600);

    drawScenery(ctx);

    buildArcTable(isBSpline);

    drawTrack(ctx, isBSpline);

    if (
        useArc &&
        !isBSpline &&
        !document.getElementById("check-parallel").checked &&
        !document.getElementById("check-rail-ties").checked &&
        !document.getElementById("check-multi").checked &&
        !document.getElementById("check-smoke").checked
    ) {
        ctx.strokeStyle = "rgba(100,100,100,0.5)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        const steps = 200;
        for (let i = 0; i <= steps; i++) {
            let t = (i / steps) * thePoints.length;
            let p = getPointAt(t, false); // Cardinal Spline
            if (i === 0) ctx.moveTo(p[0], p[1]);
            else ctx.lineTo(p[0], p[1]);
        }
        ctx.stroke();
    }

    let trainT = useArc ? getTFromS((tParam / thePoints.length) * totalLength) : tParam;

    if (document.getElementById("check-multi").checked) {
        const spacing = useArc ? 50 : 0.6; 
        for (let i = 0; i < 3; i++) {
            let carT = useArc
                ? getTFromS((((tParam / thePoints.length) * totalLength) - i * spacing + totalLength) % totalLength)
                : (tParam - i * spacing + thePoints.length) % thePoints.length;
            drawTrainCar(ctx, carT, isBSpline, i === 0, Date.now());
        }
    } else {
        drawTrainCar(ctx, trainT, isBSpline, true, Date.now());
    }

    thePoints.forEach(p => {
        ctx.fillStyle = "white";
        ctx.strokeStyle = "#333";
        ctx.beginPath();
        ctx.arc(p[0], p[1], 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
    });
}

/** Setup */
let canvas=document.getElementById("canvas1");
let run=new RunCanvas(canvas,(canvas,val)=>draw(canvas,val));
run.setupSlider(0,thePoints.length,0.01);
run.setValue(0);

draggablePoints(canvas,thePoints,()=>{},10);


