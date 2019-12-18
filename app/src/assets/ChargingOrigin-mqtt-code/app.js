const mqtt = require('mqtt');
const Web3 = require('web3');
const contract = require('./contract')

web3 = new Web3("ws://80.158.47.134:7546");
const ChargingOrigin = new web3.eth.Contract(contract.abi, contract.address);

const thuPV = '0x4DF329c10Fb40e6d89B2Cf9F89f982727b96D26f'
const exameshWPP = '0x631cBE70aa9d6a970e19273298692569eAbCF911'
const cp1 = '0x3D481ee06aFe587dAe5EAFA541c75c3D1F9dCdBc'

var server = "mqtts://unbelievable-politician.cloudmqtt.com";  // the ip of your MQTT broker
var options = {
    client_id: "DOSE",   // the client ID sent to MQTT 
    keep_alive: 60,         // keep alive time in seconds
    port: 8883,           // port number
    clean_session: true,
    username: "gmnzhypg",
    password: "zEb0WyhKguIn",
    protocol_name: "MQTT",  // or MQIsdp, etc..
    protocol_level: 4,      // protocol level
};

var client = mqtt.connect(server, options);


client.on('error', (err) => {
    console.log(err);
    client.end();
});

client.on('offline', () => {
    console.log('Reconnecting the Client');
    client.reconnect();
});

client.on('connect', () => {
    console.log("Connected");

    client.subscribe('DOSE/OLI_21/chargingStation/activePower/Demand');

    //client.subscribe('DOSE/OLI_50/PV/activePower/Supply');
    client.subscribe('EXA/OLI_IDS_3/activeEnergy/Supply');
})

// array to store examesh wpp energy values
let exameshArr = []

client.on('message', (topic, message) => {

    if (topic === 'DOSE/OLI_21/chargingStation/activePower/Demand') {
        console.log(`Topic is ${topic}`);
        // console.log(message.toString());

        let result = JSON.parse(message)
        let power = result.activePower
        console.log(power);

        sendConsumption(power, 'Oli Charging Station', cp1);
    }

    // THU pv
    if (topic === 'DOSE/OLI_50/PV/activePower/Supply') {
        console.log(`Topic is ${topic}`);
        console.log(message.toString());

        let result = JSON.parse(message)
        let power = result.activePower
        console.log(power);

       // sendProduction(power, 'THU PV', thuPV);
    }

    // Examesh WPP
    if (topic === 'EXA/OLI_IDS_3/activeEnergy/Supply') {
        console.log(`Topic is ${topic}`);
        // console.log(message.toString());

        let result = JSON.parse(message)
        let energy = result.activeEnergy

        exameshArr.push(energy)
        if (exameshArr.length > 1) {
            let power = (exameshArr[exameshArr.length - 1] - exameshArr[exameshArr.length - 2]) / 5

           // sendProduction(power, 'Examesh WPP', exameshWPP);
        }

        //console.log(exameshArr);
        

    }
})

function sendProduction(value, name, sender) {
    ChargingOrigin.methods.sendProduction(value, name).send({ from: sender })
}

function sendConsumption(value, name, sender) {
    ChargingOrigin.methods.sendConsumption(value, name).send({ from: sender })
}

