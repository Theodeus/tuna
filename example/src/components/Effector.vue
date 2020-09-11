<template>
  <div class="effector">
    <button class="effector_button" v-on:click="effectSelected()">{{effector.effectName}}</button>

    <div v-for="parameter in effector.parameters" :key="parameter.name">
      <label for=parameter.name>{{parameter.name}}</label>
      <input v-if="parameter.type != 'boolean'" type="range" v-model="parameter.value"
             v-bind:min="parameter.min" 
             v-bind:max="parameter.max" 
             v-bind:step="parameter.step()" />
      <input v-if="parameter.type == 'boolean'" type="checkbox" v-model="parameter.value" />
      {{parameter.value}}({{parameter.type}})
    </div>
  </div>
</template>

<script>
export default {
  name: "Effector",
  props: ["effector"],
  methods: {
    effectSelected: function() {
      this.$emit("effectChanged", this.effector.effectName);
    }
  }
};
</script>

<style scoped>
.effector {
  margin: 30px;
}
.effector_button {
  font-size: 1.5em;
  margin: 30px;
}
</style>
