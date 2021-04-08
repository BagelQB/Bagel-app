import {
    Redirect, useHistory
} from "react-router-dom";
import {useEffect, useState} from "react";
import {DelayedRedirect} from "./Singleplayer/singleplayerView";
import {
    IfFirebaseAuthed, IfFirebaseUnAuthed
} from "@react-firebase/auth";
import "firebase/auth";

import firebase from "firebase/app";
import "firebase/auth";
import axios from "axios";
import {ConnectionIndicator} from "./websocketComponents";

const googleAuthProvider = new firebase.auth.GoogleAuthProvider();
const githubAuthProvider = new firebase.auth.GithubAuthProvider();

let localUserData = {};


/**
 * Returns the Bagel Logo.
 * @param {Object} props - React props.
 * @param {Boolean} props.fadeIn - If the logo should run the fade in animation
 * @param {Boolean} props.fade - If the logo should run the shining intro animation.
 * @returns {Object} - The Bagel Logo
 */
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


/**
 * Returns text based on the query from the secure database, without erroring out if the user is not logged in yet.
 * @param {Object} props - React props.
 * @param {Boolean} props.refresh - If the component should make a new query to get the data or if it should use stored local data
 * @param {String} props.query - What data the component should get from the secure databased.
 * @returns {Object} - The text with values from the database.
 */
function SecureDBQuery(props) {

    const [text, setText] = useState("");
    const [refreshed, setRefreshed] = useState(false);

    useEffect(() => {
        if(props.refresh) {
            if(refreshed) return;
            setRefreshed(true);
            if(firebase.auth().currentUser) {
                firebase.auth().currentUser.getIdToken(false).then((token) => {
                    axios.get(`http://localhost:8080/api/users/?id=${firebase.auth().currentUser.uid}&auth=${token}`).then((user) => {
                        localUserData = user.data.data;
                        console.log(localUserData);
                        setText(localUserData[props.query]);
                    }).catch((err) => {
                        console.log(err);
                        setText("!Server Error!");
                    })
                });
            }
        } else {
            console.log(localUserData);
            setText(localUserData[props.query]);
        }
    }, [localUserData]);


    return <>{text}</>
}


/**
 * Wrapper for the Bagel main menu.
 * @param {Object} props - React props.
 * @param {Boolean} props.visible - If the menu should be visible.
 * @returns {Object} - The bagel main menu
 */
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
                                setRedirectState("/singleplayer/tk_alpha")
                            }}>Singleplayer</div>
                            <div className={"menu-button"}>Multiplayer</div>
                        </div>
                    </div>
                    <div className={"menu-divider"}/>
                    <IfFirebaseUnAuthed>
                        <div className={"menu-description-text"}>
                            <div className={"menu-account-status"}>You are not signed in.</div>
                            <br/>
                            <div style={{"textAlign": "center"}}>Sign in to play Bagel Multiplayer and to save your game
                                stats.
                            </div>
                            <br/><br/>
                            <div className={"login-button"} onClick={() => {

                                // Get data or create account.
                                firebase.auth().signInWithPopup(googleAuthProvider).then((res) => {
                                    console.log("signin");
                                    firebase.auth().currentUser.getIdToken(true).then((token) => {
                                        console.log("token");
                                        axios.get(`http://localhost:8080/api/users/?id=${firebase.auth().currentUser.uid}&auth=${token}`).then((res) => {
                                            localUserData = res.data.data;
                                        }).catch((err) => {
                                            console.log("doing the post thing")
                                            axios.post(`http://localhost:8080/api/users/?auth=${token}`).then((res2) => {
                                                console.log(res2);
                                            }).catch((err2) => {console.log(err2);})
                                        })
                                    })
                                });

                            }}>Sign in with <i
                                className={"fa fa-google"}></i> Google</div>
                            <div className={"login-button"} onClick={() => {
                                firebase.auth().signInWithPopup(githubAuthProvider);
                            }}>Sign in with <i
                                className={"fa fa-github"}></i> Github</div>
                            <br/><br/><br/><br/><br/>
                            <div style={{"textAlign": "center"}}>Sign-in is not required for singleplayer play.</div>
                        </div>
                    </IfFirebaseUnAuthed>
                    <IfFirebaseAuthed>
                        <div className={"menu-description-text"}>
                            <div className={"menu-account-status"}>You are signed in</div>
                            <br/>
                            <div style={{"textAlign": "center"}}>Welcome back, <SecureDBQuery query={"name"} refresh={true} /></div>
                            <br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/>
                            <ConnectionIndicator />


                            <div className={"login-button"} onClick={() => {
                                firebase.auth().signOut();
                            }}>Sign out</div>
                        </div>
                    </IfFirebaseAuthed>
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
