<p><strong>tuna.js</strong> is released! We'll be adding more effects and features during the coming weeks, so make sure to follow us at <a href="https://twitter.com/DinahmoeSTHLM">@DinahmoeSTHLM</a> to not miss out. Feel free to create your own effects and give us a pull request! </p>

tuna
====

An audio effects library for the Web Audio API.

<img src="https://i.chzbgr.com/completestore/12/9/4/rjttPiC7WE6S4Bi22aYp1A2.jpg" alt="tuna, tuna, tuna"/>

Effect list<br />
====
Overdrive (6 different algorithms)<br />
Filter<br />
Cabinet<br />
Chorus<br />
Delay<br />
PingPongDelay<br />
Convolver (Reverb)<br />
Compressor<br />
Equalizer (variable number of bands)<br />
Tremolo<br />
Phaser<br />
WahWah<br />

Created by www.dinahmoe.com

Usage:
====

Start by creating a new Tuna object like so:

<pre>
    var context = new webkitAudioContext();
    var tuna = new Tuna(context);
</pre>

You need to pass the audio context you're using in your application. Tuna will be using it to create it's effects.

You create a new tuna node as such:

<pre>
var chorus = new tuna.Chorus({
                 rate: 0.5,
                 depth: 0.5,
                 feedback: 0.5,
                 delay: 0.5,
                 bypass: 0
             });
</pre>
You can then connect the tuna node to native Web Audio nodes by doing:
<pre>
nativeNode.connect(chorus.input);
chorus.connect(anotherNativeNode);
</pre>
or to other tuna nodes by doing:
<pre>
tunaNode.connect(chorus.input);
chorus.connect(anotherTunaNode.input);
</pre>
All tuna nodes are connected TO by using the nodes input property, but connecting FROM the tuna node works as it does with ordinary native AudioNodes.

Each tuna node (or effect) inherits from the same prototype. This gives the nodes some common methods:
<ul>
    <li>connect(targetNode) - simulates the connect method of the native AudioNode in Web Audio. targetNode is a native audioNode, or the input property of a tuna node</li>
    <li>bypass(true/false) - bypasses the tuna node, without having to remove it from the effect chain</li>
    <li>activate(true/false) - performs the bypass</li>
    <li>connectInOrder(array) - connects nodes in the order they're defined in the array that is passed to connectInOrder as an argument</li>
    <li>setAutomatableProperty(property, value, duration, actionTime) - allows smooth value changes (automatiation, or tweening). property is a string with the name of the property to automate, value is the value to automate to, duration is how long the automation is in milliseconds, actionTime is the time when the automation should start based on the audioContext time</li>
    <li>verify - makes sure the property that is being set is valid</li>
</ul>

The nodes:
====

A basic chorus effect.
<pre>
var chorus = new tuna.Chorus({
                 rate: 0.5,
                 depth: 0.5,
                 feedback: 0.5,
                 delay: 0.5,
                 bypass: 0          //the value 1 starts the effect as bypassed
             });
</pre>

A delay effect with feedback and a highpass filter applied to the delayed signal.
<pre>
var delay = new tuna.Delay({
                 feedback: 0.45,    //how much should the delayed signal be feed back into the delay loop?
                 delayTime: 150,    //how many milliseconds should the wet signal be delayed?
                 wetLevel: 0.25,    //how much of the delayed signal should be audible?
                 dryLevel: 1,       //how much of the original signal should be audible?
                 cutoff: 20,        //cutoff frequency of the built in highpass-filter
                 bypass: 0
             });
</pre>