<template>
  <div id="app">
    <Examples />
  </div>
</template>

<script>
import Examples from './components/Examples.vue'

export default {
  name: 'App',
  components: {
    Examples
  }
}
</script>

<style>
#app {
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
