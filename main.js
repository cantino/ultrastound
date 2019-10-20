const synth = new Tone.Synth().toMaster(); // Load Tone.js

const emitFrequency = 17500; // What frequency we're playing sounds at
const plusMinusFrequency = 25; // How far above and below this frequency is an acceptable reading
const drawWaveform = false; // Draw the wareform or not
const soundPlayTime = 0.2; // seconds
const songIgnoreTime = 4.5 // Multiplier of soundPlayTime for how long to ignore incoming sounds

const fps = 30; // Frames per second
let counter = 0; // Keep track of when we need to emit a sound
const secondsBetweenEmit = 7; // How many seconds there are between noise emissions
const maxCounter = fps * secondsBetweenEmit; // Emit every N seconds
const counterAdjustDivisor = 2; // The divisor for how much the counter should jump (relative to the main/max) when it hears another tone


let listening = true; // If true, pay attention to tones you hear
let heardTone = false; // If true, a tone was recently heard. Wait until it's over to listen again
let inSync = false; // If this node believe it's in sync with the nodes around it
const syncCounterRange = Math.round(maxCounter * 0.15); // How far off the counter can be when it hears a sound and still believe its in sync
let syncCycles = 0; // How mny cycles this node thinks its been in sync for

function playTone () {
    // Don't list while playing a tone of you'll hear yourself
    listening = false;

    // First argument is frequency, second argument is duration (in seconds)
    synth.triggerAttackRelease(emitFrequency, soundPlayTime);

    // Wait <songIgnoreTime> * <soundPlayTime> seconds after playing the sound before listening again
    // This makes sure the tail end of the FFT doesn't catch the sound we just played
    setTimeout (() => {
        listening = true;
        playingIndicator.innerHTML = "-";
        body.style.backgroundColor = "black";
    }, soundPlayTime * songIgnoreTime * 1000);
}

let active = false;
// Become active after 0-secondsBetweenEmit seconds
function delayedStart () {
    setTimeout(() => {
        active = true;
    }, Math.random() * secondsBetweenEmit * 1000);
}


const frequencyPerBin = 22050 / 1024; // Total frequency capture divided by number of bins
const minFrequencyDetected = emitFrequency - plusMinusFrequency; // Don't check frequencies below this
const minBin = Math.floor(minFrequencyDetected / frequencyPerBin); // Don't check bins below this
const maxFrequencyDetected = emitFrequency + plusMinusFrequency; // Don't check frequencies above this
const maxBin = Math.ceil(maxFrequencyDetected / frequencyPerBin); // Don't check bins above this
const minAmplitudeDetected = 256 * 0.6; // Minimum amplitude to consider

// DOM elements for visualizing the process
let body;
let playingIndicator;
let hearingIndicator;
let counterIndicator;
let syncIndicator;

let mic;
let fft;

// Automaticall called by p5.js on startup
function setup(){
    // Setup microphone and FFT
    mic = new p5.AudioIn();
    mic.start();
    fft = new p5.FFT();
    fft.setInput(mic);

    // Set a fixed frame rate
    frameRate(fps);
    
    // Setup a canvas if we want to visualize the waveform
    if (drawWaveform) { createCanvas(1024, 512); }

    // Connect DOM elements to variables for easy access
    body = document.getElementsByTagName("BODY")[0];
    playingIndicator = document.getElementById("playing");
    hearingIndicator = document.getElementById("hearing");
    counterIndicator = document.getElementById("counter");
    syncIndicator = document.getElementById("sync");
}

// Automatically called by p5.js on each frame render
function draw() {
    // Only do things if we're <active>
    if (active) {
        // Capture the FFT data
        let spectrum = fft.analyze();

        // Draw the waveform
        if (drawWaveform) {
            background(200); 
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
                if (i >= minBin && i <= maxBin && spectrum[i] > minAmplitudeDetected && (highestAmplitudeBin === -1 || spectrum[i] > spectrum[highestAmplitudeBin])) {
                    highestAmplitudeBin = i;
                }
            }

            if (highestAmplitudeBin === -1) {
                // No tones were detected
                heardTone = false;
                hearingIndicator.innerHTML = "-";
            } else if (!heardTone) {
                // A tone was heard and the heardTone flag is false

                // This is the approximate frequency detected, if we need it
                //let detectedFrequency = Math.round(highestAmplitudeBin * frequencyPerBin);
                
                // Check if we're still in sync
                if (!(counter <= syncCounterRange || counter >= (maxCounter - syncCounterRange))) {
                    // If the counter is over <syncCounterRange> away from 0 or <maxCounter>, it's not in sync
                    inSync = false;
                    syncCycles = 0;
                    syncIndicator.innerHTML = "No Sync";
                    syncIndicator.style.backgroundColor = "red";
                }

                // Modify the <counter> based on what it's value is
                if (counter > maxCounter / 2) {
                    // If <counter> is over halfway to <maxCounter>, go half the distance from <counter> to <maxCounter>
                    counter += (maxCounter - counter) / counterAdjustDivisor;
                } else {
                    // If <counter> is less than halfway to <maxCounter>, halve it
                    counter /= counterAdjustDivisor;
                }

                // Get rid of decimals
                counter = Math.round(counter);

                // Flag that a tone was heard
                heardTone = true;
                hearingIndicator.innerHTML = "Heard Tone";
            }
        }

        // Update the counter
        counter += 1;
        if (counter >= maxCounter) {
            // If the counter is at the end, emit a tone
            playTone();
            counter = 0;
            playingIndicator.innerHTML = "Playing";
            body.style.backgroundColor = "white";

            if (inSync) {
                // Keep track of how many complete cycles this node has maintained sync
                syncCycles += 1;
            } else {
                // Assume we're back in sync whenever we play a sound
                inSync = true;
            }
            syncIndicator.innerHTML = "Yes Sync (" + syncCycles + ")";
            syncIndicator.style.backgroundColor = "green";
        }
        counterIndicator.innerHTML = counter + " / " + maxCounter;
    }
}

function fakeSound () {

}
