describe("In Tuna", function() {
    var context, tuna;

    beforeAll(function(done) {
        //start AudioContext and then tests on button press
        document.getElementById("start").addEventListener("click", function() {
            context = new AudioContext();
            tuna = new Tuna(context);
            setTimeout(function checkCurrentTime() {
                if (context.currentTime > 0) {
                    done();
                } else {
                    setTimeout(checkCurrentTime, 100);
                }
            }, 100);
        });
    });

    describe("a Bitcrusher node", function() {
        var bitcrusher;

        beforeEach(function() {
            bitcrusher = new tuna.Bitcrusher();
        });

        it("will have default values set", function() {
            expect(bitcrusher.bits).toEqual(4);
            expect(bitcrusher.normfreq).toBeCloseTo(0.1, 1);
            expect(bitcrusher.bufferSize).toEqual(4096);
            expect(bitcrusher.bypass).toBeFalsy();
        });

        it("will have passed values set", function() {
            bitcrusher = new tuna.Bitcrusher({
                bits: 5,
                normfreq: 0.2,
                bufferSize: 2048,
                bypass: true
            });
            expect(bitcrusher.bits).toEqual(5);
            expect(bitcrusher.normfreq).toBeCloseTo(0.2, 1);
            expect(bitcrusher.bufferSize).toEqual(2048);
            expect(bitcrusher.bypass).toBeTruthy();
        });

        it("will be activated", function() {
            bitcrusher.activateCallback = jasmine.createSpy("activate_bitchrusher");
            bitcrusher.bypass = true;
            bitcrusher.bypass = false;
            expect(bitcrusher.activateCallback).toHaveBeenCalled();
        });

    });

    describe("a Cabinet node", function() {
        var cabinet;

        beforeEach(function() {
            cabinet = new tuna.Cabinet();
        });

        it("will will have default values set", function() {
            expect(cabinet.makeupGain.value).toEqual(1);
            expect(cabinet.bypass).toBeFalsy();
        });

        it("will have passed values set", function() {
            cabinet = new tuna.Cabinet({
                makeupGain: 5.2,
                bypass: true
            });
            expect(cabinet.makeupGain.value).toBeCloseTo(5.2, 1);
            expect(cabinet.bypass).toBeTruthy();
        });

        it("will be activated", function() {
            cabinet.activateCallback = jasmine.createSpy("activate_cabinet");
            cabinet.bypass = true;
            cabinet.bypass = false;
            expect(cabinet.activateCallback).toHaveBeenCalled();
        });

    });

    describe("a Chorus node", function() {
        var chorus;

        beforeEach(function() {
            chorus = new tuna.Chorus();
        });

        it("will have default values set", function() {
            expect(chorus.rate).toBeCloseTo(1.5, 1);
            expect(chorus.feedback).toBeCloseTo(0.4, 1);
            expect(chorus.delay).toBeCloseTo(0.0002 * (Math.pow(10, 0.0045) * 2), 5);
            expect(chorus.depth).toBeCloseTo(0.7, 1);
            expect(chorus.bypass).toBeFalsy();
        });

        it("will have passed values set", function() {
            chorus = new tuna.Chorus({
                rate: 1.0,
                feedback: 0.2,
                delay: 0.6,
                depth: 0.5,
                bypass: true
            });
            expect(chorus.rate).toBeCloseTo(1.0, 1);
            expect(chorus.feedback).toBeCloseTo(0.2, 1);
            expect(chorus.delay).toBeCloseTo(0.0002 * (Math.pow(10, 0.6) * 2), 5);
            expect(chorus.depth).toBeCloseTo(0.5, 1);
            expect(chorus.bypass).toBeTruthy();
        });

        it("will be activated", function() {
            chorus.activateCallback = jasmine.createSpy("activate_chorus");
            chorus.bypass = true;
            chorus.bypass = false;
            expect(chorus.activateCallback).toHaveBeenCalled();
        });

    });

    describe("a Compressor node", function() {
        var compressor;

        beforeEach(function() {
            compressor = new tuna.Compressor();
        });

        it("will have default values set", function() {
            expect(compressor.threshold.value).toEqual(-20);
            expect(compressor.release.value).toEqual(250 / 1000);
            expect(compressor.makeupGain.value).toBeCloseTo(1.12, 2);
            expect(compressor.attack.value).toBeCloseTo(1 / 1000, 2);
            expect(compressor.ratio.value).toEqual(4);
            expect(compressor.knee.value).toEqual(5);
            expect(compressor.automakeup).toBeFalsy();
            expect(compressor.bypass).toBeFalsy();
        });

        it("will have passed values set", function() {
            compressor = new tuna.Compressor({
                threshold: -35,
                release: 200,
                makeupGain: 2.5,
                attack: 2,
                ratio: 3,
                knee: 4,
                bypass: true,
            })
            expect(compressor.threshold.value).toEqual(-35);
            expect(compressor.release.value).toBeCloseTo(200 / 1000, 3);
            expect(compressor.makeupGain.value).toBeCloseTo(1.33, 2);
            expect(compressor.attack.value).toBeCloseTo(2 / 1000, 3);
            expect(compressor.ratio.value).toEqual(3);
            expect(compressor.knee.value).toEqual(4);
            expect(compressor.bypass).toBeTruthy();

            // automakeup makes threshold, ratio and knee all change makeupGain,
            // hence testing it down here
            compressor = new tuna.Compressor({
                automakeup: true,
            });
            expect(compressor.automakeup).toBeTruthy();
        });

        it("will be activated", function() {
            compressor.activateCallback = jasmine.createSpy("activate_compressor");
            compressor.bypass = true;
            compressor.bypass = false;
            expect(compressor.activateCallback).toHaveBeenCalled();
        });

    });

    describe("a Delay node", function() {
        var delay;

        beforeEach(function() {
            delay = new tuna.Delay();
        });

        it("will have default values set", function() {
            expect(delay.cutoff.value).toBeCloseTo(20000, 1);
            expect(delay.delayTime.value).toBeCloseTo(0.1, 1);
            expect(delay.feedback.value).toBeCloseTo(0.45, 2);
            expect(delay.wetLevel.value).toBeCloseTo(0.5, 1);
            expect(delay.dryLevel.value).toBeCloseTo(1, 1);
            expect(delay.bypass).toBeFalsy();
        });

        it("will have passed values set", function() {
            delay = new tuna.Delay({
                feedback: 0.95,
                delayTime: 500,
                wetLevel: 0.256,
                dryLevel: 0.6,
                cutoff: 2000,
                bypass: true
            });
            expect(delay.cutoff.value).toBeCloseTo(2000, 1);
            expect(delay.delayTime.value).toBeCloseTo(0.5, 1);
            expect(delay.feedback.value).toBeCloseTo(0.95, 2);
            expect(delay.wetLevel.value).toBeCloseTo(0.256, 3);
            expect(delay.dryLevel.value).toBeCloseTo(0.6, 1);
            expect(delay.bypass).toBeTruthy();
        });

        it("will be activated", function() {
            delay.activateCallback = jasmine.createSpy("activate_delay");
            delay.bypass = true;
            delay.bypass = false;
            expect(delay.activateCallback).toHaveBeenCalled();
        });

    });

    describe("a Convolver node", function() {
        var convolver;

        beforeEach(function() {
            convolver = new tuna.Convolver();
        });

        it("will will have default values set", function() {
            expect(convolver.highCut.value).toEqual(22050);
            expect(convolver.lowCut.value).toEqual(20);
            expect(convolver.wetLevel.value).toEqual(1);
            expect(convolver.dryLevel.value).toEqual(1);
            expect(convolver.level.value).toEqual(1);
            expect(convolver.bypass).toBeFalsy();
        });

        it("will have passed values set", function() {
            convolver = new tuna.Convolver({
                highCut: 2001,                         //20 to 22050
                lowCut: 421,                             //20 to 22050
                dryLevel: 0.4,                            //0 to 1+
                wetLevel: 0.5,                            //0 to 1+
                level: 0.8,                               //0 to 1+, adjusts total output of both wet and dry
                bypass: true
            });
            expect(convolver.highCut.value).toEqual(2001);
            expect(convolver.lowCut.value).toEqual(421);
            expect(convolver.wetLevel.value).toBeCloseTo(0.5, 1);
            expect(convolver.dryLevel.value).toBeCloseTo(0.4, 1);
            expect(convolver.level.value).toBeCloseTo(0.8, 1);
            expect(convolver.bypass).toBeTruthy();
        });

        it("will be activated", function() {
            convolver.activateCallback = jasmine.createSpy("activate_convolver");
            convolver.bypass = true;
            convolver.bypass = false;
            expect(convolver.activateCallback).toHaveBeenCalled();
        });

    });

    describe("a EnvelopeFollower node", function() {
        var envelope;

        beforeEach(function() {
            envelope = new tuna.EnvelopeFollower();
        });

        it("will have default values set", function() {
            expect(envelope.attackTime).toEqual(0.003);
            expect(envelope.releaseTime).toEqual(0.5);
            expect(envelope.bypass).toBeFalsy();
        });

        it("will have passed values set", function() {
            envelope = new tuna.EnvelopeFollower({
                attackTime: 0.008,
                releaseTime: 0.4,
                bypass: true
            });
            expect(envelope.attackTime).toEqual(0.008);
            expect(envelope.releaseTime).toEqual(0.4);
            expect(envelope.bypass).toBeTruthy();
        });

        it("will be activated", function() {
            envelope.activateCallback = jasmine.createSpy();
            envelope.bypass = true;
            envelope.bypass = false;
            expect(envelope.activateCallback).toHaveBeenCalled();
        });

    });

    describe("a Filter node", function() {
        var filter;

        beforeEach(function() {
            filter = new tuna.Filter();
        });

        it("will have default values set", function() {
            expect(filter.frequency.value).toEqual(800);
            expect(filter.Q.value).toEqual(1);
            expect(filter.gain.value).toEqual(0);
            expect(filter.filterType).toEqual("lowpass");
            expect(filter.bypass).toBeFalsy();
        });

        it("will have passed values set", function() {
            filter = new tuna.Filter({
                frequency: 400,
                resonance: 2,
                gain: 2,
                filterType: "highpass",
                bypass: true
            });
            expect(filter.frequency.value).toEqual(400);
            expect(filter.Q.value).toEqual(2);
            expect(filter.gain.value).toEqual(2);
            expect(filter.filterType).toEqual("highpass");
            expect(filter.bypass).toBeTruthy();
        });

        it("will be activated", function() {
            filter.activateCallback = jasmine.createSpy();
            filter.bypass = true;
            filter.bypass = false;
            expect(filter.activateCallback).toHaveBeenCalled();
        });

    });

    describe("an LFO node", function() {
        var lfo;

        beforeEach(function() {
            lfo = new tuna.LFO();
        });

        it("will have default values set", function() {
            expect(lfo.frequency).toEqual(1);
            expect(lfo.offset).toEqual(0.85);
            expect(lfo.oscillation).toEqual(0.3);
            expect(lfo.phase).toEqual(0);
            expect(lfo.bypass).toBeFalsy();
        });

        it("will have passed values set", function() {
            lfo = new tuna.LFO({
                frequency: 0.8,
                offset: 0.6,
                oscillation: 0.4,
                phase: 0.5,
                bypass: true
            });
            expect(lfo.frequency).toEqual(0.8);
            expect(lfo.offset).toEqual(0.6);
            expect(lfo.oscillation).toEqual(0.4);
            expect(lfo.phase).toEqual(0.5);
            expect(lfo.bypass).toBeTruthy();
        });

        it("will be activated", function() {
            lfo.activateCallback = jasmine.createSpy();
            lfo.bypass = true;
            lfo.bypass = false;
            expect(lfo.activateCallback).toHaveBeenCalled();
        });

    });

    describe("a MoogFilter node", function() {
        var filter;

        beforeEach(function() {
            filter = new tuna.MoogFilter();
        });

        it("will have default values set", function() {
            expect(filter.bufferSize).toEqual(4096);
            expect(filter.processor.cutoff).toEqual(0.065);
            expect(filter.processor.resonance).toEqual(3.5);
            expect(filter.bypass).toBeFalsy();
        });

        it("will have passed values set", function() {
            filter = new tuna.MoogFilter({
                bufferSize: 256,
                cutoff: 0.110,
                resonance: 2.5,
                bypass: true
            });
            expect(filter.bufferSize).toEqual(256);
            expect(filter.processor.cutoff).toEqual(0.110);
            expect(filter.processor.resonance).toEqual(2.5);
            expect(filter.bypass).toBeTruthy();
        });

        it("will be activated", function() {
            filter.activateCallback = jasmine.createSpy();
            filter.bypass = true;
            filter.bypass = false;
            expect(filter.activateCallback).toHaveBeenCalled();
        });

    });

    describe("a Phaser node", function() {
        var phaser;

        beforeEach(function() {
            phaser = new tuna.Phaser();
        });

        it("will have default values set", function() {
            expect(phaser.rate).toEqual(0.1);
            expect(phaser.depth).toEqual(0.6);
            expect(phaser.feedback).toEqual(0.7);
            expect(phaser.stereoPhase).toEqual(40);
            expect(phaser.baseModulationFrequency).toEqual(700);
            expect(phaser.bypass).toBeFalsy();
        });

        it("will have passed values set", function() {
            phaser = new tuna.Phaser({
                rate: 0.2,
                depth: 0.8,
                feedback: 0.5,
                stereoPhase: 90,
                baseModulationFrequency: 550,
                bypass: true
            });
            expect(phaser.rate).toEqual(0.2);
            expect(phaser.depth).toEqual(0.8);
            expect(phaser.feedback).toEqual(0.5);
            expect(phaser.stereoPhase).toEqual(90);
            expect(phaser.baseModulationFrequency).toEqual(550);
            expect(phaser.bypass).toBeTruthy();
        });

        it("will be activated", function() {
            phaser.activateCallback = jasmine.createSpy();
            phaser.bypass = true;
            phaser.bypass = false;
            expect(phaser.activateCallback).toHaveBeenCalled();
        });

    });

    describe("a PingPongDelay node", function() {
        var delay;

        beforeEach(function() {
            delay = new tuna.PingPongDelay();
        });

        it("will have default values set", function() {
            expect(delay.delayTimeLeft).toEqual(200);
            expect(delay.delayTimeRight).toEqual(400);
            expect(delay.feedbackLevel.gain.value).toBeCloseTo(0.3, 2);
            expect(delay.wet.gain.value).toBeCloseTo(0.5, 2);
            expect(delay.bypass).toBeFalsy();
        });

        it("will have passed values set", function() {
            delay = new tuna.PingPongDelay({
                delayTimeLeft: 210,
                delayTimeRight: 410,
                feedback: 0.5,
                wetLevel: 0.8,
                bypass: true
            });
            expect(delay.delayTimeLeft).toEqual(210);
            expect(delay.delayTimeRight).toEqual(410);
            expect(delay.feedbackLevel.gain.value).toBeCloseTo(0.5, 2);
            expect(delay.wet.gain.value).toBeCloseTo(0.8, 2);
            expect(delay.bypass).toBeTruthy();
        });

        it("will be activated", function() {
            delay.activateCallback = jasmine.createSpy();
            delay.bypass = true;
            delay.bypass = false;
            expect(delay.activateCallback).toHaveBeenCalled();
        });

    });

    describe("a Tremolo node", function() {
        var tremolo;

        beforeEach(function() {
            tremolo = new tuna.Tremolo();
        });

        it("will have default values set", function() {
            expect(tremolo.intensity).toEqual(0.3);
            expect(tremolo.stereoPhase).toEqual(0);
            expect(tremolo.rate).toEqual(5);
            expect(tremolo.bypass).toBeFalsy();
        });

        it("will have passed values set", function() {
            tremolo = new tuna.Tremolo({
                intensity: 0.5,
                stereoPhase: 90,
                rate: 8,
                bypass: true
            });
            expect(tremolo.intensity).toEqual(0.5);
            expect(tremolo.stereoPhase).toEqual(90);
            expect(tremolo.rate).toEqual(8);
            expect(tremolo.bypass).toBeTruthy();
        });

        it("will be activated", function() {
            tremolo.activateCallback = jasmine.createSpy();
            tremolo.bypass = true;
            tremolo.bypass = false;
            expect(tremolo.activateCallback).toHaveBeenCalled();
        });

    });

    describe("a WahWah node", function() {
        var wahwah;

        beforeEach(function() {
            wahwah = new tuna.WahWah();
        });

        it("will have default values set", function() {
            expect(wahwah.automode).toBeTruthy();
            expect(wahwah.baseFrequency).toEqual(500);
            expect(wahwah.excursionOctaves).toEqual(2);
            expect(wahwah.sweep).toBeCloseTo(0.0062, 4);
            expect(wahwah.resonance).toEqual(10);
            expect(wahwah.sensitivity).toBeCloseTo(3.16, 2);
            expect(wahwah.bypass).toBeFalsy();
        });

        it("will have passed values set", function() {
            wahwah = new tuna.WahWah({
                automode: false,
                baseFrequency: 0.6,
                excursionOctaves: 3,
                sweep: 0.3,
                resonance: 11,
                sensitivity: 0.6,
                bypass: true
            });
            expect(wahwah.automode).toBeFalsy();
            expect(wahwah.baseFrequency).toBeCloseTo(792.45, 2);
            expect(wahwah.excursionOctaves).toEqual(3);
            expect(wahwah.sweep).toBeCloseTo(0.0083, 4);
            expect(wahwah.resonance).toEqual(11);
            expect(wahwah.sensitivity).toBeCloseTo(3.98, 2);
            expect(wahwah.bypass).toBeTruthy();
        });

        it("will be activated", function() {
            wahwah.activateCallback = jasmine.createSpy();
            wahwah.bypass = true;
            wahwah.bypass = false;
            expect(wahwah.activateCallback).toHaveBeenCalled();
        });
    });

    describe("a Gain node", function() {
        var gain;

        beforeEach(function() {
            gain = new tuna.Gain();
        });

        it("will have default values set", function() {
            expect(gain.gain.value).toEqual(1);
            expect(gain.bypass).toBeFalsy();
        });

        it("will have passed values set", function() {
            gain = new tuna.Gain({
                gain: 3,
                bypass: true
            });
            expect(gain.gain.value).toEqual(3);
            expect(gain.bypass).toBeTruthy();
        });

        it("will be activated", function() {
            gain.activateCallback = jasmine.createSpy();
            gain.bypass = true;
            gain.bypass = false;
            expect(gain.activateCallback).toHaveBeenCalled();
        });
    });

    describe("a Panner node", function() {
        var panner;

        beforeEach(function() {
            panner = new tuna.Panner();
        });

        it("will have default values set", function() {
            expect(panner.pan.value).toEqual(0);
            expect(panner.bypass).toBeFalsy();
        });

        it("will have passed values set", function() {
            panner = new tuna.Panner({
                pan: 0.75,
                bypass: true
            });
            expect(panner.pan.value).toEqual(0.75);
            expect(panner.bypass).toBeTruthy();
        });

        it("will be activated", function() {
            panner.activateCallback = jasmine.createSpy();
            panner.bypass = true;
            panner.bypass = false;
            expect(panner.activateCallback).toHaveBeenCalled();
        });

    });

});

