import TunaNode from "../tuna_node";
import {nodes} from "../symbols";
import {INT, FLOAT, BOOLEAN} from "../constants";

class Bitcrusher extends TunaNode {
    constructor (props) {
        super(props);

        const audioNodes        = this[nodes];
        audioNodes.processor    = this.context.createScriptProcessor(this.props.bufferSize, 1, 1);
        audioNodes.activateNode.connect(audioNodes.processor);
        audioNodes.processor.connect(this.output);

        this.processor.onaudioprocess = createAudioProcess(this);
        this.bits     = this.props.bits;
        this.normfreq = this.props.normfreq;
        this.bypass   = this.props.bypass;
    }
    get name () {
        return "Bitcrusher";
    }
    get bits () {
        return this[nodes].processor.bits;
    }
    set bits (value) {
        this[nodes].processor.bits = value;
        return value;
    }
    get normfreq () {
        return this[nodes].processor.normfreq;
    }
    set normfreq (value) {
        this[nodes].processor.normfreq = value;
        return value;
    }
}

Bitcrusher.prototype.descriptor = {
    bits : {
        value       : 4,
        min         : 1,
        max         : 16,
        automatable : false,
        type        : INT
    },
    bufferSize : {
        value       : 4096,
        min         : 256,
        max         : 16384,
        automatable : false,
        type        : INT
    },
    bypass : {
        value       : false,
        automatable : false,
        type        : BOOLEAN
    },
    normfreq : {
        value       : 0.1,
        min         : 0.0001,
        max         : 1.0,
        automatable : false,
        type        : FLOAT
    }
};

export default Bitcrusher;

function createAudioProcess (bitcrusher) {
    let phaser = 0;
    let last   = 0;
    let output;
    let length;
    let input;
    let step;
    let i;

    return function onaudioprocess (e) {
        input  = e.inputBuffer.getChannelData(0),
        output = e.outputBuffer.getChannelData(0),
        step   = Math.pow(1 / 2, bitcrusher.bits);
        length = input.length;

        for (i = 0; i < length; i++) {
            phaser += bitcrusher.normfreq;
            if (phaser >= 1.0) {
                phaser -= 1.0;
                last = step * Math.floor(input[i] / step + 0.5);
            }
            output[i] = last;
        }
    };
}
