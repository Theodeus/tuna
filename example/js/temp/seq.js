(function () {
    function Clock (context, beatLength) {
        this.f = [];
        this.c = [];
        this.currentBeat = -1;
        this.lastBeat = 0;
        this.context = context;
        this.beatLength = beatLength / 1000;
        this.beatTime = 0;
        this.run = run.bind(this);
    }
    function run () {
        if (this.context.currentTime > this.beatTime) {
            var i = this.f.length;
            while (i--) {
                this.f[i].call(this.f[i].c);
            }
            this.beatTime += this.beatLength;
        }
        this.timeout = setTimeout(this.run, 0);
    }
    Clock.prototype.start = function () {
        if (!this.kicked) {
            this.kicknote();
            this.kicked = true;
        }
        this.run();
    };
    Clock.prototype.stop = function () {
        clearTimeout(this.timeout);
    };
    Clock.prototype.add = function (f, c) {
        f.c = c;
        this.f.push(f);
    };
    Clock.prototype.remove = function (f) {
        this.f.splice(this.f.indexOf(f), 1);
    };
    Clock.prototype.kicknote = function () {
        var kick = this.context.createBufferSource(),
            buffer = this.context.createBuffer(1, 100, 44100);
        kick.buffer = buffer;
        return kick.start ? kick.start(0) : kick.noteOn(0);
    };
    window.Clock = Clock; 
})();
