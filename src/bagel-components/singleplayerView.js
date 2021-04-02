
import {
    Redirect, useHistory
} from "react-router-dom";
import {useEffect, useRef, useState} from "react";
import {judgeAnswer} from "../bagel_modules/answerJudge";

let axios = require("axios");

/**
 * Component that returns the proper-looking button given if it's pressed or not.
 * @param {Object} props - React props.
 * @param {Boolean} props.pressed - If the button is pressed or not.
 * @param {Object} props.children - Objects that should be rendered in the button
 * @param {Function} props.clickEvent - the function that should fire when the button is pressed.
 * @returns {Object} - A pink button that can be used in the play control section.
 */
export function PlayControlButton(props) {
    if(props.pressed) {
        return (<button className="play-controls-pressed" onClick={props.clickEvent}>{props.children}</button>);
    } else {
        return (<button className="play-controls-unpressed" onClick={props.clickEvent}>{props.children}</button>);
    }

}

/**
 * Component that contains tossup data.
 * @param {Object} params - React params.
 * @param {Boolean} params.play - Is a tossup currently being played
 * @param {Boolean} params.buzz - Did the player buzz
 * @param {Boolean} params.next - Is the next button currently pressed
 * @param {int[]} params.subcategories - subcategories to use
 * @param {int[]} params.difficulties - difficulty list to use
 * @param {int} params.speed - Time in ms between every character
 * @param {Function} params.onRetrieveNext - Callback for when next tossup is retrieved.
 * @param {Boolean} params.reveal - Reveal all tossup text
 * @returns {Object} - The tossup text that matches the parameters
 */
function TossupController(params) {

    const [text, setText] = useState("");
    const [char, setChar] = useState(0);

    useEffect(() => {

        let timeout = params.speed;
        if(char === 0) {
            timeout += 600;
        }

        let charTO = setTimeout(() => {
            if(params.play && !params.buzz) {
                setChar(char + 1);
            }
        }, timeout);

        return () => {
            clearTimeout(charTO);
        }

    }, [params.speed, params.play, params.buzz, char]);


    useEffect(() => {
        axios.get(`http://localhost:8080/api/tossups?type=param&diffis=[${params.difficulties.join(",")}]&subcats=[${params.subcategories.join(",")}]&limit=1`).then((res) => {

            let tu = res.data.data[0];
            params.onRetrieveNext(tu);
            setChar(0);
            setText(tu.text);

        }).catch((err) => {
            console.log(err);
        })
    }, [params.next]);






    return (
        <>
            <div className="parameter-header shadow">Tossup 1 - Geography American</div>
            {params.reveal ? text : text.substr(0, char)}
        </>
    )
}


/**
 * Component that redirects to a page after a given timeout
 * @param {Object} params - React params.
 * @param {int} params.delay - The time to wait (in ms) before the redirect happens.
 * @returns {Object} - The React-router Redirect component after the timeout
 */
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



/**
 * Component that lets players play single player tossups
 * @returns {Object} - The single player view component.
 */
export function SingleplayerViewer() {

    const [redirectState, setRedirectState] = useState("");
    const [isPlaying, setIsPlaying] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [paramsOpen, setParamsOpen] = useState(false);
    const [nextSet, setNextSet] = useState(false);
    const [buzzed, setBuzzed] = useState(false);
    const [answer, setAnswer] = useState("");
    const [tossupNum, setTossupNum] = useState(1);
    const [tossupData, setTossupData] = useState({});
    const [answerTimeout, setAnswerTimeout] = useState(null);
    const [nextTossupTimeout, setNextTossupTimeout] = useState(null);
    const [tossupCorrect, setTossupCorrect] = useState(false);

    useEffect(() => {
        document.addEventListener("keydown", (e) => {
            if(e.key === " ") {
                if(!buzzed) {
                    e.preventDefault();
                    answerRef.current.focus(); // Focus answer element
                    setBuzzed(true); setIsPlaying(true) // Stop reading the tu and show visuals that you buzzed.
                    setAnswerTimeout(setTimeout(() => {

                        let correct = judgeAnswer(answerRef.current.value, tossupData.answer);
                        console.log(answer + " / " + tossupData.answer + " / " + correct);
                        if(correct) {
                            setTossupCorrect(true);

                            setNextTossupTimeout(setTimeout(() => {
                                setNextSet(true);
                            }, 2000));

                        } else {
                            setTossupCorrect(false);
                        }
                        setAnswer("");
                        setBuzzed(false);
                    }, 10000));
                }
            }
        }, false);
    }, [])

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
                                <PlayControlButton pressed={nextSet} clickEvent={() => {setNextSet(true); clearInterval(nextTossupTimeout); setTossupNum(tossupNum + 1)}}><i className="fa fa-forward"></i> NEXT</PlayControlButton>
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
                                        // Handle the buzz
                                        answerRef.current.focus(); // Focus answer element
                                        setBuzzed(true); setIsPlaying(true) // Stop reading the tu and show visuals that you buzzed.
                                        setAnswerTimeout(setTimeout(() => {

                                            let correct = judgeAnswer(answerRef.current.value, tossupData.answer);
                                            console.log(answer + " / " + tossupData.answer + " / " + correct);
                                            if(correct) {
                                                setTossupCorrect(true);

                                                setNextTossupTimeout(setTimeout(() => {
                                                    setNextSet(true);
                                                }, 2000));

                                            } else {
                                                setTossupCorrect(false);
                                            }
                                            setAnswer("");
                                            setBuzzed(false);
                                        }, 10000));
                                    } else {
                                        clearTimeout(answerTimeout);
                                        let correct = judgeAnswer(answerRef.current.value, tossupData.answer);
                                        console.log(answer + " / " + tossupData.answer + " / " + correct);
                                        if(correct) {
                                            setTossupCorrect(true);

                                            setNextTossupTimeout(setTimeout(() => {
                                                setNextSet(true);
                                            }, 2000));
                                        } else {
                                            setTossupCorrect(false);
                                        }
                                        setAnswer("");
                                        setBuzzed(false);


                                        setAnswer("");
                                    }

                                    setBuzzed(!buzzed);
                                    setIsPlaying(true);
                                }}><i className="fa fa-bell"></i> BUZZ</PlayControlButton>
                            </div>
                        </div>

                        <div className={"question-view-bg qbg-unlit " + (tossupCorrect ? "qbg-green" : (isPlaying ? (buzzed ? "qbg-yellow " : "qbg-red") : "")) }>
                            <div className="question-view">

                                <TossupController
                                    subcategories={[36]}
                                    difficulties={[1,2,3,4,5,6,7,8,9]}
                                    play={isPlaying}
                                    buzz={buzzed}
                                    next={nextSet}
                                    reveal={tossupCorrect}
                                    speed={25}
                                    onRetrieveNext={(tossup) => {setNextSet(false); setTossupCorrect(false); setTossupData(tossup)}}
                                />
                            </div>
                        </div>
                        <div className={"answer-box-bg qbg-unlit " + (buzzed ? "qbg-timer" : "")}>
                            <div className={"answer-box " + (buzzed ? "" : "disabled")}>
                                <input type="text" ref={answerRef} className={"answer-box-input" + (buzzed ? "" : "-disabled")} value={answer} placeholder="Answer" onChange={(event) => {
                                    setAnswer(event.target.value);
                                }}
                                onKeyDown={(e) => {
                                    if(e.key === "Enter" && buzzed && isPlaying) {
                                        // submit answer
                                        let correct = judgeAnswer(answerRef.current.value, tossupData.answer);
                                        console.log(answer + " / " + tossupData.answer + " / " + correct);
                                        if(correct) {
                                            setTossupCorrect(true);

                                            setNextTossupTimeout(setTimeout(() => {
                                                setNextSet(true);
                                            }, 2000));
                                        } else {
                                            setTossupCorrect(false);
                                        }
                                        clearInterval(answerTimeout)
                                        setAnswer("");
                                        setBuzzed(false);
                                        answerRef.current.blur();
                                    }
                                }}
                                />
                                <div id="tb-buzz-container">
                                    <button id="textbox-buzz" onClick={() => {

                                        // Handle the buzz
                                        answerRef.current.focus(); // Focus answer element
                                        setBuzzed(true); setIsPlaying(true) // Stop reading the tu and show visuals that you buzzed.
                                        setAnswerTimeout(setTimeout(() => {

                                            let correct = judgeAnswer(answerRef.current.value, tossupData.answer);
                                            console.log(answer + " / " + tossupData.answer + " / " + correct);
                                            if(correct) {
                                                setTossupCorrect(true);

                                                setNextTossupTimeout(setTimeout(() => {
                                                    setNextSet(true);
                                                }, 2000));
                                            } else {
                                                setTossupCorrect(false);
                                            }
                                            setAnswer("");
                                            setBuzzed(false);
                                        }, 10000));

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
