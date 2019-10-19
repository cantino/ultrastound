const synth = new Tone.Synth().toMaster();

function sliderChanged () {
    let span = document.getElementById("frequencyDisplay");
    let slider = document.getElementById("frequencySlider");
    span.innerHTML = slider.value;
}

function playTone () {
    let slider = document.getElementById("frequencySlider");

    // First argument is frequency, second argument is duration (in seconds)
    synth.triggerAttackRelease(Number(slider.value), 0.5);
}
