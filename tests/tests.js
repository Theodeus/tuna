describe("In Tuna", function() {
    var context, tuna;

    beforeAll(function() {
        context = new AudioContext(1, 128, 44100);
        tuna = new Tuna(context);
    });

    describe("a Filter node", function() {
        var filter;

        beforeEach(function() {
            filter = new tuna.Filter({
                frequency: 400,
                resonance: 2,
                gain: 2,
                filterType: "highpass",
                bypass: true
            });
        });

        it("will be checked", function() {
            expect(filter.frequency.value).toEqual(400);
            expect(filter.Q.value).toEqual(2);
            expect(filter.gain.value).toEqual(2);
            expect(filter.filterType).toEqual("highpass");
            expect(filter.bypass).toBeTruthy();
            expect(filter.input.numberOfInputs).toEqual(1);
            expect(filter.output.numberOfOutputs).toEqual(1);
        });

        it("will be activated", function() {
            filter.activateCallback = jasmine.createSpy();
            filter.bypass = false;
            expect(filter.activateCallback).toHaveBeenCalled();
        });

    });

    describe("a Bitcrusher node", function() {
        var bitcrusher;

        beforeEach(function() {
            bitcrusher = new tuna.Bitcrusher({
                bits: 5,
                normfreq: 0.2,
                bufferSize: 2048,
                bypass: true
            });
        });

        it("will be checked", function() {
            expect(bitcrusher.bits).toEqual(5);
            expect(bitcrusher.normfreq).toEqual(0.2);
            expect(bitcrusher.bufferSize).toEqual(2048);
            expect(bitcrusher.bypass).toBeTruthy();
            expect(bitcrusher.input.numberOfInputs).toEqual(1);
            expect(bitcrusher.output.numberOfOutputs).toEqual(1);
        });

        it("will be activated", function() {
            bitcrusher.activateCallback = jasmine.createSpy();
            bitcrusher.bypass = false;
            expect(bitcrusher.activateCallback).toHaveBeenCalled();
        });

    });

    describe("a Chorus node", function() {
        var chorus;

        beforeEach(function() {
            chorus = new tuna.Chorus({
                rate: 1.0,
                feedback: 0.2,
                delay: 0.05,
                depth: 0.5,
                bypass: true
            });
        });

        it("will be checked", function() {
            expect(chorus.rate).toEqual(1.0);
            expect(chorus.feedback).toEqual(0.2);
            expect(chorus.delay).toBeCloseTo(0.00045, 5);
            expect(chorus.depth).toEqual(0.5);
            expect(chorus.bypass).toBeTruthy();
            expect(chorus.input.numberOfInputs).toEqual(1);
            expect(chorus.output.numberOfOutputs).toEqual(1);
        });

        it("will be activated", function() {
            chorus.activateCallback = jasmine.createSpy();
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
            console.log("created", delay);
        });

        it("will will have default values set", function() {
            expect(delay.cutoff.value).toBeCloseTo(20000);
            expect(delay.delayTime.value).toBeCloseTo(0.1);
            expect(delay.feedback.value).toBeCloseTo(0.45);
            expect(delay.wetLevel.value).toBeCloseTo(0.5);
            expect(delay.dryLevel.value).toBeCloseTo(1);
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
            expect(delay.cutoff.value).toBeCloseTo(2000);
            expect(delay.delayTime.value).toBeCloseTo(0.5);
            expect(delay.feedback.value).toBeCloseTo(0.95);
            expect(delay.wetLevel.value).toBeCloseTo(0.256);
            expect(delay.dryLevel.value).toBeCloseTo(0.6);
        });

        it("will be activated", function() {
            delay.activateCallback = jasmine.createSpy("activate_delay");
            delay.bypass = false;
            expect(delay.activateCallback).toHaveBeenCalled();
        });

    });
});
