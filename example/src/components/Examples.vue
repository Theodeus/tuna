<template>
  <div>
    <h1>Tuna examples</h1>

    <div v-if="errorMessage != null">
      <div class="error">{{errorMessage}}</div>
    </div>

    <h2>Audio: {{audio}}</h2>
    <div>
      <input type="radio" id="electric_piano" value="electric_piano.m4a" v-model="audio" />
      <label for="electric_piano">electric_piano</label>
      <br />
      <input type="radio" id="bass" value="bass.m4a" v-model="audio" />
      <label for="bass">bass</label>
      <br />
      <input type="radio" id="guitar" value="guitar.m4a" v-model="audio" />
      <label for="guitar">guitar</label>
      <br />
      <input type="radio" id="vocaloid" value="vocaloid.m4a" v-model="audio" />
      <label for="vocaloid">vocaloid(kiritan)</label>
      <br />
      <input type="radio" id="english" value="english.m4a" v-model="audio" />
      <label for="english">english</label>
      <br />
      <input type="radio" id="japanese" value="japanese.m4a" v-model="audio" />
      <label for="japanese">japanese</label>
      <br />
      <input type="radio" id="upload" value="upload" v-model="audio" />
      <label for="upload">upload</label>

      <div v-if="audio == 'upload'">
        <label>
          <input type="file" placeholder="audio" @change="fileUploaded" />
        </label>
      </div>
    </div>

    <button v-on:click="play()">No Effect</button>
    <button v-on:click="stop()">Stop</button>

    <div v-for="effector in effectors" :key="effector.name">
      <Effector v-bind:effector="effector" @effectChanged="effectChanged" />
    </div>
  </div>
</template>

<script>
import Tuna from "tunajs";
import { Effect } from "../Effect.js";
import Effector from "./Effector.vue";
import { Utils } from "../Utils.js";

export default {
  name: "Examples",
  components: {
    Effector,
  },
  data() {
    return {
      effectors: [],
      audioContext: null,
      source: null,
      errorMessage: null,
      audio: "electric_piano.m4a",
      uploadedAudio: null,
    };
  },
  mounted: function () {
    this.effectors = Object.keys(Tuna.prototype)
      .filter(function (key) {
        return key != "toString";
      })
      .map(function (key) {
        return new Effect(Tuna, key);
      });
    this.audioContext = new AudioContext();
  },
  methods: {
    play: async function (effectName) {
      if (this.audio == "upload") {
        this.playBuffer(this.uploadedAudio, effectName);
        return;
      }
      var xhr = new XMLHttpRequest();
      xhr.open("GET", this.audio);
      xhr.responseType = "arraybuffer";
      xhr.onload = async (e) => {
        const buffer = await this.audioContext.decodeAudioData(
          e.target.response
        );
        this.playBuffer(buffer, effectName);
      };
      xhr.send(null);
    },
    stop: function () {
      if (!this.source) return;
      try {
        this.source.stop();
      } catch (e) {
        console.log(e);
      }
    },
    effectChanged: function (effectName) {
      console.log("eventChanged", effectName);
      this.stop();
      this.play(effectName);
    },
    fileUploaded: async function (e) {
      const files = e.target.files || e.dataTransfer.files;
      this.uploadedAudio = await this.audioContext.decodeAudioData(await Utils.readAsArrayBufferSync(files[0]));
    },
    playBuffer: async function (buffer, effectName) {
      console.log(buffer);
      this.source = this.audioContext.createBufferSource();
      this.source.buffer = buffer;
      if (!effectName) {
        this.source.start(this.audioContext.currentTime);
        this.source.connect(this.audioContext.destination);
        return;
      }

      const selectedEffect = this.effectors.filter(function (effect) {
        return effect.effectName == effectName;
      })[0];
      console.log(effectName, selectedEffect.toTunaParameters());
      try {
        const tuna = new Tuna(this.audioContext);
        const tunaEffect = new tuna[effectName](
          selectedEffect.toTunaParameters()
        );
        this.source.connect(tunaEffect);
        tunaEffect.connect(this.audioContext.destination);

        this.source.start(this.audioContext.currentTime);
      } catch (e) {
        this.stop();
        this.errorMessage = e;
      }
    },
  },
};
</script>

<style scoped>
.error {
  position: fixed;
  top: 1em;
  margin: 1em auto;
  padding: 1em;
  background-color: #f88a;
  color: #f00;
  border-radius: 5px;
}
button {
  font-size: 1.5em;
  margin: 30px 0.5em;
}
</style>
