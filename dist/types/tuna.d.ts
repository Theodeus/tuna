/**
 * @typedef {Object} TunaOptions
 * @property {boolean} [bypass=false] Bypass the effect
 */
/**
 * Creates a new Tuna audio effects instance.
 * @param {AudioContext} context The Web Audio API AudioContext.
 * @returns {Tuna} A new Tuna instance.
 */
declare function Tuna(context: AudioContext): Tuna;
declare class Tuna {
    /**
     * @typedef {Object} TunaOptions
     * @property {boolean} [bypass=false] Bypass the effect
     */
    /**
     * Creates a new Tuna audio effects instance.
     * @param {AudioContext} context The Web Audio API AudioContext.
     * @returns {Tuna} A new Tuna instance.
     */
    constructor(context: AudioContext);
    /**
     * Bitcrusher effect
     * @param {Object} [properties]
     * @param {number} [properties.bits=4]
     * @param {number} [properties.normfreq=0.1]
     * @param {number} [properties.bufferSize=4096]
     * @param {boolean} [properties.bypass=false]
     */
    Bitcrusher(properties?: {
        bits?: number;
        normfreq?: number;
        bufferSize?: number;
        bypass?: boolean;
    }): void;
    bufferSize: any;
    input: any;
    activateNode: any;
    processor: any;
    output: any;
    bits: any;
    normfreq: any;
    bypass: any;
    /**
     * Cabinet effect
     * @param {Object} [properties]
     * @param {number} [properties.makeupGain=1]
     * @param {string} [properties.impulsePath] Path to impulse response file
     * @param {boolean} [properties.bypass=false]
     */
    Cabinet(properties?: {
        makeupGain?: number;
        impulsePath?: string;
        bypass?: boolean;
    }): void;
    convolver: any;
    makeupNode: any;
    /**
     * Chorus effect
     * @param {Object} [properties]
     * @param {number} [properties.feedback=0.4]
     * @param {number} [properties.delay=0.0045]
     * @param {number} [properties.depth=0.7]
     * @param {number} [properties.rate=1.5]
     * @param {boolean} [properties.bypass=false]
     */
    Chorus(properties?: {
        feedback?: number;
        delay?: number;
        depth?: number;
        rate?: number;
        bypass?: boolean;
    }): void;
    attenuator: any;
    splitter: any;
    delayL: any;
    delayR: any;
    feedbackGainNodeLR: any;
    feedbackGainNodeRL: any;
    merger: any;
    lfoL: any;
    lfoR: any;
    feedback: any;
    rate: any;
    delay: any;
    depth: any;
    /**
     * Compressor effect
     * @param {Object} [properties]
     * @param {number} [properties.threshold=-20]
     * @param {number} [properties.release=250]
     * @param {number} [properties.makeupGain=1]
     * @param {number} [properties.attack=1]
     * @param {number} [properties.ratio=4]
     * @param {number} [properties.knee=5]
     * @param {boolean} [properties.automakeup=false]
     * @param {boolean} [properties.bypass=false]
     */
    Compressor(properties?: {
        threshold?: number;
        release?: number;
        makeupGain?: number;
        attack?: number;
        ratio?: number;
        knee?: number;
        automakeup?: boolean;
        bypass?: boolean;
    }): void;
    compNode: any;
    automakeup: any;
    threshold: any;
    release: any;
    attack: any;
    ratio: any;
    knee: any;
    /**
     * Convolver effect
     * @param {Object} [properties]
     * @param {number} [properties.highCut=22050]
     * @param {number} [properties.lowCut=20]
     * @param {number} [properties.dryLevel=1]
     * @param {number} [properties.wetLevel=1]
     * @param {number} [properties.level=1]
     * @param {string} [properties.impulse]
     * @param {boolean} [properties.bypass=false]
     */
    Convolver(properties?: {
        highCut?: number;
        lowCut?: number;
        dryLevel?: number;
        wetLevel?: number;
        level?: number;
        impulse?: string;
        bypass?: boolean;
    }): void;
    dry: any;
    filterLow: any;
    filterHigh: any;
    wet: any;
    buffer: string;
    /**
     * Delay effect
     * @param {Object} [properties]
     * @param {number} [properties.delayTime=100]
     * @param {number} [properties.feedback=0.45]
     * @param {number} [properties.cutoff=20000]
     * @param {number} [properties.wetLevel=0.5]
     * @param {number} [properties.dryLevel=1]
     * @param {boolean} [properties.bypass=false]
     */
    Delay(properties?: {
        delayTime?: number;
        feedback?: number;
        cutoff?: number;
        wetLevel?: number;
        dryLevel?: number;
        bypass?: boolean;
    }): void;
    filter: any;
    feedbackNode: any;
    delayTime: any;
    /**
     * Filter effect
     * @param {Object} [properties]
     * @param {number} [properties.frequency=800]
     * @param {number} [properties.resonance=1]
     * @param {number} [properties.gain=0]
     * @param {string} [properties.filterType='lowpass']
     * @param {boolean} [properties.bypass=false]
     */
    Filter(properties?: {
        frequency?: number;
        resonance?: number;
        gain?: number;
        filterType?: string;
        bypass?: boolean;
    }): void;
    Q: any;
    filterType: any;
    /**
     * Gain effect
     * @param {Object} [properties]
     * @param {number} [properties.gain=1]
     * @param {boolean} [properties.bypass=false]
     */
    Gain(properties?: {
        gain?: number;
        bypass?: boolean;
    }): void;
    gainNode: any;
    /**
     * MoogFilter effect
     * @param {Object} [properties]
     * @param {number} [properties.cutoff=0.065]
     * @param {number} [properties.resonance=3.5]
     * @param {number} [properties.bufferSize=4096]
     * @param {boolean} [properties.bypass=false]
     */
    MoogFilter(properties?: {
        cutoff?: number;
        resonance?: number;
        bufferSize?: number;
        bypass?: boolean;
    }): void;
    cutoff: any;
    resonance: any;
    /**
     * Overdrive effect
     * @param {Object} [properties]
     * @param {number} [properties.outputGain=1]
     * @param {number} [properties.drive=0.19]
     * @param {number} [properties.curveAmount=0.7236]
     * @param {number} [properties.algorithmIndex=0]
     * @param {boolean} [properties.bypass=false]
     */
    Overdrive(properties?: {
        outputGain?: number;
        drive?: number;
        curveAmount?: number;
        algorithmIndex?: number;
        bypass?: boolean;
    }): void;
    inputDrive: any;
    waveshaper: any;
    outputDrive: any;
    ws_table: Float32Array<any>;
    drive: any;
    outputGain: any;
    curveAmount: any;
    algorithmIndex: any;
    /**
     * Panner effect
     * @param {Object} [properties]
     * @param {number} [properties.pan=0]
     * @param {boolean} [properties.bypass=false]
     */
    Panner(properties?: {
        pan?: number;
        bypass?: boolean;
    }): void;
    panner: any;
    pan: any;
    /**
     * Phaser effect
     * @param {Object} [properties]
     * @param {number} [properties.rate=0.1]
     * @param {number} [properties.depth=0.6]
     * @param {number} [properties.feedback=0.7]
     * @param {number} [properties.stereoPhase=40]
     * @param {number} [properties.baseModulationFrequency=700]
     * @param {boolean} [properties.bypass=false]
     */
    Phaser(properties?: {
        rate?: number;
        depth?: number;
        feedback?: number;
        stereoPhase?: number;
        baseModulationFrequency?: number;
        bypass?: boolean;
    }): void;
    filtersL: any[];
    filtersR: any[];
    feedbackGainNodeL: any;
    feedbackGainNodeR: any;
    filteredSignal: any;
    baseModulationFrequency: any;
    stereoPhase: any;
    /**
     * PingPongDelay effect
     * @param {Object} [properties]
     * @param {number} [properties.wetLevel=0.5]
     * @param {number} [properties.feedback=0.3]
     * @param {number} [properties.delayTimeLeft=200]
     * @param {number} [properties.delayTimeRight=400]
     * @param {boolean} [properties.bypass=false]
     */
    PingPongDelay(properties?: {
        wetLevel?: number;
        feedback?: number;
        delayTimeLeft?: number;
        delayTimeRight?: number;
        bypass?: boolean;
    }): void;
    stereoToMonoMix: any;
    feedbackLevel: any;
    delayLeft: any;
    delayRight: any;
    delayTimeLeft: any;
    delayTimeRight: any;
    /**
     * Tremolo effect
     * @param {Object} [properties]
     * @param {number} [properties.intensity=0.3]
     * @param {number} [properties.rate=5]
     * @param {number} [properties.stereoPhase=0]
     * @param {boolean} [properties.bypass=false]
     */
    Tremolo(properties?: {
        intensity?: number;
        rate?: number;
        stereoPhase?: number;
        bypass?: boolean;
    }): void;
    amplitudeL: any;
    amplitudeR: any;
    intensity: any;
    /**
     * WahWah effect
     * @param {Object} [properties]
     * @param {boolean} [properties.automode=true]
     * @param {number} [properties.baseFrequency=0.5]
     * @param {number} [properties.excursionOctaves=2]
     * @param {number} [properties.sweep=0.2]
     * @param {number} [properties.resonance=10]
     * @param {number} [properties.sensitivity=0.5]
     * @param {boolean} [properties.bypass=false]
     */
    WahWah(properties?: {
        automode?: boolean;
        baseFrequency?: number;
        excursionOctaves?: number;
        sweep?: number;
        resonance?: number;
        sensitivity?: number;
        bypass?: boolean;
    }): void;
    envelopeFollower: any;
    filterBp: any;
    filterPeaking: any;
    automode: any;
    sensitivity: any;
    baseFrequency: any;
    excursionOctaves: any;
    sweep: any;
    /**
     * EnvelopeFollower effect
     * @param {Object} [properties]
     * @param {number} [properties.attackTime=0.003]
     * @param {number} [properties.releaseTime=0.5]
     * @param {boolean} [properties.bypass=false]
     */
    EnvelopeFollower(properties?: {
        attackTime?: number;
        releaseTime?: number;
        bypass?: boolean;
    }): void;
    jsNode: any;
    attackTime: any;
    releaseTime: any;
    _envelope: number;
    target: any;
    callback: any;
    /**
     * LFO effect
     * @param {Object} [properties]
     * @param {number} [properties.frequency=1]
     * @param {number} [properties.offset=0.85]
     * @param {number} [properties.oscillation=0.3]
     * @param {number} [properties.phase=0]
     * @param {boolean} [properties.bypass=false]
     */
    LFO(properties?: {
        frequency?: number;
        offset?: number;
        oscillation?: number;
        phase?: number;
        bypass?: boolean;
    }): void;
    frequency: any;
    offset: any;
    oscillation: any;
    phase: any;
    toString(): string;
}
declare namespace Tuna {
    namespace prototype { }
    function toString(): string;
}
export default Tuna;
export type TunaOptions = {
    /**
     * Bypass the effect
     */
    bypass?: boolean;
};
