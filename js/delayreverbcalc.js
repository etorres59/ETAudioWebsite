// Calculate time in milliseconds for different subdivisions
function calculateTimes(bpm) {
    const quarterNote = 60000.0 / bpm;
    const notes = [
        ["Whole Note", quarterNote * 4], ["Dotted Whole Note", quarterNote * 6], ["Triplet Whole Note", quarterNote * 8 / 3],
        ["Half Note", quarterNote * 2], ["Dotted Half Note", quarterNote * 3], ["Triplet Half Note", quarterNote * 4 / 3],
        ["Quarter Note", quarterNote], ["Dotted Quarter Note", quarterNote * 1.5], ["Triplet Quarter Note", quarterNote * 2 / 3],
        ["Eighth Note", quarterNote / 2], ["Dotted Eighth Note", quarterNote * 0.75], ["Triplet Eighth Note", quarterNote / 3],
        ["Sixteenth Note", quarterNote / 4], ["Dotted Sixteenth Note", quarterNote / 4 * 1.5], ["Triplet Sixteenth Note", quarterNote / 6],
        ["Thirty-second Note", quarterNote / 8], ["Dotted Thirty-second Note", quarterNote / 8 * 1.5], ["Triplet Thirty-second Note", quarterNote / 12],
        ["Sixty-fourth Note", quarterNote / 16], ["Dotted Sixty-fourth Note", quarterNote / 16 * 1.5], ["Triplet Sixty-fourth Note", quarterNote / 24],
    ];

    let output = `Reverb and Delay Times at ${bpm} BPM:\n\n`;
    const categories = ["Whole Notes", "Half Notes", "Quarter Notes", "Eighth Notes", "Sixteenth Notes", "Thirty-second Notes", "Sixty-fourth Notes"];
    let idx = 0;

    for (let category of categories) {
        output += `--- ${category} ---\n`;
        for (let i = 0; i < 3; i++) {
            if (idx < notes.length) {
                output += `${notes[idx][0]}: ${notes[idx][1].toFixed(2)} ms\n`;
                idx++;
            }
        }
        output += `\n`;
    }

    return output;
}

// Tap tempo functionality
let tapTimes = [];
function tapTempo() {
    const now = performance.now();

    if (tapTimes.length > 0 && now - tapTimes[tapTimes.length - 1] > 2000) {
        tapTimes = []; // Reset if paused too long
    }

    tapTimes.push(now);

    if (tapTimes.length >= 8) {
        const intervals = tapTimes.slice(1).map((t, i) => t - tapTimes[i]);
        const avgInterval = intervals.reduce((a, b) => a + b) / intervals.length;
        const bpm = Math.round(60000 / avgInterval);
        tapTimes = [];
        return bpm;
    }

    return null;
}
