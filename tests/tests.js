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
            expect(bitcrusher.bypass).toBeTruthy();
        });

        it("will have passed values set", function() {
            bitcrusher = new tuna.Bitcrusher({
                bits: 5,
                normfreq: 0.2,
                bufferSize: 2048,
                bypass: false
            });
            expect(bitcrusher.bits).toEqual(5);
            expect(bitcrusher.normfreq).toBeCloseTo(0.2, 1);
            expect(bitcrusher.bufferSize).toEqual(2048);
            expect(bitcrusher.bypass).toBeFalsy();
        });

        it("will be activated", function() {
            bitcrusher.activateCallback = jasmine.createSpy("activate_bitchrusher");
            bitcrusher.bypass = false;
            expect(bitcrusher.activateCallback).toHaveBeenCalled();
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
            expect(chorus.bypass).toBeTruthy();
        });

        it("will have passed values set", function() {
            chorus = new tuna.Chorus({
                rate: 1.0,
                feedback: 0.2,
                delay: 0.6,
                depth: 0.5,
                bypass: false
            });
            expect(chorus.rate).toBeCloseTo(1.0, 1);
            expect(chorus.feedback).toBeCloseTo(0.2, 1);
            expect(chorus.delay).toBeCloseTo(0.0002 * (Math.pow(10, 0.6) * 2), 5);
            expect(chorus.depth).toBeCloseTo(0.5, 1);
            expect(chorus.bypass).toBeFalsy();
        });

        it("will be activated", function() {
            chorus.activateCallback = jasmine.createSpy("activate_chorus");
            chorus.bypass = false;
            expect(chorus.activateCallback).toHaveBeenCalled();
        });

    });

    describe("a Delay node", function() {
        var delay;

        beforeEach(function() {
            delay = new tuna.Delay({
                bypass: true
            });
        });

        it("will have default values set", function() {
            expect(delay.cutoff.value).toBeCloseTo(20000, 1);
            expect(delay.delayTime.value).toBeCloseTo(0.1, 1);
            expect(delay.feedback.value).toBeCloseTo(0.45, 2);
            expect(delay.wetLevel.value).toBeCloseTo(0.5, 1);
            expect(delay.dryLevel.value).toBeCloseTo(1, 1);
        });

        it("will have passed values set", function() {
            delay = new tuna.Delay({
                feedback: 0.95,
                delayTime: 500,
                wetLevel: 0.256,
                dryLevel: 0.6,
                cutoff: 2000,
                bypass: 0
            });
            expect(delay.cutoff.value).toBeCloseTo(2000, 1);
            expect(delay.delayTime.value).toBeCloseTo(0.5, 1);
            expect(delay.feedback.value).toBeCloseTo(0.95, 2);
            expect(delay.wetLevel.value).toBeCloseTo(0.256, 3);
            expect(delay.dryLevel.value).toBeCloseTo(0.6, 1);
        });

        it("will be activated", function() {
            delay.activateCallback = jasmine.createSpy("activate_delay");
            delay.bypass = false;
            expect(delay.activateCallback).toHaveBeenCalled();
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
            expect(filter.bypass).toBeTruthy();
        });

        it("will have passed values set", function() {
            filter = new tuna.Filter({
                frequency: 400,
                resonance: 2,
                gain: 2,
                filterType: "highpass",
                bypass: false
            });
            expect(filter.frequency.value).toEqual(400);
            expect(filter.Q.value).toEqual(2);
            expect(filter.gain.value).toEqual(2);
            expect(filter.filterType).toEqual("highpass");
            expect(filter.bypass).toBeFalsy();
        });

        it("will be activated", function() {
            filter.activateCallback = jasmine.createSpy();
            filter.bypass = false;
            expect(filter.activateCallback).toHaveBeenCalled();
        });

    });
});
