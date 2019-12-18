<template>
  <div class="main">
    <div class="top-bar">
      <div class="top-header">
        <!-- <h1>OLI Systems</h1> -->
        <img src="../assets/img/OLI_logo.png" alt="gg" />
      </div>
      <div class="stats">
        <div class="stat">
          <p class="top-heading">THU PV</p>
          <span class="value-span">{{totalTHU}}</span>
          <span></span>
          <span class="sub-span">MWh</span>
        </div>
        <div class="stat">
          <p class="top-heading">Examesh WPP</p>
          <span class="value-span">{{totalExamesh}}</span>
          <span class="sub-span">MWh</span>
        </div>
        <div class="stat">
          <p class="top-heading">Total Production</p>
          <span class="prod-color value-span">{{totalProduction}}</span>
          <span class="sub-span">MWh</span>
        </div>
        <div class="stat">
          <p class="top-heading">Total Consumption</p>
          <span class="cons-color value-span">{{totalConsumption}}</span>
          <span class="sub-span">MWh</span>
        </div>
      </div>
    </div>

    <div class="percentage">
      <div class="percentage-wrapper">
        <div class="wrapper consumption-table">
          <div class="header">
            <h3>Charging Stations Overview</h3>
          </div>
          <div class="table">
            <div class="table-wrapper">
              <v-table :data="consumptionEvents">
                <thead slot="head">
                  <th>ETH Address</th>
                  <th>Power [kW]</th>
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

                    <td>{{row.power[row.power.length-1]/1000}}</td>

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

        <div class="percentage-pie-chart wrapper">
          <div class="header">
            <h3>Charging Power Origin</h3>
          </div>
          <div id="percentage-plot"></div>
        </div>
      </div>
    </div>

    <div class="generation-data">
      <div class="generation-data-wrapper">
        <div class="wrapper generation-table">
          <div class="header">
            <h3>Generation Assets Overview</h3>
          </div>
          <div class="table">
            <div class="table-wrapper">
              <v-table :data="sumProduction">
                <thead slot="head">
                  <th>ETH Address</th>
                  <th>Name</th>
                  <th>Power [kW]</th>
                  <th>Time</th>
                </thead>

                <transition-group name="test" tag="tbody" slot="body" slot-scope="{displayData}">
                  <tr v-for="(row, index) in displayData" :key="index">
                    <td v-tooltip="row.producer">{{row.producer}}</td>
                    <td>{{row.name}}</td>
                    <td>{{row.power[row.power.length-1]/1000}}</td>
                    <td v-tooltip="row.time[row.time.length-1]">{{row.time[row.time.length-1]}}</td>
                  </tr>
                </transition-group>
              </v-table>
              <h5 class="loader">Loading...</h5>
            </div>
          </div>
        </div>

        <div class="thu-examesh-pie wrapper">
          <div class="header">
            <h3>Generation Assets Plot</h3>
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
      totalConsumptionEvent: "",
      consumptionEvents: [],
      consumptionPower: [], // array to hold consumption values
      thuPV: [],
      thuPVPower: [], // array to hold only power values
      uniqueThuPV: [],
      uniqueExameshWpp: [],
      exameshWPP: [],
      exameshWPPPower: [], // array to hold only power values
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
      this.totalTHU = ((production / 1000000) * (10 / 3600)).toFixed(3);
    },
    async getTotalExameshProduction() {
      const production = await this.contract.methods
        .totalExameshWppProd()
        .call({ from: this.account });
      this.totalExamesh = ((production / 1000000) * (10 / 3600)).toFixed(3);
    },
    async getTotalProduction() {
      const production = await this.contract.methods
        .totalProduction()
        .call({ from: this.account });
      this.totalProduction = ((production / 1000000) * (10 / 3600)).toFixed(3);
    },
    async getTotalConsumption() {
      const consumption = await this.contract.methods
        .totalConsumption()
        .call({ from: this.account });
      this.totalConsumption = ((consumption / 1000000) * (10 / 3600)).toFixed(
        3
      );

      this.totalConsumptionEvent = consumption;
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
        center: [48.76, 9.4],
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

          if (
            event.returnValues.consumer ===
            "0x3D481ee06aFe587dAe5EAFA541c75c3D1F9dCdBc"
          ) {
            // store only consumption values for pie chart
            this.consumptionPower.push(event.returnValues.consumption);
          }

          this.callPublicData();
        })
        .on("error", console.error);
    },

    plotPercentage() {
      if (
        this.thuPVPower.length > 1 &&
        this.exameshWPPPower.length > 1 &&
        this.consumptionPower.length > 1
      ) {
        let tempThuPower = this.thuPVPower[this.thuPVPower.length - 1];
        // let tempExameshPower = this.exameshWPPPower[
        //   this.exameshWPPPower.length - 1
        // ];

        let tempConsumption = this.consumptionPower[
          this.consumptionPower.length - 1
        ];

        var data = [
          {
            values: [tempThuPower, tempConsumption - tempThuPower, 0],
            labels: ["THU PV", "Examesh WPP", "Gray Power"],
            type: "pie",
            marker: {
              colors: ["#1f77b4", "#ff7f0e", "#7f7f7f"]
            }
          }
        ];

        var layout = {
          height: 360,

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
      }
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
            // for pie chart
            this.thuPVPower.push(event.returnValues[2]);
          } else if (event.returnValues[1] === "Examesh WPP") {
            this.exameshWPP.push({
              energy: event.returnValues[2],
              time: timeConverter(event.returnValues[3])
            });
            // for pie chart
            this.exameshWPPPower.push(event.returnValues[2]);
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
      this.thuPV = this.getUnique(this.thuPV, "time");
      this.exameshWPP = this.getUnique(this.exameshWPP, "time");
      if (this.thuPV.length > 100) {
        this.thuPV = this.thuPV.slice(-100);
      }
      if (this.exameshWPP.length > 100) {
        this.exameshWPP = this.exameshWPP.slice(-100);
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
          type: "log",
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
          r: 20,
          l: 90,
          b: 50,
          t: 20,
          pad: 10
        }
      };
      Plotly.newPlot("production-plot", data, layout, { responsive: true });
    },

    // utility functions
    getUnique(arr, comp) {
      const unique = arr
        .map(e => e[comp])

        // store the keys of the unique objects
        .map((e, i, final) => final.indexOf(e) === i && i)

        // eliminate the dead keys & store unique objects
        .filter(e => arr[e])
        .map(e => arr[e]);

      return unique;
    },

    kFormatter(num) {
      return Math.abs(num) > 999
        ? Math.sign(num) * (Math.abs(num) / 1000).toFixed(1) + "k"
        : Math.sign(num) * Math.abs(num);
    }
  },

  watch: {
    consumptionPower() {
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

.top-header {
  padding: 1rem;
  background-color: #154360;
}

img {
  width: 100px;
  height: 100px;
}

td {
  font-size: 0.8rem;
}

.stats {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  margin: 0.5rem 4.5rem;
}

.top-heading {
  font-size: 1.2rem;
}

.value-span {
  font-size: calc(1vw + 1vh + 1vmin);
  margin-bottom: 0.7rem;
  margin-top: 0.7rem;
  color: #394f7c;
  font-weight: bold;
}

.stat {
  padding-bottom: 1rem;
}

.sub-span {
  padding-left: 1rem;
  font-weight: 600;
}

.prod-color {
  color: #009933;
}

.cons-color {
  color: #cc6600;
}

.percentage,
.generation-data {
  padding: 1rem;
  background-color: rgba(245, 239, 239, 0.582);
}

.percentage-wrapper {
  display: flex;
  justify-content: space-around;
  margin: 1.5rem 0.1rem;
}

.percentage-wrapper {
  margin-bottom: 0;
}

.consumption-table,
.percentage-pie-chart {
  width: 30%;
  padding: 0.5rem;
}

.map {
  width: 35%;
  height: 445px;
}

#map {
  position: center;
  width: 100% !important;
  height: 100%;
  margin: auto;
  border: 1px solid #d2d4d6;
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.08);
}

.generation-data-wrapper {
  display: flex;
  justify-content: space-around;
  margin: 1.5rem 0.1rem;
}

.generation-data {
  padding-top: 0;
}

.generation-table {
  width: 40%;
  padding: 0.5rem;
}

.thu-examesh-pie {
  width: 50%;
  padding: 0.5rem;
  min-height: 360px;
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

#production-plot {
  width: 100%;
  height: 360px;
}
</style>
