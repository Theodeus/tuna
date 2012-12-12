eve.on("load.ui", function () {
    var demo = this,
        skipFill = "#BBB",
        downFill = "#AAA",
        R = {
            A: {x: 0, y: 0},
            B: {x:0, y: 27},
            C: {x: 27, y: 13},
            F: skipFill
        },
        L = {
            A: {x: 27, y: 27},
            B: {x:27, y: 0},
            C: {x: 0, y: 13},
            F: skipFill
        },
        fx = demo.ui.fxEls = document.querySelectorAll(".effect"),
        fade = "fade",
        knobDivs,
        names = Object.keys(demo.effectNames),
        filterTypes = ["LOWPASS", "HIGHPASS", "BANDPASS", "LOWSHELF", "HIGHSHELF", "PEAKING", "NOTCH", "ALLPASS"];
    
    demo.effectSlots = [];
    for (var i = 0, ii = fx.length; i < ii; i++) {
        makeEffect(fx[i], i);
        populateKnobs(fx[i], i);
    }
    function makeEffect (root, index) {
        var label = root.querySelector(".effect_title"),
            canvases = root.querySelectorAll("canvas"),
            ctx,
            c;
        demo.effectSlots[index] = {index: index, active: true, expanded: false, fxControls: {}};
        knobDivs = demo.effectSlots[index].fxControls;
        if (index) {
            demo.effectSlots[index].active = false;
        }
        label.innerText = demo.effectNames[index];
        root.querySelector(".onOff").addEventListener(demo.touchMap.down, onOff);
        root.querySelector(".onOff").data = {slot: index};
        root.querySelector("button").addEventListener(demo.touchMap.down, expand);
        root.querySelector("button").data = {slot: index};
        for (var i = 0; i < 2; i++) {
            c = canvases[i];
            c.width = c.height = 27;
            ctx = c.getContext("2d");
            ctx.strokeStyle = skipFill;
            c.data = {
                type: i,
                ctx: ctx,
                slot: index
            };
            if (i) {
                ctx.triangle(R.A, R.B, R.C, R.F);
                c.addEventListener(demo.touchMap.down, forward, false);
            } else {
                 ctx.triangle(L.A, L.B, L.C, L.F);
                 c.addEventListener(demo.touchMap.up, back, false);
            }
            c.addEventListener(demo.touchMap.down, skipDown, false);
            c.addEventListener(demo.touchMap.up, skipUp, false);
        }
    }
    function populateKnobs (root, index) {
        var keys, key, j, name, prop, id, temp, knobWrap, title, textBox;
        for (var i = 0; i < demo.effectNames.length; i++) {
            name = demo.effectNames[i];
            keys = Object.keys(demoDefaults[name]);
            knobDivs[name] = document.createElement("div");
            knobDivs[name].classList.add("fx_controls_wrapper");
            knobDivs[name].classList.add("hidden");
            knobDivs[name].id = "slot" + index + "_" + name;
            root.appendChild(knobDivs[name]);
            for(j = 0; (key = keys[j++]);) {
                if (key === "bypass") {
                    break;
                }
                prop = demoDefaults[name][key];
                knobWrap = document.createElement("div");
                knobWrap.classList.add("knobWrap");
                knobWrap.id = id = "slot" + index + "_" + name + "_" + key;
                knobDivs[name].appendChild(knobWrap);
                title = document.createElement("span");
                title.innerText = key;
                knobWrap.appendChild(title);
                switch (prop.type) {
                    case "float":
                        temp = Ctrl.knob({
                            size: 60,
                            min: prop.min,
                            max: prop.max,
                            value: prop.value,
                            stroke: "#999",
                            change: knobChange,
                            container: id
                        });
                        textBox = temp.input = document.createElement("input");
                        textBox.type = "text";
                        textBox.value = prop.value;
                        button = temp.button = document.createElement("button");
                        button.data = {
                            par: temp
                        };
                        button.addEventListener(demo.touchMap.down, knobButtonDown, false);
                        knobWrap.appendChild(textBox);
                        knobWrap.appendChild(button);
                        break;
                    case "int":
                        temp = Ctrl.picker({
                            size: 60,
                            min: prop.min,
                            max: prop.max,
                            value: prop.value,
                            upFill: "#999",
                            downFill: "AAA",
                            change: pickerChange,
                            container: id
                        });
                        textBox = temp.input = document.createElement("input");
                        textBox.type = "text";
                        textBox.value = prop.value;
                        textBox.disabled = "true";
                        textBox.classList.add("effect_value_display");
                        knobWrap.appendChild(textBox);
                        break;
                    case "boolean":
                        temp = Ctrl.checkBox({
                            size: 60,
                            value: prop.value,
                            stroke: "#FFF",
                            lineWidth: 1,
                            fill: "AAA",
                            change: null,
                            container: id
                        });
                        break;
                }
                temp.slot = index;
                temp.name = name;
                temp.prop = key;
            }
        }
    }
    function showEffectControls (slot, effect) {
        for (var i = 0; i < demo.effectNames.length; i++) {
            demo.effectSlots[slot].fxControls[demo.effectNames[i]].classList.add("hidden");
        }
        demo.effectSlots[slot].fxControls[effect].classList.remove("hidden");
    }
    function knobChange (value) {
        this.input.value = value;
        eve(this.slot + this.name + this.prop, demo, value);
    }
    function knobButtonDown (e) {
        this.data.par.setValue(e.srcElement.parentElement.querySelector("input").value);
    }
    function pickerChange (value) {
        if (this.prop === "filterType") {
            this.input.value = filterTypes[value];
        } else {
            this.input.value = value;
        }
        eve(this.slot + this.name + this.prop, demo, value);
    }
    function skipDown () {
        if (this.data.type) {
            this.data.ctx.triangle(R.A, R.B, R.C, downFill);
        } else {
            this.data.ctx.triangle(L.A, L.B, L.C, downFill);
        }
    }
    function skipUp () {
        if (this.data.type) {
            this.data.ctx.triangle(R.A, R.B, R.C, skipFill);
        } else {
            this.data.ctx.triangle(L.A, L.B, L.C, skipFill);
        }
    }
    function expand () {
        if (!demo.effectSlots[this.data.slot].active) {
            return;
        }
        eve("effect.expand", demo, this, this.parentElement, this.data.slot);
    }
    function onOff () {
        eve("effect.activate", demo, this.parentElement, this.checked, this.data.slot);
    }
    function forward () {
        if (!demo.effectSlots[this.data.slot].active) {
            return;
        }
        eve("effect.change", demo, this.parentElement.querySelector(".effect_title"), this.data.slot, true);
    }
    function back () {
        if (!demo.effectSlots[this.data.slot].active) {
            return;
        }
        eve("effect.change", demo, this.parentElement.querySelector(".effect_title"), this.data.slot, false);
    }
    eve.on("hideEffects", showEffectControls);
});
//float: 160, string: 0, boolean: 24, int: 8