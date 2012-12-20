//@author chris coniglio || chris@dinahmoe.com
(function (window, document) {
    "use-strict";
    var g = {
            win: window,
            doc: document
        },
        proto = "prototype",
        hasTouch = "createTouch" in g.doc,
        touchMap = {
            down: hasTouch ? "touchstart" : "mousedown",
            move: hasTouch ? "touchmove" : "mousemove",
            up: hasTouch ? "touchend" : "mouseup"
        },
        PI = Math.PI,
        TAU = PI * 2,
        slice = TAU / 12,
        triforce = TAU / 3,
        Ctrl = Object.create(null),
        ctrls = Object.create(null),
        id = 0,
        lastY = 0,
        downEl = null,
        playProto = {
            type: "Play",
            remove: removeCtrl,
            draw: function () {
                if (!this.value) {
                    this.ctx.clear();
                    this.ctx.strokeStyle = this.fill;
                    this.ctx.circle(this.half, this.half, this.radius);
                    this.ctx.triangle(this.t.A, this.t.B, this.t.C, this.fill);
                } else {
                    this.ctx.clear();
                    this.ctx.strokeStyle = this.fill;
                    this.ctx.circle(this.half, this.half, this.half - this.space);
                    this.ctx.rectangle(this.r.p.x, this.r.p.y, this.r.w, this.r.h, this.fill);
                }
            },
            down: function () {
                this.value = !this.value;
                this.change(this.value);
                this.draw();
            }
        },
        knobProto = {
            type: "Knob",
            remove: removeCtrl,
            upperLimit: slice * 10,
            draw: function () {
                var x2 = this.cx + this.r * Math.cos(this.theta + slice * 4),
                    y2 = this.cy + this.r * Math.sin(this.theta + slice * 4);
                this.ctx.clear();
                this.ctx.circle(this.cx, this.cy, this.r, this.stroke, this.fill);
                this.ctx.line(this.cx, this.cy, x2, y2);
            },
            move: function (y) {
                var normalized = 0,
                    value;
                this.theta += (lastY - y) > 0 ? 0.25 : -0.25;
                this.theta = constrain(this.theta, this.upperLimit, 0);
                normalized = this.theta / (slice * 10);
                if (this.isExponential) {
                    this.value = Math.floor(this.offset + Math.pow(normalized, 2) * this.range * 100) / 100;
                } else {
                    this.value = Math.floor((this.offset + normalized * this.range) * 100) / 100;
                }
                this.change(this.value);
                lastY = y;
                this.draw();
            },
            setValue: function (v) {
                v = parseFloat(v);
                if (typeof v !== "number") {
                    return;
                }
                var value = constrain(v, this.max, this.min);
                this.value = value;
                this.theta = (value / this.range) * this.upperLimit;
                this.draw();
                this.change(this.value);
            },
            down: function () {}
        },
        checkProto = {
            type: "CheckBox",
            remove: removeCtrl,
            draw: function () {
                this.ctx.clear();
                this.ctx.strokeStyle = this.stroke;
                this.ctx.rectangle(this.x, this.y, this.size, this.size, this.fill);
                if (this.value) {
                    this.ctx.line(this.x, this.y, this.x + this.size, this.y + this.size);
                    this.ctx.line(this.x, this.y + this.size, this.x + this.size, this.y);
                }
            },
            down: function () {
                this.value = !this.value;
                this.change(this.value);
                this.draw();
            }
        },
        pickProto = {
            type: "Picker",
            draw: function () {
                this.ctx.clear();
                this.ctx.strokeStyle = this.isDown === "left" ? this.downFill : this.upFill;
                this.ctx.triangle(this.L.A, this.L.B, this.L.C,
                    this.isDown === "left" ? this.downFill : this.upFill);
                this.ctx.strokeStyle = this.isDown === "right" ? this.downFill : this.upFill;
                this.ctx.triangle(this.R.A, this.R.B, this.R.C,
                    this.isDown === "right" ? this.downFill : this.upFill);
            },
            down: function (e) {
                var P = relMouseCoords(e, this.el);
                if (P.x < this.half) {
                //if (isInsideTriangle(this.L.A, this.L.B, this.L.C, P)) {
                    this.isDown = "left";
                    this.value--;
                    if (this.value < this.min) {
                        this.value = this.max;
                    }
                } else {
                //} else if (isInsideTriangle(this.R.A, this.R.B, this.R.C, P)) {
                    this.isDown = "right";
                    this.value++;
                    if (this.value > this.max) {
                        this.value = this.min;
                    }
                } /*else {
                    return;
                }*/
                this.change(this.value);
                this.draw();
            }
        };
    Ctrl.play = function (props) {
        var root = Object.create(playProto);
        root.value = false;
        root.size = props.size || 80;
        root.half = props.size * 0.5;
        root.radius = root.half - 5;
        root.space = 5;
        root.t = {
            A: new Point(
                root.half + Math.cos(0) * (root.radius - root.space),
                root.half + Math.sin(0) * (root.radius - root.space)),
            B: new Point(
                root.half + Math.cos(triforce) * (root.radius - root.space),
                root.half + Math.sin(triforce) * (root.radius - root.space)),
            C: new Point(
                root.half + Math.cos(triforce * 2) * (root.radius - root.space),
                root.half + Math.sin(triforce * 2) * (root.radius - root.space))
        };
        root.r = {
            p: new Point(root.half * 0.5 - 2.5, root.half * 0.5 - 2.5),
            w: root.half + root.space,
            h: root.half + root.space
        };
        root.fill = props.fill || "#444";
        root.id = "ctrl_" + id++;
        root.el = canvas(props.size, root.id);
        root.ctx = root.el.getContext("2d");
        root.ctx.lineWidth = props.lineWidth || 3;
        root.change = props.change || function () {};
        if (props.container) {
            document.getElementById(props.container).appendChild(root.el);
        }
        ctrls[root.id] = root;
        root.draw();
        return root;
    };
    Ctrl.picker = function (props) {
        var root = Object.create(pickProto);
        root.value = props.value || 0;
        root.min = props.min || 0;
        root.max = props.max || 1;
        root.space = 5;
        root.size = props.size || 80;
        root.half = props.size * 0.5;
        root.L = {
            A: new Point(root.space, root.half),
            B: new Point(root.half - root.space, root.space),
            C: new Point(root.half - root.space, root.size - root.space)
        };
        root.R = {
            A: new Point(root.size - root.space, root.half),
            B: new Point(root.half + root.space, root.space),
            C: new Point(root.half + root.space, root.size - root.space)
        };
        root.upFill = props.upFill || "#444";
        root.downFill = props.downFill || "#999";
        root.id = "ctrl_" + id++;
        root.el = canvas(props.size, root.id);
        root.ctx = root.el.getContext("2d");
        root.ctx.lineWidth = props.lineWidth || 3;
        root.change = props.change || function () {};
        if (props.container) {
            document.getElementById(props.container).appendChild(root.el);
        }
        ctrls[root.id] = root;
        root.draw();
        return root;
    };
    Ctrl.checkBox = function (props) {
        var root = Object.create(checkProto);
        root.x = 7;
        root.y = 7;
        root.stroke = props.stroke || "#EEE";
        root.fill = props.fill || "#444";
        root.value = props.value || false;
        root.size = props.size - (root.x * 2) || 80;
        root.id = "ctrl_" + id++;
        root.el = canvas(props.size, root.id);
        root.ctx = root.el.getContext("2d");
        root.ctx.lineWidth = props.lineWidth || 3;
        root.change = props.change || function () {};
        ctrls[root.id] = root;
        if (props.container) {
            document.getElementById(props.container).appendChild(root.el);
        }
        root.draw();
        return root;
    };
    Ctrl.knob = function (props) {
        var root = Object.create(knobProto);
        root.value = Math.floor(props.value * 100) / 100 || props.min;
        root.stroke = props.stroke || "#EEE";
        root.fill = props.fill || false;
        root.range = props.max - props.min;
        root.max = props.max;
        root.min = props.min;
        root.size = props.size || 10;
        root.offset = props.min;
        root.id = "ctrl_" + id++;
        root.el = canvas(root.size, root.id);
        root.cx = root.size * 0.5;
        root.cy = root.size * 0.5;
        root.r = (root.size * 0.5) - 3;
        root.isExponential = props.isExponential || false;
        root.theta = (root.value / root.range) * slice * 10;
        root.ctx = root.el.getContext("2d");
        root.ctx.lineWidth = props.lineWidth || 3;
        root.change = props.change || function () {};
        ctrls[root.id] = root;
        if (props.container) {
            document.getElementById(props.container).appendChild(root.el);
        }
        root.draw();
        return root;
    };
    function Point (x, y) {
        this.x = x;
        this.y = y;
    }
    function constrain (n, u, l) {
        if (n > u) return u;
        if (n < l) return l;
        return n;
    }
    function canvas (size, id) {
        var c = document.createElement("canvas");
        c.width = size;
        c.height = size;
        c.id = id;
        c.classList.add("ctrl");
        return c;
    }
    function relMouseCoords(event, currentElement){
        var totalOffsetX = 0,
            totalOffsetY = 0,
            canvasX = 0,
            canvasY = 0;
        if (event.offsetX === undefined) {
            do {
                totalOffsetX += currentElement.offsetLeft - currentElement.scrollLeft;
                totalOffsetY += currentElement.offsetTop - currentElement.scrollTop;
            }
            while((currentElement = currentElement.offsetParent));
            canvasX = event.pageX - totalOffsetX;
            canvasY = event.pageY - totalOffsetY;
        } else {
            canvasX = event.offsetX;
            canvasY = event.offsetY;
        }
        return {
            x: canvasX,
            y: canvasY
        };
    }
    function isInsideTriangle (A, B, C, P) {
        var planeAB = (A.x - P.x) * (B.y - P.y) - (B.x - P.x) * (A.y - P.y),
            planeBC = (B.x - P.x) * (C.y - P.y) - (C.x - P.x) * (B.y - P.y),
            planeCA = (C.x - P.x) * (A.y - P.y) - (A.x - P.x) * (C.y - P.y);
        return sign(planeAB) === sign(planeBC) && sign(planeBC) === sign(planeCA);
    }
    function sign (n) {
        return Math.abs(n) / n;
    }
    function removeCtrl () {
        var parent = this.el.parentElement;
        parent.removeChild(this.el);
        delete ctrls[this.id];
    }
    function down (e) {
        var ctrl = ctrls[e.srcElement.id];
        if (ctrl) {
            downEl = ctrl;
            lastY = e.pageY;
            ctrl.down(e);
        }
    }
    function up (e) {
        if (downEl) {
            downEl.isDown = false;
            downEl.draw();
            downEl = null;
        }
    }
    function move (e) {
        if (downEl && downEl.type === "Knob") {
            downEl.move(e.pageY);
        }
    }
    function load () {
        /*
        Demo!!
        document.addEventListener(touchMap.down, down, false);
        document.addEventListener(touchMap.up, up, false);
        document.addEventListener(touchMap.move, move, false);
        */
        eve.on("CONTROL.down", down);
        eve.on("CONTROL.up", up);
        eve.on("CONTROL.move", move);
    }
    g.win.Ctrl = Ctrl;
    window.addEventListener("load", load, false);
})(this, this.document);

CanvasRenderingContext2D.prototype.line = function (x1, y1, x2, y2) {
    this.lineCap = 'round';
    this.beginPath();
    this.moveTo(x1, y1);
    this.lineTo(x2, y2);
    this.closePath();
    this.stroke();
};
CanvasRenderingContext2D.prototype.circle = function (x, y, r, fill) {
    this.beginPath();
    this.arc(x, y, r, 0, Math.PI * 2, true);
    this.closePath();
    if (fill) {
        this.fillStyle = fill;
        this.fill();
    } else {
        this.stroke();
    }
};
CanvasRenderingContext2D.prototype.rectangle = function (x, y, w, h, fill) {
    this.beginPath();
    this.rect(x, y, w, h);
    this.closePath();
    if (fill) {
        this.fillStyle = fill;
        this.fill();
        this.stroke();
    } else {
        this.stroke();
    }
};
CanvasRenderingContext2D.prototype.triangle = function (p1, p2, p3, fill, noStroke) {
    // Stroked triangle.
    this.beginPath();
    this.lineJoin = "round";
    this.moveTo(p1.x, p1.y);
    this.lineTo(p2.x, p2.y);
    this.lineTo(p3.x, p3.y);
    this.closePath();
    if (fill) {
        this.fillStyle = fill;
        this.fill();
    }
    this.stroke();
};
CanvasRenderingContext2D.prototype.clear = function () {
    this.clearRect(0, 0, this.canvas.clientWidth, this.canvas.clientHeight);
};