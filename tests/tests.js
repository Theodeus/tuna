describe("In Tuna", function() {
    var context, tuna;

    beforeAll(function() {
        context = new AudioContext(1, 128, 44100);
        tuna = new Tuna(context);
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
});
