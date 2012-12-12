(function () {
    var pentatonic = [0, 3, 5, 7, 10],
        diatonic = [0, 2, 4, 5, 7, 9, 11],
        chordIndex = [0, 2, 4, 7];
    function Synth (context)  {
        var synth = context.createGainNode();
        synth.oscType = 0;
        synth.output = context.createGainNode();
        synth.connect = connect.bind(synth);
        synth.disconnect = connect.bind(synth);
        synth.makeNote = makeNote.bind(synth);
        synth.noteFromScaleDegree = noteFromScaleDegree.bind(synth);
        synth.noteFromChordMember = noteFromChordMember.bind(synth);
        synth.scale = diatonic;
        synth.offset = 0;
        Object.defineProperty(synth, "gain", {
            gain: {
                get: getGain,
                set: setGain
            }
        });
        return synth;
    }
    function getGain () {
        return this.ouput.gain;
    }
    function setGain (value) {
        this.output.gain.value = value;
    }
    function makeNote (midiNote, t, d) {
        var o = this.context.createOscillator(), 
            g = this.context.createGainNode();
        o.connect(g);
        g.connect(this.output);
        o.type = this.oscType;
        o.frequency.value = mtof(midiNote);
        o.start(0);
        o.stop(t + d);
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.25, t + 0.005);
        g.gain.linearRampToValueAtTime(0, t + d - 0.001);
    }
    function mtof(note) {
        return 440 * Math.pow(2, (note - 69) / 12);
    }
    function connect (target) {
        this.output.connect(target);
    }
    function disconnect (target) {
        this.output.disconnect(target);
    }
    function noteFromChordMember(member, offset) {
        var octaveOffset = Math.floor(member / 3) * 7, 
            chordQuantized = chordIndex[member % 3];
        return noteFromScaleDegree.call(this, octaveOffset + chordQuantized, offset);
    }
    function noteFromScaleDegree (scaleDegree, offset) {
        scaleDegree += offset || 0;
        var octaveOffset = Math.floor(scaleDegree / this.scale.length) * 12,
            scaleQuantized = this.scale[scaleDegree % this.scale.length];
        return 36 + octaveOffset + scaleQuantized;
    }
    window.Synth = Synth;
})();