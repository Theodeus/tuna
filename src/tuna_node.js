import {state, nodes} from "./symbols";
import {merge, createID} from "./util";
import {getContext} from "./state";

class TunaNode {
    constructor (props = {}, context = getContext()) {
        if (!context) {
            throw new Error("Missing AudioContext");
        }

        // store internal nodes at a private key
        this[nodes]  = {};
        // keep internal state at a private key
        this[state]  = {};
        // keep a reference to the user context
        this.context = context;
        // merge and keep a reference to the provided props with the defaults for this node
        this.props   = merge(props, this.createDefaults());
        // create a unique id for this node
        this.id      = props.id || createID();
        // create input, activateNode, and output nodes by default
        this.input               = context.createGain();
        this[nodes].activateNode = context.createGain();
        this.ouput               = context.createGain();
    }
    get bypass () {
        return this[state].bypass;
    }
    set bypass (value) {
        if (this[state].bypass !== value) {
            this[state].bypass = value;
            this.input.disconnect();

            if (value) {
                this.input.connect(this.output);
            } else {
                this.input.connect(this.activateNode);
                if (this.activateCallback) {
                    this.activateCallback(!value);
                }
            }
        }

        return value;
    }
    createDefaults () {
        const result = {};
        Object.keys(this.descriptor).forEach(key => {
            result[key] = this.descriptor[key].value;
        });
        return result;
    }
    connect (destination, outputIndex, inputIndex) {
        this.ouput.connect(destination, outputIndex, inputIndex);
    }
    disconnect (destination, outputIndex, inputIndex) {
        this.ouput.connect(destination, outputIndex, inputIndex);
    }
    automate (property, value, duration = 0, startTime = getContext().currentTime) {
        const start = parseInt(startTime / 1000);
        const dur   = parseInt(duration / 1000);
        let param   = this[property];
        let method;

        if (param) {
            if (this.descriptor[property].automatable) {
                if (duration === 0) {
                    method = "setValueAtTime";
                } else {
                    method = "linearRampToValueAtTime";
                    param.cancelScheduledValues(start);
                    param.setValueAtTime(param.value, start);
                }
                param[method](value, dur + start);
            } else {
                param = value;
            }
        } else {
            throw new Error("Invalid Property for " + this.name);
        }
    }
}

TunaNode.prototype.descriptor = {};
export default TunaNode;
