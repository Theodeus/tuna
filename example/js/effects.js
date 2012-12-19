eve.once("load.ui", function () {
    var demo = this,
        effects = demo.effectSlots = [],
        fakeProps = {impulse: "impulses/ir_rev_short.wav"},
        ctrlSize = 43,
        uid = 0,
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
        filterTypes = ["LOWPASS", "HIGHPASS", "BANDPASS", "LOWSHELF", "HIGHSHELF", "PEAKING", "NOTCH", "ALLPASS"];
    
    demo.ui.ctrls = Object.create(null);

    function EffectControl (slot) {
        var block = this.block = makeNav(slot, this), effect, controls;
        block.style.height = "27px";
        this.slot = slot;
        this.expanded = false;
        this.active = false;
        this.activeIndex = slot;
        this.effects = [];
        this.effectDisplays = [];
        for (var i = 0, ii = demo.effectNames.length; i < ii; i++) {
            if (demo.effectNames[i] === "LFO" || demo.effectNames[i] === "EnvelopeFollower") {
                continue;
            }
            effect = new demo.audio.tuna[demo.effectNames[i]](fakeProps);
            controls = makeControls(slot, i, demo.effectNames[i], effect.defaults, this);
            controls.name = demo.effectNames[i];
            this.effects.push(effect);
            this.effectDisplays.push(controls);
            block.appendChild(controls);
        }
        demo.audio.tuna.connectInOrder(this.effects);
        this.activate(false);
        document.querySelector("#effects").appendChild(block);
    }
    EffectControl.prototype.activate = function (value) {
        if (value !== undefined) {
            this.active = value;
            this.onOff.checked = !value;
        } else {
            this.active = this.onOff.checked;
        }
        if (!this.active) {
            this.select.classList.add("fade");
            //this.button.classList.add("fade");
            if (this.expanded) {
                this.toggleExpand(true);
            }
            this.disableAllEffects();
        } else {
            this.select.classList.remove("fade");
            //this.button.classList.remove("fade");
            this.effectDisplays[this.activeIndex].classList.remove("hidden");
            this.effects[this.activeIndex].activate(true);
            if (!this.expanded) {
                this.toggleExpand();
            }
        }
    };
    EffectControl.prototype.toggleExpand = function (secondary) {
        if (!this.active && !secondary) return;
        var i = 0,
            ii = secondary ? 0 : demo.effectSlots.length,
            height = this.effectDisplays[this.activeIndex].data.height;

        if (this.expanded) {
            this.block.style.height = "27px";
        } else {
            this.block.style.height = "auto";
        }
        this.expanded = !this.expanded;
    };
    EffectControl.prototype.skip = function (el) {
        if (!this.active) return;
        this.activeIndex -= el.data.type;
        this.activeIndex %= this.effects.length;
        if (this.activeIndex < 0) {
            this.activeIndex = this.effects.length - 1;
        }
        this.disableAllEffects();
        this.hideAll();
        this.showActive();
        this.effects[this.activeIndex].activate(true);
        this.block.style.height = this.effectDisplays[this.activeIndex].data.height;
        this.expanded = true;
        this.title.innerText = this.effectDisplays[this.activeIndex].name;
    };
    EffectControl.prototype.hideAll = function () {
        for (var i = 0; i < this.effectDisplays.length; i++) {
            this.effectDisplays[i].classList.add("hidden");
        }
    };
    EffectControl.prototype.showActive = function () {
        this.effectDisplays[this.activeIndex].classList.remove("hidden");
    };
    EffectControl.prototype.disableAllEffects = function () {
        for (var i = 0, ii = this.effects.length; i < ii; i++) {
            this.effects[i].activate(false);
        }
    };
    function makeNav (slot, parent) {
        var els = {},
            block = document.createElement("div"),
            onOff = parent.onOff = els[0] = document.createElement("input"),
            effect_select_wrap = parent.select = document.createElement("effect_select_wrap"),
            skipForward = els[1] = document.createElement("canvas"),
            skipBack = els[2] = document.createElement("canvas"),
            //expand = parent.button = els [3] = document.createElement("button"),
            title = parent.title = document.createElement("span"), ctx;

        onOff.type = "checkbox";
        onOff.classList.add("onOff");
        onOff.data = {evnt: "ui.onOff"};

        effect_select_wrap.classList.add("effect_select_wrap");
        skipForward.classList.add("skip");
        skipBack.classList.add("skip");
        skipForward.data = {evnt: "ui.skip", slot: slot, type: 1, down: downFill, up: skipFill, ctx: skipForward.getContext("2d")};
        skipBack.data = {evnt: "ui.skip", slot: slot, type: -1, down: downFill, up: skipFill, ctx: skipBack.getContext("2d")};
        skipBack.width = skipBack.height = skipForward.width = skipForward.height = 27;
        skipForward.addEventListener(demo.touchMap.down, skipDown, false);
        skipForward.addEventListener(demo.touchMap.up, skipUp, false);
        skipBack.addEventListener(demo.touchMap.down, skipDown, false);
        skipBack.addEventListener(demo.touchMap.up, skipUp, false);
        for (var i = 0, c; i < 2; i++) {
            c = i ? skipBack : skipForward;
            c.data.ctx.strokeStyle = skipFill;
            if (i) {
                c.data.ctx.triangle(R.A, R.B, R.C, R.F);
            } else {
                c.data.ctx.triangle(L.A, L.B, L.C, L.F);
            }
        }

        title.classList.add("effect_title");
        title.innerText = demo.effectNames[slot];

        //expand.innerText = "v";
        //expand.data = {evnt: "ui.expand"};

        block.classList.add("block");
        block.classList.add("effect");

        for(i = 0; i < 3; i++) {
            els[i].data.slot = slot;
        }

        block.appendChild(onOff);
        block.appendChild(effect_select_wrap);
        //block.appendChild(expand);
        effect_select_wrap.appendChild(skipForward);
        effect_select_wrap.appendChild(title);
        effect_select_wrap.appendChild(skipBack);
        return block;
    }
    function makeControls (slot, effectIndex, name, defaults, parent) {
        var keys = Object.keys(defaults), key,
            wrapper = document.createElement("div"),
            control,
            rows;
        if (keys.indexOf("bypass") > -1) {
            keys.splice(keys.indexOf("bypass"), 1);
        }
        wrapper.classList.add("fx_controls_wrapper");
        if (effectIndex !== slot) {
            wrapper.classList.add("hidden");
        }
        rows = ~~((keys.length / 4) + 0.999);
        wrapper.id = "slot_" + slot + "_" + effectIndex;
        wrapper.data = {height: 48 + (65 * rows) + (20 * (rows - 1))};
        for (var i = 0; (key = keys[i++]);) {
            control = makeControl(slot, effectIndex, key, name, defaults);
            wrapper.appendChild(control);
        }
        return wrapper;
    }
    function makeControl (slot, effectIndex, key, name, defaults, height) {
        var prop = defaults[key],
            control = document.createElement("div"),
            title = document.createElement("span"),
            widget,
            data = {
                evnt: "ui.param",
                slot: slot,
                effectIndex: effectIndex,
                prop: key,
                effectName: name,
                height: height + "px"
            };
        
        title.innerText = key;
        control.classList.add("knobWrap");
        control.appendChild(title);
    
        switch (defaults[key].type) {
            case "float":
                makeKnob(data, defaults[key], control);
                break;
            case "int":
                makePicker(data, defaults[key], control);
                break;
            case "boolean":
                makeCheck(data, defaults[key], control);
                break;
        }
        return control;
    }
    function makeKnob(data, defaults, parent) {
        var knob = Ctrl.knob({
                size: ctrlSize,
                min: defaults.min,
                max: defaults.max,
                value: defaults.value,
                stroke: "#999",
                change: valueChange
            }),
            textBox = document.createElement("input");

        data.textBoxId = "effectValue_" + uid++;
        data.ctrlId = knob.id;

        knob.el.data = data;

        textBox.type = "text";
        textBox.value = defaults.value;
        textBox.id = data.textBoxId;
        textBox.data = Object.create(data);
        textBox.data.evnt = null;

        parent.appendChild(knob.el);
        parent.appendChild(textBox);
        demo.ui.ctrls[knob.id] = knob;
    }
    function makePicker (data, defaults, parent) {
        var picker = Ctrl.picker({
                size: ctrlSize,
                min: defaults.min,
                max: defaults.max,
                value: defaults.value,
                upFill: "#999",
                downFill: "AAA",
                change: valueChange
            }),
            textBox = document.createElement("input");

        data.ctrlId = picker.id;
        data.textBoxId = "effectValue_" + uid++;

        textBox.type = "text";
        if (data.prop === "filterType") {
            textBox.value = filterTypes[defaults.value];
        } else {
            textBox.value = defaults.value;
        }
        
        textBox.disabled = "true";
        textBox.classList.add("effect_value_display");

        picker.el.data = data;
        textBox.id = data.textBoxId;

        parent.appendChild(picker.el);
        parent.appendChild(textBox);
        demo.ui.ctrls[picker.id] = picker;
    }
    function makeCheck (data, defaults, parent) {
        var check = Ctrl.checkBox({
                size: ctrlSize,
                value: defaults.value,
                stroke: "#444",
                fill: "AAA",
                change: valueChange
            }),
            textBox = document.createElement("input");

        data.textBoxId = "effectValue_" + uid++;

        textBox.disabled = "true";
        textBox.classList.add("effect_value_display");
        textBox.id = data.textBoxId;
        textBox.value = defaults.value;
        textBox.disabled = "true";

        check.el.data = data;
        parent.appendChild(check.el);
        parent.appendChild(textBox);
        demo.ui.ctrls[check.id] = check;
    }
    function skipDown () {
        this.data.ctx.clear();
        if (this.data.type === -1) {
            this.data.ctx.triangle(R.A, R.B, R.C, downFill);
        } else {
            this.data.ctx.triangle(L.A, L.B, L.C, downFill);
        }
    }
    function skipUp () {
        this.data.ctx.clear();
        if (this.data.type == -1) {
            this.data.ctx.triangle(R.A, R.B, R.C, skipFill);
        } else {
            this.data.ctx.triangle(L.A, L.B, L.C, skipFill);
        }
    }
    function valueChange (value) {
        if (this.el.data.prop === "filterType") {
            document.querySelector("#" + this.el.data.textBoxId).value = filterTypes[this.value];
        } else {
            document.querySelector("#" + this.el.data.textBoxId).value = this.value;
        }
        eve("valueChange", demo, this);
    }
    for (var i = 0; i < 4; i++) {
        effects[i] = new EffectControl(i);
        if (i) {
            effects[i - 1].effects[effects[i - 1].effects.length - 1].connect(effects[i].effects[0].input);
        }
    }
});