import {STRING, FLOAT, BOOLEAN} from "../constants";
import {nodes} from "../symbols";
import TunaNode from "../tuna_node";
import {getBuffer} from "../util";

class Convolver extends TunaNode {
    constructor (props) {
        super(props);

        const audioNodes      = this[nodes];
        audioNodes.convolver  = this.context.createConvolver();
        audioNodes.dry        = this.context.createGain();
        audioNodes.filterLow  = this.context.createBiquadFilter();
        audioNodes.filterHigh = this.context.createBiquadFilter();
        audioNodes.wet        = this.context.createGain();
        audioNodes.output     = this.context.createGain();

        audioNodes.activateNode.connect(audioNodes.filterLow);
        audioNodes.activateNode.connect(audioNodes.dry);
        audioNodes.filterLow.connect(audioNodes.filterHigh);
        audioNodes.filterHigh.connect(audioNodes.convolver);
        audioNodes.convolver.connect(audioNodes.wet);
        audioNodes.wet.connect(this.output);
        audioNodes.dry.connect(this.output);

        //don't use setters at init to avoid smoothing
        audioNodes.dry.gain.value             = this.props.dryLevel;
        audioNodes.wet.gain.value             = this.props.wetLevel;
        audioNodes.filterHigh.frequency.value = this.props.highCut;
        audioNodes.filterLow.frequency.value  = this.props.lowCut;
        this.output.gain.value                = this.props.level;
        this.filterHigh.type                  = "lowpass";
        this.filterLow.type                   = "highpass";
        this.buffer                           = this.props.impulse;
        this.bypass                           = this.props.bypass;
    }
    get name () {
        return "Convolver";
    }
    get lowCut () {
        return this[nodes].filterLow.frequency;
    }
    set lowCut (value) {
        this[nodes].filterLow.frequency.setTargetAtTime(value, this.context.currentTime, 0.01);
        return value;
    }
    get highCut () {
        return this[nodes].filterHigh.frequency;
    }
    set highCut (value) {
        this[nodes].filterHigh.frequency.setTargetAtTime(value, this.context.currentTime, 0.01);
        return value;
    }
    get level () {
        return this.output.gain;
    }
    set level (value) {
        this.output.gain.setTargetAtTime(value, this.context.currentTime, 0.01);
        return value;
    }
    get dryLevel () {
        return this[nodes].dry.gain;
    }
    set dryLevel (value) {
        this[nodes].dry.gain.setTargetAtTime(value, this.context.currentTime, 0.01);
    }
    get wetLevel () {
        return this[nodes].wet.gain;
    }
    set wetLevel (value) {
        this[nodes].wet.gain.setTargetAtTime(value, this.context.currentTime, 0.01);
    }
    get buffer () {
        return this.convolver.buffer;
    }
    set buffer (impulse) {
        getBuffer(impulse).then(buffer => this.buffer = buffer).catch(console.error);
    }
}

Convolver.prototype.descriptor = {
    impulse : {
        value       : "../impulses/ir_rev_short.wav",
        automatable : false,
        type        : STRING
    },
    highCut : {
        value       : 22050,
        min         : 20,
        max         : 22050,
        automatable : true,
        type        : FLOAT
    },
    lowCut : {
        value       : 20,
        min         : 20,
        max         : 22050,
        automatable : true,
        type        : FLOAT
    },
    dryLevel : {
        value       : 1,
        min         : 0,
        max         : 1,
        automatable : true,
        type        : FLOAT
    },
    wetLevel : {
        value       : 1,
        min         : 0,
        max         : 1,
        automatable : true,
        type        : FLOAT
    },
    level : {
        value       : 1,
        min         : 0,
        max         : 1,
        automatable : true,
        type        : FLOAT
    },
    bypass : {
        value       : false,
        automatable : false,
        type        : BOOLEAN
    }
};

export default Convolver;
