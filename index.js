const express = require('express');
const consul = require('consul')();
const ip = require('ip');

const listenPort = parseInt(process.env.PORT) || 3000;
const serviceName = 'node-service';
const serviceId = `${serviceName}-${listenPort}`;
const address = ip.address();

const app = express();
let listener;

app.get('/health', (req, res) => {
    res.json({ status: "UP" });
})

app.get('/ns/a', (req, res) => {
    return res.send(`Hello World from ${listener.address().port}!`);
})
// console.log(`Example app listening on port ${port[i]}!`);

listener = app.listen(listenPort, () => console.log(`Example app listening on port ${listenPort}!`));

const consulOptions = {
    name: serviceName, id: serviceId, port: listenPort, address: address,
    tags: ["secure=false"],
    check: {
        http: `http://${address}:${listenPort}/health`,
        interval: '60s',
        status: "passing"
    }
};
consul.agent.service.register(consulOptions, function (err) {
    if (err) throw err;
});

process.on('SIGINT', function () {
    consul.agent.service.deregister(serviceId, function (err) {
        if (err) throw err;
        process.exit();
    });
})
