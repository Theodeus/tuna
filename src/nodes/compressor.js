import {FLOAT, BOOLEAN} from "../constants";
import {nodes, state} from "../symbols";
import TunaNode from "../tuna_node";
import {dbToWAVolume} from "../util";

class Compressor extends TunaNode {
    constructor (props) {
        super(props);

        const audioNodes = this[nodes];
        audioNodes.compNode     =
        audioNodes.activateNode = audioNodes.createDynamicsCompressor();
        audioNodes.makeupNode   = audioNodes.createGain();

        audioNodes.compNode.connect(audioNodes.makeupNode);
        audioNodes.makeupNode.connect(this.output);

        this.automakeup = this.props.automakeup;

        //don't use makeupGain setter at initialization to avoid smoothing
        if (this.automakeup) {
            this.makeupNode.gain.value = dbToWAVolume(this.computeMakeup());
        } else {
            this.makeupNode.gain.value = dbToWAVolume(this.props.makeupGain);
        }

        this.threshold = this.props.threshold;
        this.release   = this.props.release;
        this.attack    = this.props.attack;
        this.ratio     = this.props.ratio;
        this.knee      = this.props.knee;
        this.bypass    = this.props.bypass;
    }
    get name () {
        return "Compressor";
    }
    get automakeup () {
        return this[state].automakeup;
    }
    set automakeup (value) {
        this[state].automakeup = value;
        if (value) {
            this.makeupGain = this.computeMakeup();
        }
        return value;
    }
    get threshold () {
        return this[nodes].compNode.threshold;
    }
    set threshold (value) {
        this[nodes].compNode.threshold.value = value;
        if (this[state].automakeup) {
            this.makeupGain = this.computeMakeup();
        }
        return value;
    }
    get ratio () {
        return this[nodes].compNode.ratio;
    }
    set ratio (value) {
        this[nodes].compNode.ratio.value = value;
        if (this[state].automakeup) {
            this.makeupGain = this.computeMakeup();
        }
        return value;
    }
    get knee () {
        return this[nodes].compNode.knee;
    }
    set knee (value) {
        this[nodes].compNode.knee.value = value;
        if (this[state].automakeup) {
            this.makeupGain = this.computeMakeup();
        }
        return value;
    }
    get attack () {
        return this[nodes].compNode.attack;
    }
    set attack (value) {
        this[nodes].compNode.attack.value = value / 1000;
        return value;
    }
    get release () {
        return this[nodes].compNode.release;
    }
    set release (value) {
        this[nodes].compNode.release.value = value / 1000;
        return value;
    }
    get makeupGain () {
        return this.makeupNode.gain;
    }
    set makeupGain (value) {
        this.makeupNode.gain.setTargetAtTime(dbToWAVolume(value), this.context.currentTime, 0.01);
        return value;
    }
    computeMakeup () {
        const magicCoefficient = 4; // raise me if the output is too hot
        const c                = this[nodes].compNode;
        return -(c.threshold.value - c.threshold.value / c.ratio.value) / magicCoefficient;
    }
}

Compressor.prototype.descriptor = {
    threshold : {
        value       : -20,
        min         : -60,
        max         : 0,
        automatable : true,
        type        : FLOAT
    },
    release : {
        value       : 250,
        min         : 10,
        max         : 2000,
        automatable : true,
        type        : FLOAT
    },
    makeupGain : {
        value       : 1,
        min         : 1,
        max         : 100,
        automatable : true,
        type        : FLOAT
    },
    attack : {
        value       : 1,
        min         : 0,
        max         : 1000,
        automatable : true,
        type        : FLOAT
    },
    ratio : {
        value       : 4,
        min         : 1,
        max         : 50,
        automatable : true,
        type        : FLOAT
    },
    knee : {
        value       : 5,
        min         : 0,
        max         : 40,
        automatable : true,
        type        : FLOAT
    },
    automakeup : {
        value       : false,
        automatable : false,
        type        : BOOLEAN
    },
    bypass : {
        value       : false,
        automatable : false,
        type        : BOOLEAN
    }
};

export default Compressor;
