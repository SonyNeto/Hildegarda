import * as Tone from "https://cdn.skypack.dev/tone";
import chants from './chants.json' with { type: 'json' };

function gabcToTone(gabc){
    const melodyGABC = gabc? [...gabc.matchAll(/\(([^)]*)\)/g)].map(m => m[1].replace(/\[[^\]]*\]/g, "").trim()) : "";
    let melody = [];
    const tones = ["F3", "G3,", "A3", "B3", "C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5", "D5", "E5", "F5", "G5", "A5"];
    const clef = melodyGABC.shift();
    for (let n of melodyGABC) {
        let clean = n.replace(/[^A-Ma-m\.!_]/gi, m => m.match(/[A-Ma-m]/) ? m : '');
        melody = melody.concat(clean.toUpperCase().match(/[A-M][^A-M\s]*/gi) || []);
    }
    melody = melody.map(n => { 
        const chars = n.slice(1);
        switch(true){
            case /^A.?/.test(n): return "A3" + chars;
            case /^B.?/.test(n): return "B3" + chars;
            case /^H.?/.test(n): return "A4" + chars;
            case /^I.?/.test(n): return "B4" + chars;
            case /^J.?/.test(n): return "C5" + chars;
            case /^K.?/.test(n): return "D5" + chars;
            case /^L.?/.test(n): return "E5" + chars;
            case /^M.?/.test(n): return "F5" + chars;
            default: return n[0] + "4" + chars;
        }
    });

    switch (clef){
        case "f3": melody = melody.map(n => {
            const chars = n.slice(2);
            const tone = n.slice(0, 2);
            const toneIndex = tones.indexOf(tone);
            return tones[toneIndex - 2] + chars;
        });
        break;
        case "c3": melody = melody.map(n => {
            const chars = n.slice(2);
            const tone = n.slice(0, 2);
            const toneIndex = tones.indexOf(tone);
            return tones[toneIndex + 2] + chars;
        });
        break;
        case "c4": melody = melody.map(n => {
            const chars = n.slice(2);
            const tone = n.slice(0, 2);
            const toneIndex = tones.indexOf(tone);
            return tones[toneIndex] + chars;
        });
        break;
    }
    melody = melody.map(n => n.includes(".") || n.includes("_") || n.includes("!")? n.replace(/[_!]/gi, ".").replace(/[^A-Za-z345.]/g, ""): n.replace(/[^A-Za-z345]/g, ""));
    return melody;
}

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
    console.log(chantSelect.value);
    if (chantSelect.value) {
        setChantName(chantSelect.value);
        generateSVG();
    }else {
        setChantName(chantSelect.value);
        chantContainer.innerHTML = "";
        middle.style.height = "auto";
    }
    if (melodyDuration > 0) {
        stopMelody();
    }
});

const colors = [
    "rgba(75, 0, 130)",   // violeta
    "rgba(0, 0, 255)",    // azul
    "rgba(0, 127, 255)",  // azul claro / ciano
    "rgba(0, 128, 0)",    // verde
    "rgba(255, 255, 0)",  // amarelo
    "rgba(255, 83, 0)",  // laranja
    "rgba(255, 0, 0)",    // vermelho
    "rgba(202, 42, 75)", // violeta + laranja
    "rgba(0, 191, 128)" // verde + ciano
];

const canvas = document.getElementById("colorAura");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let circles = [];
let isPlaying = false;
let timeouts = [];
const synth = new Tone.Synth({ oscillator: { type: "sine" } }).toDestination();

function activateCircle(note, mode) {
    note = note.replace(/[\d.]+/, "")
    const notes = mode === "major"? ["C", "E", "B", "A", "F", "D", "G", "", "Bb"] :["A", "D", "F", "E", "G", "C", "B", "Bb", ""];
    const i = notes.indexOf(note);
    if (i === -1) return;

    const duration = melodyDuration * 1000;

    const radius = 0;
    const angle = (i / colors.length) * 2 * Math.PI;
    const x = canvas.width/2 + Math.cos(angle) * radius;
    const y = canvas.height/2 + Math.sin(angle) * radius;
    const color = colors[i % colors.length];
    const startTime = performance.now();

    circles.push({x, y, color, startTime, duration});
}

function animate() {
    const now = performance.now();

    for (let i = 0; i < circles.length; i++) {
        const c = circles[i];
        const t = Math.min((now - c.startTime) / c.duration, 1);
        const size = 30 * t + (canvas.height/2 - 30) * Math.sqrt(t);

        ctx.beginPath();
        ctx.fillStyle = c.color;
        ctx.arc(c.x, c.y, size, 0, Math.PI * 2);
        ctx.fill();
    }

    requestAnimationFrame(animate);
}


let melodyDuration = 0;
function playMelody() {
    melodyDuration = 0;
    let currentTime = 0;
    melody.forEach((note) => {
    const duration = note.includes('.')? '2n': '4n';
    const durSec = note.includes('.')? 1: 0.5;

    Tone.Transport.schedule(time => {
        synth.triggerAttackRelease(note.replace(".", ""), duration, time);
        const timeoutId = setTimeout(() => activateCircle(note, mode), 0);
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

    score.performLayoutAsync(ctxt, function() {
        score.layoutChantLines(ctxt, window.innerHeight - 100, function() {
            chantContainer.innerHTML = score.createSvg(ctxt);
            const svg = document.querySelector('svg');
            const height = 2*svg.getAttribute("height");
            middle.style.height = height + "px";
        });
    });
}