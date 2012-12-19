(function () {
    var FLOAT = "float",
    BOOLEAN = "boolean",
    STRING = "string",
    INT = "int",
    demoDefaults = {
        Filter: {
            frequency: {
                value: 800,
                min: 20,
                max: 22050,
                automatable: true,
                type: FLOAT
            },
            Q: {
                value: 1,
                min: 0.001,
                max: 50,
                automatable: true,
                type: FLOAT
            },
            gain: {
                value: 0,
                min: -20,
                max: 20,
                automatable: true,
                type: FLOAT
            },
            bypass: {
                value: true,
                automatable: false,
                type: BOOLEAN
            },
            filterType: {
                value: 1,
                min: 0,
                max: 7,
                automatable: false,
                type: INT
            }
        },
        Cabinet: {
            makeupGain: {
                value: 1,
                min: 0,
                max: 7,
                automatable: true,
                type: FLOAT
            },
            bypass: {
                value: false,
                automatable: false,
                type: BOOLEAN
            }
        },
        Compressor: {
            threshold: {
                value: -20,
                min: -60,
                max: 0,
                automatable: true,
                type: FLOAT
            },
            release: {
                value: 250,
                min: 10,
                max: 2000,
                automatable: true,
                type: FLOAT
            },
            makeupGain: {
                value: 1,
                min: 1,
                max: 100,
                automatable: true,
                type: FLOAT
            },
            attack: {
                value: 1,
                min: 0,
                max: 1000,
                automatable: true,
                type: FLOAT
            },
            ratio: {
                value: 4,
                min: 1,
                max: 50,
                automatable: true,
                type: FLOAT
            },
            knee: {
                value: 5,
                min: 0,
                max: 40,
                automatable: true,
                type: FLOAT
            },
            automakeup: {
                value: false,
                automatable: false,
                type: BOOLEAN
            },
            bypass: {
                value: true,
                automatable: false,
                type: BOOLEAN
            }
        },
        Chorus: {
            feedback: {
                value: 0.4,
                min: 0,
                max: 0.95,
                automatable: false,
                type: FLOAT
            },
            delay: {
                value: 0.0045,
                min: 0,
                max: 1,
                automatable: false,
                type: FLOAT
            },
            depth: {
                value: 0.7,
                min: 0,
                max: 1,
                automatable: false,
                type: FLOAT
            },
            rate: {
                value: 1.5,
                min: 0,
                max: 8,
                automatable: false,
                type: FLOAT
            },
            bypass: {
                value: true,
                automatable: false,
                type: BOOLEAN
            }
        },
        Convolver: {
            highCut: {
                value: 22050,
                min: 20,
                max: 22050,
                automatable: true,
                type: FLOAT
            },
            lowCut: {
                value: 20,
                min: 20,
                max: 22050,
                automatable: true,
                type: FLOAT
            },
            dryLevel: {
                value: 1,
                min: 0,
                max: 1,
                automatable: true,
                type: FLOAT
            },
            wetLevel: {
                value: 1,
                min: 0,
                max: 1,
                automatable: true,
                type: FLOAT
            },
            level: {
                value: 1,
                min: 0,
                max: 1,
                automatable: true,
                type: FLOAT
            }
        },
        Delay: {
            delayTime: {
                value: 1000,
                min: 20,
                max: 1000,
                automatable: false,
                type: FLOAT
            },
            feedback: {
                value: 0.45,
                min: 0,
                max: 0.9,
                automatable: true,
                type: FLOAT
            },
            cutoff: {
                value: 20000,
                min: 20,
                max: 20000,
                automatable: true,
                type: FLOAT
            },
            wetLevel: {
                value: 0.5,
                min: 0,
                max: 1,
                automatable: true,
                type: FLOAT
            },
            dryLevel: {
                value: 1,
                min: 0,
                max: 1,
                automatable: true,
                type: FLOAT
            }
        },
        Overdrive: {
            drive: {
                value: 1,
                min: 0,
                max: 11,
                automatable: true,
                type: FLOAT,
                scaled: true
            },
            outputGain: {
                value: 1,
                min: 0,
                max: 1,
                automatable: true,
                type: FLOAT,
                scaled: true
            },
            curveAmount: {
                value: 0.725,
                min: 0,
                max: 1,
                automatable: false,
                type: FLOAT
            },
            algorithmIndex: {
                value: 0,
                min: 0,
                max: 5,
                automatable: false,
                type: INT
            }
        },
        Phaser: {
            rate: {
                value: 0.1,
                min: 0,
                max: 8,
                automatable: false,
                type: FLOAT
            },
            depth: {
                value: 0.6,
                min: 0,
                max: 1,
                automatable: false,
                type: FLOAT
            },
            feedback: {
                value: 0.7,
                min: 0,
                max: 1,
                automatable: false,
                type: FLOAT
            },
            stereoPhase: {
                value: 40,
                min: 0,
                max: 180,
                automatable: false,
                type: FLOAT
            },
            baseModulationFrequency: {
                value: 700,
                min: 500,
                max: 1500,
                automatable: false,
                type: FLOAT
            }
        },
        Tremolo: {
            intensity: {
                value: 0.3,
                min: 0,
                max: 1,
                automatable: false,
                type: FLOAT
            },
            stereoPhase: {
                value: 0,
                min: 0,
                max: 180,
                automatable: false,
                type: FLOAT
            },
            rate: {
                value: 5,
                min: 0.1,
                max: 11,
                automatable: false,
                type: FLOAT
            }
        },
        WahWah: {
            automode: {
                value: true,
                automatable: false,
                type: BOOLEAN
            },
            baseFrequency: {
                value: 0.5,
                min: 0,
                max: 1,
                automatable: false,
                type: FLOAT
            },
            excursionOctaves: {
                value: 2,
                min: 1,
                max: 6,
                automatable: false,
                type: FLOAT
            },
            sweep: {
                value: 0.2,
                min: 0,
                max: 1,
                automatable: false,
                type: FLOAT
            },
            resonance: {
                value: 10,
                min: 1,
                max: 100,
                automatable: false,
                type: FLOAT
            },
            sensitivity: {
                value: 0.5,
                min: -1,
                max: 1,
                automatable: false,
                type: FLOAT
            }
        }
    },
    names = Object.keys(demoDefaults),
    name;
    for (var i = 0, ii = names.length; i < ii; i++) {
        name = names[i];
        Tuna.prototype[name].defaults = demoDefaults[name];
    }
})();
