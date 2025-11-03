import * as Tone from "https://cdn.skypack.dev/tone";
import chants from './chants.json' with { type: 'json' };
import { gabcToTone } from './gabcToTone.js';

const chantSelect = document.getElementById("chantSelect");
const chantNames = chants.map(c => c.name);
chantNames.forEach(name => {
    const option = document.createElement('option');
    option.value = name;
    option.textContent = name;
    chantSelect.appendChild(option);
});

function setChantName(chantName){
    const chant = chants.find(c => c.name === chantName);
    if (chant) {
        gabc = chant.gabc;
        melody = gabcToTone(gabc);
        mode = chant.mode;
    }else {
        gabc = "";
        melody = [];
        mode = "";
    }
}

let gabc;
let melody;
let mode;
chantSelect.addEventListener('change', () => {
    if (chantSelect.value) {
        setChantName(chantSelect.value);
        generateSVG();
    }else {
        setChantName(chantSelect.value);
        chantContainer.innerHTML = "";
        chantContainer.style.height = 0;
        chantContainer.style.width = 0;
        middle.style.height = 0;
        middle.style.width = 0;
    }
    if (melodyDuration > 0) {
        stopMelody();
    }
});

const colors = [
    "rgba(150, 90, 200, 0.8)",  // violeta
    "rgba(80, 120, 255, 0.8)",  // azul
    "rgba(80, 200, 255, 0.8)",  // azul claro / ciano
    "rgba(80, 200, 120, 0.8)",  // verde (mais ciano)
    "rgba(200, 200, 80, 0.8)",  // amarelo
    "rgba(255, 130, 80, 0.8)",  // laranja
    "rgba(255, 100, 100, 0.8)", // vermelho
    "rgba(210, 90, 140, 0.8)",  // violeta + laranja
    "rgba(80, 220, 180, 0.8)"   // verde + ciano
];

const canvas = document.getElementById("colorAura");
const ctx = canvas.getContext("2d");

let circles = [];
let isPlaying = false;
let timeouts = [];
const synth = new Tone.Synth({ oscillator: { type: "sine" } }).toDestination();

function activateCircle(note, mode, noteMelodyIndex) {
    note = note.replace(/[\d.]+/, "")
    const notes = mode === "major"? ["D", "E", "B", "A", "F", "C", "G", "", "Bb"] :["A", "D", "F", "E", "G", "C", "B", "Bb", ""];
    const i = notes.indexOf(note);
    if (i === -1) return;

    const duration = melodyDuration;

    const coords = notesCoords[noteMelodyIndex];
    const xCoord = coords[0];
    const yCoord = coords[1];
    const radius = 0;
    const angle = (i / colors.length) * 2 * Math.PI;
    const x = xCoord + Math.cos(angle) * radius;
    const y = yCoord + Math.sin(angle) * radius;
    const color = colors[i % colors.length];
    const startTime = performance.now();

    circles.push({x, y, color, startTime, duration});
}

function animate() {
    const now = performance.now();

    for (let i = 0; i < circles.length; i++) {
        const c = circles[i];
        const t = Math.min((now - c.startTime) / c.duration, 1);
        const size =  15 * Math.pow(t, 0.2);

        ctx.globalCompositeOperation = "normal";
        ctx.beginPath();
        ctx.fillStyle = c.color;
        ctx.arc(c.x, c.y, size, 0, Math.PI * 2);
        ctx.fill();
    }

    requestAnimationFrame(animate);
}


let melodyDuration = 0;
function playMelody() {
    findSVGNoteCoordinate();
    melodyDuration = 0;
    let currentTime = 0;
    melody.forEach((note, k) => {
    const duration = note.includes('.')? '2n': '4n';
    const durSec = note.includes('.')? 1: 0.5;

    Tone.Transport.schedule(time => {
        synth.triggerAttackRelease(note.replace(".", ""), duration, time);
        const timeoutId = setTimeout(() => activateCircle(note, mode, k), 0);
        timeouts.push(timeoutId);
        }, currentTime);

    currentTime += durSec;
    });
    melodyDuration = currentTime;
    Tone.Transport.start();
    isPlaying = true;
    Tone.Transport.scheduleRepeat(() => updateSeekBar(), 0.1);
}

function pauseMelody() {
    Tone.Transport.pause();
    timeouts.forEach(t => clearTimeout(t));
    timeouts = [];
    isPlaying = false;
}

function stopMelody() {
    circles = [];
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    Tone.Transport.stop();
    Tone.Transport.cancel(0);
    Tone.Transport.seconds = 0;

    timeouts.forEach(t => clearTimeout(t));
    timeouts = [];
    isPlaying = false;

    const seekBar = document.getElementById("seekBar");
    if (seekBar) seekBar.value = 0;
    
    melodyDuration = 0;
}

function updateSeekBar(){
    const seekBar = document.getElementById("seekBar");
    const position = Tone.Transport.seconds;
    seekBar.value = (position/melodyDuration)*100;
}

function handleSeekBarInput(event){
    const value = parseFloat(event.target.value);
    const newValue = (value/100)*melodyDuration;
    Tone.Transport.seconds = newValue;
}


document.getElementById("seekBar").addEventListener("input", handleSeekBarInput);
document.getElementById("playBtn").addEventListener("click", playMelody);
document.getElementById("pauseBtn").addEventListener("click", pauseMelody);
document.getElementById("stopBtn").addEventListener("click", stopMelody);
animate();

function generateSVG() {
    const chantContainer = document.getElementById("chantContainer");
    const middle = document.getElementById("middle");
    chantContainer.innerHTML = "";
    var ctxt = new exsurge.ChantContext();
    var mappings = exsurge.Gabc.createMappingsFromSource(ctxt, gabc);
    var score = new exsurge.ChantScore(ctxt, mappings, true);
    const scaleFactor = 1.5;
    score.performLayoutAsync(ctxt, function() {
        score.layoutChantLines(ctxt, document.documentElement.clientHeight>=document.documentElement.clientWidth? 
            document.documentElement.clientWidth*(1/scaleFactor - 1/15) : document.documentElement.clientWidth*(1/scaleFactor - 1/3), function() {
            chantContainer.innerHTML = score.createSvg(ctxt);
            const svg = document.querySelector('svg');
            const height = svg.getAttribute("height");
            const width = svg.getAttribute("width");

            canvas.height = scaleFactor*height;
            canvas.width = scaleFactor*width;

            chantContainer.style.height = scaleFactor*height + "px";
            chantContainer.style.width = scaleFactor*width + "px";

            middle.style.height = scaleFactor*height + "px";
            middle.style.width = scaleFactor*width + "px";

            svg.style.height = scaleFactor*height + "px";
            svg.style.width = scaleFactor*width + "px";
        });
    });
};

let notesCoords = [];
function findSVGNoteCoordinate() {
    notesCoords = [];
    const svg = document.querySelector('svg');
    if (!svg) return;

    const svgNotes = document.querySelectorAll('[class*=" note"]');

    svgNotes.forEach(note => {
        const pt = svg.createSVGPoint();
        pt.x = parseFloat(note.getAttribute("x") || 0);
        pt.y = parseFloat(note.getAttribute("y") || 0);
        
        const transformed = pt.matrixTransform(note.getCTM());

        const x = (transformed.x);
        const y = (transformed.y);

        notesCoords.push([x, y]);
    });
};