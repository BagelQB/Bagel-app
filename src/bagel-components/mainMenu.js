import {
    Redirect, useHistory
} from "react-router-dom";
import {useEffect, useState} from "react";
import {RedirectWrapper} from "./redirectWrapper";
import {DelayedRedirect} from "./singleplayerView";

export function Logo(props) {
    return (
        <div className={props.fadeIn ? "menu-fadein" : ""}>
            <div className="logo-wrapper">
                <div className={"outer-circle " + (props.fade ? "logo-animation logo-slow" : "")}>
                    <div className="outer-circle-fill">
                        <div className={"inner-circle " + (props.fade ? "logo-animation logo-slow" : "")}>
                            <div className="inner-circle-fill"></div>
                        </div>
                    </div>
                </div>
                <div className={"logo-text-wrapper " + (props.fade ? "logo-animation" : "")}>
                    bagel
                </div>


            </div>
            <div
                className={"logo-text-wrapper logo-text-wrapper-sub " + (props.fade ? "logo-animation logo-sub-slow" : "")}>
                The premier quizbowl practice tool
            </div>

        </div>
    );
}


export function FullMenu(props) {
    let history = useHistory();
    let [hoverMenuStyle, updateHoverMenuStyle] = useState({
        visibility: "hidden",
        opacity: 0
    });
    const [redirectState, setRedirectState] = useState("");

    let redirect = <DelayedRedirect to={redirectState} delay={600}/>

    if (redirectState === "") {
        redirect = null;
    }

    return (
        <>
            {redirect}
            <Logo fade={history.action === "POP"} fadeIn={history.action === "REPLACE"}/>
            <div
                className={"menu-wrapper " + (props.visible ? (history.action === "REPLACE" ? "menu-fadein" : "") : "menu-fadeout ")}>
                <div className={"flex-horizontal"}>
                    <div style={{"flexGrow": "2", "marginTop": "100px", "marginBottom": "100px"}}>\
                        <br/>
                        <div id="play-button-container" onMouseEnter={() => {
                            updateHoverMenuStyle({
                                visibility: "visible",
                                opacity: 1
                            });
                        }} onMouseLeave={() => {
                            updateHoverMenuStyle({
                                visibility: "hidden",
                                opacity: 0
                            });
                        }}>
                            <div className={"menu-button"} href="#">Play</div>
                        </div>
                        <br/>
                        <div className={"menu-button"}>Settings</div>
                        <br/>
                        <div className={"menu-button"}>Credits</div>
                    </div>
                    <div className={"menu-divider"}/>
                    <div style={{"flexGrow": "2"}} className={"menu-description-text"}>
                        <div className="hover-menu vert-flex-c" onMouseEnter={() => {
                            updateHoverMenuStyle({
                                visibility: "visible",
                                opacity: 1
                            });
                        }} onMouseLeave={() => {
                            updateHoverMenuStyle({
                                visibility: "hidden",
                                opacity: 0
                            });
                        }} style={hoverMenuStyle}>
                            <div className={"menu-button"} onClick={() => {
                                setRedirectState("/singleplayer/alpha")
                            }}>Singleplayer</div>
                            <div className={"menu-button"}>Multiplayer</div>
                        </div>
                    </div>
                    <div className={"menu-divider"}/>
                    <div className={"menu-description-text"}>
                        <div className={"menu-account-status"}>You are not signed in.</div>
                        <br/>
                        <div style={{"textAlign": "center"}}>Sign in to play Bagel Multiplayer and to save your game
                            stats.
                        </div>
                        <br/><br/>
                        <div className={"login-button"} >Sign in with <i
                            className={"fa fa-google"}></i> Google</div>
                        <div className={"login-button"}>Sign in with <i
                            className={"fa fa-github"}></i> Github</div>
                        <br/><br/><br/><br/><br/>
                        <div style={{"textAlign": "center"}}>Sign-in is not required for singleplayer play.</div>
                    </div>
                </div>
            </div>
            <div className={"redirect-cover"} style={{"display": redirectState === "" ? "none" : "block"}}/>

        </>
    )
}

/*
*                     <button className="login-button" style={{"marginTop": "100px"}} onClick={() => {
                        setRedirectState("/singleplayer/alpha");
                    }}>Bagel Alpha Test 1</button>
                    <div className={"flex-left-right"}>

                    </div>

                    <div className="sign-in">
                        <p style={{"fontSize": "32px", "marginRight": "15px"}}>Sign in with: </p>
                        <button className="login-button" style={{"marginLeft": "5px"}}><i className="fa fa-google icon-size"></i>
                        </button>
                        <button className="login-button"><i className="fa fa-github icon-size"></i></button>
                    </div>
                    <div className="sign-in">
                        <button className="login-button" style={{"fontSize": "18px", "marginTop": "50px"}} onClick={() => {
                            setRedirectState("https://github.com/BagelQB"); ;
                        }}>View this project on Github <i className="fa fa-github icon-size"></i></button>
                    </div>
* */
