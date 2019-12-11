<template>
  <div class="main">
    <div class="top-bar">
      <div class="stats">
        <div class="stat">
          <p>THU PV</p>
          <h4>{{totalTHU}}</h4>
          <p class="sub-heading">Total Production [kWh]</p>
        </div>
        <div class="stat">
          <p>Examesh WPP</p>
          <h4>{{totalExamesh}}</h4>
          <p class="sub-heading">Total Production [kWh]</p>
        </div>
        <div class="stat">
          <p>Total Production</p>
          <h4 class="prod-color">{{totalProduction}}</h4>
          <p class="sub-heading">[kWh]</p>
        </div>
        <div class="stat">
          <p>Total Consumption</p>
          <h4 class="cons-color">{{totalConsumption}}</h4>
          <p class="sub-heading">[kWh]</p>
        </div>
      </div>
    </div>

    <div class="percentage">
      <div class="percentage-wrapper">
        <div class="wrapper consumption-table">
          <div class="header">
            <h3>Real Time Energy Consumption</h3>
          </div>
          <div class="table">
            <div class="table-wrapper">
              <v-table :data="consumptionEvents">
                <thead slot="head">
                  <th>ETH Address</th>
                  <th>Power</th>
                  <th>Location</th>
                  <th>Time</th>
                </thead>

                <tbody slot="body" slot-scope="{displayData}">
                  <tr v-for="(row, index) in displayData" :key="index">
                    <td
                      v-tooltip="row.consumer"
                      v-on:click="getCurrentConsMarker"
                      class="consumer-address"
                    >{{row.consumer}}</td>

                    <td>{{row.power[row.power.length-1]}}</td>

                    <td v-tooltip="row.location">{{row.location}}</td>
                    <td v-tooltip="row.time[row.time.length-1]">{{row.time[row.time.length-1]}}</td>
                  </tr>
                </tbody>
              </v-table>
              <h5 class="loader">Loading...</h5>
            </div>
          </div>
        </div>

        <div class="map">
          <div id="map"></div>
        </div>

        <div class="pie-chart wrapper">
          <div class="header">
            <h3>THU PV & Examesh WPP Energy Percentage</h3>
          </div>
          <div id="percentage-plot"></div>
        </div>
      </div>
    </div>

    <div class="live-data">
      <div class="live-data-wrapper">
        <div class="wrapper realTime-table">
          <div class="header">
            <h3>Real Time Energy Production</h3>
          </div>
          <div class="table">
            <div class="table-wrapper">
              <v-table :data="sumProduction">
                <thead slot="head">
                  <th>ETH Address</th>
                  <th>Name</th>
                  <th>Power</th>
                  <th>Time</th>
                </thead>

                <transition-group name="test" tag="tbody" slot="body" slot-scope="{displayData}">
                  <tr v-for="(row, index) in displayData" :key="index">
                    <td v-tooltip="row.producer">{{row.producer}}</td>
                    <td>{{row.name}}</td>
                    <td>{{row.power[row.power.length-1]}}</td>
                    <td v-tooltip="row.time[row.time.length-1]">{{row.time[row.time.length-1]}}</td>
                  </tr>
                </transition-group>
              </v-table>
              <h5 class="loader">Loading...</h5>
            </div>
          </div>
        </div>

        <div class="thu-examesh wrapper">
          <div class="header">
            <h3>THU PV & Examesh WPP Energy Production</h3>
          </div>
          <div id="production-plot">
            <h5 class="loader">Loading...</h5>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import web3 from "../assets/js/web3";
const $ = require("jquery");
import { timeConverter } from "../assets/js/time-format";
import Plotly from "plotly.js-dist";
import ContractInstance from "../assets/js/ContractInstance";
import L from "leaflet";

export default {
  name: "ChargingOrigin",
  data() {
    return {
      account: "",
      contract: "",
      totalTHU: "",
      totalExamesh: "",
      totalProduction: "",
      totalConsumption: "",
      consumptionEvents: [],
      thuPV: [],
      exameshWPP: [],
      sumProduction: [], //thuPV + exameshWPP production
      // spatial distribution starts here
      map: null,
      consumerAddress: "",
      consumerLocation: [],
      consumerLocationObject: {},
      consumerLocationEntries: [],
      currentConsumerCordinates: [],
      consumerPopup: "",
      currentConsumerPopup: [],
      currentConsumerMarker: {},
      currentConsumerAddress: "",
      consumerEthAddress: []
    };
  },
  methods: {
    getMetamaskAccount() {
      web3.eth.getAccounts((err, res) => {
        if (err) {
          console.log(err);
          return;
        }
        this.account = res[0];
      });
    },

    // get public data variables
    async getTotalTHUProduction() {
      const production = await this.contract.methods
        .totalThuPvProd()
        .call({ from: this.account });
      this.totalTHU = production;
    },
    async getTotalExameshProduction() {
      const production = await this.contract.methods
        .totalExameshWppProd()
        .call({ from: this.account });
      this.totalExamesh = production;
    },
    async getTotalProduction() {
      const production = await this.contract.methods
        .totalProduction()
        .call({ from: this.account });
      this.totalProduction = production;
    },
    async getTotalConsumption() {
      const consumption = await this.contract.methods
        .totalConsumption()
        .call({ from: this.account });
      this.totalConsumption = consumption;
    },

    callPublicData() {
      this.getTotalTHUProduction();
      this.getTotalExameshProduction();
      this.getTotalProduction();
      this.getTotalConsumption();
    },
    // spatial distribution starts from here
    getCurrentConsMarker() {
      this.currentConsumerAddress = event.target.innerHTML;
      let popupOptions = {
        maxWidth: "500",
        className: "currentCons-popup" // classname for another popup
      };

      this.contract
        .getPastEvents("ConsumerRegistration", {
          fromBlock: 0,
          toBlock: "latest"
        })
        .then(results => {
          results.forEach(result => {
            this.consumerLocation.push(
              result.returnValues.latitude / 10000 +
                ", " +
                result.returnValues.longitude / 10000 +
                ", " +
                result.returnValues.name
            );

            // push addresses
            this.consumerEthAddress.push(result.returnValues.addressCP);

            // bind key values
            this.consumerEthAddress.forEach(
              (key, i) =>
                (this.consumerLocationObject[key] = this.consumerLocation[i])
            );
          });

          // storing entries of single object into list of items
          for (
            let i = 0;
            i < Object.keys(this.consumerLocationObject).length;
            i++
          ) {
            this.consumerLocationEntries.push(
              Object.entries(this.consumerLocationObject)[i]
            );
          }

          for (let i = 0; i < this.consumerLocationEntries.length; i++) {
            if (
              this.currentConsumerAddress == this.consumerLocationEntries[i][0]
            ) {
              this.currentConsumerCordinates = this.consumerLocationObject[
                this.currentConsumerAddress
              ];
              this.currentConsumerCordinates = this.currentConsumerCordinates.split(
                ","
              );

              let currentConsLat = this.currentConsumerCordinates[0].trim();
              let currentConsLon = this.currentConsumerCordinates[1].trim();

              this.currentConsumerPopup =
                "Consumer: " +
                this.currentConsumerCordinates[2] +
                "<br>" +
                "Eth address: " +
                this.currentConsumerAddress.slice(0, 7) +
                "..." +
                "<br>" +
                "Location: " +
                this.currentConsumerCordinates[0] +
                ", " +
                this.currentConsumerCordinates[1];

              let currentConsIcon = L.icon({
                iconUrl: "consumer.png",
                iconSize: [30, 40]
              });

              if (this.currentConsumerMarker != undefined) {
                this.map.removeLayer(this.currentConsumerMarker);
              }

              this.currentConsumerMarker = L.marker(
                [currentConsLat, currentConsLon],
                { icon: currentConsIcon }
              ).addTo(this.map);
              this.currentConsumerMarker
                .bindPopup(this.currentConsumerPopup, popupOptions)
                .openPopup();
            }
          }
        });

      // removing the background color for ul-selected items
      document.querySelectorAll(".consumer-address").forEach(list => {
        list.classList.remove("active-consumer");
      });
      // add background to selected account
      event.target.classList.add("active-consumer");
    },
    addConsMarkers() {
      // define popup options
      const popupOptions = {
        maxWidth: "500",
        className: "currentCons-popup"
      };
      // current producer icon
      const consumerIcon = L.icon({
        iconUrl: "consumer.png",
        iconSize: [50, 60]
      });
      // get event data
      this.contract
        .getPastEvents("ConsumerRegistration", {
          fromBlock: 0,
          toBlock: "latest"
        })
        .then(results => {
          results.forEach(result => {
            const markers = L.marker(
              [
                result.returnValues.latitude / 10000,
                result.returnValues.longitude / 10000
              ],
              { icon: consumerIcon }
            ).addTo(this.map);

            // define popup contents
            this.consumerPopup =
              "Consumer: " +
              result.returnValues.name +
              "<br>" +
              "Eth address: " +
              result.returnValues.addressCP.slice(0, 7) +
              "..." +
              "<br>" +
              "Location: " +
              result.returnValues.latitude / 10000 +
              ", " +
              result.returnValues.longitude / 10000;
            // bind popup
            markers.bindPopup(this.consumerPopup, popupOptions);
            markers.on("mouseover", function() {
              this.openPopup();
            });
            markers.on("mouseout", function() {
              this.closePopup();
            });
          });
        });
    },

    initMap() {
      // home marker icon
      var homeIcon = L.icon({
        iconUrl: "home.png",
        iconSize: [30, 40]
      });

      // create tile layers
      const openStreet = L.tileLayer(
          "http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
          {
            attribution:
              "&copy; " +
              '<a href="http://openstreetmap.org">OpenStreetMap</a>' +
              " Contributors",
            maxZoom: 10
          }
        ),
        OpenStreetMap_BlackAndWhite = L.tileLayer(
          "http://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png",
          {
            maxZoom: 18,
            attribution:
              '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          }
        ),
        OpenStreetMap_DE = L.tileLayer(
          "https://{s}.tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png",
          {
            maxZoom: 18,
            attribution:
              '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          }
        ),
        OpenTopoMap = L.tileLayer(
          "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
          {
            maxZoom: 17,
            attribution:
              'Map data: &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
          }
        ),
        Esri_WorldImagery = L.tileLayer(
          "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          {
            attribution:
              "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
          }
        ),
        CartoDB_DarkMatter = L.tileLayer(
          "https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png",
          {
            attribution:
              '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
            subdomains: "abcd",
            maxZoom: 19
          }
        );

      // create base layer object
      const baseMaps = {
        "<span style='color: gray'>Open Street</span>": openStreet,
        Grayscale: OpenStreetMap_BlackAndWhite,
        "Open Street DE": OpenStreetMap_DE,
        "Open Topo": OpenTopoMap,
        "ESRI Imagery": Esri_WorldImagery,
        "CartoDB Dark": CartoDB_DarkMatter
      };

      this.map = L.map("map", {
        center: [48.7, 9.4],
        zoom: 9,
        layers: openStreet
      });
      // add layers control
      L.control.layers(baseMaps).addTo(this.map);
      // add home marker
      const homeMarker = L.marker([48.77538056, 9.16277778], {
        icon: homeIcon
      }).addTo(this.map);
      // bind popup to home marker
      homeMarker.bindPopup("OLI Systems GmbH");
      homeMarker.on("mouseover", function() {
        this.openPopup();
      });
      homeMarker.on("mouseout", function() {
        this.closePopup();
      });
    },

    watchRealTimeConsumption() {
      this.contract.events
        .Consumption({
          fromBlock: "latest",
          toBlock: "latest"
        })
        .on("data", event => {
          $(".loader").hide();

          const index = this.consumptionEvents.findIndex(
            e => e.consumer == event.returnValues.consumer
          );
          if (index === -1) {
            this.consumptionEvents.push({
              consumer: event.returnValues.consumer,
              power: [event.returnValues.consumption],
              location: event.returnValues.location,
              time: [timeConverter(event.returnValues.timestamp)]
            });
          } else {
            this.consumptionEvents[index].power.push(
              event.returnValues.consumption
            );
            this.consumptionEvents[index].time.push(
              timeConverter(event.returnValues.timestamp)
            );
          }
        })
        .on("error", console.error);
    },

    plotPercentage() {
      var data = [
        {
          values: [this.totalTHU, this.totalExamesh, 0],
          labels: ["THU PV", "Examesh WPP", "Gray Power"],
          type: "pie",
          marker: {
            colors: ["#1f77b4", "#ff7f0e", "#7f7f7f"]
          }
        }
      ];

      var layout = {
        height: 350,

        legend: {
          orientation: "h",
          xanchor: "center",
          y: 1.2,
          x: 0.5
        },

        margin: {
          r: 20,
          l: 20,
          b: 20,
          t: 20,
          pad: 10
        }
      };

      Plotly.newPlot("percentage-plot", data, layout, { responsive: true });
    },

    watchRealTimeProduction() {
      this.contract.events
        .Production({
          fromBlock: "latest"
        })
        .on("data", event => {
          $(".loader").hide();
          if (event.returnValues[1] === "THU PV") {
            this.thuPV.push({
              energy: event.returnValues[2],
              time: timeConverter(event.returnValues[3])
            });
          } else if (event.returnValues[1] === "Examesh WPP") {
            this.exameshWPP.push({
              energy: event.returnValues[2],
              time: timeConverter(event.returnValues[3])
            });
          }

          const index = this.sumProduction.findIndex(
            e => e.producer == event.returnValues.producer
          );
          if (index === -1) {
            this.sumProduction.unshift({
              name: event.returnValues.name,
              producer: event.returnValues.producer,
              power: [event.returnValues.production],
              time: [timeConverter(event.returnValues.timestamp)]
            });
          } else {
            this.sumProduction[index].power.push(event.returnValues.production);
            this.sumProduction[index].time.push(
              timeConverter(event.returnValues.timestamp)
            );
          }

          this.callPublicData();
          this.plotLiveProduction();
        })
        .on("error", console.error);
    },

    plotLiveProduction() {
      if (this.thuPV.length > 10) {
        this.thuPV = this.thuPV.slice(-10);
      }
      if (this.exameshWPP.length > 10) {
        this.exameshWPP = this.exameshWPP.slice(-10);
      }
      // temp arrays to hold time and energy values
      let thuTime = [];
      let thuValue = [];
      let exameshTime = [];
      let exameshValue = [];

      this.thuPV.forEach(obj => {
        thuValue.push(obj.energy);
        thuTime.push(obj.time);
      });
      this.exameshWPP.forEach(obj => {
        exameshValue.push(obj.energy);
        exameshTime.push(obj.time);
      });

      let thuData = {
        type: "scatter",
        mode: "lines+markers",
        name: "THU PV",
        x: thuTime,
        y: thuValue,
        line: {
          //color: "#009933"
          color: "rgb(55, 128, 191)"
        }
      };
      let exameshData = {
        type: "scatter",
        mode: "lines+markers",
        name: "Examesh WPP",
        x: exameshTime,
        y: exameshValue,
        line: {
          //color: "#cc6600"
          color: "rgb(128, 0, 128)"
        }
      };
      let data = [thuData, exameshData];
      let layout = {
        xaxis: {
          title: "Time",
          type: "date",
          nticks: 5,
          tickformat: "%H:%M:%S",
          hoverformat: "%H:%M:%S",
          linecolor: "lightgray",
          linewidth: 0.5,

          titlefont: {
            color: "black"
          }
        },
        yaxis: {
          title: "Energy [kWh] per Block",
          tickformat: ",d",
          linecolor: "lightgray",
          linewidth: 0.5,
          tick0: 0,
          zeroline: false,
          titlefont: {
            color: "black"
          },
          exponentformat: "e"
        },
        legend: {
          orientation: "h",
          xanchor: "center",
          y: 1.2,
          x: 0.5
        },
        margin: {
          r: 50,
          l: 90,
          b: 50,
          t: 20,
          pad: 10
        }
      };
      Plotly.newPlot("production-plot", data, layout, { responsive: true });
    }
  },
  watch: {
    totalConsumption() {
      this.plotPercentage();
    }
  },

  async created() {
    this.getMetamaskAccount();
    this.contract = await ContractInstance();
    this.callPublicData();
    this.watchRealTimeProduction();
    this.watchRealTimeConsumption();
    this.addConsMarkers();
  },
  mounted() {
    this.initMap();
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.main {
  display: flex;
  flex-direction: column;
}

.top-bar {
  background-color: #f1eded;
}

.stats {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  margin: 0.5rem 4.5rem;
}

h4 {
  font-size: calc(1vw + 1vh + 1vmin);
  margin-bottom: 0.7rem;
  margin-top: 0.7rem;
  color: #394f7c;
}

.prod-color {
  color: #009933;
}

.cons-color {
  color: #cc6600;
}

.sub-heading {
  font-size: 0.8rem;
  font-style: italic;
}

.live-data,
.percentage {
  padding: 1rem;
  background-color: rgba(245, 239, 239, 0.582);
}

.percentage-wrapper {
  display: flex;
  justify-content: space-around;
  margin: 1.5rem 0.1rem;
}

.live-data-wrapper {
  display: flex;
  justify-content: space-around;
  margin: 1.5rem 0.1rem;
}

.live-data {
  padding-top: 0;
}

.percentage-wrapper {
  margin-bottom: 0;
}

.consumption-table,
.pie-chart {
  width: 30%;
  padding: 0.5rem;
}

.realTime-table {
  width: 45%;
  padding: 0.5rem;
}

.consumer-address {
  cursor: pointer;
}

.consumer-address:hover {
  background: #d6d2d2;
}

.active-consumer {
  background-color: #ecbe78;
}

.thu-examesh {
  width: 45%;
  padding: 0.5rem;
  min-height: 350px;
}

#production-plot,
#plot {
  width: 100%;
  height: 350px;
}

.test-enter, .test2-enter /* .list-leave-active below version 2.1.8 */ {
  opacity: 50;
  transform: translateY(-5px);
  background-color: #a2d893;
}

.test-move,
.test2-move {
  transition: transform 1s;
}

.test-enter-active,
.test2-enter-active {
  transition: all 1s ease-in-out;
}

.map {
  width: 35%;
  height: 435px;
}

.prod-cons {
  width: 35%;
  padding: 0.5rem;
  min-height: 350px;
}

#map {
  position: center;
  width: 100% !important;
  height: 100%;
  margin: auto;
  border: 1px solid #d2d4d6;
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.08);
}
</style>
