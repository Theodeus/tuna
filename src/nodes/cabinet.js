import TunaNode from "../tuna_node";
import {nodes} from "../symbols";
import {FLOAT, BOOLEAN} from "../constants";
import Convolver from "./convolver";

class Cabinet extends TunaNode {
    constructor (props) {
        super(props);

        const audioNodes = this[nodes];
        audioNodes.convolver = new Convolver({
            impulsepath : this.props.impulsePath,
            dryLevel    : 0,
            wetLevel    : 1
        });
        audioNodes.makeupNode = this.context.createGain();
        audioNodes.activateNode.connect(audioNodes.convolver);
        audioNodes.convolver.output.connect(audioNodes.makeupNode);
        audioNodes.makeupNode.connect(this.output);

        //don't use makeupGain setter at init to avoid smoothing
        audioNodes.makeupNode.gain.value = this.props.makeupGain;
        this.bypass = this.props.bypass;
    }
    get name () {
        return "Cabinet";
    }
    get makeupGain () {
        return this[nodes].makeupNode.gain;
    }
    set makeupGain (value) {
        this[nodes].makeupNode.gain.setTargetAtTime(value, this.context.currentTime, 0.01);
    }
}

Cabinet.prototype.descriptor = {
    makeupGain: {
        value       : 1,
        min         : 0,
        max         : 20,
        automatable : true,
        type        : FLOAT
    },
    bypass: {
        value       : false,
        automatable : false,
        type        : BOOLEAN
    }
};

export default Cabinet;
