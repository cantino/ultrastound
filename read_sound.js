const emitFrequency = 1250;
const plusMinusFreqneucy = 50;

const frequencyPerBin = 22050 / 1024; // Total frequency capture divided by number of bins
const minFrequencyDetected = emitFrequency - plusMinusFreqneucy; // Don't check frequencies below this
const minBin = minFrequencyDetected / frequencyPerBin; // Don't check bins below this
const maxFrequencyDetected = emitFrequency + plusMinusFreqneucy; // Don't check frequencies above this
const minAmplitudeDetected = 0.75; // Minimum amplitude to consider

let mic;
let fft;

// Automaticall called by p5.js on startup
function setup(){
    mic = new p5.AudioIn();
    mic.start();
    fft = new p5.FFT();
    fft.setInput(mic);
    createCanvas(1024, 512);

    document.getElementById("frequencySlider").value = "17500";
}

// Automatically called by p5.js on each frame render
function draw(){
    // Clear the canvas
    background(200);

    let spectrum = fft.analyze();

    let maxBin = -1;

    // Draw the waveform
    beginShape();
    for (i = 0; i < spectrum.length; i++) {
        vertex(i, map(spectrum[i], 0, 255, height, 0));

        // Store the highest amplitude bin that we care about
        if (i >= minBin && spectrum[i] > minAmplitudeDetected && (maxBin === -1 || spectrum[i] > spectrum[maxBin])) {
            maxBin = i;
        }
    }
    vertex(1024, 0);
    vertex(0, 0);
    endShape();

    // Display which frequency was the strongest
    if (maxBin === -1) {
        document.getElementById("maxFrequency").innerHTML = "No Sound Detected";
    } else {
        let detectedFrequency = Math.round(maxBin * frequencyPerBin);
        document.getElementById("maxFrequency").innerHTML = detectedFrequency + " Hz";
    }
}
