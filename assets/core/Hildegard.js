import * as Tone from "https://cdn.skypack.dev/tone";

const colors = [
    "rgba(75, 0, 130)",   // violeta
    "rgba(0, 0, 255)",    // azul
    "rgba(0, 127, 255)",  // azul claro / ciano
    "rgba(0, 128, 0)",    // verde
    "rgba(255, 255, 0)",  // amarelo
    "rgba(255, 83, 0)",  // laranja
    "rgba(165, 42, 65)",   // laranja avermelhado
    "rgba(255, 0, 0)"     // vermelho
];

const colorAura = document.getElementById("colorAura");

// Cria os 7 círculos coloridos dispostos em círculo
const radius = 0;
const intervals = [7, 0, 3, 2, 5, -2, 6, 4];
let isPlaying = false;
let timeouts = [];
const synth = new Tone.Synth({ oscillator: { type: "sine" } }).toDestination();

function activateCircle(interval, duration) {
    const i = intervals.indexOf(interval);
    if (i === -1) return;

    const circle = document.createElement("div");
    circle.interval = intervals[i];
    circle.className = "circle";
    circle.style.background = `radial-gradient(circle, ${colors[i % colors.length]} 0%, transparent 100%)`;

    const angle = (i / colors.length) * 2 * Math.PI;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;

    circle.style.left = `calc(50% + ${x}px)`;
    circle.style.top = `calc(50% + ${y}px)`;
    circle.style.position = "absolute";
    circle.style["border-radius"] = "50%";
    circle.style.filter = "blur(3px) brightness(2)";
    circle.style.width = "80px";
    circle.style.height = "80px";
    circle.style["mix-blend-mode"] = "ligthen";
    circle.style.transform = "translate(-50%, -50%) scale(0)"
    circle.style.transition = "transform 3s ease-out, opacity 3s ease-out";

    colorAura.appendChild(circle);

    setTimeout(() => {
    circle.style.transform = "translate(-50%, -50%) scale(50)";
    circle.style.opacity = "1";
    }, 50);
    setTimeout(() => {
    circle.style.opacity = "0";
    }, 1000 + duration);
    
    setTimeout(() => circle.remove(), 3500 + duration);
}

//const melody = ["D4", "F4", "D4", "E4", "F4.", "G4", "A4", "G4", "A4", "A4", "Bb4", "A4", "G4.", "F4.", "A4", "Bb4", "A4", "G4.", "E4.", "G4", "A4", "G4", "F4", "E4", "F4.", "G4", "F4.", "E4."];
const melody = ["D4", "D4", "F4", "D4", "F4", "F4.", 
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
];
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
    const firstNote = melody[0];
    let currentTime = 0;
    melody.forEach((note, i) => {
    const nextNote = melody[i + 1];
    const duration = note.includes('.')? '2n': '4n';
    const durSec = note.includes('.')? 1: 0.5;

    Tone.Transport.schedule(time => {
        synth.triggerAttackRelease(note.replace(".", ""), duration, time);
        const interval = Tone.Frequency(note.replace(".", "")).toMidi() - Tone.Frequency(firstNote.replace(".", "")).toMidi();
        const timeoutId = setTimeout(() => activateCircle(interval, durSec * 1000), 0);
        timeouts.push(timeoutId);
        }, currentTime);

    currentTime += durSec;
    });
    melodyDuration = currentTime;
    Tone.Transport.start();
    isPlaying = true;
}

function pauseMelody() {
    Tone.Transport.pause();
    timeouts.forEach(t => clearTimeout(t));
    timeouts = [];
    isPlaying = false;
}

function stopMelody() {
    Tone.Transport.stop();
    timeouts.forEach(t => clearTimeout(t));
    timeouts = [];
    isPlaying = false;
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

Tone.Transport.scheduleRepeat(() => updateSeekBar(), 0.1);
document.getElementById("seekBar").addEventListener("input", handleSeekBarInput);
document.getElementById("playBtn").addEventListener("click", playMelody);
document.getElementById("pauseBtn").addEventListener("click", pauseMelody);
document.getElementById("stopBtn").addEventListener("click", stopMelody);
document.getElementById("stopBtn").addEventListener("click", playMelody);