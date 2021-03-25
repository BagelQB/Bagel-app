
import {
    Redirect
} from "react-router-dom";
import {useEffect, useState} from "react";
import {RedirectWrapper} from "./redirectWrapper";

export function Logo() {
    return(
        <div className="wrapper">
            <div className="logo-wrapper">
                <div className="outer-circle">
                    <div className="outer-circle-fill">
                        <div className="inner-circle">
                            <div className="inner-circle-fill"></div>
                        </div>
                    </div>
                </div>
                <div className="logo-text-wrapper">
                    bagel
                </div>


            </div>
            <div className="logo-text-wrapper logo-text-wrapper-sub">
                The premier quizbowl practice tool
            </div>

        </div>
    );
}



export function FullMenu(props) {
    const [redirectState, setRedirectState] = useState("");

    if(redirectState !== "") {
        if(redirectState === "https://github.com/BagelQB") {
            return (<RedirectWrapper to={redirectState} />  );
        }
        return (<Redirect to={redirectState}/>)
    }


    return (
        <>

        <div className={"menu-wrapper " + (props.visible ? "" : "menu-fadeout")}>
            <Logo />
            <button className="login-button" style={{"marginTop": "100px"}} onClick={() => {
                setRedirectState("/singleplayer");
            }}>Bagel Alpha Test 1</button>


            <div className="sign-in">
                <p style={{"fontSize": "32px", "marginRight": "15px"}}>Sign in with: </p>
                <button className="login-button" style={{"marginLeft": "5px"}}><i className="fa fa-google icon-size"></i>
                </button>
                <button className="login-button"><i className="fa fa-github icon-size"></i></button>
            </div>
            <div className="sign-in">
                <button className="login-button" style={{"fontSize": "24px"}} onClick={() => {
                    setRedirectState("https://github.com/BagelQB"); ;
                }}>View this project on Github <i className="fa fa-github icon-size"></i></button>
            </div>
        </div>

        </>
    )
}
