
const ChargingOrigin = artifacts.require('ChargingOrigin')
const truffleAssert = require('truffle-assertions');

contract('ChargingOrigin', function (accounts) {

    let defaultAccount = accounts[0]
    let chargingOrigin;
    before('setup contract', async () => {
        chargingOrigin = await ChargingOrigin.deployed()
    });

    it("can send the consumption data", async () => {

        let consumption = 20;
        let event = await chargingOrigin.sendConsumption(consumption, { from: defaultAccount })
        let totalConsumption = await chargingOrigin.totalConsumption.call()

        assert.equal(totalConsumption, consumption, 'Failed to set total consumption')
        // test event
        truffleAssert.eventEmitted(event, 'Consumption')

    })

    it("can send the ULM production data", async () => {
        let ulmP = 30
        let xameshP = 20
        let totalP = ulmP + xameshP

        let event1 = await chargingOrigin.sendProduction(ulmP, 'ULM PV', { from: defaultAccount })
        let event2 = await chargingOrigin.sendProduction(xameshP, 'Xamesh', { from: defaultAccount })

        let ulmProduction = await chargingOrigin.totalUlmProduction.call()
        let xameshProduction = await chargingOrigin.totalXameshProduction.call()
        let totalProduction = await chargingOrigin.totalProduction.call()

        assert.equal(ulmProduction, ulmP, 'Failed to set ulm production')
        assert.equal(xameshProduction, xameshP, 'Failed to set xamesh production')
        assert.equal(totalProduction, totalP, 'Failed to set total production')
        // test event
        truffleAssert.eventEmitted(event1, 'Production')
        truffleAssert.eventEmitted(event2, 'Production')

    })
});