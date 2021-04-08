
import {
    Redirect, Route, Switch, useHistory, useLocation, useRouteMatch
} from "react-router-dom";
import {useEffect, useRef, useState} from "react";
import {judgeAnswer} from "../../bagel_modules/answerJudge";
import {MultirangeSlider, SelectBox, Slider} from "../../bagel_modules/utilityComponents";

const subcategoryMapping = require("../../bagel_mappings/subcategoryMapping.json");

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
 * @param {Object} props - React props.
 * @param {Boolean} props.play - Is a tossup currently being played
 * @param {Boolean} props.buzz - Did the player buzz
 * @param {Boolean} props.next - Is the next button currently pressed
 * @param {int[]} props.subcategories - subcategories to use
 * @param {int[]} props.difficulties - difficulty list to use
 * @param {int} props.speed - Time in ms between every character
 * @param {Function} props.onRetrieveNext - Callback for when next tossup is retrieved.
 * @param {Function} props.onStart - Callback for when the tossup reading starts
 * @param {Boolean} props.reveal - Reveal all tossup text
 * @returns {Object} - The tossup text that matches the parameters
 */
function TossupController(props) {

    const [text, setText] = useState("");
    const [subcat, setSubcat] = useState(0);
    const [num, setNum] = useState(0);
    const [char, setChar] = useState(0);

    useEffect(() => {
        let timeout = props.speed;
        if(char === 0) {

            if(props.play && !props.buzz) {
                setNum(num + 1);
                props.onStart(num);
            }

            timeout += 600;
        }

        let charTO = setTimeout(() => {
            if(props.play && !props.buzz) {
                setChar(char + 1);
            }
        }, timeout);

        return () => {
            clearTimeout(charTO);
        }

    }, [props.speed, props.play, props.buzz, char]);


    useEffect(() => {
        if(props.next === true) {
            axios.get(`http://localhost:8080/api/tossups?type=param&diffis=[${props.difficulties.join(",")}]&subcats=[${props.subcategories.join(",")}]&limit=1`).then((res) => {

                let tu = res.data.data[0];
                props.onRetrieveNext(tu);
                setChar(0);
                setSubcat(tu.subcategory_id);
                setText(tu.text);

            }).catch((err) => {
                console.log(err);
            })
        }
    }, [props.next, props.difficulties, props.subcategories]);






    return (
        <>
            <div className="parameter-header shadow">{num-1 > 0 ? `Tossup ${num-1} - ` : ""}{subcategoryMapping.forwards[subcat] ? subcategoryMapping.forwards[subcat].name : "Select params to play"}</div>
            {props.reveal ? text : text.substr(0, char)}
        </>
    )
}


/**
 * Component that redirects to a page after a given timeout
 * @param {Object} props - React props.
 * @param {int} props.delay - The time to wait (in ms) before the redirect happens.
 * @returns {Object} - The React-router Redirect component after the timeout
 */
export function DelayedRedirect(props) {
    const [canRedirect, setCanRedirect] = useState(false);

    useEffect(() => {
        setTimeout(() => {
            setCanRedirect(true);
        }, props.delay)
    }, [])

    if(canRedirect) {
        return <Redirect to={props.to} />
    } else {
        return <></>
    }
}

/**
 * Component that converts an array of log events to a list of logs.
 * @param {Object} props - React props.
 * @param {Object[]} props.logs - The game logs
 * @returns {Object} - A list of logs.
 */
function LogCollection(props) {


    return (props.logs.slice(1, props.logs.length).map(({effect, render}) => {

        return (
            <li>
                <div className={"answer-box-bg " + effect + " onlyHover"}>
                    <div className="answer-box">
                        {render}
                    </div>
                </div>
            </li>
        )

        })

        );
}

/**
 * Component that lets players play single player tossups
 * @returns {Object} - The single player tossups component
 */
export function TKView() {


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
    const [log, setLog] = useState([{effect: "qbg-focus", render: <>This is the beginning of the game log. Select some params and click&nbsp;&nbsp; <i className="fa fa-play"></i> &nbsp;&nbsp;to begin playing.</>}]);



    //Settings
    const [readingSpeed, setReadingSpeed] = useState(460)

    //Params
    const [difficultySliderMin, setDifficultySliderMin] = useState(1);
    const [difficultySliderMax, setDifficultySliderMax] = useState(9);
    const [subcatList, setSubcatList] = useState([]);

    useEffect(() => {

        document.addEventListener("keydown", (e) => {
            if(e.key === " ") {

                if(document.activeElement.className === "answer-box-input") return;

                if(!buzzed) {
                    e.preventDefault();
                    answerRef.current.focus(); // Focus answer element
                    setBuzzed(true); setIsPlaying(true) // Stop reading the tu and show visuals that you buzzed.
                    setAnswerTimeout(setTimeout(() => {

                        let correct = judgeAnswer(answerRef.current.value, tossupData.answer);
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


    const answerRef = useRef(null);





    return(
        <>


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
                            Bagel Tossups
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
                                    subcategories={subcatList}
                                    difficulties={Array(difficultySliderMax + 1).fill().map((_, idx) => difficultySliderMin + idx + 1)} //Generate list of numbers between 2 ranges (https://stackoverflow.com/a/33457557)
                                    play={isPlaying}
                                    buzz={buzzed}
                                    next={nextSet}
                                    reveal={tossupCorrect}
                                    speed={1000/(readingSpeed* 1/12)}
                                    onRetrieveNext={(tossup) => {setNextSet(false); setTossupCorrect(false); setTossupData(tossup)}}
                                    onStart={(number) => {
                                        let newLog = log;
                                        newLog.unshift({effect: "qbg-yellow", render: <>Tossup {number+1}</>});
                                        setLog(newLog);
                                        console.log(newLog);

                                    } }
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
                                <ul className="log-ul">
                                    {log.length > 0 ?
                                        <li>
                                            <div className={"answer-box-bg " + log[0].effect}>
                                                <div className="answer-box">
                                                    {log[0].render}
                                                </div>
                                            </div>
                                        </li>
                                        : <></>
                                    }

                                    <LogCollection logs={log} />

                                </ul>
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
                                    Params {subcatList.length === 0 ? "(No params selected)" : ""} <div style={{marginTop: 0}} className={"question-view-bg qbg-unlit " + (subcatList.length === 0 ? "qbg-focus" : "")}><button id="param-button" onClick={() => {setParamsOpen(true)}}><i className="fa fa-pencil"></i> EDIT</button></div>
                                </div>
                                <div className="parameter-box small-shadow" style={{"flexGrow": "3"}}>
                                    Room Options

                                    <div className={"room-option"}>
                                        {` Reading Speed  |  ${readingSpeed} WPM  |  ` } <span class={"settings-reset-button"} onClick={() => {setReadingSpeed(460)}}>Reset</span>
                                        <Slider min={160} max={2000} defaultValue={460} setValue={readingSpeed} updateFunction={setReadingSpeed} />
                                    </div>

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



                                <div>
                                    Difficulty:
                                    <div className={"multislider-container"} >

                                        <MultirangeSlider initialValues={[0, 8, 0]} setMin={setDifficultySliderMin} setMax={setDifficultySliderMax} />

                                    </div>


                                </div>
                                <br/><br/>
                                <SelectBox updateFunction={setSubcatList}  />

                            </div>

                        </div>

                    </div>


                </div>
            </div>

        </div>

    </div>


        </>

    )
}

/**
 * Component that lets players play single player bonuses (pk)
 * @returns {Object} - The single player pk component.
 */
export function PKView() {


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
    const [log, setLog] = useState([{effect: "qbg-focus", render: <>This is the beginning of the game log. Select some params and click&nbsp;&nbsp; <i className="fa fa-play"></i> &nbsp;&nbsp;to begin playing.</>}]);




    //Params
    const [difficultySliderMin, setDifficultySliderMin] = useState(1);
    const [difficultySliderMax, setDifficultySliderMax] = useState(9);
    const [subcatList, setSubcatList] = useState([]);

    useEffect(() => {

        document.addEventListener("keydown", (e) => {
            if(e.key === " ") {

                if(document.activeElement.className === "answer-box-input") return;

                if(!buzzed) {
                    e.preventDefault();
                    answerRef.current.focus(); // Focus answer element
                    setBuzzed(true); setIsPlaying(true) // Stop reading the tu and show visuals that you buzzed.
                    setAnswerTimeout(setTimeout(() => {

                        let correct = judgeAnswer(answerRef.current.value, tossupData.answer);
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


    const answerRef = useRef(null);





    return(
        <>


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
                            Bagel Bonuses
                            <div>
                                <PlayControlButton pressed={isPlaying} clickEvent={() => {
                                    setIsPlaying(!isPlaying);
                                    setAnswer("");
                                    setBuzzed(false);
                                }}><i className="fa fa-play"></i></PlayControlButton>
                                <PlayControlButton pressed={nextSet} clickEvent={() => {setNextSet(true); setTossupNum(tossupNum + 1)}}><i className="fa fa-forward"></i></PlayControlButton>
                            </div>
                        </div>

                        <div className={"question-view-bg qbg-unlit " + (tossupCorrect ? "qbg-green" : (isPlaying ? (buzzed ? "qbg-yellow " : "qbg-red") : "")) }>
                            <div className="question-view">

                                <TossupController
                                    subcategories={subcatList}
                                    difficulties={Array(difficultySliderMax + 1).fill().map((_, idx) => difficultySliderMin + idx + 1)} //Generate list of numbers between 2 ranges (https://stackoverflow.com/a/33457557)
                                    play={isPlaying}
                                    buzz={buzzed}
                                    next={nextSet}
                                    reveal={tossupCorrect}
                                    speed={-1}
                                    onRetrieveNext={(tossup) => {setNextSet(false); setTossupCorrect(false); setTossupData(tossup)}}
                                    onStart={(number) => {
                                        let newLog = log;
                                        newLog.unshift({effect: "qbg-yellow", render: <>Tossup {number+1}</>});
                                        setLog(newLog);
                                        console.log(newLog);

                                    } }
                                />
                            </div>
                        </div>
                        <div className={"answer-box-bg qbg-unlit " + (buzzed ? "qbg-timer" : "")}>
                            <div className={"answer-box"}>
                                <input type="text" ref={answerRef} className={"answer-box-input"} value={answer} placeholder="Answer" onChange={(event) => {
                                    setAnswer(event.target.value);
                                }}
                                       onKeyDown={(e) => {
                                           if(e.key === "Enter" && buzzed && isPlaying) {
                                               // submit answer
                                               let correct = judgeAnswer(answerRef.current.value, tossupData.answer);
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


                            </div>

                        </div>
                        <div className="log-bg qbg-unlit">
                            <div className="log-list">
                                <ul className="log-ul">
                                    {log.length > 0 ?
                                        <li>
                                            <div className={"answer-box-bg " + log[0].effect}>
                                                <div className="answer-box">
                                                    {log[0].render}
                                                </div>
                                            </div>
                                        </li>
                                        : <></>
                                    }

                                    <LogCollection logs={log} />

                                </ul>
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
                                    Params {subcatList.length === 0 ? "(No params selected)" : ""} <div style={{marginTop: 0}} className={"question-view-bg qbg-unlit " + (subcatList.length === 0 ? "qbg-focus" : "")}><button id="param-button" onClick={() => {setParamsOpen(true)}}><i className="fa fa-pencil"></i> EDIT</button></div>
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



                                        <div>
                                            Difficulty:
                                            <div className={"multislider-container"} >

                                                <MultirangeSlider initialValues={[0, 8, 0]} setMin={setDifficultySliderMin} setMax={setDifficultySliderMax} />

                                            </div>


                                        </div>
                                        <br/><br/>
                                        <SelectBox updateFunction={setSubcatList}  />

                                    </div>

                                </div>

                            </div>


                        </div>
                    </div>

                </div>

            </div>


        </>

    )
}

/**
 * Component conditionally renders single player views.
 * @returns Single player views depending on path.
 */
export function SingleplayerView() {
    const [redirectState, setRedirectState] = useState("");
    const [instantRedirectState, setInstantRedirectState] = useState("");
    let history = useHistory();
    let match = useRouteMatch();
    const location = useLocation();

    let redirect = <DelayedRedirect to={redirectState} delay={600} />
    let instRedirect = <Redirect to={instantRedirectState} />

    if(instantRedirectState === "") {
        instRedirect = null;
    }

    if(redirectState === "") {
        redirect = null;
    }

    return(
        <>
        <div className={"main-wrapper " + (history.action === "REPLACE" ? "main-wrapper-fadein" : "")}>
            {redirect}
            {instRedirect}
            <div className="nav-bar shadow">
                <div className={"point-cursor"} onClick={() => {
                    setRedirectState("/menu");
                }}>
                    <div className="outer-circle-b">
                        <div className="inner-circle-b"></div>
                    </div>
                    <span className="title-text">bagel</span>
                </div>
                <div>
                    <button className={"nav-button " + (location.pathname === "/singleplayer/tk_alpha" ? "nav-button-active" : "")} onClick={() => {setInstantRedirectState("/singleplayer/tk_alpha");}}>Tossups (Alpha)</button>
                    <button className={"nav-button " + (location.pathname === "/singleplayer/pk_alpha" ? "nav-button-active" : "")} onClick={() => {setInstantRedirectState("/singleplayer/pk_alpha");}}>Bonuses (Alpha)</button>
                </div>
            </div>

            <Switch>
                <Route path={`${match.path}/tk_alpha`}>
                    <TKView />
                </Route>
                <Route path={`${match.path}/pk_alpha`}>
                    <PKView />
                </Route>
                <Route path={match.path}>
                    <Redirect to={"tk_alpha"} />
                </Route>
            </Switch>

        </div>
        <div className={"redirect-cover"} style={{"display": redirectState === "" ? "none" : "block"}} />
        </>
    )
}


