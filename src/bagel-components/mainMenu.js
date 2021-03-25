
import {
    Redirect
} from "react-router-dom";
import {useEffect, useState} from "react";

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

export function MenuButtons(props) {
    const [redirectState, setRedirectState] = useState("");

    if(redirectState !== "") {
        return (<Redirect to={redirectState}/>)
    }


    return (
        <>

            <button className="login-button" style={{"margin-top": "100px"}} onClick={() => {
                setRedirectState("/singleplayer");
            }}>Bagel Alpha Test 1</button>
        </>
    );
}

export function FullMenu(props) {
    if(!props.visible) return <></>

    return (
        <>

        <div className="menu-wrapper">
            <Logo />
            <MenuButtons spPressEvent={() => {
                props.playModeSetter(false);
                props.menuSetter(false);
            }} mpPressEvent={() => {
                //props.playModeSetter(true);
                //props.menuSetter(false);
            }} />
            <div className="sign-in">
                <p style={{"font-size": "32px", "margin-right": "15px"}}>Sign in with: </p>
                <button className="login-button" style={{"margin-left": "5px"}}><i className="fa fa-google icon-size"></i>
                </button>
                <button className="login-button"><i className="fa fa-github icon-size"></i></button>
            </div>
        </div>

        </>
    )
}
