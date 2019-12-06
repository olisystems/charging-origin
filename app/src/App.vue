<template>
  <div id="app">
    <ChargingOrigin />
  </div>
</template>

<script>
import ChargingOrigin from "./components/ChargingOrigin.vue";

export default {
  name: "app",
  components: {
    ChargingOrigin
  }
};
</script>

<style>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

body {
  margin: 0;
}
</style>
