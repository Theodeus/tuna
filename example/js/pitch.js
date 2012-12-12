eve.once("load", function () {
    var demo = this,
        pentatonic = [0, 3, 5, 7, 10],
        diatonic = [0, 2, 4, 5, 7, 9, 11],
        chordIndex = [0, 2, 4, 7],
        harmony = [
            [4, 5, 6],
            [5, 7],
            [4, 5],
            [1, 2, 5],
            [1, 6],
            [2, 4, 5],
            [1, 5, 3]
        ];

    demo.music.pitch = {
        scale: diatonic,
        chordOffset: 0,
        noteFromChordMember: noteFromChordMember,
        getChordOptions: function (offset) {
            return harmony[offset];
        }
    };
    function noteFromChordMember (member, offset) {
        var octaveOffset = Math.floor(member / 3) * 7,
            chordQuantized = chordIndex[member % 3];
        return noteFromScaleDegree.call(demo.music.pitch, octaveOffset + chordQuantized, offset);
    }
    function noteFromScaleDegree (scaleDegree, offset) {
        scaleDegree += offset || 0;
        var octaveOffset = Math.floor(scaleDegree / this.scale.length) * 12,
            scaleQuantized = this.scale[scaleDegree % this.scale.length];
        return 36 + octaveOffset + scaleQuantized;
    }
});
