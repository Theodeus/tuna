(function (window, document) {
    var hasAudio = "webkitAudioContext" in window,
        hasTouch = "createTouch" in document,
        load = hasAudio ? function () {
            demo = new Demo();
            eve("load.ui", demo);
        } : noWebAudio,
        demo;
    function noWebAudio () {
        var block = document.createElement("div"),
            text = document.createElement("p");
        block.className = "block app";
        text.className = "errortext";
        text.innerHTML = "It looks like the browser you're using doesn't support " +
            "web audio! Try downloading <a href=\"http://www.google.com/chrome\"" +
            "target=\"_blank\">chrome</a> and come back to enjoy this demo.";
        block.appendChild(text);
        document.body.appendChild(block);
    }
    function Demo () {
        this.audio = Object.create(null);
        this.context = new webkitAudioContext();
        this.audio.tuna = new Tuna(this.context);
        this.effectNames = Object.keys(Tuna.prototype);
        this.touchMap = {
            down: hasTouch ? "touchstart" : "mousedown",
            move: hasTouch ? "touchmove" : "mousemove",
            up: hasTouch ? "touchend" : "mouseup"
        };
        this.ui = Object.create(null);
        this.music = Object.create(null);
        this.raf = window.webkitRequestAnimationFrame;
        this.tempoMs = 125;
    }
    function init () {
        this.audio.synth = new this.Synth(this.context);
        this.audio.synth.output.connect(this.effectSlots[0].effects[0].input);
        this.effectSlots[3].effects[this.effectSlots[3].effects.length - 1].output.connect(this.context.destination);
        this.clock = new this.Clock(this.context, this.tempoMs).start();
        this.ui.chord = new this.ChordControl();
        document.getElementById("ALL").classList.remove("hidden");
    }
    eve.once("load.ui", init)(1);
    window.addEventListener("load", load, false);
})(this, this.document);