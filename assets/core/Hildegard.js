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

const colorAura = document.getElementById("colorAura");

// Cria os 7 círculos coloridos dispostos em círculo
const radius = 300;
let isPlaying = false;
let timeouts = [];
const synth = new Tone.Synth({ oscillator: { type: "sine" } }).toDestination();

function activateCircle(note, duration, mode) {
    note = note.replace(/[\d.]+/, "")
    const notes = mode === "major"? ["C", "E", "B", "A", "F", "D", "G", "", "Bb"] :["A", "D", "F", "E", "G", "C", "B", "Bb", ""];
    const i = notes.indexOf(note);
    if (i === -1) return;

    const circle = document.createElement("div");
    circle.note = notes[i];
    circle.className = "circle";
    circle.style.background = `radial-gradient(circle, ${colors[i % colors.length]} 0%, transparent 70%)`;

    const angle = (i / colors.length) * 2 * Math.PI;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;

    circle.style.left = `calc(50% + ${x}px)`;
    circle.style.top = `calc(50% + ${y}px)`;
    circle.style.position = "absolute";
    circle.style["border-radius"] = "50%";
    circle.style.filter = "blur(3px) brightness(1)";
    circle.style.width = "80px";
    circle.style.height = "80px";
    circle.style["mix-blend-mode"] = "screen";
    circle.style.transform = "translate(-50%, -50%) scale(0)"
    circle.style.transition = "transform 2s ease-out, opacity 1s ease-out";

    colorAura.appendChild(circle);

    setTimeout(() => {
    circle.style.transform = "translate(-50%, -50%) scale(50)";
    circle.style.opacity = "1";
    }, 50);
    setTimeout(() => {
    circle.style.opacity = "0";
    }, 500 + duration);
    
    setTimeout(() => circle.remove(), 1500 + duration);
}

//const melody = ["D4", "F4", "D4", "E4", "F4.", "G4", "A4", "G4", "A4", "A4", "Bb4", "A4", "G4.", "F4.", "A4", "Bb4", "A4", "G4.", "E4.", "G4", "A4", "G4", "F4", "E4", "F4.", "G4", "F4.", "E4."];
/*const melody = ["D4", "D4", "F4", "D4", "F4", "F4.", 
    "D4", "E4", "D4.", "F4", "E4", "F4", 
    "G4", "G4", "G4", "F4", "E4", "F4", 
    "G4", "F4", "G4.", "G4.", "F4.", 
    "D4", "F4", "E4", "E4", "G4", "F4.", 
    "F4.", "E4.",
    "F4", "G4", "F4", "F4.", "F4.", "G4", "A4", "G4", "A4", "G4", "G4.", "F4.", 
    "D4.", "E4", "F4", "G4", "F4", "F4.", "F4.", 
    "D4.", "E4", "F4", "F4", "G4", "F4", "E4", "F4.", "F4.", 
    "D4", "F4", "E4", "F4", "G4", "F4.", 
    "D4", "F4.", "D4", "F4.", 
    "C4", "C4", "D4", "F4", "E4", "F4", "F4", "F4", "F4.", "F4", 
    "G4", "D4", "E4", "D4", "C4", "D4", "D4.", "C4.", "E4.", 
    "F4", "G4", "G4", "A4", "G4", "F4", "F4.", 
    "G4", "F4", "A4", "G4", "G4.", "G4", "F4", "E4", "F4.", 
    "G4", "G4", "F4", "E4", "F4", "G4", "F4", "G4.", "G4.", "F4.", 
    "D4", "F4", "E4", "E4", "G4", "F4.", "F4.", "E4."
];*/
/*const melody = [
    "D4", "F4.", "F4.", "E4", "F4.", "A4", 
    "Bb4", "A4", "G4", "F4.", "E4", 
    "G4", "A4", "G4", "F4", "G4", "E4", "F4.", 
    "D4", "D4", "F4", "A4", "G4", 
    "D4", "F4", "A4", "G4", "F4", "G4", "E4", "F4.", 
    "D4", "A4", "G4", "F4", "G4", "E4", 
    "E4", "G4", "F4", "G4", "F4.", 
    "E4."
];*/
/*const melody = [
    "F4", "G4", "F4", "G4", "A4.", 
    "Bb4", "A4", "G4.", "Bb4", "A4", "G4", "F4.", 
    "F4", "C5.", 
    "C5", "D5", "C5", "Bb4", "A4", "F4", "G4", "A4.", 
    "Bb4", "A4", "G4", "F4.", 
    "C5", "C5", "D5", "C5.", 
    "C5", "F4", "G4", "F4.", 
    "G4", "A4", "Bb4", "C5.", 
    "C5", "F4", "G4", "Bb4", "A4", "G4", "F4.", 
    "E4", "G4", "G4.", 
    "F4."
];*/
/*const melody = [
"G4", "A4", "C5", "B4", "A4", "B4", "C5", "D5.", 
"E5.", "F5", "G5", "G5", "F5", "E5", "D5", "E5", "D5.", 
"C5", "B4", "C5", "D5", "C5", "A4", "B4", "G4.", 
"A4.", "G4.", "G4.",
"G4", "A4", "C5", "B4", "A4", "B4", "C5", "D5.", 
"D5.", "E5", "F5", "E5", "D5", "C5", "B4", "A4", 
"C5", "B4", "C5", "D5", "C5", "A4", "B4", "G4.", 
"A4.", "G4.", "G4."
];*/
/*const melody = [
    "E4", "E4", "F4", "E4", "D4", "G4", "G4", "A4", "C5", "C5.", 
    "C5", "D5", "C5", "C5", "B4", "A4", "C5", "B4", "A4", "G4.", 
    "G4", "A4", "C5", "B4", "A4", "G4", "A4", "G4.", 
    "A4", "B4", "G4", "G4", "E4", "A4", "A4.", 
    "D4.", "E4", "G4", "G4", "E4", "G4", "A4", "A4", "G4.", 
    "A4", "B4", "G4", "A4", "G4", "F4", "E4", "D4", "E4."
];*/
let melodyDuration = 0;
function playMelody() {
    Tone.Transport.cancel(0);
    Tone.Transport.seconds = 0;
    melodyDuration = 0;
    let currentTime = 0;
    melody.forEach((note) => {
    const duration = note.includes('.')? '2n': '4n';
    const durSec = note.includes('.')? 1: 0.5;

    Tone.Transport.schedule(time => {
        synth.triggerAttackRelease(note.replace(".", ""), duration, time);
        const timeoutId = setTimeout(() => activateCircle(note, durSec * 1000, mode), 0);
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
document.getElementById("stopBtn").addEventListener("click", playMelody);