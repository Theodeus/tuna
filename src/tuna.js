import {setUserInstance, setUserContext, getInstance} from "./state";
import {shimConnect} from "./shim";

const AudioContext = window.AudioContext || window.webkitAudioContext;

export default class Tuna {
    constructor (context = new AudioContext()) {
        if (typeof getInstance() !== "undefined") {
            throw new Error("Tuna must be singleton");
        }
        // allow for Tuna nodes to be connected directly to native AudioNodes
        shimConnect();
        // save the user's instance for use in other modules
        setUserInstance(this);
        // save the user's context for user in other modules
        setUserContext(context);
    }
}
