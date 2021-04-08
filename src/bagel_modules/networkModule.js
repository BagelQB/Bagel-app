let axios = require("axios");

let W3CWebSocket = require('websocket').w3cwebsocket;

let client = new W3CWebSocket('ws://localhost:8000/', 'echo-protocol');

let network = {};


let connected = false;

/**
 * Makes a string from header and a data object.
 * @param {String} header - The header of the packet.
 * @param {Object} data - The data to be sent.
 * @returns {String} - The websocket packet
 */
function Packet(header, data) {
    return header + ":ws:" + (JSON.stringify(data) || "null");
}

/**
 * Decodes a websocket packet
 * @param {String} packetString - The packet data
 * @returns {Object} - The decoded header and data of the packet.
 */
function getObjFromPacket(packetString) {
    let [header, obj] = packetString.split(":ws:");
    return {header: header, data: JSON.parse(obj)};
}

client.onerror = function() {
    console.log('Connection Error');
    connected = false;
};

client.onopen = function() {
    console.log('WebSocket Client Connected');
    connected = true;

    function sendNumber() {
        if (client.readyState === client.OPEN) {
            setInterval(() => {
                client.send(Packet("ping", {time: Date.now()}));
            }, 500)
        }
    }
    sendNumber();
};

client.onclose = function() {
    console.log('echo-protocol Client Closed');
    connected = false;
};

let ping = 0;

client.onmessage = function(e) {
    let {header, data} = getObjFromPacket(e.data);

    if(header === "pong") {
        ping = Date.now() - parseInt(data.time);
    }
};


/**
 * Returns the minimum response time to the API by making a GET request to "/"
 * @returns {int} - The minimum response time
 */
network.getResponseTime = () => {
    return new Promise((resolve, reject) => {
        let start = Date.now();
        axios.get("http://localhost:8080/").then((res) => {
            resolve(Date.now()-start);
        }).catch((err) => {
            resolve(-1);
        })
    });
}

/**
 * Returns the websocket ping
 * @returns {int} - The ping
 */
network.getPing = () => {
    return ping;
}

/**
 * Returns if the websocket is connected
 * @returns {int} - Connection status
 */
network.getConnected = () => {
    return connected;
}

/**
 * Sends data to the server via websocket.
 * @param {String} header - The header of the data to send
 * @param {Object} data - the data to send.
 */
network.send = (header, data) => {
    if (client.readyState === client.OPEN) {
        client.send(Packet(header, data));
    }
}

module.exports = network;

