eve.on("load.ui", function () {
    var demo = this,
        add = "add",
        fade = "fade",
        remove = "remove",
        underscore = "_",
        colors = [
            "rgba(250,250,50,1)",
            "rgba(23,87,100,1)",
            "rgba(250,0,0,1)",
            "rgba(250,175,89,1)",
            "rgba(15,150,250,1)",
            "rgba(140,140,140,1)",
            "rgba(250,102,250,1)",
            "rgba(0,192,0,1)"
        ],
        raf = demo.raf;

    demo.ChordControl = function () {
        this.buttons = document.getElementsByClassName("chord_control");
        for (var i = 0, ii = this.buttons.length; i < ii; i++) {
            this.buttons[i].classList.add(fade);
        }
        this.buttons[0].parentElement.addEventListener(demo.touchMap.down, down, false);
        this.displayOptions(0);
        this.enabled = true;
    };
    demo.ChordControl.prototype.displayOptions = function(selected) {
        var opts = demo.music.pitch.getChordOptions(selected);
        for (var i = 0, ii = opts.length; i < ii; i++) {
            this.activate(opts[i] - 1, true);
        }
    };
    demo.ChordControl.prototype.activate = function(no, activate) {
        var m = activate ? remove : add;
        this.buttons[no].classList[m](fade);
    };
    demo.ChordControl.prototype.clear = function () {
        for (var i = 0, ii = this.buttons.length; i < ii; i++) {
            this.buttons[i].classList.add(fade);
        }
        return this;
    };
    function down (e) {
        if (!demo.ui.chord.enabled ||
                e.srcElement.id == "chord_controls" ||
                e.srcElement.classList.contains(fade)) {
            return;
        }
        var offset = parseInt(e.srcElement.id.split(underscore)[1], 0);
        demo.music.pitch.chordOffset = offset;
        demo.ui.chord.clear().displayOptions(offset);
    }
})();