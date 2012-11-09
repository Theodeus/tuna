 /*
    Copyright (c) 2012 DinahMoe AB

    Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation
    files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy,
    modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software
    is furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
    DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE
    OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

//Originally written by Alessandro Saccoia, Chris Coniglio and Oskar Eriksson

 (function (window) {
    var userContext,
        userInstance,
        Tuna = function (context) {
            if (!context) {
                console.log("tuna.js: Missing audio context! Creating a new context for you.");
                context = window.webkitAudioContext && (new window.webkitAudioContext());
            }
            userContext = context;
            userInstance = this;
        },
        version = "0.1",
        set = "setValueAtTime",
        linear = "linearRampToValueAtTime",
        pipe = function (param, val) {param.value = val}, 
        Super = Object.create(null, {
            activate: {
                writable: true, 
                value: function (doActivate) {
                    if (doActivate) {
                        //console.log("activating: " + this.name)
                        this.input.disconnect();
                        this.input.connect(this.activateNode);
                        this.activateCallback && this.activateCallback(doActivate);
                    } else {
                        //console.log("deactiving: " + this.name)
                        this.input.disconnect();
                        this.input.connect(this.output);
                    }
                }  
            },
            bypass: {
                get: function () {return this._bypass},
                set: function (value) {
                    if (this._lastBypassValue === value) {return}
                    this._bypass = value;
                    this.activate(!value);
                    this._lastBypassValue = value;
                }
            },
            connect: {
                value: function (target) {
                    this.output.connect(target);
                }
            },
            disconnect: {
                value: function () {
                    this.output.disconnect();
                }
            },
            connectInOrder: {
                value: function (nodeArray) {
                    var i = nodeArray.length - 1;
                    while (i--) {
                        if (!nodeArray[i].connect) {
                            return console.error("AudioNode.connectInOrder: TypeError: Not an AudioNode.", nodeArray[i]);
                        }
                        if (nodeArray[i + 1].input) {
                            nodeArray[i].connect(nodeArray[i + 1].input);
                        } else {
                            nodeArray[i].connect(nodeArray[i + 1]);
                        }
                    }
                }
            },
            getDefaults: {
                value: function () {
                    var result = {};
                    for (var key in this.defaults) {
                        result[key] = this.defaults[key].value;
                    }
                    return result;
                }
            },
            automate: {
                value: function (property, value, duration, startTime) {
                    var start = startTime ? ~~(startTime / 1000) : userContext.currentTime,
                        dur = duration ? ~~(duration / 1000) : 0,
                        _is = this.defaults[property],
                        param = this[property],
                        method;

                    if (param) {
                        if (_is.automatable) {
                           if (!duration) {
                                method = set;
                            } else {
                                method = linear;
                                param.cancelScheduledValues(start);
                                param.setValueAtTime(param.value, start);
                            }
                            param[method](value, dur + start);
                        } else {
                            param = value;
                        }
                    } else {
                        console.error("Invalid Property for " + this.name);
                    }
                } 
            }
        }), 
        FLOAT = "float",
        BOOLEAN = "boolean",
        STRING = "string",
        INT = "int";

    function dbToWAVolume (db) {
        return Math.max(0, Math.round(100 * Math.pow(2, db / 6)) / 100);   
    }
    function fmod (x, y) {
        // http://kevin.vanzonneveld.net
        // +   original by: Onno Marsman
        // +      input by: Brett Zamir (http://brett-zamir.me)
        // +   bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
        // *     example 1: fmod(5.7, 1.3);
        // *     returns 1: 0.5
        var tmp, tmp2, p = 0,
            pY = 0,
            l = 0.0,
            l2 = 0.0;

        tmp = x.toExponential().match(/^.\.?(.*)e(.+)$/);
        p = parseInt(tmp[2], 10) - (tmp[1] + '').length;
        tmp = y.toExponential().match(/^.\.?(.*)e(.+)$/);
        pY = parseInt(tmp[2], 10) - (tmp[1] + '').length;

        if (pY > p) {
            p = pY;
        }

        tmp2 = (x % y);

        if (p < -100 || p > 20) {
            // toFixed will give an out of bound error so we fix it like this:
            l = Math.round(Math.log(tmp2) / Math.log(10));
            l2 = Math.pow(10, l);

            return (tmp2 / l2).toFixed(l - p) * l2;
        } else {
            return parseFloat(tmp2.toFixed(-p));
        }
    }
    function sign (x) {
        if (x == 0) {
            return 1;
        } else {
            return Math.abs(x) / x;
        }
    }
    function tanh (n) {
        return (Math.exp(n) - Math.exp(-n)) / (Math.exp(n) + Math.exp(-n));
    }
    Tuna.prototype.Filter = function (properties) {
        if (!properties) {
            properties = this.getDefaults();
        }
        this.input = userContext.createGainNode();
        this.activateNode = userContext.createGainNode();
        this.filter = userContext.createBiquadFilter();
        this.output = userContext.createGainNode();

        this.activateNode.connect(this.filter);
        this.filter.connect(this.output);
        
        this.frequency = properties.frequency || this.defaults.frequency.value;
        this.Q = properties.resonance || this.defaults.Q.value;
        this.filterType = properties.filterType || this.defaults.filterType.value;
        this.gain = properties.gain || this.defaults.gain.value;
        this.bypass = false;
    };
    Tuna.prototype.Filter.prototype = Object.create(Super, {
        name: {value: "Filter"},
        defaults: {
            value: {
                frequency: {value: 500, min: 20, max: 22050, automatable: true, type: FLOAT},
                Q: {value: 1, min: 0.001, max: 100, automatable: true, type: FLOAT}, 
                gain: {value: 0, min: -40, max: 40, automatable: true, type: FLOAT},
                bypass: {value: true, automatable: false, type: BOOLEAN},
                filterType: {value: 1, automatable: false, type: INT}
            }
        }, 
        filterType: {
            enumerable: true, 
            get: function () {return this._filterType},
            set: function (value) {
                this.filter.type = value;
            }
        }, 
        Q: {
            enumerable: true, 
            get: function () {return this.filter.Q}, 
            set: function (value) {
                this.filter.Q.value = value;
            }
        }, 
        gain: {
            enumerable: true, 
            get: function () {return this.filter.gain},
            set: function (value) {
                this.filter.gain.value = value;
            }
        }, 
        frequency: {
            enumerable: true, 
            get: function () {return this.filter.frequency}, 
            set: function (value) {
                this.filter.frequency.value = value;
            }
        }
    });
    Tuna.prototype.Cabinet = function (properties) {
        if (!properties) {
            properties = this.getDefaults();
        }
        this.input = userContext.createGainNode();
        this.activateNode = userContext.createGainNode();
        this.convolver = this.newConvolver(properties.impulsePath || "../impulses/impulse_guitar.wav");
        this.makeupNode = userContext.createGainNode();
        this.output = userContext.createGainNode();

        this.activateNode.connect(this.convolver.input);
        this.convolver.output.connect(this.makeupNode);
        this.makeupNode.connect(this.output);

        this.makeupGain = properties.makeupGain || this.defaults.makeupGain;
        this.bypass = false;
    };
    Tuna.prototype.Cabinet.prototype = Object.create(Super, {
        name: {value: "Cabinet"},
        defaults: {
            value: {
                makeupGain: {value: 1, min: 0, max: 20, automatable: true, type: FLOAT},
                bypass: {value: false, automatable: false, type: BOOLEAN}
            }
        },
        makeupGain: {
            enumerable: true, 
            get: function () {return this.makeupNode.gain}, 
            set: function (value) {
                this.makeupNode.gain.value = value;
            }
        }, 
        newConvolver: {
            value: function (impulsePath) {
                return new userInstance.Convolver({impulse: impulsePath, dryLevel: 0, wetLevel: 1});
            }
        }
    });
    Tuna.prototype.Compressor = function (properties) {
        if (!properties) {
            properties = this.getDefaults();
        }
        this.input = userContext.createGainNode();
        this.compNode = this.activateNode = userContext.createDynamicsCompressor();
        this.makeupNode = userContext.createGainNode();
        this.output = userContext.createGainNode();

        this.compNode.connect(this.makeupNode);
        this.makeupNode.connect(this.output);

        this.automakeup = properties.automakeup || this.defaults.automakeup.value;
        this.makeupGain = properties.makeupGain || this.defaults.makeupGain.value;
        this.threshold = properties.threshold || this.defaults.threshold.value;
        this.release = properties.release || this.defaults.release.value;
        this.attack = properties.attack || this.defaults.attack.value;
        this.ratio = properties.ratio || this.defaults.ratio.value;
        this.knee = properties.knee || this.defaults.knee.value;
        this.bypass = false;
    };
    Tuna.prototype.Compressor.prototype = Object.create(Super, {
        name: {value: "Compressor"},
        defaults: {
            value: {
                threshold: {value: -20, min: -80, max: 0, automatable: true, type: FLOAT},
                release: {value: 250, min: 10, max: 2000, automatable: true, type: FLOAT},
                makeupGain: {value: 1, min: 1, max: 100, automatable: true, type: FLOAT},
                attack: {value: 1, min: 0, max: 1000, automatable: true, type: FLOAT},
                ratio: {value: 4, min: 1, max: 50, automatable: true, type: FLOAT},
                knee: {value: 5, min: 0, max: 40, automatable: true, type: FLOAT}, 
                automakeup: {value: false, automatable: false, type: BOOLEAN},
                bypass: {value: true, automatable: false, type: BOOLEAN}
            }
        },
        computeMakeup: {
            value: function () {
                var magicCoefficient = 4,   // raise me if the output is too hot
                    c = this.compNode; 
                return -(c.threshold.value - c.threshold.value / c.ratio.value) / magicCoefficient;
            }
        },
        automakeup: {
            enumerable: true,
            get: function () {return this._automakeup},
            set: function(value) {
                this._automakeup = value;
                if (this._automakeup) this.makeupGain = this.computeMakeup();
            }
        },
        threshold: {
            enumerable: true,
            get: function () {return this.compNode.threshold},
            set: function (value) {
                this.compNode.threshold.value = value;
                if (this._automakeup) this.makeupGain = this.computeMakeup();
            }
        },
        ratio: {
            enumerable: true,
            get: function () {return this.compNode.ratio},
            set: function (value) {
                this.compNode.ratio.value = value;
                if (this._automakeup) this.makeupGain = this.computeMakeup();
            }
        }, 
        knee: {
            enumerable: true,
            get: function () {return this.compNode.knee},
            set: function (value) {
                this.compNode.knee.value = value;
                if (this._automakeup) this.makeupGain = this.computeMakeup();
            }
        }, 
        attack: {
            enumerable: true,
            get: function () {return this.compNode.attack},
            set: function (value) {
                this.compNode.attack.value = value / 1000;
            }
        }, 
        release: {
            enumerable: true,
            get: function () {return this.compNode.release},
            set: function (value) {
                this.compNode.release = value / 1000;
            }
        }, 
        makeupGain: {
            enumerable: true,
            get: function () {return this.makeupNode.gain},
            set: function (value) {
                this.makeupNode.gain.value = dbToWAVolume(value);      
            }
        }
    });
    Tuna.prototype.Convolver = function (properties) {
        if (!properties) {
            properties = this.getDefaults();
        }
        this.input = userContext.createGainNode();
        this.activateNode = userContext.createGainNode();
        this.convolver = userContext.createConvolver();
        this.dry = userContext.createGainNode();
        this.filterLow = userContext.createBiquadFilter();
        this.filterHigh = userContext.createBiquadFilter();
        this.wet = userContext.createGainNode();
        this.output = userContext.createGainNode();

        this.activateNode.connect(this.filterLow);
        this.activateNode.connect(this.dry);
        this.filterLow.connect(this.filterHigh);
        this.filterHigh.connect(this.convolver);
        this.convolver.connect(this.wet);
        this.wet.connect(this.output);
        this.dry.connect(this.output);

        this.dryLevel = properties.dryLevel || this.defaults.dryLevel.value;
        this.wetLevel = properties.wetLevel || this.defaults.wetLevel.value;
        this.highCut = properties.highCut|| this.defaults.highCut.value;
        this.buffer = properties.impulse || "../impulses/ir_rev_short.wav";
        this.lowCut = properties.lowCut || this.defaults.lowCut.value;
        this.level = properties.level || this.defaults.level.value;
        this.filterHigh.type = 0; 
        this.filterLow.type = 1;
        this.bypass = false;
    };
    Tuna.prototype.Convolver.prototype = Object.create(Super, {
        name: {value: "Convolver"},
        defaults: {
            value: {
                highCut: {value: 22050, min: 20, max: 22050, automatable: true, type: FLOAT},
                lowCut: {value: 20, min: 20, max: 22050, automatable: true, type: FLOAT}, 
                dryLevel: {value: 1, min: 0, max: 1, automatable: true, type: FLOAT}, 
                wetLevel: {value: 1, min: 0, max: 1, automatable: true, type: FLOAT}, 
                level: {value: 1, min: 0, max: 1, automatable: true, type: FLOAT}
            }
        }, 
        lowCut: {
            get: function () {return this.filterLow.frequency},
            set: function (value) {
                this.filterLow.frequency.value = value;
            } 
        }, 
        highCut: {
            get: function () {return this.filterHigh.frequency},
            set: function (value) {
                this.filterHigh.frequency.value = value;
            }
        }, 
        level: {
            get: function () {return this.output.gain},
            set: function (value) {
                this.output.gain.value = value;
            }
        }, 
        dryLevel: {
            get: function () {return this.dry.gain},
            set: function (value) {
                this.dry.gain.value = value;
            }
        }, 
        wetLevel: {
            get: function () {return this.wet.gain},
            set: function (value) {
                this.wet.gain.value = value;
            }
        }, 
        buffer: {
            enumerable: false, 
            get: function () {return this.convolver.buffer},
            set: function (impulse) {
                var convolver = this.convolver, 
                    xhr = new XMLHttpRequest();
                if (!impulse) {
                    console.log("Tuna.Convolver.setBuffer: Missing impulse path!");
                    return;
                }
                xhr.open("GET", impulse, true);
                xhr.responseType = "arraybuffer";
                xhr.onreadystatechange = function () {
                    if (xhr.readyState === 4) {
                        if (xhr.status < 300 && xhr.status > 199 || xhr.status === 302) {
                            userContext.decodeAudioData(xhr.response, function (buffer) {
                                convolver.buffer = buffer;
                            }, function(e) {
                                if (e) console.log("Tuna.Convolver.setBuffer: Error decoding data" + e);
                            });
                        }
                    }
                };
                xhr.send(null);
            }
        }
    });
    Tuna.prototype.Delay = function(properties) {
        if (!properties) {
            properties = this.getDefaults();
        }
        this.input = userContext.createGainNode();
        this.activateNode = userContext.createGainNode();
        this.dry = userContext.createGainNode();
        this.wet = userContext.createGainNode();
        this.filter = userContext.createBiquadFilter();
        this.delay = userContext.createDelayNode();
        this.feedbackNode = userContext.createGainNode();
        this.output = userContext.createGainNode();
       
        this.activateNode.connect(this.delay);
        this.activateNode.connect(this.dry)
        this.delay.connect(this.feedbackNode);
        this.feedbackNode.connect(this.delay);
        this.delay.connect(this.filter);
        this.filter.connect(this.wet);
        this.wet.connect(this.output);
        this.dry.connect(this.output);

        this.delayTime = properties.delayTime || this.defaults.delayTime.value;
        this.feedback = properties.feedback || this.defaults.feedback.value;
        this.wetLevel = properties.wetLevel || this.defaults.wetLevel.value;
        this.dryLevel = properties.dryLevel || this.defaults.dryLevel.value;
        this.cutoff = properties.cutoff || this.defaults.cutoff.value;
        this.filter.type = 1;
        this.bypass = false;
    };
    Tuna.prototype.Delay.prototype = Object.create(Super, {
        name: {value: "Delay"},
        defaults: {
            value: {
                delayTime: {value: 150, min: 20, max: 10000, automatable: false, type: FLOAT},
                feedback: {value: 0.45, min: 0, max: 0.9, automatable: true, type: FLOAT},
                cutoff: {value: 20, min: 20, max: 20000, automatable: true, type: FLOAT},
                wetLevel: {value: 0.5, min: 0, max: 1, automatable: true, type: FLOAT},
                dryLevel: {value: 1, min: 0, max: 1, automatable: true, type: FLOAT},
            }
        }, 
        delayTime: {
            enumerable: true,
            get: function () {return this.delay.delayTime}, 
            set: function (value) {
                this.delay.delayTime.value = value / 1000;
            }
        }, 
        wetLevel: {
            enumerable: true,
            get: function () {return this.wet.gain}, 
            set: function (value) {
                this.wet.gain.value = value;
            }
        }, 
        dryLevel: {
            enumerable: true, 
            get: function () {return this.dry.gain}, 
            set: function (value) {
                this.dry.gain.value = value;
            }
        }, 
        feedback: {
            enumerable: true, 
            get: function () {return this.feedbackNode.gain}, 
            set: function (value) {
                this.feedbackNode.gain.value = value;
            }
        }, 
        cutoff: {
            enumerable: true, 
            get: function () {return this.filter.frequency},
            set: function (value) {
                this.filter.frequency.value = value;
            }
        }
    });
    Tuna.prototype.Overdrive = function(properties) {
        if (!properties) {
            properties = this.getDefaults();
        }
        this.input = userContext.createGainNode();
        this.activateNode = userContext.createGainNode();
        this.inputDrive = userContext.createGainNode();
        this.waveshaper = userContext.createWaveShaper();
        this.outputDrive = userContext.createGainNode();
        this.output = userContext.createGainNode();

        this.activateNode.connect(this.inputDrive);
        this.inputDrive.connect(this.waveshaper);
        this.waveshaper.connect(this.outputDrive);
        this.outputDrive.connect(this.output);

        this.ws_table = new Float32Array(this.k_nSamples);
        this.drive = properties.drive || this.defaults.drive.value; 
        this.outputGain = properties.outputGain || this.defaults.outputGain.value;
        this.curveAmount = properties.curveAmount || this.defaults.curveAmount.value;
        this.algorithm = properties.algorithmIndex || this.defaults.algorithmIndex.value;
        this.bypass = false;
    };
    Tuna.prototype.Overdrive.prototype = Object.create(Super, {
        name: {value: "Overdrive"},
        defaults: {
            value: {
                drive: {value: 1, min: 0, max: 1, automatable: true, type: FLOAT, scaled: true}, 
                outputGain: {value: 1, min: 0, max: 1, automatable: true, type: FLOAT, scaled: true}, 
                curveAmount: {value: 0.65, min: 0, max: 1, automatable: false, type: FLOAT},
                algorithmIndex: {value: 0, automatable: false, type: INT},
                bypass: {value: true, automatable: false, type: BOOLEAN}
            }
        },  
        k_nSamples: {value: 8192},  
        drive: {
            get: function () {return this.inputDrive.gain},
            set: function(value) {
                this._drive = value;
            }
        }, 
        curveAmount: {
            get: function () {return this._curveAmount},
            set: function (value) {
                this._curveAmount = value;
                if(this._algorithmIndex === undefined) {this._algorithmIndex = 0}
                this.waveshaperAlgorithms[this._algorithmIndex](this._curveAmount, this.k_nSamples, this.ws_table);
                this.waveshaper.curve = this.ws_table;
            }
        }, 
        outputGain: {
            get: function () {return this.outputDrive.gain},
            set: function (value) {
                this._outputGain = dbToWAVolume(value);
            } 
        }, 
        algorithm: {
            get: function () {return this._algorithmIndex},
            set: function (value) {
                this._algorithmIndex = value;
                this.curveAmount = this._curveAmount;
            }
        },
        waveshaperAlgorithms: {
            value: [
                function (amount, n_samples, ws_table) {
                    amount = Math.min(amount, 0.999);
                    var k = 2 * amount / (1 - amount), i, x;
                    for (i = 0; i < n_samples; i++) {
                        x = i * 2 / n_samples - 1;
                        ws_table[i] = (1 + k) * x / (1 + k * Math.abs(x));
                    }
                },
                function (amount, n_samples, ws_table) {
                    var i, x, y;
                    for (i = 0; i < n_samples; i++) {
                        x = i * 2 / n_samples - 1;
                        y = ((0.5 * Math.pow((x + 1.4), 2)) - 1) * y >= 0 ? 5.8 : 1.2;
                        ws_table[i] = tanh(y);
                    }
                },
                function (amount, n_samples, ws_table) {
                    var i, x, y, a = 1 - amount;
                    for (i = 0; i < n_samples; i++) {
                        x = i * 2 / n_samples - 1;
                        y = x < 0 ? -Math.pow(Math.abs(x), a + 0.04) : Math.pow(x, a);
                        ws_table[i] = tanh(y * 2);
                    }
                }, 
                function (amount, n_samples, ws_table) {
                    var i, x, y, abx, a = 1 - amount > 0.99 ? 0.99 : 1 - amount;
                    for (i = 0; i < n_samples; i++) {
                        x = i * 2 / n_samples - 1;
                        abx = Math.abs(x);
                        if (abx < a)  y = abx;
                        else if (abx > a) y = a + (abx - a) / (1 + Math.pow((abx - a) / (1 - a), 2));
                        else if (abx > 1) y = abx;
                        ws_table[i] = sign(x) * y * (1 / ((a + 1) / 2));
                    }
                },
                function (amount, n_samples, ws_table) { // fixed curve, amount doesn't do anything, the distortion is just from the drive
                    var i, x;
                    for (i = 0; i < n_samples; i++) {
                        x = i * 2 / n_samples - 1;
                        if (x < -0.08905) {
                            ws_table[i] = (-3 / 4) * (1 - (Math.pow((1 - (Math.abs(x) - 0.032857)), 12)) + (1 / 3) * (Math.abs(x) - 0.032847)) + 0.01;;
                        } else if (x >= -0.08905 && x < 0.320018) {
                            ws_table[i] = (-6.153 * (x * x)) + 3.9375 * x;
                        } else {
                            ws_table[i] = 0.630035;
                        }
                    }
                },
                function (amount, n_samples, ws_table) {
                    var a = 2 + Math.round(amount * 14),            // we go from 2 to 16 bits, keep in mind for the UI
                        bits = Math.round(Math.pow(2, a - 1)),      // real number of quantization steps divided by 2
                        i, x;
                    for (i = 0; i < n_samples; i++) {
                        x = i * 2 / n_samples - 1;
                        ws_table[i] = Math.round(x * bits) / bits;
                    }
                }
            ]
        }
    });
    Tuna.prototype.WahWah = function (properties) {
        if (!properties) {
            properties = this.getDefaults();
        }
        this.input = userContext.createGainNode();
        this.activateNode = userContext.createGainNode();
        this.envelopeFollower = new userInstance.EnvelopeFollower({target: this, callback: function (context, value) {
            context.sweep = value;
        }});
        this.filterBp = userContext.createBiquadFilter();
        this.filterPeaking = userContext.createBiquadFilter();
        this.output = userContext.createGainNode();

        //Connect AudioNodes
        this.activateNode.connect(this.filterBp);
        this.filterBp.connect(this.filterPeaking);
        this.filterPeaking.connect(this.output);

        //Set Properties
        this.init();
        this.automode = properties.enableAutoMode || this.defaults.automode.value;
        this.resonance = properties.resonance || this.defaults.resonance.value;
        this.sensitivity = properties.sensitivity || this.defaults.sensitivity.value;
        this.baseFrequency = properties.baseFrequency || this.defaults.baseFrequency.value;
        this.excursionOctaves = properties.excursionOctaves || this.defaults.excursionOctaves.value;
        this.sweep = properties.sweep || this.defaults.sweep.value;

        this.activateNode.gain.value = 2;
        this.envelopeFollower.activate(true);
        this.bypass = false;
    };
    Tuna.prototype.WahWah.prototype = Object.create(Super, {
        name: {value: "WahWah"}, 
        defaults: {
            value: {
                automode: {value: false, automatable: false, type: BOOLEAN},
                baseFrequency: {value: 0.5, min: 0, max: 1, automatable: false, type: FLOAT},
                excursionOctaves: {value: 2, min: 1, max: 6, automatable: false, type: FLOAT}, 
                sweep: {value: 0.2, min: 0, max: 1, automatable: false, type: FLOAT}, 
                resonance: {value: 10, min: 1, max: 100, automatable: false, type: FLOAT}, 
                sensitivity: {value: 0.5, min: -1, max: 1, automatable: false, type: FLOAT}
            }
        }, 
        activateCallback: {
            value: function (value) {
                this.automode = value;
            }
        }, 
        automode: {
            get: function () {return this._automode},
            set: function (value) {
                this._automode = value;
                if (value) {
                    this.activateNode.connect(this.envelopeFollower.input);
                    this.envelopeFollower.activate(true);
                } else {
                    this.envelopeFollower.activate(false);
                    this.activateNode.disconnect();
                    this.activateNode.connect(this.filterBp);
                }
            }
        }, 
        sweep: {
            enumerable: true, 
            get: function () {return this._sweep.value},
            set: function (value) {
                this._sweep = Math.pow(value > 1 ? 1 : value < 0 ? 0 : value, this._sensitivity);
                this.filterBp.frequency.value = this._baseFrequency + this._excursionFrequency * this._sweep;
                this.filterPeaking.frequency.value = this._baseFrequency + this._excursionFrequency * this._sweep;
            }
        }, 
        baseFrequency: {
            enumerable: true,
            get: function () {return this._baseFrequency},
            set: function (value) {
                this._baseFrequency = 50 * Math.pow(10, value * 2);
                this._excursionFrequency = Math.min(this.sampleRate / 2, this.baseFrequency * Math.pow(2, this._excursionOctaves));
                this.filterBp.frequency.value = this._baseFrequency + this._excursionFrequency * this._sweep;
                this.filterPeaking.frequency.value = this._baseFrequency + this._excursionFrequency * this._sweep;
            }
        }, 
        excursionOctaves: {
            enumerable: true,
            get: function () {return this._excursionOctaves},
            set: function (value) {
                this._excursionOctaves = value;
                this._excursionFrequency = Math.min(this.sampleRate / 2, this.baseFrequency * Math.pow(2, this._excursionOctaves));
                this.filterBp.frequency.value = this._baseFrequency + this._excursionFrequency * this._sweep;
                this.filterPeaking.frequency.value = this._baseFrequency + this._excursionFrequency * this._sweep;
            }
        }, 
        sensitivity: {
            enumerable: true,
            get: function () {return this._sensitivity},
            set: function (value) {
                this._sensitivity = Math.pow(10, value);
            }
        }, 
        resonance: {
            enumerable: true,
            get: function () {return this._resonance},
            set: function (value) {
                this._resonance = value;
                this.filterPeaking.Q = this._resonance;
            }
        }, 
        init: {
            value: function () {
                this.output.gain.value = 1;
                this.filterPeaking.type = 5;
                this.filterBp.type = 2;
                this.filterPeaking.frequency.value = 100;
                this.filterPeaking.gain.value = 20;
                this.filterPeaking.Q.value = 5;
                this.filterBp.frequency.value = 100;
                this.filterBp.Q.value = 1;
                this.sampleRate = userContext.sampleRate;
            }
        }
    });
    Tuna.prototype.EnvelopeFollower = function (properties) {
        if (!properties) {
            properties = this.getDefaults();
        }
        this.input = userContext.createGainNode();
        this.jsNode = this.output = userContext.createJavaScriptNode(this.buffersize, 1, 1);

        this.input.connect(this.output);

        this.attackTime = properties.attackTime || this.defaults.attackTime.value;
        this.releaseTime = properties.releaseTime || this.defaults.releaseTime.value;
        this._envelope = 0;
        this.target = properties.target || {};
        this.callback = properties.callback || function () {}; 
    };
    Tuna.prototype.EnvelopeFollower.prototype = Object.create(Super, {
        name: {value: "EnvelopeFollower"},
        defaults: {
            value: {
                attackTime: {value: 0.003, min: 0, max: 0.5, automatable: false, type: FLOAT}, 
                releaseTime: {value: 0.5, min: 0.5, max: 1, automatable: false, type: FLOAT}
            }
        },  
        buffersize: {value: 256}, 
        envelope: {value: 0}, 
        sampleRate: {value: 44100},  
        attackTime: {
            enumerable: true,
            get: function () {return this._attackTime},
            set: function (value) {
                this._attackTime = value;
                this._attackC = Math.exp(-1 / this._attackTime * this.sampleRate / this.buffersize);
            }
        }, 
        releaseTime: {
            enumerable: true, 
            get: function () {return this._releaseTime}, 
            set: function (value) {
                this._releaseTime = value;
                this._releaseC = Math.exp(-1 / this._releaseTime * this.sampleRate / this.buffersize); 
            }
        }, 
        callback: {
            get: function () {return this._callback}, 
            set: function (value) {
                if (typeof value === "function") {
                    this._callback = value;
                } else {
                    console.error("tuna.js: " + this.name + ": Callback must be a function!");
                }
            }
        }, 
        target: {
            get: function () {return this._target}, 
            set: function (value) {
                this._target = value;
            }
        }, 
        activate: {
            value: function(doActivate) {
                this.activated = doActivate;
                if (doActivate) {
                    this.jsNode.connect(userContext.destination);
                    this.jsNode.onaudioprocess = this.returnCompute(this);
                } else {
                    this.jsNode.disconnect();
                    this.jsNode.onaudioprocess = null;
                }  
            }
        }, 
        returnCompute: {
            value: function (instance) {
                return function(event) {instance.compute(event);}
            }
        }, 
        compute: {
            value: function(event) {
                var count = event.inputBuffer.getChannelData(0).length,
                    channels = event.inputBuffer.numberOfChannels, 
                    current, 
                    chan, 
                    rms;
                chan = rms = 0;
                if (channels > 1) { // need to mixdown
                    for (var i = 0; i < count; ++i) {
                        for (; chan < channels; ++chan) {
                            current = event.inputBuffer.getChannelData(chan)[i];
                            rms += (current * current) / channels;
                        }
                    }
                } else {
                    for (var i = 0; i < count; ++i) {
                        current = event.inputBuffer.getChannelData(0)[i];
                        rms += (current * current);
                    }
                }
                rms = Math.sqrt(rms);

                if (this._envelope < rms) {
                    this._envelope *= this._attackC;
                    this._envelope += (1 - this._attackC) * rms;
                } else {
                    this._envelope *= this._releaseC;
                    this._envelope += (1 - this._releaseC) * rms;
                }
                this._callback(this._target, this._envelope);
            }
        }
    });
    Tuna.toString = Tuna.prototype.toString = function () {
        return "You are running Tuna version " + version + " by Dinahmoe!";
    };
    (typeof define != "undefined" ? (define("Tuna", [], function () {return Tuna})) : window.Tuna = Tuna)
})(this);