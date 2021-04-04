// This is simply in another module so we don't rewrite the same code.

import stringSimilarity from "string-similarity";

/**
 * Uses regex to remove clutter around answerlines (Names in brackets and artifacts such as &lt/&gt
 * @param {String} answerline - The answer string to simplify
 * @returns {String} - The simplified answer string.
 */
function simplify(answerline) {
    var rx = /\<.*?\>/g;
    var rx2 = /\[.*?\]/g;

    var rx3 = /(&lt;).*?(&gt;)/g;
    var rx4 = /\(.*?\)/g;

    if(!answerline)
        return "";
    return answerline.replace(rx, "").replace(rx2, "").replace(rx3, "").replace(rx4, "");
}

/**
 * Uses regex to get alternate answers from an answerline.
 * @param {String} answerline - The answer string
 * @returns {String[]} - The list of "acceptable answerlines"
 */
function getAlternate(answerline) {

    if(!answerline)
        return [];

    var rx = /(accept).*?;/g;
    return answerline.match(rx);
}

/**
 * Judges an answer locally
 * @param {String} userAnswer - The answer that the player provided
 * @param {String} tossupAnswer - The tossup answer
 * @returns {Boolean} - If this answer should be counted as correct.
 */
export function judgeAnswer(userAnswer, tossupAnswer) {

    var answers = simplify(tossupAnswer).split(" ");
    answers = answers.concat(getAlternate(tossupAnswer)).filter(item => item !== null && item !== undefined && item !== "");

    if(answers.length === 0) {
        return false;
    }

    for(var i = 0; i < answers.length; i++) {

        if(stringSimilarity.compareTwoStrings(userAnswer, simplify(answers[i].toLowerCase())) > 0.7) {
            return true;
        }

    }

    if(stringSimilarity.compareTwoStrings(tossupAnswer.toLowerCase(), userAnswer.toLowerCase()) > 0.666) {return true;}

    if(userAnswer.length < 3) {return false;}
    if(stringSimilarity.compareTwoStrings(tossupAnswer.toLowerCase().substring(0, userAnswer.toLowerCase().length), userAnswer.toLowerCase()) > 0.75) {return true;}
    return false;
}