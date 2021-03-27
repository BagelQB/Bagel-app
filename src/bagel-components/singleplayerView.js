
import {
    Redirect, useHistory
} from "react-router-dom";
import {useEffect, useRef, useState} from "react";
import {FullMenu} from "./mainMenu";
import {RedirectWrapper} from "./redirectWrapper";

let axios = require("axios");

export function PlayControlButton(props) {
    if(props.pressed) {
        return (<button className="play-controls-pressed" onClick={props.clickEvent}>{props.children}</button>);
    } else {
        return (<button className="play-controls-unpressed" onClick={props.clickEvent}>{props.children}</button>);
    }

}

function TossupText(params) {

    const [text, setText] = useState("");

    useEffect(() => {
        axios.get(`http://localhost:8080/api/tossups?type=cat&cat=${params.category[0]}&limit=1`).then((res) => {
            setText(res.data.data[0].text);
            params.onRetrieve();
        })
    }, [params.num])

    return (
        <>
            {text}
        </>
    )
}

export function DelayedRedirect(params) {
    const [canRedirect, setCanRedirect] = useState(false);

    useEffect(() => {
        setTimeout(() => {
            setCanRedirect(true);
        }, params.delay)
    }, [])

    if(canRedirect) {
        return <Redirect to={params.to} />
    } else {
        return <></>
    }
}

export function SingleplayerViewer() {

    const [redirectState, setRedirectState] = useState("");
    const [isPlaying, setIsPlaying] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [paramsOpen, setParamsOpen] = useState(false);
    const [nextSet, setNextSet] = useState(false);
    const [buzzed, setBuzzed] = useState(false);
    const [answer, setAnswer] = useState("");
    const [tossupNum, setTossupNum] = useState(1);


    let history = useHistory();
    const answerRef = useRef(null);


    let redirect = <DelayedRedirect to={redirectState} delay={600} />

    if(redirectState === "") {
        redirect = null;
    }


    return(
        <>
            {redirect}
        <div className={"main-wrapper " + (history.action === "REPLACE" ? "main-wrapper-fadein" : "")}>

            <div className="nav-bar shadow">
                <div className={"point-cursor"} onClick={() => {
                    setRedirectState("/menu");
                }}>
                    <div className="outer-circle-b">
                        <div className="inner-circle-b"></div>
                    </div>
                    <span className="title-text">bagel</span>
                </div>

            </div>
            <div className="content-wrapper">

                <div className="main-view shadow">
                    <div className="vert-flex">
                        <div className="mode-view shadow only-mobile">
                            <div className="flex-space">
                                <PlayControlButton pressed={settingsOpen} clickEvent={() => {setSettingsOpen(true)}}><i className="fa fa-gear"></i> SETTINGS</PlayControlButton>
                                <PlayControlButton pressed={isPlaying} clickEvent={() => {setIsPlaying(!isPlaying); setBuzzed(false)}}><i className="fa fa-play"></i> PLAY</PlayControlButton>
                                <PlayControlButton pressed={nextSet} clickEvent={() => {setNextSet(true); setTossupNum(tossupNum + 1)}}><i className="fa fa-forward"></i> NEXT</PlayControlButton>
                            </div>

                        </div>

                        <div className="mode-view shadow only-desktop flex-left-right">
                            Bagel Tossups (OFFLINE)
                            <div>
                                <PlayControlButton pressed={isPlaying} clickEvent={() => {
                                    setIsPlaying(!isPlaying);
                                    setAnswer("");
                                    setBuzzed(false);
                                }}><i className="fa fa-play"></i></PlayControlButton>
                                <PlayControlButton pressed={nextSet} clickEvent={() => {setNextSet(true); setTossupNum(tossupNum + 1)}}><i className="fa fa-forward"></i></PlayControlButton>
                                <PlayControlButton pressed={buzzed} clickEvent={() => {

                                    if(!buzzed === true) {
                                        answerRef.current.focus();
                                    } else {
                                        setAnswer("");
                                    }

                                    setBuzzed(!buzzed);
                                    setIsPlaying(true);
                                }}><i className="fa fa-bell"></i> BUZZ</PlayControlButton>
                            </div>
                        </div>

                        <div className={"question-view-bg qbg-unlit " + (isPlaying ? (buzzed ? "qbg-yellow " : "qbg-red") : "") }>
                            <div className="question-view">
                                <div className="parameter-header shadow">Tossup 1 - Geography American</div>
                                <TossupText difficulty={[1]} category={[15]} num={tossupNum} onRetrieve={() => {
                                    setNextSet(false);
                                }} />
                            </div>
                        </div>
                        <div className={"answer-box-bg qbg-unlit " + (buzzed ? "qbg-timer" : "")}>
                            <div className={"answer-box " + (buzzed ? "" : "disabled")}>
                                <input type="text" ref={answerRef} className={"answer-box-input" + (buzzed ? "" : "-disabled")} value={answer} placeholder="Answer" onChange={(event) => {
                                    setAnswer(event.target.value);
                                }} />
                                <div id="tb-buzz-container">
                                    <button id="textbox-buzz" onClick={() => {
                                        answerRef.current.focus();
                                        setBuzzed(true); setIsPlaying(true)
                                    }} style={{display: buzzed ? "none" : "block"}}><i className="fa fa-bell"></i> BUZZ</button>
                                </div>


                            </div>

                        </div>
                        <div className="log-bg qbg-unlit">
                            <div className="log-list">
                                <ul className="log-ul"></ul>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="side-view shadow only-desktop">


                    <div className="options-view">
                        <div className="mode-view shadow">
                            Room Settings
                        </div>
                        <div className="options-box-large small-shadow">
                            <div className="vert-flex">
                                <div className="option-header small-shadow flex-left-right">
                                    Params <button id="param-button" onClick={() => {setParamsOpen(true)}}><i className="fa fa-pencil"></i> EDIT</button>
                                </div>
                                <div className="parameter-box small-shadow" style={{"flexGrow": "3"}}>

                                    Room Options
                                </div>
                            </div>

                        </div>
                        <div className="options-box-small small-shadow">
                            <div className="vert-flex">
                                <div className="option-header small-shadow">
                                    Multiplayer options
                                </div>
                                <button id="cr-button"><i className="fa fa-pencil"></i> CREATE ONLINE ROOM</button>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
            <div className="only-mobile" >
                <div className="modal" style={{display: settingsOpen ? "block" : "none"}}>
                    <div className="modal-content">
                        <div className="options-view">
                            <div className="mode-view shadow flex-left-right">
                                Room Settings
                                <button className="play-controls-unpressed" onClick={() => {setSettingsOpen(false)}}><i className="fa fa-times"></i></button>

                            </div>
                            <div className="options-box-large small-shadow">
                                <div className="vert-flex">
                                    <div className="option-header small-shadow flex-left-right">
                                        Params <button id="param-button" onClick={() => {setParamsOpen(true)}}><i className="fa fa-pencil"></i> EDIT</button>
                                    </div>
                                    <div className="parameter-box small-shadow" style={{"flexGrow": "3"}}>
                                        Room Options
                                    </div>
                                </div>

                            </div>
                            <div className="options-box-small small-shadow">
                                <div className="vert-flex">
                                    <div className="option-header small-shadow">
                                        Multiplayer options
                                    </div>
                                    <button id="cr-button"><i className="fa fa-pencil"></i> CREATE ONLINE ROOM</button>
                                </div>

                            </div>
                        </div>

                    </div>

                </div>
            </div>

    <div className="modal" style={{display: paramsOpen ? "block" : "none"}}>
        <div className="modal-content">
            <div className="vert-flex">
                <div className="mode-view shadow flex-left-right">
                    Edit Params
                    <button className="play-controls-unpressed" onClick={() => {setParamsOpen(false)}}><i className="fa fa-times"></i></button>

                </div>
                <div className="flex-space" style={{"height": "100%"}}>

                    <div className="options-box-large small-shadow flex-space">
                        <div className="vert-flex" style={{"flexGrow": "2"}}>
                            <div className="parameter-box small-shadow" style={{"flexGrow": "3"}}>
                                Add Param
                            </div>
                            <div className="parameter-box small-shadow" style={{"flexGrow": "3", "marginTop": "5px"}}>
                                Presets
                            </div>
                        </div>

                        <div className="vert-flex" style={{"flexGrow": "2", "paddingLeft": "5px"}}>
                            <div className="parameter-box small-shadow" style={{"flexGrow": "3"}}>
                                Param List
                            </div>
                        </div>

                    </div>


                </div>
            </div>

        </div>

    </div>

    <div className={"redirect-cover"} style={{"display": redirectState === "" ? "none" : "block"}} />


        </>

    )

}

/*


* */
