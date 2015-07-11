Notice
===
Ownership of the tuna repo has been transferred. The old Dinahmoe/tuna repo should be redirected here, but
we recommend updating your remotes using:

```bash
git remote set-url origin https://github.com/Theodeus/tuna.git
```
or, if you use ssh:
```bash
git remote set-url origin git@github.com:Theodeus/tuna.git
```

Latest news
====
Moog style filter and Bitcrusher added! Also, make sure you update your filter nodes to use strings instead of integers for filter type!

tuna
====

An audio effects library for the Web Audio API. Concieved at <a href="http://www.dinahmoe.com">DinahMoe</a>, open source since 2012.

<img src="https://i.chzbgr.com/completestore/12/9/4/rjttPiC7WE6S4Bi22aYp1A2.jpg" alt="tuna, tuna, tuna"/>

Effect list:
====
<ul>
    <li>Overdrive (6 different algorithms)</li>
    <li>Filter</li>
    <li>Cabinet</li>
    <li>Delay</li>
    <li>Convolver (Reverb)</li>
    <li>Compressor</li>
    <li>WahWah</li>
    <li>Tremolo</li>
    <li>Phaser</li>
    <li>Chorus</li>
    <li>Bitcrusher</li>
    <li>Moog Filter</li>
</ul>

Usage
====

Start by creating a new Tuna object like so:

```javascript
var context = new AudioContext();
var tuna = new Tuna(context);
```

You need to pass the audio context you're using in your application. Tuna will be using it to create its effects.

You create a new tuna node as such:

```javascript
var chorus = new tuna.Chorus({
                 rate: 1.5,
                 feedback: 0.2,
                 delay: 0.0045,
                 bypass: 0
             });
```
You can then connect the tuna node to native Web Audio nodes by doing:
```javascript
nativeNode.connect(chorus.input);
chorus.connect(anotherNativeNode);
```
or to other tuna nodes by doing:
```javascript
tunaNode.connect(chorus.input);
chorus.connect(anotherTunaNode.input);
```
All tuna nodes are connected TO by using the nodes input property, but connecting FROM the tuna node works as it does with ordinary native AudioNodes.


The nodes
====

A basic chorus effect.
```javascript
var chorus = new tuna.Chorus({
                 rate: 1.5,         //0.01 to 8+
                 feedback: 0.2,     //0 to 1+
                 delay: 0.0045,     //0 to 1
                 bypass: 0          //the value 1 starts the effect as bypassed, 0 or 1
             });
```

A delay effect with feedback and a lowpass filter applied to the delayed signal.
```javascript
var delay = new tuna.Delay({
                feedback: 0.45,    //0 to 1+
                delayTime: 150,    //how many milliseconds should the wet signal be delayed?
                wetLevel: 0.25,    //0 to 1+
                dryLevel: 1,       //0 to 1+
                cutoff: 2000,      //cutoff frequency of the built in lowpass-filter. 20 to 22050
                bypass: 0
            });
```

A basic phaser effect.
```javascript
var phaser = new tuna.Phaser({
                 rate: 1.2,                     //0.01 to 8 is a decent range, but higher values are possible
                 depth: 0.3,                    //0 to 1
                 feedback: 0.2,                 //0 to 1+
                 stereoPhase: 30,               //0 to 180
                 baseModulationFrequency: 700,  //500 to 1500
                 bypass: 0
             });
```

A basic overdrive effect.
```javascript
var overdrive = new tuna.Overdrive({
                    outputGain: 0.5,         //0 to 1+
                    drive: 0.7,              //0 to 1
                    curveAmount: 1,          //0 to 1
                    algorithmIndex: 0,       //0 to 5, selects one of our drive algorithms
                    bypass: 0
                });
```

A compressor with the option to use automatic makeup gain.
```javascript
var compressor = new tuna.Compressor({
                     threshold: 0.5,    //-100 to 0
                     makeupGain: 1,     //0 and up
                     attack: 1,         //0 to 1000
                     release: 0,        //0 to 3000
                     ratio: 4,          //1 to 20
                     knee: 5,           //0 to 40
                     automakeup: true,  //true/false
                     bypass: 0
                 });
```

A convolver with high- and lowcut. You can find a lot of impulse resonses <a href="http://chromium.googlecode.com/svn/trunk/samples/audio/impulse-responses/">here</a>, or by searching for "free impulse response files".
```javascript
var convolver = new tuna.Convolver({
                    highCut: 22050,                         //20 to 22050
                    lowCut: 20,                             //20 to 22050
                    dryLevel: 1,                            //0 to 1+
                    wetLevel: 1,                            //0 to 1+
                    level: 1,                               //0 to 1+, adjusts total output of both wet and dry
                    impulse: "impulses/impulse_rev.wav",    //the path to your impulse response
                    bypass: 0
                });
```

A basic filter.
```javascript
var filter = new tuna.Filter({
                frequency: 440, //20 to 22050
                Q: 1, //0.001 to 100
                gain: 0, //-40 to 40
                filterType: "lowpass", //lowpass, highpass, bandpass, lowshelf, highshelf, peaking, notch, allpass
                bypass: 0
            });
```

A cabinet/speaker emulator.
```javascript
var cabinet = new tuna.Cabinet({
                  makeupGain: 1,                                 //0 to 20
                  impulsePath: "impulses/impulse_guitar.wav",    //path to your speaker impulse
                  bypass: 0
              });
```

A basic tremolo.
```javascript
var tremolo = new tuna.Tremolo({
                  intensity: 0.3,    //0 to 1
                  rate: 4,         //0.001 to 8
                  stereoPhase: 0,    //0 to 180
                  bypass: 0
              });
```

A wahwah with an auto wah option.
```javascript
var wahwah = new tuna.WahWah({
                 automode: true,                //true/false
                 baseFrequency: 0.5,            //0 to 1
                 excursionOctaves: 2,           //1 to 6
                 sweep: 0.2,                    //0 to 1
                 resonance: 10,                 //1 to 100
                 sensitivity: 0.5,              //-1 to 1
                 bypass: 0
             });
```

A lo-fi bitcrusher effect.

```javascript
var bitcrusher = new tuna.Bitcrusher({
                     bits: 4,          //1 to 16
                     normfreq: 0.1,    //0 to 1
                     bufferSize: 4096  //256 to 16384
                 });
```

A resonant, analog-sounding filter.

```javascript
var moog = new tuna.MoogFilter({
               cutoff: 0.065,    //0 to 1
               resonance: 3.5,   //0 to 4
               bufferSize: 4096  //256 to 16384
           });
```
