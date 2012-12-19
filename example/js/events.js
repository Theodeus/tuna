eve.once("load", function () {
    var demo = this,
        fade = "fade",
        mobile = /Mobile/.test(navigator.userAgent);
    
    function beat (currentBeat, lastBeat, beatTime) {
        var grid = this.ui.grid, note;
            now = ~~(beatTime * 1000) / 1000 + 0.03;
        grid.lightColumn(currentBeat, true);
        grid.lightColumn(lastBeat, false);
        for (var i = 0, ii = grid.rows; i < ii; i++) {
            if (grid.states[i][currentBeat] === true) {
                note = this.music.pitch.getPitch(grid.rows - 1 - i, this.music.pitch.chordOffset || 0);
                this.audio.synth.makeNote.call(this.audio.synth, note, now, 0.125);
            }
        }
    }
    function effectActivate (el) {
        this.effectSlots[el.data.slot].activate();
    }
    function effectExpand (el) {
        this.effectSlots[el.data.slot].toggleExpand();
    }
    function effectChange (el) {
        this.effectSlots[el.data.slot].skip(el);
    }
    function valueChange (ctrl) {
        var prop = this.effectSlots[ctrl.el.data.slot].effects[ctrl.el.data.effectIndex][ctrl.el.data.prop];
        if (prop.value === undefined) {
            this.effectSlots[ctrl.el.data.slot].effects[ctrl.el.data.effectIndex][ctrl.el.data.prop] = ctrl.value;
        } else {
            this.effectSlots[ctrl.el.data.slot].effects[ctrl.el.data.effectIndex][ctrl.el.data.prop].value = ctrl.value;
        }
    }
    function changeScale (name, id) {
        this.music.pitch.scale = name;
    }
    function startGrid () {
        this.clock.currentBeat = -1;
        this.clock.lastBeat = 15;
        this.clock.add(beat, this);
    }
    function stopGrid () {
        this.ui.grid.clearAll(false);
        this.clock.remove(beat);
    }
    function gridBlock (el) {
        this.ui.grid.mouseEvent(el);
    }
    function clearGrid () {
        this.ui.grid.clearAll(true);
    }
    function checkIfApp (e) {
        var el = e.srcElement;
        while (el.parentElement) {
            el = el.parentElement;
            if (el.id == "ALL") {
                return true;
            }
        }
        return false;
    }
    function keyUp (e) {
        if(e.keyCode == 13 && e.srcElement.data && e.srcElement.data.ctrlId){
            demo.ui.ctrls[e.srcElement.data.ctrlId].setValue(e.srcElement.value);
            demo.ui.ctrls[e.srcElement.data.ctrlId].draw();
            valueChange.call(demo, demo.ui.ctrls[e.srcElement.data.ctrlId]);
        }
    }
    function destroyEvent (event) {
        event.cancelBubble = true;
        event.returnValue = false;
        if (event.stopPropagation) event.stopPropagation();
        if (event.preventDefault) event.preventDefault();
        return false;
    }
    function doc_down (e) {
        var el = e.srcElement;
        if (el.data && el.data.evnt) {
            eve(el.data.evnt, demo, e.srcElement);
        }
        if (!demo.context.currentTime) {
            demo.clock.kicknote();
        }
        eve("CONTROL.down", document, e);
        if (checkIfApp(e) && mobile && el.tagName !== "BUTTON" && el.tagName !== "INPUT") {
            return destroyEvent(e);
        }
    }
    function doc_up (e) {
        eve("CONTROL.up", document, e);
    }
    function doc_move (e) {
        eve("CONTROL.move", document, e);
        if (checkIfApp(e)) {
            return destroyEvent(e);
        }
    }

    eve.on("valueChange", valueChange);
    eve.on("ui.gridBlock", gridBlock);
    eve.on("ui.onOff", effectActivate);
    eve.on("ui.expand", effectExpand);
    eve.on("ui.skip", effectChange);
    eve.on("grid.start", startGrid);
    eve.on("grid.stop", stopGrid);
    eve.on("grid.clear", clearGrid);
    eve.on("pitch.scale", changeScale);
    document.addEventListener(demo.touchMap.down, doc_down, false);
    document.addEventListener(demo.touchMap.up, doc_up, false);
    document.addEventListener(demo.touchMap.move, doc_move, false);
    document.addEventListener("keyup", keyUp, false);
});