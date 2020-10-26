const input = document.getElementById("input");
const invalid = document.getElementById("invalid");
const letterOutput = document.getElementById("output");
const wordOutput = document.getElementById("output2");
//only in german:
const umlautCheckbox = isGerman() ? document.getElementById("has-umlauts") : null;

//to replace "_" with regex
const wildCardRegex = /[_?-]/g;
//to improve matching:
const WildCardMatch = /^[_?-]+$/; //should be like wildCardRegex.
//to strip whitespaces
const whiteSpaceRegex = /\s+/g;
//to remove duplicate chars:
const duplicateCharsRegex = /(.)(?=.*\1)/g;

let lastWordLength = 0;
let lastHasUmlauts = undefined;
let words = [];

function getInvalidChars() {
    return stringToLowerCase(invalid.value + input.value.replace(wildCardRegex, "")).replace(duplicateCharsRegex, "");
}

function getRegex() {
    const invalidChars = "[^" + getInvalidChars() + "]";
    const regexStr = input.value.replace(wildCardRegex, (s) => {
        return invalidChars + (s.length > 1 ? "{" + s.length + "}" : "");
    });
    return new RegExp("^" + stringToLowerCase(regexStr) + "$", hasUmlauts() ? "u" : "");
}

function isGerman() {
    return getLanguage() === "de";
}

function hasUmlauts() {
    return isGerman() && umlautCheckbox.checked;
}

function getWordsFolder() {
    return isGerman() ? (hasUmlauts() ? "words/words_de/" : "words/words_de_only_a-z/") : "../words/words_" + getLanguage() + "/";
}

let ready = true;
//This gets called on button press
function updateWords() {
    if (!ready) return;

    ready = false;
    input.value = input.value.replace(whiteSpaceRegex, "");
    const wordLength = input.value.length;
    if (wordLength < 1) {
        noWordsFound();
    } else {
        const umlautsBoo = hasUmlauts();
        if (lastWordLength === wordLength && lastHasUmlauts === umlautsBoo) {
            onWordsLoaded();
        } else {
            const reader = new XMLHttpRequest() || new ActiveXObject("MSXML2.XMLHTTP");
            reader.open("get", getWordsFolder() + wordLength + ".txt", true);
            reader.onreadystatechange = function () {
                // In local files, status is 0 upon success in Mozilla Firefox
                if(reader.readyState === XMLHttpRequest.DONE) {
                    let status = reader.status;
                    if (status === 0 || (status >= 200 && status < 400)) {
                        lastWordLength = wordLength;
                        lastHasUmlauts = umlautsBoo;
                        words = reader.responseText.split("\n");
                        onWordsLoaded();
                    } else {
                        words = [];
                        noWordsFound();
                    }
                }
            };
            reader.send(null);
        }
    }
}

function onWordsLoaded() {
    const invalidChars = getInvalidChars();
    const letters = new Map();

    const alwaysMatches = invalidChars.length === 0 && wildCardRegex.test(input.value);
    const regex = getRegex();

    let count = 0;
    let matchList = "";
    words.forEach(word => {
        if (alwaysMatches || regex.test(word)) {
            count++;
            let used = invalidChars;
            for (let j = 0; j < word.length; j++) {
                const char = word.charAt(j);
                if (!stringContainsIgnoreCase(used, char)) {
                    letters.set(char, letters.has(char) ? letters.get(char) + 1 : 1);
                    used += char;
                }
            }
            if (count < 100) {
                matchList += "<li>" + word + "</li>";
            } else if (count === 100) {
                matchList += "<li>...</li>"; //to show something is missing
            }
        }
    });

    if (count > 0) {
        wordOutput.innerHTML = count + (isGerman() ? " passende Wörter" : " matching words") + ":<ul class='match-list'>" + matchList + "</ul>";

        // sort by value
        const lettersSorted = new Map([...letters.entries()].sort((a, b) => b[1] - a[1]));
        let letterList = "<div class='letter-list'>\n";
        //TODO: Better print?:
        lettersSorted.forEach(((value, key) => {
            letterList += key + ": " + value + ", ";
        }));
        //close div and remove last ", "
        letterOutput.innerHTML = letterList.substring(0, letterList.length - 2) + "</div>";
    } else {
        noWordsFound();
    }
    ready = true;
}

function noWordsFound() {
    letterOutput.innerHTML = isGerman() ? "Keine passenden Wörter gefunden." :  "No matching words found.";
    wordOutput.innerHTML = "";
}

function stringContainsIgnoreCase(str, val) {
    return str.indexOf(val) !== -1 || stringToLowerCase(str).indexOf(stringToLowerCase(val)) !== -1;
}

const bigSzRegex = /ẞ/g;
function stringToLowerCase(str) {
    return hasUmlauts() ? str.toLowerCase().replace(bigSzRegex, "ß") : str.toLowerCase();
}

function getParamFromURL(param, defaultValue) {
    let results = new RegExp("[\?&]" + param + "=([^&#]*)").exec(window.location.href);
    return results === null ? defaultValue : decodeURIComponent(results[1]);
}

//if umlauts=t umlauts else not
if (isGerman()) {
    umlautCheckbox.checked = getParamFromURL("umlauts", "f") === "t";
}
input.value = getParamFromURL("input", "");
invalid.value = getParamFromURL("wrong", "");

function setUrlParam(param, value) {
    let newStr = param + "=" + encodeURIComponent(value);
    let changed = false;
    let url = window.location.href.replace(new RegExp("([\?&])" + param + "=[^&#]*", "g"), (str, args) => {
        if (changed || value === "") return "";
        changed = true;
        return str.substring(0, 1) + newStr;
    });
    if (value !== "" && url === window.location.href && url.indexOf(param) === -1) {
        if (url.indexOf("?") === -1) {
            url += "?" + newStr;
        } else {
            url += "&" + newStr;
        }
    }
    history.replaceState("", url, url);
}

if (isGerman()) {
    umlautCheckbox.onchange = () => {
        setUrlParam("umlauts", hasUmlauts() ? "t" : "");
    }
}

input.onchange = () => {
    setUrlParam("input", input.value.replace(whiteSpaceRegex, "").replace(wildCardRegex, "_"));
}

invalid.onchange = () => {
    setUrlParam("wrong", invalid.value.replace(duplicateCharsRegex, "").replace(whiteSpaceRegex, "").replace(wildCardRegex, "_"));
}