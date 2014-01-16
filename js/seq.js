eve.on("load", function () {
    var demo = this;
    demo.Clock = function (context, beatLength) {
        this.f = [];
        this.currentBeat = -1;
        this.lastBeat = 0;
        this.context = context;
        this.beatLength = beatLength / 1000;
        this.beatTime = 0;
        this.lastBeatTime = 0;
        this.run = run.bind(this);
        this.state = false;
    };
    demo.Clock.prototype.start = function () {
        if (!this.kicked) {
            this.kicknote();
            this.kicked = true;
        }
        if (!this.state) {
            this.beatTime = this.lastBeatTime = this.context.currentTime;
            this.run();
            this.state = true;
        }
        return this;
    };
    demo.Clock.prototype.stop = function () {
        if (this.state) {
            clearTimeout(this.timeout);
            this.state = false;
        }
        return this;
    };
    demo.Clock.prototype.add = function (f, c) {
        f.c = c;
        this.f.push(f);
        return this;
    };
    demo.Clock.prototype.remove = function (f) {
        this.f.splice(this.f.indexOf(f), 1);
        return this;
    };
    demo.Clock.prototype.kicknote = function () {
        var kick = this.context.createBufferSource(),
            buffer = this.context.createBuffer(1, 100, 44100);
        kick.buffer = buffer;
        kick.noteOn(0);
        return this;
    };
    function dispatchLatent() {
        demo.ui.grid.clearAll();
    }
    function run () {
        if (this.context.currentTime > this.beatTime) {
            var i = this.f.length;
            while (this.lastBeatTime + this.beatLength < this.context.currentTime) {
                this.lastBeatTime += this.beatLength;
                this.beatTime += this.beatLength;
                this.currentBeat++;
                this.currentBeat %= 16;
            }
            this.beatTime += this.beatLength;
            this.currentBeat++;
            this.currentBeat %= 16;
            while (i--) {
                this.f[i].call(this.f[i].c, this.currentBeat, this.lastBeat, this.beatTime);
            }
            this.lastBeat = this.currentBeat;
            this.lastBeatTime = this.beatTime;
        }
        this.timeout = setTimeout(this.run, 16);
    }
});
