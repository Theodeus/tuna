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
        Tuna = function (context) {
            if (!context) {
                console.log("tuna.js: Missing audio context! Creating a new context for you.");
                context = window.webkitAudioContext && (new window.webkitAudioContext());
            }
            userContext = context;
        },
        set = "setValueAtTime",
        linear = "linearRampToValueAtTime",
        pipe = function (param, val) {param.value = val}, 
        Super = Object.create(null, {
            activate: {
                writable: true, 
                value: function (doActivate) {
                    this.input.disconnect();
                    this._activated = doActivate;
                    if (doActivate) {
                        this.input.connect(this.activateNode);
                        this.activateCallback && this.activateCallback(doActivate);
                    } else {
                        this.input.connect(this.output);
                    }
                }  
            },
            connect: {
                value: function (target) {
                    this.output.connect(target);
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
        });

    function dbToWAVolume (db) {
        return Math.max(0, Math.round(100 * Math.pow(2, db / 6)) / 100);   
    }
    function fmod (x, y) {
        // http://kevin.vanzonneveld.net
        // +   original by: Onno Marsman
        // +      input by: Brett Zamir (http://brett-zamir.me)
        // +   bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
        var tmp, 
            tmp2, 
            p = 0,
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
//---------------------------------------------------------------------------------//
//-------------------------------AudioNode Subclasses------------------------------//
//---------------------------------------------------------------------------------//
    Tuna.prototype.Filter = function (properties) {
        this.input = userContext.createGainNode();
        this.filter = this.activateNode = userContext.createBiquadFilter();
        this.output = userContext.createGainNode();

        this.filter.connect(this.output);
        
        this.frequency = properties.frequency;
        this.Q = properties.resonance;
        this.filterType = properties.filterType;
        this.gain = properties.gain;
    };
    Tuna.prototype.Filter.prototype = Object.create(Super, {
        name: {value: "Filter"},
        defaults: {
            value: {
                frequency: {value: 20, min: 20, max: 22050, automatable: true, type: _FLOAT},
                Q: {value: 1, min: 0.001, max: 100, automatable: true, type: _FLOAT}, 
                gain: {value: 0, min: -40, max: 40, automatable: true, type: _FLOAT},
                bypass: {value: true, automatable: false, type: _BOOLEAN},
                type: {value: 0, automatable: false, type: INT}
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
//---------------------------------------------------------------------------------//
    Tuna.prototype.Cabinet = function (properties) {
        this.input = userContext.createGainNode();
        this.activateNode = userContext.createGainNode();
        this.convolver = this.newConvolver(properties.impulsePath);
        this.makeupNode = userContext.createGainNode();
        this.output = userContext.createGainNode();

        this.activateNode.connect(this.convolver.input);
        this.convolver.output.connect(this.makeupNode);
        this.makeupNode.connect(this.output);

        this.makeupGain = properties.makeupGain;
        this.convolver.activate(true);
    }
    Tuna.prototype.Cabinet.prototype = Object.create(Super, {
        name: {value: "Cabinet"},
        defaults: {
            value: {
                makeupGain: {value: 1, min: 0, max: 20, automatable: true, type: _FLOAT},
                impulsePath: {value: "impulse.wav", automatable: false, type: STRING}
                bypass: {value: true, automatable: false, type: _BOOLEAN}
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
                return new Tuna.Convolver({impulse: impulsePath, dryLevel: 0, wetLevel: 1});
            }
        }
    });
//---------------------------------------------------------------------------------//
    Tuna.prototype.Chorus = function (properties) {
        this.input = userContext.createGainNode();
        this.attenuator = this.activateNode = userContext.createGainNode();
        this.splitter = userContext.createChannelSplitter(2);
        this.delayL = userContext.createDelayNode();
        this.delayR = userContext.createDelayNode();
        this.feedbackGainNodeLR = userContext.createGainNode();
        this.feedbackGainNodeRL = userContext.createGainNode();
        this.merger = userContext.createChannelMerger(2);
        this.output = userContext.createGainNode();

        this.lfoL = new Tuna.LFO({target: this.delayL.delayTime, callback: pipe});
        this.lfoR = new Tuna.LFO({target: this.delayR.delayTime, callback: pipe});

        this.input.connect(this.attenuator);
        this.attenuator.connect(this.output);
        this.attenuator.connect(this.splitter);
        this.splitter.connect(this.delayL, 0);
        this.splitter.connect(this.delayR, 1);
        this.delayL.connect(this.feedbackGainNodeLR);
        this.delayR.connect(this.feedbackGainNodeRL);
        this.feedbackGainNodeLR.connect(this.delayR);
        this.feedbackGainNodeRL.connect(this.delayL);
        this.delayL.connect(this.merger, 0, 0);
        this.delayR.connect(this.merger, 0, 1);
        this.merger.connect(this.output);
        
        this.feedback = properties.feedback;
        this.rate = properties.rate;
        this.delay = properties.delay;
        this.depth = properties.depth;
        this.lfoR.phase = Math.PI / 2;
        this.attenuator.gain.value = 0.6934; // 1 / (10 ^ (((20 * log10(3)) / 3) / 20))

        this.lfoL.activate(true);
        this.lfoR.activate(true);
    };
    Tuna.prototype.Chorus.prototype = Object.create(Super, {
        name: {value: "Chorus"}, 
        defaults: {
            value: {
                feedback: {value: 0.4, min: 0, max: 1, automatable: false, type: _FLOAT}, 
                delay: {value: 0.0045, min: 0, max: 1, automatable: false, type: _FLOAT},
                depth: {value: 0.7, min: 0, max: 1, automatable: false, type: _FLOAT},
                rate: {value: 1.5, min: 0, max: 8, automatable: false, type: _FLOAT}, 
                bypass: {value: true, automatable: false, type: _BOOLEAN}
            }
        },
        delay: {
            enumerable: true,
            get: function () {return this._delay},
            set: function (value) {
                this._delay = 0.0002 * Math.pow(10, value) * 2);
                this.lfoL.offset = this._delay; 
                this.lfoR.offset = this._delay;
                this._depth = this._depth;
            }
        },
        depth: {
            enumerable: true,
            get: function () {return this._depth},
            set: function (value) {
                this._depth = value;
                this.lfoL.oscillation = this._depth * this._delay;
                this.lfoR.oscillation = this._depth * this._delay;
            }
        },
        feedback: {
            enumerable: true,
            get: function () {return this._feedback}, 
            set: function (value) {
                this._feedback = value;
                this.feedbackGainNodeLR.gain.value = this._feedback;
                this.feedbackGainNodeRL.gain.value = this._feedback;
            }
        },  
        rate: {
            enumerable: true,
            get: function () {return this._rate},
            set: function (value) {
                this._rate = value;
                this.lfoL._frequency = this._rate;
                this.lfoR._frequency = this._rate;
            }
        }
    });
//---------------------------------------------------------------------------------// 
    Tuna.prototype.Compressor = function (properties) {
        this.input = userContext.createGainNode();
        this.compNode = this.activateNode = userContext.createDynamicsCompressor();
        this.makeupNode = userContext.createGainNode();
        this.output = userContext.createGainNode();

        this.compNode.connect(this.makeupNode);
        this.makeupNode.connect(this.output);

        this.automakeup = properties.automakeup;
        this.makeupGain = properties.makeupGain;
        this.threshold = properties.threshold;
        this.release = properties.release;
        this.attack = properties.attack;
        this.ratio = properties.ratio;
        this.knee = properties.knee;
    };
    Tuna.prototype.Compressor.prototype = Object.create(Super, {
        name: {value: "Compressor"},
        defaults: {
            value: {
                threshold: {value: -20, min: -80, max: 0, automatable: true, type: _FLOAT},
                release: {value: 250, min: 10, max: 2000, automatable: true, type: _FLOAT},
                makeupGain: {value: 1, min: 1, max: 100, automatable: true, type: _FLOAT},
                attack: {value: 1, min: 0, max: 1000, automatable: true, type: _FLOAT},
                ratio: {value: 4, min: 1, max: 50, automatable: true, type: _FLOAT},
                knee: {value: 5, min: 0, max: 40, automatable: true, type: _FLOAT}, 
                automakeup: {value: false, automatable: false, type: _BOOLEAN},
                bypass: {value: true, automatable: false, type: _BOOLEAN}
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
//---------------------------------------------------------------------------------//
    Tuna.prototype.Convolver = function (properties) {
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

        this.dryLevel = properties.dryLevel;
        this.wetLevel = properties.wetLevel;
        this.highCut = properties.highCut;
        this.buffer = properties.impulse;
        this.lowCut = properties.lowCut;
        this.level = properties.level;
        this.filterHigh.type = 0; 
        this.filterLow.type = 1;
    };
    Tuna.prototype.Convolver.prototype = Object.create(Super, {
        name: {value: "Convolver"},
        defaults: {
            value: {
                highCut: {value: 22050, min: 20, max: 22050, automatable: true, type: _FLOAT},
                lowCut: {value: 20, min: 20, max: 22050, automatable: true, type: _FLOAT}, 
                dryLevel: {value: 1, min: 0, max: 1, automatable: true, type: _FLOAT}, 
                wetLevel: {value: 1, min: 0, max: 1, automatable: true, type: _FLOAT}, 
                level: {value: 1, min: 0, max: 1, automatable: true, type: _FLOAT}
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
//---------------------------------------------------------------------------------//
    Tuna.prototype.Delay = function(properties) {
        //Instantiate AudioNodes
        this.input = userContext.createGainNode();
        this.activateNode = userContext.createGainNode();
        this.dry = userContext.createGainNode();
        this.wet = userContext.createGainNode();
        this.filter = userContext.createBiquadFilter();
        this.delay = userContext.createDelayNode();
        this.feedbackNode = userContext.createGainNode();
        this.output = userContext.createGainNode();
       
        //Connect the AudioNodes
        this.activateNode.connect(this.delay);
        this.activateNode.connect(this.dry)
        this.delay.connect(this.feedbackNode);
        this.feedbackNode.connect(this.delay);
        this.delay.connect(this.filter);
        this.filter.connect(this.wet);
        this.wet.connect(this.output);
        this.dry.connect(this.output);

        //Set properties
        this.delayTime = properties.delayTime;
        this.feedback = properties.feedback;
        this.wetLevel = properties.wetLevel;
        this.dryLevel = properties.dryLevel;
        this.cutoff = properties.cutoff;
        this.filter.type = 1;
    };
    Tuna.prototype.Delay.prototype = Object.create(Super, {
        name: {value: "Delay"},
        defaults: {
            value: {
                delayTime: {value: 30, min: 20, max: 10000, automatable: false, type: _FLOAT},
                feedback: {value: 0.45, min: 0, max: 0.9, automatable: true, type: _FLOAT},
                cutoff: {value: 20, min: 20, max: 20000, automatable: true, type: _FLOAT},
                wetLevel: {value: 0.5, min: 0, max: 1, automatable: true, type: _FLOAT},
                dryLevel: {value: 1, min: 0, max: 1, automatable: true, type: _FLOAT},
            }
        }, 
        delayTime: {
            enumerable: true,
            get: function () {return this.delay.delayTime}, 
            set: function (value) {
                this.delay.delayTime = ~~(value / 1000);
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
//---------------------------------------------------------------------------------//
    /*Tuna.Equalizer = (function () {
        var propertyNames = ["frequency", "gain", "Q", "type"];
        function Equalizer (properties) {
            
            this._defaults = DMAF.Descriptors.type.audioNode.equalizer;
            this.nbands = properties.bands.length;
            
            for(var i = 0, ii = this._nbands; i < ii; i++) {
                //addBand.call(this, i);
            }

            this.input = userContext.createGainNode();
            this.output = userContext.createGainNode();
            //this.activateNode = this.bands[0];
            this.activateNode = userContext.createGainNode();    
            return;
            //Connect the AudioNodes
            this.connectInOrder(this.bands);
            this.bands[this.nbands - 1].connect(this.output);

            //Set properties for each band
            for(i = 0; i < this._nbands; i++) {
                for(var j = 0, jj = propertyNames.length; j < jj; j++) {
                    var current = "band" + i + ":" + propertyNames[j];
                    this[current] = properties[current];
                }
            }
        };
        //Using mixin pattern here pretty heavily...This is a bit tricky.
        //EQ is kind of the odd one out as far as nodes go. 
        //I think this is the best way to handle it as now the params of the EQ
        //Can be treated like any other audioNode parameter. 
        function addBandParam(i, param) {
            var access = "band" + i + ":" + param;
            Object.defineProperty(this, access, {
                enumerable: true, 
                get: function () {return this.bands[i][param]}, 
                set: function (value) {
                    if(param === "type") {
                        this.bands[i][param] = this.verify(param, value);
                    } else {
                        this.bands[i][param].value = this.verify(param, value);
                    }
                }
            });
            this.defaults[access] = this._defaults[param];
        }
        function addBand (i) {
            this.bands[i] = userContext.createBiquadFilter();
            addBandParam.apply(this, [i, "frequency"]);
            addBandParam.apply(this, [i, "type"]);
            addBandParam.apply(this, [i, "gain"]);
            addBandParam.apply(this, [i, "Q"]);
        }
        return Equalizer;
    })();
    Tuna.Equalizer.prototype = Object.create(Super, {
        name: {value: "Equalizer"}, 
        propertySearch: {value: /:bypass|:type|:frequency|:gain|:q/i}
    });*/
//---------------------------------------------------------------------------------//
    Tuna.prototype.Overdrive = function(properties) {
        //Instantiate AudioNodes
        this.input = userContext.createGainNode();
        this.activateNode = userContext.createGainNode();
        this.inputDrive = userContext.createGainNode();
        this.waveshaper = userContext.createWaveShaper();
        this.outputDrive = userContext.createGainNode();
        this.output = userContext.createGainNode();

        //Connect AudioNodes
        this.activateNode.connect(this.inputDrive);
        this.inputDrive.connect(this.waveshaper);
        this.waveshaper.connect(this.outputDrive);
        this.outputDrive.connect(this.output);

        //Set Properties
        this.ws_table = new Float32Array(this.k_nSamples);
        this.drive = properties.drive; 
        this.outputGain = properties.outputGain;
        this.curveAmount = properties.curveAmount;
        this.algorithm = properties.algorithmIndex;
    };
    Tuna.prototype.Overdrive.prototype = Object.create(Super, {
        name: {value: "Overdrive"},
        defaults: {
            value: {
                drive: {value: 0.5, min: 0, max: 1, automatable: true, type: _FLOAT, scaled: true}, 
                outputGain: {value: 1, min: 0, max: 1, automatable: true, type: _FLOAT, scaled: true}, 
                curveAmount: {value: 1, min: 0, max: 1, automatable: false, type: _FLOAT},
                algorithmIndex: {value: 0, automatable: false, type: _INT}
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
//---------------------------------------------------------------------------------//
    /*Tuna.PingPongDelay = function(properties) {
        this.input = userContext.createGainNode();
        this.activateNode = userContext.createGainNode();
        this.dry = userContext.createGainNode();
        this.splitter = userContext.createChannelSplitter(2);
        this.toMono = userContext.createGainNode();
        this.wet = userContext.createGainNode();
        this.feedbackNode = userContext.createGainNode();
        this.delayL = new Tuna.Delay(properties);
        this.delayR = new Tuna.Delay(properties);
        this.merger = userContext.createChannelMerger();
        this.output = userContext.createGainNode();
        this.activateNode = this.dry;
        
        this.activateNode.connect(this.dry);
        this.activateNode.connect(this.splitter);
        this.splitter.connect(this.toMono, 0, 0);
        this.splitter.connect(this.toMono, 1, 0);
        this.toMono.connect(this.wet);
        this.wet.connect(this.delayL.delay);
        this.feedbackNode.connect(this.delayL.delay);
        this.delayL.delay.connect(this.delayR.delay);
        this.delayR.delay.connect(this.feedbackNode);
        this.delayL.delay.connect(this.merger, 0, 0);
        this.delayR.delay.connect(this.merger, 0, 1);
        this.dry.connect(this.output);
        this.merger.connect(this.output);

        //Set Properties
        this.delayL.feedback = 0;
        this.delayR.feedback = 0;
        this.delayL.wetLevel = 1;
        this.delayR.wetLevel = 1;
        this.delayL.dryLevel = 0;
        this.delayR.dryLevel = 0;

        this.defaults = DMAF.Descriptors.type.audioNode.pingPongDelay;
        this.cutoff = properties.cutoff;
        this.tempoSync = properties.tempoSync;
        if (this.tempoSync) {
            this.subdivision = properties.subdivision;
        } 
        this.delayTime = properties.delayTime;
        this.feedback = properties.feedback;
        this.wetLevel = properties.wetLevel;
        this.dryLevel = properties.dryLevel;
    };
    Tuna.PingPongDelay.prototype = Object.create(Super, {
        name: {value: "PingPongDelay"},
        tempoSync: {
            get: function () {return this._tempoSync},
            set: function (value) {
                var player = DMAF.ProcessorManager.getActiveInstance(value);
                if (player) {
                    this.tempo = player.tempo;
                } else {
                    this.tempo = 120;
                }
                this._tempoSync = this.verify("tempoSync", value);
                this.delayL.tempoSync = this._tempoSync;
                this.delayR.tempoSync = this._tempoSync;
            }
        }, 
        tempo: {
            get: function () {return this._tempo}, 
            set: function (value) {
                this._tempo = value;
                this.delayL.tempo = value;
                this.delayR.tempo = value;
            }
        },
        subdivision: {
            get: function () {return this._subdivision},
            set: function (value) {
                this._subdivision = this.verify("subdivision", value);
                this.delayL.subdivision = this._subdivision;
                this.delayR.subdivision = this._subdivision;
            }
        },
        delayTime: {
            enumerable: true,
            get: function () {return this._delayTime}, 
            set: function (value) {
                if (this._tempoSync) {
                    this._delayTime = this.verify("delayTime",  60 * delayConstants[this.subdivision] / this.tempo)
                    this.delayL.delayTime = this._delayTime;
                    this.delayR.delayTime = this._delayTime;
                } else {
                    this._delayTime = this.verify("delayTime", value) / 1000;
                    this.delayL.delayTime = value;
                    this.delayR.delayTime = value;
                }
            }
        }, 
        wetLevel: {
            enumerable: true,
            get: function () {return this.wet.gain}, 
            set: function (value) {
                this.wet.gain.value = this.verify("wetLevel", value);
            }
        }, 
        dryLevel: {
            enumerable: true, 
            get: function () {return this.dry.gain}, 
            set: function (value) {
                this.dry.gain.value = this.verify("dryLevel", value);
            }
        }, 
        feedback: {
            enumerable: true, 
            get: function () {return this.feedbackNode.gain}, 
            set: function (value) {
                this.feedbackNode.gain.value = this.verify("feedback", value);
            }
        }, 
        cutoff: {
            enumerable: true, 
            get: function () {return this.filter.frequency},
            set: function (value) {
                this.delayL.filter.frequency.value = this.verify("cutoff", value);
                this.delayR.filter.frequency.value = this.verify("cutoff", value);
            }
        }
    });*/
//---------------------------------------------------------------------------------//
    Tuna.prototype.Phaser = function(properties) {
        //Instantiate AudioNodes
        this.input = userContext.createGainNode();
        this.splitter = this.activateNode = userContext.createChannelSplitter(2);
        this.filtersL = [];
        this.filtersR = [];
        this.feedbackGainNodeL = userContext.createGainNode();
        this.feedbackGainNodeR = userContext.createGainNode();
        this.merger = userContext.createChannelMerger(2);
        this.filteredSignal = userContext.createGainNode();
        this.output = userContext.createGainNode();
        this.lfoL = new Tuna.LFO({target: this.filtersL, callback: this.callback});
        this.lfoR = new Tuna.LFO({target: this.filtersR, callback: this.callback});

        //Instantiate Left and Right Filter AudioNode Arrays
        var i = this.stage;
        while(i--) {
            this.filtersL[i] = userContext.createBiquadFilter();
            this.filtersR[i] = userContext.createBiquadFilter();
            this.filtersL[i].type = 7;
            this.filtersR[i].type = 7;
        };
        //Connect Nodes
        this.input.connect(this.splitter);
        this.input.connect(this.output);
        this.splitter.connect(this.filtersL[0], 0, 0);
        this.splitter.connect(this.filtersR[0], 1, 0);
        this.connectInOrder(this.filtersL);
        this.connectInOrder(this.filtersR);
        this.filtersL[this.stage - 1].connect(this.feedbackGainNodeL);
        this.filtersL[this.stage - 1].connect(this.merger, 0, 0);
        this.filtersR[this.stage - 1].connect(this.feedbackGainNodeR);
        this.filtersR[this.stage - 1].connect(this.merger, 0, 1);
        this.feedbackGainNodeL.connect(this.filtersL[0]);
        this.feedbackGainNodeR.connect(this.filtersR[0]);
        this.merger.connect(this.output);
        
        //Set Values
        this.rate = properties.rate;
        this.baseModulationFrequency = properties.baseModulationFrequency;
        this.depth = properties.depth;
        this.feedback = properties.feedback;
        this.stereoPhase = properties.stereoPhase;

        //Activate LFOs
        this.lfoL.activate(true);
        this.lfoR.activate(true);
    };
    Tuna.prototype.Phaser.prototype = Object.create (Super, {
        name: {value: "Phaser"}, 
        stage: {value: 4},
        defaults: {
            value: {
                frequency: {value: 1, min: 0, max: 8, automatable: false, type: _FLOAT},
                rate: {value: 0.3, min: 0, max: 8, automatable: false, type: _FLOAT},
                depth: {value: 0.3, min: 0, max: 1, automatable: false, type: _FLOAT}, 
                feedback: {value: 0.2, min: 0, max: 1, automatable: false, type: _FLOAT},
                stereoPhase: {value: 30, min: 0, max: 180, automatable: false, type: _FLOAT},
                baseModulationFrequency: {value: 700, min: 500, max: 1500, automatable: false, type: _FLOAT}
            }
        },   
        callback: {
            value: function(filters, value) {
                for (var stage = 0; stage < 4; stage++) {
                    filters[stage].frequency.value = value;
                }
            }
        }, 
        depth: {
            get: function () {return this._depth},
            set: function(value) {
                this._depth = value;
                this.lfoL.oscillation = this._baseModulationFrequency * this._depth;
                this.lfoR.oscillation = this._baseModulationFrequency * this._depth;
            }
        }, 
        rate: {
            get: function () {return this._rate},
            set: function(value) {
                this._rate = value;
                this.lfoL.frequency = this._rate;
                this.lfoR.frequency = this._rate;
            }
        }, 
        baseModulationFrequency: {
            enumerable: true, 
            get: function () {return this._baseModulationFrequency},
            set: function (value) {
                this._baseModulationFrequency = value;
                this.lfoL.offset = this._baseModulationFrequency;
                this.lfoR.offset = this._baseModulationFrequency;
                this._depth = this._depth;
            }
        }, 
        feedback: {
            get: function () {return this._feedback}, 
            set: function (value) {
                this._feedback = value;
                this.feedbackGainNodeL.gain.value = this._feedback;
                this.feedbackGainNodeR.gain.value = this._feedback;
            }
        }, 
        stereoPhase: {
            get: function () {return this._stereoPhase}, 
            set: function (value) {
                this._stereoPhase = value;
                var newPhase = this.lfoL._phase + this._stereoPhase * Math.PI / 180;
                newPhase = fmod(newPhase, 2 * Math.PI);
                this.lfoR._phase = newPhase;
            }
        }
    });
//---------------------------------------------------------------------------------//
    Tuna.prototype.Tremolo = function(actionProperties) {
        //Instantiate AudioNodes
        this.input = userContext.createGainNode()
        this.splitter = this.activateNode = userContext.createChannelSplitter(2),
        this.amplitudeL = userContext.createGainNode(),
        this.amplitudeR = userContext.createGainNode(),
        this.merger = userContext.createChannelMerger(2),
        this.output = userContext.createGainNode();
        this.lfoL = new Tuna.LFO({target: this.amplitudeL.gain, callback: pipe});
        this.lfoR = new Tuna.LFO({target: this.amplitudeR.gain, callback: pipe});

        //Connect AudioNodes
        this.input.connect(this.splitter);
        this.splitter.connect(this.amplitudeL, 0);
        this.splitter.connect(this.amplitudeR, 1);
        this.amplitudeL.connect(this.merger, 0, 0);
        this.amplitudeR.connect(this.merger, 0, 1);
        this.merger.connect(this.output);

        //Set Values
        this.rate = actionProperties.rate;
        this.intensity = actionProperties.intensity;
        this.stereoPhase = actionProperties.stereoPhase;

        //Set LFO Values
        this.lfoL.offset = 1 - (this.intensity / 2);
        this.lfoR.offset = 1 - (this.intensity / 2);
        this.lfoL.phase = this.stereoPhase * Math.PI / 180;  

        //Activate LFOs
        this.lfoL.activate(true);
        this.lfoR.activate(true);
    };
    Tuna.prototype.Tremolo.prototype = Object.create(Super, {
        name: {value: "Tremolo"},
        defaults: {
            value: {
                frequency: {value: 1.5, min: 0.1, max: 11, automatable: false, type: _FLOAT}, 
                intensity: {value: 0.3, min: 0, max: 1, automatable: false, type: _FLOAT}, 
                stereoPhase: {value: 0, min: 0, max: 180, automatable: false, type: _FLOAT}, 
                rate: {value: 0.1, min: 0.1, max: 11, automatable: false, type: _FLOAT}
            }
        },  
        intensity: {
            enumerable: true,
            get: function () {return this._intensity},
            set: function (value) {
                this._intensity = value;
                this.lfoL.offset = this._intensity / 2;
                this.lfoR.offset = this._intensity / 2;
                this.lfoL.oscillation = this._intensity;
                this.lfoR.oscillation = this._intensity;
            }
        }, 
        rate: {
            enumerable: true,
            get: function () {return this._rate},
            set: function (value) {
                this._rate = value;
                this.lfoL.frequency = this._rate;
                this.lfoR.frequency = this._rate;
            }
        },
        steroPhase: {
            enumerable: true,
            get: function () {return this._rate},
            set: function (value) {
                this._stereoPhase = value;
                var newPhase = this.lfoL._phase + this._stereoPhase * Math.PI / 180;
                newPhase = fmod(newPhase, 2 * Math.PI);
                this.lfoR.phase = newPhase;
            }
        },
    });
    Tuna.prototype.WahWah = function (properties) {
        //Instantiate AudioNodes
        this.input = userContext.createGainNode();
        this.activateNode = userContext.createGainNode();
        this.envelopeFollower = new Tuna.EnvelopeFollower({target: this, callback: function (context, value) {
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
        this.automode = properties.enableAutoMode;
        this.resonance = properties.resonance;
        this.sensitivity = properties.sensitivity;
        this.baseFrequency = properties.baseFrequency;
        this.excursionOctaves = properties.excursionOctaves;
        this.sweep = properties.sweep;

        this.envelopeFollower.activate(true);
    };
    Tuna.prototype.WahWah.prototype = Object.create(Super, {
        name: {value: "WahWah"}, 
        defaults: {
            value: {
                baseFrequency: {value: 0.5, min: 0, max: 1, automatable: false, type: _FLOAT},
                excursionOctaves: {value: 2, min: 1, max: 6, automatable: false, type: _FLOAT}, 
                sweep: {value: 0.2, min: 0, max: 1, automatable: false, type: _FLOAT}, 
                resonance: {value: 10, min: 1, max: 100, automatable: false, type: _FLOAT}, 
                sensitivity: {value: 0.5, min: -1, max: 1, automatable: false, type: _FLOAT}
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
                this.output.gain.value = 5;
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
//---------------------------------------------------------------------------------//
    Tuna.prototype.EnvelopeFollower = function (properties) {
        this.input = userContext.createGainNode(),
        this.jsNode = this.output = userContext.createJavaScriptNode(this.buffersize, 1, 1);

        this.input.connect(this.output);

        this.attackTime = properties.attackTime;
        this.releaseTime = properties.releaseTime;
        this._envelope = 0;
        this.target = properties.target;
        this.callback = properties.callback;  
    };
    Tuna.prototype.EnvelopeFollower.prototype = Object.create(Super, {
        name: {value: "EnvelopeFollower"},
        defaults: {
            value: {
                attackTime: {value: 0.003, min: 0, max: 0.5, automatable: false, type: _FLOAT}, 
                releaseTime: {value: 0.5, min: 0.5, max: 1, automatable: false, type: _FLOAT}
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
                if (target.setValueAtTime) {
                    this._target = value;
                } else {
                    console.error("tuna.js: " + this.name + ": Target must be an AudioParam interface!");
                }
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
//---------------------------------------------------------------------------------//
    Tuna.prototype.LFO = function (properties) {
        //Instantiate AudioNode
        this.output = userContext.createJavaScriptNode(256, 1, 1);
        this.activateNode = userContext.destination; 

        //Set Properties
        this.frequency = properties.frequency;
        this.offset = properties.offset;
        this.oscillation = properties.oscillation;
        this.phase = properties.phase;
        this.target = properties.target;
        this.output.onaudioprocess = this.callback(properties.callback);
    }
    Tuna.prototype.LFO.prototype = Object.create(Super, {
        name: {value: "LFO"}, 
        bufferSize: {value: 256},
        sampleRate: {value: 44100},
        defaults: {
                value: {
                    frequency: {value: 1, min: 0, max: 20, automatable: false, type: _FLOAT}, 
                    offset: {value: 0.85, min: 0, max: 22049, automatable: false, type: _FLOAT},
                    oscillation: {value: 0.3, min: -22050, max: 22050, automatable: false, type: _FLOAT},
                    phase: {value: 0, min: 0, max: 2 * Math.PI, automatable: false, type: _FLOAT}
                }
            }, 
        frequency: {
            get: function () {return this._frequency},
            set: function (value) {
                this._frequency = value;
                this._phaseInc = 2 * Math.PI * this._frequency * this.bufferSize / this.sampleRate;
            }
        }, 
        offset: {
            get: function () {return this._offset},
            set: function (value) {
                this._offset = value;
            }
        }, 
        oscillation: {
            get: function () {return this._oscillation},
            set: function (value) {
                this._oscillation = value;
            }
        },
        phase: {
            get: function () {return this._phase},
            set: function (value) {
                this._phase = value;
            }
        },
        target: {
            get: function () {return this._target}, 
            set: function (value) {
                this._target = value;
            }
        },
        activate: {
            value: function (doActivate) {
                this._activated = doActivate;
                if(!doActivate) {
                    this.output.disconnect(userContext.destination);
                } else {
                    this.output.connect(userContext.destination);
                }
            }
        }, 
        callback: {
            value: function (callback) {
                var that = this;
                return function () {
                    that._phase += that._phaseInc;
                    if (that._phase > 2 * Math.PI) {
                        that._phase = 0;
                    }
                    callback(that._target, that._offset + that._oscillation * Math.sin(that._phase));
                }
            }
        }
    });
})(this);