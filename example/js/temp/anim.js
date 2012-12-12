eve.on("load", function () {
    var demo = this, 
        raf = demo.raf;
        demo.Anim = {
            f: [],
            context: demo.context,
            timeout: null,
            state: false,
            lastTime: 0,
            thisTime: 0,
            delta: 0,
            start: function () {
                if (!this.state) {
                    this.previousTime = this.context.currentTime;
                    this.run();
                    this.state = true;
                }
                return this;
            },
            stop: function () {
                if (this.state) {
                    clearTimeout(this.timeout);
                    this.state = false;
                }
                return this;
            },
            add: function (f, c) {
                f.c = c;
                this.f.push(f);
                return this;
            },
            remove: function (f) {
                this.f.splice(this.f.indexOf(f), 1);
                return this;
            }
        };
    function run () {
        var i = this.f.length;
        this.currentTime = demo.context.currentTime;
        this.delta = this.currentTime - this.lastTime / 16;
        while (i--) {
            this.f[i].call(this.f[i].c, this.currentBeat, this.lastBeat);
        }
        raf(this.run);
    }
    demo.Anim.run = run.bind(demo.Anim);
});