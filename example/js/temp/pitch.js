var pentatonic = [0, 3, 5, 7, 10],
    diatonic = [0, 2, 4, 5, 7, 9, 11],
    chordIndex = [0, 2, 4, 7];

synth.noteFromScaleDegree = noteFromScaleDegree.bind(synth);
synth.noteFromChordMember = noteFromChordMember.bind(synth);
synth.scale = diatonic;

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