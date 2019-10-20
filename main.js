const synth = new Tone.Synth().toMaster(); // Load Tone.js

const emitFrequency = 1250; // What frequency we're playing sounds at
const plusMinusFrequency = 25; // How far above and below this frequency is an acceptable reading
const drawWaveform = false; // Draw the wareform or not
const soundPlayTime = 300; // milliseconds

const fps = 30;
let counter = 0;
const maxCounter = fps * 3; // Emit every N seconds
const counterAdd = 2; // How much to add to the counter when you hear a tone
let counterAdded = false;
const proportionalCounterAdd = 0.1;

let listening = true;

function playTone () {
    listening = false;
    // First argument is frequency, second argument is duration (in seconds)
    synth.triggerAttackRelease(emitFrequency, 0.5);
    setTimeout (() => {
        listening = true;
    }, soundPlayTime * 4);
}


const frequencyPerBin = 22050 / 1024; // Total frequency capture divided by number of bins
const minFrequencyDetected = emitFrequency - plusMinusFrequency; // Don't check frequencies below this
const minBin = Math.floor(minFrequencyDetected / frequencyPerBin); // Don't check bins below this
const maxFrequencyDetected = emitFrequency + plusMinusFrequency; // Don't check frequencies above this
const maxBin = Math.ceil(maxFrequencyDetected / frequencyPerBin); // Don't check bins above this
const minAmplitudeDetected = 256 * 0.6; // Minimum amplitude to consider

console.log(minBin, maxBin);

let mic;
let fft;

// Automaticall called by p5.js on startup
function setup(){
    mic = new p5.AudioIn();
    mic.start();
    fft = new p5.FFT();
    fft.setInput(mic);
    if (drawWaveform) { createCanvas(1024, 512); }
    frameRate(30);
}

// Automatically called by p5.js on each frame render
function draw() {
    // Clear the canvas
    if (drawWaveform) { background(200); }

    let spectrum = fft.analyze();

    // Draw the waveform
    if (drawWaveform) {
        beginShape();
        for (i = 0; i < spectrum.length; i++) {
            vertex(i, map(spectrum[i], 0, 255, height, 0));
        }
        vertex(1024, 0);
        vertex(0, 0);
        endShape();
    }

    if (listening) {
        // Store the highest amplitude bin that we care about
        let highestAmplitudeBin = -1; // Highest-amplitude bin
        for (i = 0; i < spectrum.length; i++) {
            //console.log(i, minBin, maxBin);
            //console.log(maxBin, spectrum[i], minAmplitudeDetected, spectrum[maxBin]);
            //if (i >= minBin && i <= maxBin && spectrum[i] > minAmplitudeDetected && (maxBin === -1 || spectrum[i] > spectrum[maxBin])) {

            if (i >= minBin && i <= maxBin && spectrum[i] > minAmplitudeDetected && (highestAmplitudeBin === -1 || spectrum[i] > spectrum[highestAmplitudeBin])) {
                highestAmplitudeBin = i;
            }
        }

        // Display which frequency was the strongest
        if (highestAmplitudeBin === -1) {
            document.getElementById("maxFrequency").innerHTML = "No Sound Detected";
        } else {
            let detectedFrequency = Math.round(highestAmplitudeBin * frequencyPerBin);
            document.getElementById("maxFrequency").innerHTML = detectedFrequency + " Hz (bin " + highestAmplitudeBin + ")";
            //let distance = counter > maxCounter / 2 ? Math.abs(maxCounter - counter) : counter;
            if (!counterAdded && counter < maxCounter / 2) {
                counter -= counterAdd;
                counterAdded = true;
            }
            //counter += counterAdd;
        }

        // Update the counter
        counter += 1;
        if (counter >= maxCounter) {
            playTone();
            counter = 0;
            counterAdded = false;
        }
    }
}

function fakeSound () {

}
