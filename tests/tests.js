describe("In Tuna", function() {
  var context, tuna;

  beforeAll(function() {
    context = new OfflineAudioContext(1, 128, 44100);
    tuna = new Tuna(context);
  });


  describe("a Filter node", function() {
    var filter;

    beforeEach(function() {
      filter = new tuna.Filter({
        frequency: 400,
        // Why "resonance" rather than "Q" as elsewhere?
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
      // tuna.js#523 looks weird.
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

});
