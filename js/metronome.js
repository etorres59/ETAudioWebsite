// Function to update the sound source
//function updateSound(sender,e) {
//const soundSource = document.getElementById("soundSource"); // Get the source element
//const audioPlayer = document.getElementById("audio"); // Get the audio player


//const selectedValue = sender.options[sender.selectedIndex];


// Use a switch statement to handle each option
//switch (selectedValue.value) {
//    case "tick":
//        soundSource.src = "/static/sounds/tick.mp3";
//        break;
//    case "click":
//        soundSource.src = "/static/sounds/click.mp3";
//        break;
//    case "cowbell":
//        soundSource.src = "/static/sounds/cowbell.mp3";
//        break;
//    case "hihat":
//        soundSource.src = "/static/sounds/hihat.mp3";
//        break;
//    case "beep":
//        soundSource.src = "/static/sounds/beep.mp3";
//        break;
//    case "rimshot":
//        soundSource.src = "/static/sounds/rimshot.mp3";
//        break;
//    default:
//        console.error("Invalid selection");
//        return; // Exit the function if no valid option is selected
//}


// Reload the audio player with the updated source
//    audioPlayer.load();
//    console.log(`Audio source updated to: ${soundSource.src}`); // Debug log
//}


let metronomeInterval;
let audioContext; // Declare a global AudioContext
let currentOscillator = null; // Keeps track of the current oscillator being played
let currentGainNode = null; // Keeps track of the current gain node
let currentVolume = 0.75; // defaults the current volume
let isMetronomeRunning = false;//track metronome state

//Create AnalyserNode and Canvas Context for visualizations
let analyserNode;
let canvas;
let canvasCtx;
let bufferLength;
let dataArray;


// Initialize AudioContext on window load
window.onload = function () {
    // Create AudioContext but keep it suspended
    audioContext = new (window.AudioContext || window.webkitAudioContext)();

    // Set volume slider to initial value
    const volumeSlider = document.getElementById("volumeSlider");
    volumeSlider.value = currentVolume;

    //Add keydown listener event for spacebar
    document.addEventListener("keydown", function (event) {
        if (event.code === "Space") {
            event.preventDefault(); // prevent default spacebar behavior
            toggleMetronome();
        }
    });
};



function playSound() {
    // Ensure AudioContext is resumed (Chrome requirement)
    if (audioContext.state === "suspended") {
        audioContext.resume();
    }

    // Creates an Oscillator
    let oscillator = audioContext.createOscillator();
    let gainNode = audioContext.createGain();
    let filterNode = audioContext.createBiquadFilter();

    // Sets Oscillator Frequency:
    const selectedFrequency = document.getElementById("selectedFrequency");
    const selectedFrequencyOption = selectedFrequency.options[selectedFrequency.selectedIndex]
    const pitch = parseInt(selectedFrequencyOption.value);
    switch (pitch) {
        case 0:
            oscillator.frequency.value = 880; // A5 Frequency
            break;

        case 1:
            oscillator.frequency.value = 440; // A4 Frequency
            break;

        case 2:
            oscillator.frequency.value = 220; // A3 Frequency
            break;

        default:
            oscillator.frequency.value = 440; // A4 Frequency
    }
    const selectedSound = document.getElementById("selectedSound");
    const selectedSoundOption = selectedSound.options[selectedSound.selectedIndex]
    const waveform = parseInt(selectedSoundOption.value);
    // Sets Oscillator Waveform:
    switch (waveform) {

        case 0: // sine
            oscillator.type = "sine";
            break;

        case 1: // square
            oscillator.type = "square";
            break;

        case 2: // sawtooth
            oscillator.type = "sawtooth";
            break;

        case 3: // triangle
            oscillator.type = "triangle";
            break;

        default:
            oscillator.type = "sine";
    }

    // Set Filter Properties
    const filterTypeSelect = document.getElementById("filterType");
    const filterFreqInput = document.getElementById("filterFreq");
    const filterQInput = document.getElementById("filterQ");

    filterNode.type = filterTypeSelect.value;
    filterNode.frequency.value = parseFloat(filterFreqInput.value);
    filterNode.Q.value = parseFloat(filterQInput.value);

    // Connect Nodes: Oscillator -> Filter -> Gain -> Destination
    oscillator.connect(filterNode);
    filterNode.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Set initial volume from the gain volume slider
    gainNode.gain.value = currentVolume;

    // Start Oscillator sound
    oscillator.start(audioContext.currentTime);

    // Stop the oscillator sound after 100ms
    oscillator.stop(audioContext.currentTime + 0.1);

    // Track the current oscillator and gain node
    currentOscillator = oscillator;
    currentGainNode = gainNode;
}

function updateFilterFreqReadout(value) {
    const freqReadout = document.getElementById("filterFreqReadout");
    freqReadout.value = value; // Update the number input
}

function updateFilterQReadout(value) {
    const qReadout = document.getElementById("filterQReadout");
    qReadout.value = parseFloat(value).toFixed(1); // Update the number input with 1 decimal place
}

function updateFilterFreqSlider(value) {
    const freqSlider = document.getElementById("filterFreq");
    const numericValue = Math.min(Math.max(value, 20), 20000); // Clamp to valid range
    freqSlider.value = numericValue; // Update the slider
    updateFilterFreqReadout(numericValue); // Update readout to match the clamped value
}

function updateFilterQSlider(value) {
    const qSlider = document.getElementById("filterQ");
    const numericValue = Math.min(Math.max(value, 0.1), 10); // Clamp to valid range
    qSlider.value = numericValue; // Update the slider
    updateFilterQReadout(numericValue); // Update readout to match the clamped value
}


function updateVolume() {
    // Get slider value
    const volumeSlider = document.getElementById("volumeSlider");
    currentVolume = parseFloat(volumeSlider.value);

    // Update the volume of the gain node in real time
    if (currentGainNode) {
        currentGainNode.gain.value = currentVolume;
    }

    // Update displayed volume
    const volumeLevel = document.getElementById("volumeLevel");
    volumeLevel.value = currentVolume;
}

// Attach an event listener to the volume slider to update the volume in real time
document.getElementById("volumeSlider").addEventListener("input", updateVolume);

function startMetronome() {
    // Ensure AudioContext is resumed (Chrome requirement)
    if (audioContext.state === "suspended") {
        audioContext.resume();
    }

    const bpmInput = document.getElementById("bpm"); // Get BPM from input
    const bpm = parseInt(bpmInput.value, 10); // Convert BPM input from a string to an integer
    const subdivisionSelect = document.getElementById("subdivisionSelect"); // Get selected subdivision
    const subdivisions = parseInt(subdivisionSelect.value); // Convert subdivision value to an integer
    const interval = (60000 / bpm) / subdivisions; // Calculate the interval in milliseconds

    const beatIndicator = document.getElementById("beatIndicator"); // Get the beat indicator

    if (metronomeInterval) clearInterval(metronomeInterval); // Clear any pre-existing intervals

    // Start the intervals
    metronomeInterval = setInterval(function () {
        playSound(); // Uses Web Audio API to play the sound

        // Flash the beat indicator every interval
        beatIndicator.style.backgroundColor = "green"; // Change indicator color to green
        setTimeout(() => {
            beatIndicator.style.backgroundColor = "grey"; // Reset beat indicator to grey
        }, 25); // Change from green to grey in 25ms
    }, interval);

    isMetronomeRunning = true; //Updates Metronome Running State
}

function stopMetronome() {
    if (metronomeInterval) {
        clearInterval(metronomeInterval); // Stop the metronome sound
        metronomeInterval = null; // Clear the interval variable
    }

    if (currentOscillator) {
        currentOscillator.stop(); // Stop the oscillator
        currentOscillator = null; // Reset oscillator reference
    }

    isMetronomeRunning = false; //Updates Metronome Running State
}

function toggleMetronome(){
    if (isMetronomeRunning){
        stopMetronome();
    } else{
        startMetronome();
    }

}

// Attach event listeners to buttons
document.getElementById("startButton").addEventListener("click", startMetronome);
document.getElementById("stopButton").addEventListener("click", stopMetronome);

function changeBpm(inc) {
    const bpmInput = document.getElementById("bpm"); // Get BPM from input
    const bpm = parseInt(bpmInput.value, 10); // Convert BPM input from a string to an integer

    let newBpm = bpm + inc; // Add increment value to existing BPM
    bpmInput.value = newBpm; // Change BPM input value to the new number
}

//tap tempo feature
let intervals = [];
let lastTap = null;
let tapCount = 0;
const requiredTaps = 8;

const tapButton = document.getElementById('tapButton');
const bpmInput = document.getElementById('bpm');

tapButton.addEventListener('click', () => {
    const now = performance.now(); // Get current timestamp in milliseconds

    if (lastTap !== null) {
        const interval = now - lastTap; // Calculate the interval in ms
        if (interval >= 10) { // Ignore intervals less than 10 ms
            intervals.push(interval);
        } else {
            alert("Ignored tap: Interval too short.");
        }
    }

    lastTap = now;
    tapCount++;

    if (tapCount >= requiredTaps) {
        if (intervals.length >= 7) {
            const averageInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
            const bpm = Math.round(60000.0 / averageInterval); // Convert interval to BPM
            bpmInput.value = bpm; // Update the BPM input field
        } else {
            bpmInput.value = "Error";
            alert("Not enough valid intervals to calculate BPM.");
        }
        resetTaps(); // Reset for next calculation
    }
});

function resetTaps() {
    intervals = [];
    lastTap = null;
    tapCount = 0;
}

