import {useEffect, useState} from "react";

let axios = require("axios");

let W3CWebSocket = require('websocket').w3cwebsocket;

let client = new W3CWebSocket('ws://localhost:8000/', 'echo-protocol');

let connected = false;

function Packet(header, data) {
    return header + ":ws:" + (JSON.stringify(data) || "null");
}

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



function getResponseTime() {
    return new Promise((resolve, reject) => {
        let start = Date.now();
        axios.get("http://localhost:8080/").then((res) => {
            resolve(Date.now()-start);
        }).catch((err) => {
            resolve(-1);
        })
    });
}


export function ConnectionIndicator(props) {
    const [pingText, setPing] = useState(0);
    const [minResponseTime, setMRT] = useState(0);

    useEffect(() => {
        let pingInterval = setInterval(() => {
            setPing(ping);
        }, 650)

        getResponseTime().then((mrt) => {
            setMRT(mrt)
        });

        let mrtInterval = setInterval(() => {

            getResponseTime().then((mrt) => {
                setMRT(mrt)
            });
        }, 30000)

        return function cleanup() {
            clearInterval(pingInterval);
            clearInterval(mrtInterval);
        }
    }, [])
    // This component self sufficiently shows connection status to the api and ws.
    return <div className={"option-header redirect-center"} style={{margin: "20px"}}>
        <div style={{width: "45%"}}className={"connection-status " + (
            connected ? ping<350 ? (ping<100 ? "conn-green" : "conn-yellow") : "conn-red" : "conn-red"
        )}>
            <div>
                <i className="fa fa-bolt"></i>  WS

            </div>
                <span className={"connection-text"}>{connected ? ` ping: ${pingText}ms` : " Disconnected"}</span>

        </div>

        <div style={{"marginLeft": "10px", width: "45%"}} className={"connection-status " + (
            minResponseTime !== -1 ? minResponseTime< 3000 ? (minResponseTime< 1000 ? "conn-green" : "conn-yellow") : "conn-red" : "conn-red"
        )}>
            <div>
                <i className="fa fa-wifi"></i> API
            </div>

            <span className={"connection-text"}>{minResponseTime !== -1 ? ` MRT: ${minResponseTime}ms` : " Disconnected"}</span>
        </div>


    </div>
}