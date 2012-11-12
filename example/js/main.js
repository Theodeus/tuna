//"useStrict";
//http://freesound.org/people/TexasMusicForge/sounds/2684/
/*
    tuna.js: demo
    @author chris coniglio || chris@dinahmoe.com
*/
/*
    Copyright (c) 2012 DinahMoe AB

    Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation
    files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy,
    modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software
    is furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
    DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE
    OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
(function () {
    if(!window.webkitAudioContext) {
        window.addEventListener("load", function () {
            var inter = document.getElementById("interface"),
                player = document.getElementById("player");
            player.style.display = "none";
            inter.style.padding = "25px";
            inter.style.width = "660px";
            inter.style["font-size"] = "14px";
            inter.innerHTML = "It looks like the browser you're using doesn't support the web audio API. <br /> <br /> Please download the latest version of Chrome at <a href='http://google.com/chrome'>google.com/chrome</a> and come back soon to check out this demo.";
        });
        return;
    }
    var names = ["Filter", "Cabinet", "Chorus", "Convolver", "Delay", "WahWah", "Tremolo", "Phaser", "Overdrive", "Compressor"],
        context = new webkitAudioContext(),
        effects = Object.create(null),
        mouse = Object.create(null),
        tuna = new Tuna(context),
        proto = "prototype",
        movingKnob = false,
        TAU = Math.PI * 2,
        slice = TAU / 12,
        knobRadius = 20,
        fxInterface, knobNames, player, masterGain, ctx, fun = function () {};

    //audio/2684__texasmusicforge__dandelion.mp3

    function Tab(parent, name) {
        var tab = document.createElement("div"),
            anch = document.createElement("a"),
            text = document.createTextNode(name);
        tab.classList.add("tab");
        anch.setAttribute("id", name + "_tab");
        anch.classList.add("tabanchor");
        anch.appendChild(text);
        tab.appendChild(anch);
        parent.appendChild(tab);
    }

    function Picker(x, y, name, parent) {
        this.min = parent.defaults[name].min;
        this.max = parent.defaults[name].max;
        this.downRight = false;
        this.downLeft = false;
        this.type = "Picker";
        this.parent = parent;
        this.name = name;
        this.x = x;
        this.y = y;
        this.draw();
    }
    Picker.prototype = Object.create(null, {
        w: {
            value: knobRadius * 2
        },
        draw: {
            value: function () {
                ctx.triangle({
                    x: this.x,
                    y: this.y + this.w * 0.5
                }, {
                    x: this.x + this.w * 0.5 - 5,
                    y: this.y
                }, {
                    x: this.x + this.w * 0.5 - 5,
                    y: this.y + this.w
                }, this.downRight ? "#FFF" : "#444");

                ctx.triangle({
                    x: this.x + this.w,
                    y: this.y + this.w * 0.5
                }, {
                    x: this.x + this.w * 0.5 + 5,
                    y: this.y
                }, {
                    x: this.x + this.w * 0.5 + 5,
                    y: this.y + this.w
                }, this.downLeft ? "#FFF" : "#444");
            }
        }
    });

    function CheckBox(x, y, name, parent) {
        this.parentName = parent.name;
        this.active = parent[name];
        this.type = "CheckBox";
        this.name = name;
        this.x = x;
        this.y = y;
        this.draw();
    }
    CheckBox.prototype = Object.create(null, {
        width: {
            value: knobRadius * 2
        },
        draw: {
            value: function () {
                ctx.rectangle(this.x, this.y, this.width, this.width, "#444");
                if(this.active) {
                    ctx.line(this.x, this.y, this.x + this.width, this.y + this.width);
                    ctx.line(this.x, this.y + this.width, this.x + this.width, this.y);
                }
            }
        }
    });

    function Knob(x, y, name, parent) {
        this.parent = parent;
        this.param = parent[name] === undefined ? parent["_" + name] : parent[name];
        var value = this.param["value"] === undefined ? this.param : this.param.value;
        this.range = parent.defaults[name].max - parent.defaults[name].min;
        this.theta = (value / this.range) * slice * 10;
        this.x = x + 20;
        this.y = y + 20;
        this.name = name;
        this.type = "Knob";
        this.draw();
    }
    Knob.prototype = Object.create(null, {
        r: {
            value: knobRadius
        },
        upperLimit: {
            value: slice * 10
        },
        draw: {
            value: function (y) {
                var x2 = this.x + this.r * Math.cos(this.theta + slice * 4),
                    y2 = this.y + this.r * Math.sin(this.theta + slice * 4);
                ctx.circle(this.x, this.y, this.r, "#EEE", "#444");
                ctx.line(this.x, this.y, x2, y2);
            }
        }
    });

    function Interface(name) {
        var el = document.getElementById("interface_canvas"),
            offset = 45,
            prop;

        ctx.clear();
        this.offset = el.getBoundingClientRect();
        this.controls = {};
        this.controlsByIndex = [];
        for(var i = 0, ii = knobNames.length; i < ii; i++) {
            knobNames[i].innerText = "";
        }
        i = 0;
        for(var def in Tuna[proto][name][proto].defaults) {
            if(def === "bypass") {
                continue;
            }
            prop = Tuna[proto][name][proto].defaults[def];
            switch(prop.type) {
            case "boolean":
                this.controls[def] = new CheckBox(offset, 10, def, effects[name]);
                this.controlsByIndex.push(this.controls[def]);
                break;
            case "float":
                this.controls[def] = new Knob(offset, 10, def, effects[name]);
                this.controlsByIndex.push(this.controls[def]);
                break;
            case "int":
                this.controls[def] = new Picker(offset, 10, def, effects[name]);
                this.controlsByIndex.push(this.controls[def]);
                break;
            case "string":
                this.controlsByIndex.push({
                    draw: fun
                });
                break;
            default:
                this.controlsByIndex.push({
                    draw: fun
                });
            }
            knobNames[i].innerText = def;
            i++;
            offset += 90;
        }
    }
    Interface.prototype = Object.create(null, {
        drawControls: {
            value: function (y) {
                ctx.clear();
                for(var i = 0, ii = this.controlsByIndex.length; i < ii; i++) {
                    this.controlsByIndex[i].draw();
                }
            }
        }
    });

    function down(e) {
        if(e.srcElement.classList.contains("tabanchor")) {
            tabDown(e);
            return;
        }
        if(e.srcElement.id === "interface_canvas") {
            interfaceDown(e);
            return;
        }
    }

    function up(e) {
        movingKnob = false;
        if(!fxInterface) {
            return;
        }
        for(var k in fxInterface.controls) if(fxInterface.controls[k].type === "Picker") {
            fxInterface.controls[k].downLeft = fxInterface.controls[k].downRight = false;
        }
        fxInterface.drawControls();
    }

    function move(e) {
        if(e.srcElement.id === "player") {
            masterGain.gain.value = e.srcElement.volume;
        }
        if(!movingKnob) {
            return;
        }
        var y = e.pageY,
            normalized = 0;
        activeKnob.theta += (mouse.lastY - y > 0 ? 0.15 : -0.15);

        if(activeKnob.theta > activeKnob.upperLimit) {
            activeKnob.theta = activeKnob.upperLimit;
        }
        if(activeKnob.theta < 0) {
            activeKnob.theta = 0;
        }
        normalized = activeKnob.theta / (slice * 10);
        if(activeKnob.param["value"] !== undefined) {
            activeKnob.param.value = normalized * activeKnob.range;
        } else {
            activeKnob.parent[activeKnob.name] = normalized * activeKnob.range;
        }

        fxInterface.drawControls(y);
        mouse.lastY = y;
    }

    function tabDown(e) {
        var el = e.srcElement;
        if(tabDown.previous) {
            document.getElementById(tabDown.previous).classList.remove("activetab");
        }
        el.classList.add("activetab");
        fxInterface = el.id.replace("_tab", "");
        deactivateAll();
        effects[fxInterface].bypass = false;
        fxInterface = new Interface(fxInterface);
        tabDown.previous = el.id + "";
    }

    function deactivateAll() {
        for(var i = 0, ii = names.length; i < ii; i++) {
            effects[names[i]].bypass = true;
        }
    }

    function interfaceDown(e) {
        var adjX = e.pageX - fxInterface.offset.left,
            effectIndex = ~~ (((adjX - 20) / 780) * 8);
        if(fxInterface.controlsByIndex[effectIndex]) {
            switch(fxInterface.controlsByIndex[effectIndex].type) {
            case "Knob":
                activeKnob = fxInterface.controlsByIndex[effectIndex];
                movingKnob = true;
                break;
            case "CheckBox":
                var box = fxInterface.controlsByIndex[effectIndex];
                box.active = !box.active;
                effects[box.parentName][box.name] = box.active;
                break;
            case "Picker":
                var pick = fxInterface.controlsByIndex[effectIndex],
                    value = effects[pick.parent.name][pick.name],
                    LR = adjX > pick.x + pick.w * 0.5,
                    x = adjX - 20;
                if(LR) {
                    value--;
                    if(value < pick.min) {
                        value = pick.max;
                    }
                    pick.downLeft = true;
                } else {
                    value++;
                    if(value > pick.max) {
                        value = pick.min;
                    }
                    pick.downRight = true;
                }
                effects[pick.parent.name][pick.name] = value;
                break;
            }
        }
        fxInterface.drawControls();
        mouse.startY = e.pageY;
        mouse.lastY = e.pageY;
    }

    function init() {
        var interface_canvas = document.getElementById("interface_canvas"),
            inter = document.getElementById("interface"),
            tabsEl = document.getElementById("tabs"),
            temp = inter.getBoundingClientRect(),
            brickWall = new tuna.Compressor({
                threshold: -10,
                ratio: 50,
                attack: 0
            }),
            name;

        knobNames = document.getElementsByClassName("name");
        interface_canvas.width = 800;
        interface_canvas.height = 55;
        ctx = interface_canvas.getContext("2d");
        ctx.lineWidth = 3;

        for(var i = 0, ii = names.length; i < ii; i++) {
            name = names[i];
            effects[name] = new tuna[name]();
            if(i) {
                effects[names[i - 1]].connect(effects[names[i]].input);
            }
            Tab(tabsEl, name);
        }
        player = document.getElementById("player");
        sourceNode = context.createMediaElementSource(player);
        masterGain = context.createGainNode();
        sourceNode.connect(effects[names[0]].input);
        effects[name].connect(brickWall.input);
        brickWall.connect(masterGain);
        masterGain.connect(context.destination);
        deactivateAll();
        down({
            srcElement: document.getElementById("Filter_tab")
        });

        document.addEventListener("mousedown", down);
        document.addEventListener("mouseup", up);
        document.addEventListener("mousemove", move);
    }

    function pleaseFixSafariBugs() {
        var inter = document.getElementById("interface"),
            player = document.getElementById("player");
        player.style.display = "none";
        inter.style.padding = "25px";
        inter.style.width = "660px";
        inter.style["font-size"] = "14px";
        inter.innerHTML = "This demo uses the html5 audio tag and currently only works with google chrome. <br /><br />" + " Unfortunately, the createMediaElementSource method of the Web Audio API is currently broken in Safari." + " You can find the latest version of chrome at <a href='http://google.com/chrome'>google.com/chrome</a>.<br /><br />" + " You can use Tuna with oscillator and bufferSource nodes in Safari, but for now, use with the audio tag isn't working correctly is broken for all Web Audio API nodes.";
    }
    window.addEventListener("load", function () {
        var findChrome = /Chrome/,
            isChrome = findChrome.test(window.navigator.userAgent);
        if(isChrome) {
            init();
        } else {
            pleaseFixSafariBugs();
        }

    });
})();

CanvasRenderingContext2D.prototype.line = function (x1, y1, x2, y2) {
    this.lineCap = 'round';
    this.beginPath();
    this.moveTo(x1, y1);
    this.lineTo(x2, y2);
    this.closePath();
    this.stroke();
};
CanvasRenderingContext2D.prototype.circle = function (x, y, r, stroke, fill) {
    this.beginPath();
    this.arc(x, y, r, 0, Math.PI * 2, true);
    this.closePath();
    if(stroke) {
        this.strokeStyle = stroke;
    }
    if(fill) {
        this.fillStyle = fill;
        this.fill();
        this.stroke();
    } else {
        this.stroke();
    }
};
CanvasRenderingContext2D.prototype.rectangle = function (x, y, w, h, fill) {
    this.beginPath();
    this.rect(x, y, w, h);
    this.closePath();
    if(fill) {
        this.fillStyle = fill;
        this.fill();
        this.stroke();
    } else {
        this.stroke();
    }
};
CanvasRenderingContext2D.prototype.triangle = function (p1, p2, p3, fill) {
    // Stroked triangle.
    this.beginPath();
    this.moveTo(p1.x, p1.y);
    this.lineTo(p2.x, p2.y);
    this.lineTo(p3.x, p3.y);
    this.closePath();
    if(fill) {
        this.fillStyle = fill;
        this.fill();
    }
    this.stroke();
};
CanvasRenderingContext2D.prototype.clear = function () {
    this.clearRect(0, 0, this.canvas.clientWidth, this.canvas.clientHeight);
};