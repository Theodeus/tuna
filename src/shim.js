import {shim} from "./symbols";

const proto         = AudioNode.prototype;
const nativeConnect = AudioNode.prototype.connect;

export const shimConnect = () => {
    if (AudioNode.prototype[shim]) {
        return;
    } else {
        AudioNode.prototype[shim]  = true; // Prevent overriding connect more than once
    }

    proto.connect = function connect (destination, outputIndex, inputIndex) {
        destination = destination.input ? destination.input : destination;
        nativeConnect.call(this, destination, outputIndex, inputIndex);
        return destination;
    };
};
