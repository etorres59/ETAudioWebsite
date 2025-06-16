"use strict";

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function resumeAudioContext() {
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
}

["click", "keydown", "touchstart"].forEach(event => {
  document.body.addEventListener(event, resumeAudioContext, { once: true });
});

const notesFrequencies = {
  C4: 261.63, "C#4": 277.18, D4: 293.66, "D#4": 311.13, E4: 329.63,
  F4: 349.23, "F#4": 369.99, G4: 392.0, "G#4": 415.3, A4: 440.0,
  "A#4": 466.16, B4: 493.88, C5: 523.25, "C#5": 554.37, D5: 587.33,
  "D#5": 622.25, E5: 659.25, F5: 698.46, "F#5": 739.99, G5: 783.99,
  "G#5": 830.61, A5: 880.0, "A#5": 932.33, B5: 987.77
};

const activeNotes = new Map();
const heldKeys = new Set();

const masterGain = audioCtx.createGain();
masterGain.gain.value = 0.3;
masterGain.connect(audioCtx.destination);

const keyToNote = {
  z: "C4", s: "C#4", x: "D4", d: "D#4", c: "E4", v: "F4", g: "F#4",
  b: "G4", h: "G#4", n: "A4", j: "A#4", m: "B4", q: "C5", 2: "C#5",
  w: "D5", 3: "D#5", e: "E5", r: "F5", 5: "F#5", t: "G5", 6: "G#5",
  y: "A5", 7: "A#5", u: "B5"
};

function getValue(id, fallback = 0) {
  const elem = document.getElementById(id);
  if (!elem) return fallback;
  if (elem.type === "range" || elem.type === "number") return parseFloat(elem.value) || fallback;
  return elem.value || fallback;
}

function mapFilterFrequency(value, min = 20, max = 20000) {
  const percent = value / 100;
  return min * Math.pow(max / min, percent);
}

function createOscillatorChain(oscNum, freq) {
  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  osc.frequency.setValueAtTime(freq, now);
  osc.type = getValue(`osc${oscNum}-waveform`, "sine");

  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(getValue(`osc${oscNum}-volume`, 0.5), now);

  const filter = audioCtx.createBiquadFilter();
  filter.type = getValue(`osc${oscNum}-filter-type`, "lowpass");

  const rawFilterValue = getValue(`osc${oscNum}-filter`, 50);
  filter.frequency.setValueAtTime(mapFilterFrequency(rawFilterValue), now);
  filter.Q.setValueAtTime(getValue(`osc${oscNum}-filter-q`, 1), now);
  filter.gain.setValueAtTime(getValue(`osc${oscNum}-filter-gain`, 0), now);

  const envelopeGain = audioCtx.createGain();
  envelopeGain.gain.setValueAtTime(0, now);

  osc.connect(gain);
  gain.connect(filter);
  filter.connect(envelopeGain);

  return { osc, gain, filter, envelopeGain };
}

function applyADSR(envelopeGain, oscNum) {
  const now = audioCtx.currentTime;
  const attack = getValue(`osc${oscNum}-attack`, 0.01);
  const decay = getValue(`osc${oscNum}-decay`, 0.1);
  const sustain = getValue(`osc${oscNum}-sustain`, 0.8);

  envelopeGain.gain.cancelScheduledValues(now);
  envelopeGain.gain.setValueAtTime(0, now);
  envelopeGain.gain.linearRampToValueAtTime(1, now + attack);
  envelopeGain.gain.linearRampToValueAtTime(sustain, now + attack + decay);
}

function playNote(note) {
  if (!notesFrequencies[note]) return;

  resumeAudioContext();
  const freq = notesFrequencies[note];
  const now = audioCtx.currentTime;
  const osc1Chain = createOscillatorChain(1, freq);
  applyADSR(osc1Chain.envelopeGain, 1);
  osc1Chain.envelopeGain.connect(masterGain);

  const voice = {
    osc1Chain,
    startedAt: now,
    releaseTime1: getValue("osc1-release", 0.3)
  };

  if (!activeNotes.has(note)) activeNotes.set(note, []);
  activeNotes.get(note).push(voice);

  osc1Chain.osc.start(now);
  highlightKey(note, true);
}

function stopNote(note, immediate = false) {
  const voices = activeNotes.get(note);
  if (!voices) return;

  const now = audioCtx.currentTime;

  voices.forEach(({ osc1Chain, releaseTime1 }) => {
    const r1 = immediate ? 0.05 : releaseTime1;

    osc1Chain.envelopeGain.gain.cancelScheduledValues(now);
    osc1Chain.envelopeGain.gain.setValueAtTime(osc1Chain.envelopeGain.gain.value, now);
    osc1Chain.envelopeGain.gain.linearRampToValueAtTime(0, now + r1);

    try {
      osc1Chain.osc.stop(now + r1 + 0.05);
    } catch {}

    setTimeout(() => {
      try {
        osc1Chain.osc.disconnect();
        osc1Chain.gain.disconnect();
        osc1Chain.filter.disconnect();
        osc1Chain.envelopeGain.disconnect();
      } catch {}
    }, (r1 + 0.1) * 1000);
  });

  activeNotes.delete(note);
  highlightKey(note, false);
}

function highlightKey(note, on) {
  const key = document.querySelector(`#keyboard [data-note="${note}"]`);
  if (key) key.classList.toggle("active", on);
}

function generateKeyboard() {
  const keyboard = document.getElementById("keyboard");
  keyboard.innerHTML = "";
  Object.keys(notesFrequencies).forEach((note) => {
    const key = document.createElement("div");
    key.dataset.note = note;
    key.classList.add(note.includes("#") ? "black-key" : "white-key");

    const label = document.createElement("span");
    label.className = "label";
    label.textContent = note;
    key.appendChild(label);

    key.addEventListener("mousedown", () => playNote(note));
    key.addEventListener("mouseup", () => stopNote(note));
    key.addEventListener("mouseleave", (e) => { if (e.buttons === 1) stopNote(note); });

    key.addEventListener("touchstart", (e) => { e.preventDefault(); playNote(note); }, { passive: false });
    key.addEventListener("touchend", (e) => { e.preventDefault(); stopNote(note); });

    keyboard.appendChild(key);
  });
}

function setupKeyboardInput() {
  window.addEventListener("keydown", (e) => {
    if (e.repeat) return;
    const note = keyToNote[e.key];
    if (note && !heldKeys.has(e.key)) {
      heldKeys.add(e.key);
      playNote(note);
    }
  });

  window.addEventListener("keyup", (e) => {
    const note = keyToNote[e.key];
    if (note) {
      heldKeys.delete(e.key);
      stopNote(note);
    }
  });

  window.addEventListener("blur", stopAllNotes);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stopAllNotes();
  });
}

function stopAllNotes() {
  for (let note of activeNotes.keys()) stopNote(note, true);
  heldKeys.clear();
}

function updateOscillatorParams(oscNum) {
  activeNotes.forEach((voices) => {
    voices.forEach(({ osc1Chain }) => {
      const chain = osc1Chain;
      const waveform = getValue(`osc${oscNum}-waveform`, "sine");
      if (chain.osc.type !== waveform) chain.osc.type = waveform;
      chain.gain.gain.setTargetAtTime(getValue(`osc${oscNum}-volume`, 0.5), audioCtx.currentTime, 0.01);

      const filterType = getValue(`osc${oscNum}-filter-type`, "lowpass");
      if (chain.filter.type !== filterType) chain.filter.type = filterType;

      const rawFilterValue = getValue(`osc${oscNum}-filter`, 50);
      chain.filter.frequency.setTargetAtTime(mapFilterFrequency(rawFilterValue), audioCtx.currentTime, 0.01);

      chain.filter.Q.setTargetAtTime(getValue(`osc${oscNum}-filter-q`, 1), audioCtx.currentTime, 0.01);
      chain.filter.gain.setTargetAtTime(getValue(`osc${oscNum}-filter-gain`, 0), audioCtx.currentTime, 0.01);
    });
  });
}

function setupControlsListeners() {
  const osc1Controls = [
    "osc1-waveform", "osc1-volume",
    "osc1-filter-type", "osc1-filter", "osc1-filter-q", "osc1-filter-gain",
    "osc1-attack", "osc1-decay", "osc1-sustain", "osc1-release"
  ];

  osc1Controls.forEach((id) => {
    const elem = document.getElementById(id);
    if (elem) {
      elem.addEventListener("input", () => {
        updateOscillatorParams(1);

        // Update corresponding slider-value element text
        const display = document.getElementById(`${id}-val`);
        if (display && display.classList.contains("slider-value")) {
          display.textContent = elem.value;
        }
      });

      // Initialize display value on load
      const display = document.getElementById(`${id}-val`);
      if (display && display.classList.contains("slider-value")) {
        display.textContent = elem.value;
      }
    }
  });
}

window.addEventListener("DOMContentLoaded", () => {
  generateKeyboard();
  setupControlsListeners();
  setupKeyboardInput();
});
