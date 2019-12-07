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

    <div class="live-data">
      <div class="live-data-wrapper">
        <div class="thu-examesh wrapper">
          <div class="header">
            <h3>THU PV Examesh WPP Energy Production</h3>
          </div>
          <div id="production-plot">
            <h5 class="loader">Loading...</h5>
          </div>
        </div>

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
                    <td>{{row.producer}}</td>
                    <td>{{row.name}}</td>
                    <td>{{row.power}}</td>
                    <td>{{row.time}}</td>
                  </tr>
                </transition-group>
              </v-table>
              <h5 class="loader">Loading...</h5>
            </div>
          </div>
        </div>

        <div class="prod-cons wrapper">
          <div class="header">
            <h3>Total Energy Production & Consumption</h3>
          </div>
          <div id="plot">
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
      thuPV: [],
      exameshWPP: [],
      sumProduction: [] //thuPV + exameshWPP production
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

    watchRealTimeProduction() {
      this.contract.events
        .Production({
          fromBlock: 0
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

          // sum production
          this.sumProduction.push({
            name: event.returnValues.name,
            producer: event.returnValues.producer,
            power: event.returnValues.production,
            time: timeConverter(event.returnValues.timestamp)
          });

          this.callPublicData();
          this.plotLiveProduction();
          this.plotTotalProdCons();
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
    },
    plotTotalProdCons() {
      var trace1 = {
        type: "bar",
        x: ["Production", "Consumption"],
        y: [this.totalProduction, this.totalConsumption],
        width: 0.2,
        marker: {
          color: ["#009933", "#cc6600"]
        }
      };

      var data = [trace1];

      var layout = {
        // title: "Current Energy Production & Consumption",
        // font: { size: 12 }

        margin: {
          r: 40,
          l: 50,
          b: 50,
          t: 20,
          pad: 10
        }
      };

      Plotly.newPlot("plot", data, layout, { responsive: true });
    }
  },
  async created() {
    this.getMetamaskAccount();
    this.contract = await ContractInstance();
    this.callPublicData();
    this.watchRealTimeProduction();
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
.live-data {
  padding: 1rem;
}

.live-data-wrapper {
  display: flex;
  justify-content: space-between;
  margin: 2.5rem 0.1rem;
}
.realTime-table {
  width: 35%;
  padding: 0.5rem;
}

.prod-cons {
  width: 25%;

  padding: 0.5rem;
  min-height: 350px;
}

.thu-examesh {
  width: 35%;
  padding: 0.5rem;
  min-height: 350px;
}

#production-plot,
#plot {
  width: 100%;
  height: 350px;
}
</style>
