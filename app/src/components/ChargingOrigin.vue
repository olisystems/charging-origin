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
        <div class="thu-examesh wrapper">
          <div class="header">
            <h3>THU PV Examesh WPP Energy Production</h3>
  </div>
          <div id="production-plot"></div>
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
            </div>
          </div>
        </div>

</template>

<script>
import web3 from "../assets/js/web3";
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
  async created() {
    this.getMetamaskAccount();
    this.contract = await ContractInstance();
    this.callPublicData();
    // this.watchProduction();
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

.thu-examesh {
  width: 35%;
  padding: 0.5rem;
  min-height: 350px;
}
</style>
