import {FLOAT, BOOLEAN} from "../constants";
import {nodes, state} from "../symbols";
import TunaNode from "../tuna_node";
import {pipe} from "../utils";
import LFO from "./lfo";

class Chorus extends TunaNode {
    constructor (props) {
        super(props);

        const audioNodes = this[nodes];
        audioNodes.attenuator         = audioNodes.activateNode;
        audioNodes.splitter           = this.context.createChannelSplitter(2);
        audioNodes.delayL             = this.context.createDelay();
        audioNodes.delayR             = this.context.createDelay();
        audioNodes.feedbackGainNodeLR = this.context.createGain();
        audioNodes.feedbackGainNodeRL = this.context.createGain();
        audioNodes.merger             = this.context.createChannelMerger(2);

        audioNodes.lfoL = new LFO({
            target: audioNodes.delayL.delayTime,
            callback: pipe
        });
        audioNodes.lfoR = new LFO({
            target: audioNodes.delayR.delayTime,
            callback: pipe
        });

        this.input.connect(audioNodes.attenuator);
        audioNodes.attenuator.connect(this.output);
        audioNodes.attenuator.connect(audioNodes.splitter);
        audioNodes.splitter.connect(audioNodes.delayL, 0);
        audioNodes.splitter.connect(audioNodes.delayR, 1);
        audioNodes.delayL.connect(audioNodes.feedbackGainNodeLR);
        audioNodes.delayR.connect(audioNodes.feedbackGainNodeRL);
        audioNodes.feedbackGainNodeLR.connect(audioNodes.delayR);
        audioNodes.feedbackGainNodeRL.connect(audioNodes.delayL);
        audioNodes.delayL.connect(audioNodes.merger, 0, 0);
        audioNodes.delayR.connect(audioNodes.merger, 0, 1);
        audioNodes.merger.connect(audioNodes.output);

        this.feedback   = this.props.feedback;
        this.rate       = this.props.rate;
        this.delay      = this.props.delay;
        this.depth      = this.props.depth;

        audioNodes.lfoR.phase = Math.PI / 2;
        audioNodes.attenuator.gain.value = 0.6934; // 1 / (10 ^ (((20 * log10(3)) / 3) / 20))
        audioNodes.lfoL.bypass = false;
        audioNodes.lfoR.bypass = false;

        this.bypass      = this.props.bypass;
    }
    get name () {
        return "Chorus";
    }
    get delay () {
        return this[state].delay;
    }
    set delay (value) {
        this[state].delay       = 0.0002 * (Math.pow(10, value) * 2);
        this[nodes].lfoL.offset = this[state].delay;
        this[nodes].lfoR.offset = this[state].delay;
        this.depth              = this[state].depth;
    }
    get depth () {
        return this[state].depth;
    }
    set depth (value) {
        this[state].depth            = value;
        this[nodes].lfoL.oscillation = this[state].depth * this[state].delay;
        this[nodes].lfoR.oscillation = this[state].depth * this[state].delay;
    }
    get feedback () {
        return this[state].feedback;
    }
    set feedback (value) {
        const now = this.context.currentTime;
        this[state].feedback = value;
        this[nodes].feedbackGainNodeLR.gain.setTargetAtTime(value, now, 0.01);
        this[nodes].feedbackGainNodeRL.gain.setTargetAtTime(value, now, 0.01);
    }
    get rate () {
        return this[state].rate;
    }
    set rate (value) {
        this[state].rate    = value;
        this[nodes].lfoL.frequency = this[state].rate;
        this[nodes].lfoR.frequency = this[state].rate;
    }
}

Chorus.prototype.descriptor = {
    feedback : {
        value       : 0.4,
        min         : 0,
        max         : 0.95,
        automatable : false,
        type        : FLOAT
    },
    delay : {
        value       : 0.0045,
        min         : 0,
        max         : 1,
        automatable : false,
        type        : FLOAT
    },
    depth : {
        value       : 0.7,
        min         : 0,
        max         : 1,
        automatable : false,
        type        : FLOAT
    },
    rate : {
        value       : 1.5,
        min         : 0,
        max         : 8,
        automatable : false,
        type        : FLOAT
    },
    bypass : {
        value       : false,
        automatable : false,
        type        : BOOLEAN
    }
};

export default Chorus;
