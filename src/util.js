export const getBuffer = src => new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", src, true);
    xhr.responseType = "arraybuffer";
    xhr.onerror = reject;
    xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
            if (xhr.status < 300 && xhr.status > 199 || xhr.status === 302) {
                this.context.decodeAudioData(xhr.response, buffer => {
                    resolve(buffer);
                }, reject);
            }
        }
    };
    xhr.send(null);
});

export const createID = () => {
    const hex = "1234567890abcdef";
    let res   = "";
    for (let i = 0; i < 8; i++) {
        res += hex[Math.random() * hex.length];
    }
    return res;
};

export const merge = (dest, src = {}) =>
    Object.keys(src).reduce((acc, key) => {
        if (typeof dest[key] === "undefined") {
            acc[key] = src[key];
        } else if (typeof dest[key] === "object") {
            acc[key] = merge(dest[key], src[key]);
        } else {
            acc[key] = dest[key];
        }
        return acc;
    }, {});

export const clone = object =>
    JSON.parse(JSON.stringify(object));

export const pipe = (audioParam, value) =>
    audioParam.value = value;

export function dbToWAVolume (db) {
    return Math.max(0, Math.round(100 * Math.pow(2, db / 6)) / 100);
}

export function fmod (x, y) {
    // http://kevin.vanzonneveld.net
    // *     example 1: fmod(5.7, 1.3);
    // *     returns 1: 0.5
    var tmp, tmp2, p = 0,
        pY = 0,
        l = 0.0,
        l2 = 0.0;

    tmp = x.toExponential().match(/^.\.?(.*)e(.+)$/);
    p = parseInt(tmp[2], 10) - (tmp[1] + "").length;
    tmp = y.toExponential().match(/^.\.?(.*)e(.+)$/);
    pY = parseInt(tmp[2], 10) - (tmp[1] + "").length;

    if (pY > p) {
        p = pY;
    }

    tmp2 = (x % y);

    if (p < -100 || p > 20) {
        // toFixed will give an out of bound error so we fix it like this:
        l = Math.round(Math.log(tmp2) / Math.log(10));
        l2 = Math.pow(10, l);

        return (tmp2 / l2).toFixed(l - p) * l2;
    } else {
        return parseFloat(tmp2.toFixed(-p));
    }
}

export function sign (x) {
    if (x === 0) {
        return 1;
    } else {
        return Math.abs(x) / x;
    }
}

export function tanh (n) {
    return (Math.exp(n) - Math.exp(-n)) / (Math.exp(n) + Math.exp(-n));
}

export function initValue (userVal, defaultVal) {
    return userVal === undefined ? defaultVal : userVal;
}
