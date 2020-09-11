export class EffectParameter {
    constructor(parameterName, defaults) {
        this.name = parameterName;
        this.value = defaults.value ?? 0;
        this.min = defaults.min ?? 0.1;
        this.max = defaults.max ?? 100;
        this.automatable = !!defaults.automatable;
        this.type = defaults.type;
    }

    step() {
        if (this.name.indexOf("Index") > 0) return 1;
        if (this.min == 0) return 0.1;
        return this.min;
    }
}