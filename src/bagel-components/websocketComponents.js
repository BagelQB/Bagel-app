import {useEffect, useState} from "react";

let network = require("../bagel_modules/networkModule");


/**
 * Self contained indicator of connection status.
 * @returns {Object} - The connection indicator.
 */
export function ConnectionIndicator() {
    const [pingText, setPing] = useState(0);
    const [minResponseTime, setMRT] = useState(0);

    useEffect(() => {
        let pingInterval = setInterval(() => {
            setPing(network.getPing());
        }, 650)

        network.getResponseTime().then((mrt) => {
            setMRT(mrt)
        });

        let mrtInterval = setInterval(() => {

            network.getResponseTime().then((mrt) => {
                setMRT(mrt)
            });
        }, 30000)

        return function cleanup() {
            clearInterval(pingInterval);
            clearInterval(mrtInterval);
        }
    }, [])
    // This component self sufficiently shows connection status to the api and ws.
    return <div className={"option-header redirect-center"} style={{margin: "0px"}}>
        <div style={{width: "30%"}}className={"connection-status " + (
            network.getConnected() ? pingText<350 ? (pingText<100 ? "conn-green" : "conn-yellow") : "conn-red" : "conn-red"
        )}>
            <div>
                <i className="fa fa-bolt"></i>  WS

            </div>
                <span className={"connection-text"}>{network.getConnected() ? ` ping: ${pingText}ms` : " Disconnected"}</span>

        </div>

        <div style={{"marginLeft": "10px", width: "30%"}} className={"connection-status " + (
            minResponseTime !== -1 ? minResponseTime< 3000 ? (minResponseTime< 1000 ? "conn-green" : "conn-yellow") : "conn-red" : "conn-red"
        )}>
            <div>
                <i className="fa fa-wifi"></i> API
            </div>

            <span className={"connection-text"}>{minResponseTime !== -1 ? ` MRT: ${minResponseTime}ms` : " Disconnected"}</span>
        </div>

        <div style={{"marginLeft": "10px", width: "30%"}} className={"connection-status " + (
            "conn-yellow"
        )}>
            <div>
                <i className="fa fa-database"></i> DB
            </div>

            <span className={"connection-text"}>{"Syncing (5%)"}</span>
        </div>


    </div>
}