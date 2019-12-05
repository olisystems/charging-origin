<template>
  <div class="main">
    <div class="set-data">
      <input type="number" v-model="data" placeholder="Please enter a number" />
      <button @click="setData">Set Data</button>
    </div>

    <div class="set-data">
      <h2>Last set Value: {{value}}</h2>
      <button @click="getData">Get Data</button>
    </div>
  </div>
</template>

<script>
import web3 from "../assets/js/web3";
import ContractInstance from "../assets/js/ContractInstance";

export default {
  name: "HelloWorld",
  data() {
    return {
      account: "",
      contract: "",
      data: "",
      value: ""
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
    async getData() {
      this.value = await this.contract.methods.getData().call();
      console.log(this.value);
    },
    setData() {
      this.contract.methods.setData(this.data).send({ from: this.account });
      this.data = "";
    }
  },
  async created() {
    this.getMetamaskAccount();
    this.contract = await ContractInstance();
    this.getData();
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
