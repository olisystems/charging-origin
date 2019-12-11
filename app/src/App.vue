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

/*current consumer popop style*/
.currentCons-popup .leaflet-popup-content-wrapper {
  background: #e68a00;
  color: white;
  font-size: 12px;
  line-height: 24px;
  border-radius: 0px;
}

.currentCons-popup .leaflet-popup-tip-container {
  width: 50px;
  height: 15px;
}

.currentCons-popup .leaflet-popup-tip {
  background: #e68a00;
  border: white;
  box-shadow: none;
}
</style>
