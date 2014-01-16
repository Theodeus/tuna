eve.once("load", function () {
    var demo = this,
        chordIndex = [0, 2, 4, 7],
        rules = {
            Major: [
                [2, 3, 4, 5, 6, 7, 8],
                [5, 7],
                [4, 5, 7],
                [1, 2, 5, 8],
                [1, 6, 8],
                [2, 4, 5],
                [1, 5, 8],
                [1, 2, 3, 4, 5, 6, 7]
            ],
            Minor: [
                [2, 3, 4, 5, 6, 7, 8],
                [5, 7],
                [4, 5, 6, 7],
                [1, 2, 5, 8],
                [1, 6, 8],
                [2, 4, 5, 7],
                [1, 5, 6, 3, 8],
                [1, 2, 3, 4, 5, 6, 7]
            ],
            Pentatonic: []
        },
        scales = {
            "Major": [0, 2, 4, 5, 7, 9, 11],
            "Minor": Object.create(null, {
                "0": {value: 0},
                "1": {value: 2},
                "2": {value: 3},
                "3": {value: 5},
                "4": {value: 7},
                "5": {value: 8},
                "6": {
                    get: function () {
                        var cur = demo.music.pitch.chordOffset;
                        switch (demo.music.pitch._lOffset) {
                            case 5: return cur === 4 ? 11 : 10;
                            case 0: return cur === 2 ? 10 : 11;
                            case 8: return 10;
                        }
                        return demo.music.pitch.chordOffset === 4 ? 11 : 10;
                    }
                },
                length: {value: 7}
            }),
            "Pentatonic": [0, 3, 5, 7, 10]
        };

    demo.music.pitch = Object.create(null, {
        chordOffset: {
            get: function () {
                return this._offset;
            },
            set: function (v) {
                this._lOffset = this._offset;
                this._offset = v;
                return v;
            }
        },
        getPitch: {
            get: function () {
                return this._getpitch;
            },
            set: function (f) {
                this._getpitch = f;
            }
        },
        getChordOptions: {
            value: function (offset) {
                return this._harmony[this.chordOffset];
            }
        },
        scale: {
            get: function () {
                return this._scale;
            },
            set: function (s) {
                this._scale = scales[s];
                this.getPitch = s === "Pentatonic" ? noteFromScaleDegree : noteFromChordMember;
                this._harmony = rules[s];
            }
        }
    });
    demo.music.pitch.scale = "Major";
    demo.music.pitch.chordOffset = 0;
    demo.music.pitch._lOffset = 0;

    function noteFromChordMember (member, offset) {
        var octaveOffset = Math.floor(member / 3) * 7,
            chordQuantized = chordIndex[member % 3];
        return noteFromScaleDegree.call(demo.music.pitch, octaveOffset + chordQuantized, offset);
    }
    function noteFromScaleDegree (scaleDegree, offset) {
        scaleDegree += offset || 0;
        var octaveOffset = Math.floor(scaleDegree / this._scale.length) * 12,
            scaleQuantized = this._scale[scaleDegree % this._scale.length];
        return 36 + octaveOffset + scaleQuantized;
    }
});
