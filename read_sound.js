let mic;
let fft;

function setup(){
    mic = new p5.AudioIn();
    mic.start();
    fft = new p5.FFT();
    fft.setInput(mic);
    createCanvas(1024, 512);
}
function draw(){
    background(200);

    let spectrum = fft.analyze();

    beginShape();
    for (i = 0; i < spectrum.length; i++) {
        vertex(i, map(spectrum[i], 0, 255, height, 0));
    }
    vertex(1024, 0);
    vertex(0, 0);
    endShape();
}
