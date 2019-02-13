const state     = {};
const listeners = {};

export const setUserInstance = tuna =>
    state.instance = tuna;

export const setUserContext = context =>
    state.context = context;

export const getContext = () =>
    state.context || new window.AudioContext();

export const getInstance = () =>
    state.instance || new window.Tuna();

export const get = key =>
    state[key];

export const set = (key, value) => {
    if (state[key] !== value) {
        state[key] = value;
        if (Array.isArray(listeners[key])) {
            listeners[key].forEach(fn => fn(value, key));
        }
    }
    return value;
};

export const on = (key, fn) =>
    ((listeners[key] || (listeners[key] = [])).push(fn), fn);

export const off = (key, fn) =>
    listeners[key] ?
        listeners[key].includes(fn) ?
            listeners[key].splice(listeners[key].indexOf(fn), 1) :
            fn : fn;

export const once = (key, fn) => {
    function f2 (...args) {
        const result = fn.apply(this, args);
        off(key, f2);
        return result;
    }
    return on(key, f2);
};
