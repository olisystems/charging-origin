
const SampleContract = artifacts.require('SampleContract')
contract('SampleContract', function (accounts) {

    let metamaskAccount = accounts[0]
    let sampleContract;
    before('setup contract', async () => {
        sampleContract = await SampleContract.deployed()
    });

    it("can set the value", async () => {

        // set data value
        await sampleContract.setData(2, { from: metamaskAccount });
        // get value
        let data = await sampleContract.getData.call();

        assert.equal(data, 2, 'Failed to set data');

    })
});