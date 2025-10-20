import * as Tone from "https://cdn.skypack.dev/tone";
import chants from './chants.json' with { type: 'json' };

function gabcToTone(gabc){
    const melodyGABC = gabc? [...gabc.matchAll(/\(([^)]+)\)/g)].map(m => m[1]): "";
    let melody = [];
    for (let n of melodyGABC){
        melody = melody.concat(n.toUpperCase().match(/[B-Mb-m][^A-Za-zÀ-ÿ\s]*/g) || []);
    }
    melody = melody.map(n => { 
        const chars = n.slice(1);
        switch(true){
            case /^H.?/.test(n): return "A" + chars;
            case /^I.?/.test(n): return "B" + chars;
            case /^J.?/.test(n): return "C5" + chars;
            case /^K.?/.test(n): return "D5" + chars;
            case /^L.?/.test(n): return "E5" + chars;
            case /^M.?/.test(n): return "F5" + chars;
            default: return n;
        }
    });

    switch (melody[0]){
        case "F3": melody = melody.map(n => {
            let code = n.charCodeAt(0);
            let newCode;
            let octave;
            const chars = n.slice(1);
            if (code === 65){
                newCode = 70;
            }else if (code === 66){
                newCode = 71;
            }else {
                newCode = code - 2;
            }
            octave = "4";
            return chars.includes("5")? String.fromCharCode(newCode) + chars : String.fromCharCode(newCode) + octave + chars;
        });
        break;
        case "C3": melody = melody.map(n => {
            let code = n.charCodeAt(0);
            let newCode;
            let octave;
            const chars = n.slice(1);
            if (code === 70){
                newCode = 65;
            }else if (code === 71){
                newCode = 66;
            }else {
                newCode = code + 2;
            }
            if (code === 65 || code === 66){
                octave = "5";
            }else {
                octave = "4";
            }
            return chars.includes("5")? String.fromCharCode(newCode) + chars : String.fromCharCode(newCode) + octave + chars;
        });
        break;
        case "C4": melody = melody.map(n => {
            let code = n.charCodeAt(0);
            let octave = "4";
            const chars = n.slice(1);
            return chars.includes("5")? String.fromCharCode(code) + chars : String.fromCharCode(code) + octave + chars;
        });
        break;
    }
    melody.shift();
    melody = melody.map(n => n.includes(".") || n.includes("_")? n.replace("_", ".").replace(/[^A-Za-z45.]/g, ""): n.replace(/[^A-Za-z45]/g, ""));
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
        console.log(gabc, melody, mode)
    }
}

let gabc;
let melody;
let mode;
chantSelect.addEventListener('change', () => {
    setChantName(chantSelect.value);
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