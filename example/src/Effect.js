import { EffectParameter } from "./EffectParameter";
export class Effect {
  constructor(tuna, effectName) {
    this.effectName = effectName;
    this.parameters = [];

    const effect = tuna.prototype[effectName];
    this.parameters = Object.keys(effect.prototype.defaults).map(function(parameterName) {
      return new EffectParameter(parameterName, effect.prototype.defaults[parameterName]);
    });
  }

  toTunaParameters() {
    let hash = {};
    this.parameters.forEach(p => hash[p.name] = p.value);
    return hash;
  }
}
