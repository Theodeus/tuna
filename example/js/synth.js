//Synth Class
eve.once("load", function () {
    this.Synth = function Synth (context)  {
        this.context = context;
        this.output = context.createGainNode();
    };
    this.Synth.prototype = Object.create(null, {
        gain: {
            get: function () {return this.output.gain;},
            set: function (value) {this.output.gain.value = value;}
        },
        oscType: {
            writable: true,
            value: 0
        },
        makeNote: {
            value: function (midiNote, t, d) {
                var o = this.context.createOscillator(),
                    g = this.context.createGainNode();
                o.connect(g);
                g.connect(this.output);
                o.type = this.oscType;
                o.frequency.value = 440 * Math.pow(2, (midiNote - 69) / 12);
                o.noteOn(t);
                o.noteOff(t + d);
                g.gain.setValueAtTime(0, t);
                g.gain.linearRampToValueAtTime(0.25, t + 0.005);
                g.gain.linearRampToValueAtTime(0, t + d - 0.001);
            }
        },
        connect: {
            value: function (target) {
                this.output.connect(target);
            }
        },
        disconnect: {
            value:function disconnect (target) {
                this.output.disconnect(target);
            }
        }
    });
});

//Synth GUI
eve.once("load.ui", function () {
    var demo = this,
        s = 80,
        types = [
            "Sine",
            "Square",
            "Sawtooth",
            "Triangle"
        ],
        scales = [
            "Major",
            "Minor",
            "Pentatonic"
        ];
    demo.ui.synthPlay = Ctrl.play({
        size: s,
        fill: "#999",
        change: playStop,
        container: "synth_play"
    });
    demo.ui.synthType = Ctrl.picker({
        size: s,
        min: 0,
        max: 3,
        value: 0,
        upFill: "#999",
        downFill: "AAA",
        change: type,
        container: "synth_type"
    });
    demo.ui.synthScale = Ctrl.picker({
        size: s,
        min: 0,
        max: 2,
        value: 0,
        upFill: "#999",
        downFill: "AAA",
        change: scale,
        container: "synth_scale"
    });
    demo.ui.synthPlay.span = document.getElementById("synth_play_value");
    demo.ui.synthType.span = document.getElementById("synth_type_value");
    demo.ui.synthScale.span = document.getElementById("synth_scale_value");

    function scale (value) {
        eve("pitch.scale", demo, scales[value], value);
        if (value === 2) {
            eve("disable_select");
        } else {
            eve("enable_select");
        }
        this.span.innerText = scales[value];
    }
    function type (value) {
        this.span.innerText = types[value];
        demo.audio.synth.oscType = value;
    }
    function playStop (isPlaying) {
        if (isPlaying) {
            eve("grid.start", demo);
            this.span.innerText = "";
            this.span.innerText = "Playing";
        } else {
            eve("grid.stop", demo);
            this.span.innerText = "";
            this.span.innerText = "Stopped";
        }
    }
    document.getElementById("synth_clear").data = {evnt: "grid.clear"};
});