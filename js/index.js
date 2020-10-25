const input = document.getElementById("input");
const invalid = document.getElementById("invalid");
const letterOutput = document.getElementById("output");
const wordOutput = document.getElementById("output2");
//only in german:
const umlautCheckbox = isGerman() ? document.getElementById("has-umlauts") : null;

//to replace "_" with regex
const wildCardRegex = /[_-]+/g;
//to strip whitespaces
const whiteSpaceRegex = /\s+/g

let lastWordLength = 0;
let lastHasUmlauts = undefined;
let words = [];

function getInvalidChars() {
    return stringToLowerCase(invalid.value + input.value.replaceAll(wildCardRegex, ""));
}

function getRegex() {
    const invalidChars = "[^" + getInvalidChars() + "]";
    const regexStr = input.value.replaceAll(wildCardRegex, (s) => {
        return invalidChars + (s.length > 1 ? "{" + s.length + "}" : "");
    })
    return new RegExp("^" + stringToLowerCase(regexStr) + "$", "u")
}

function isGerman() {
    return getLanguage() === "de";
}

function hasUmlauts() {
    return isGerman() && umlautCheckbox.checked;
}

function getWordsFolder() {
    return isGerman() ? (hasUmlauts() ? "words_de/" : "words_de_only_a-z/") : "../words_" + getLanguage() + "/";
}

let ready = true;
//This gets called on button press
function updateWords() {
    if (!ready) return;

    ready = false;
    input.value = input.value.replaceAll(whiteSpaceRegex, "");
    const wordLength = input.value.length;
    const umlautsBoo = hasUmlauts();
    if (lastWordLength === wordLength && lastHasUmlauts === umlautsBoo) {
        onWordsLoaded();
    } else {
        const reader = new XMLHttpRequest() || new ActiveXObject("MSXML2.XMLHTTP");
        reader.open("get", getWordsFolder() + wordLength + ".txt", true);
        reader.onreadystatechange = function() {
            lastWordLength = wordLength;
            lastHasUmlauts = umlautsBoo;
            words = reader.responseText.split("\n");
            onWordsLoaded();
        };
        reader.send(null);
    }
}

function onWordsLoaded() {
    const regex = getRegex();

    const invalidChars = getInvalidChars();

    const matches = [];
    const letters = new Map();

    let index = 0;
    for (let i = 0; i < words.length; i++) {
        if (regex.test(words[i])) {
            matches[index++] = words[i];
            let usedChars = "";
            for (let j = 0; j < words[i].length; j++) {
                let char = words[i].charAt(j);
                if (!stringContainsIgnoreCase(usedChars + invalidChars, char)) {
                    usedChars += char;
                    letters.set(char, letters.has(char) ? letters.get(char) + 1 : 1);
                }
            }
        }
    }

    if (matches.length > 0) {
        let matchList = matches.length + " " + (isGerman() ? "passende Wörter" : "matching words") + ":<ul class='match-list'>";
        matches.forEach(val => {
            matchList += "<li>" + val + "</li>";
        });
        wordOutput.innerHTML = matchList + "</ul>";

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
        letterOutput.innerHTML = isGerman() ? "Keine Wörter gefunden." :  "No words found.";
        wordOutput.innerHTML = "";
    }
    ready = true;
}

function stringContainsIgnoreCase(str, val) {
    return str.indexOf(val) !== -1 || stringToLowerCase(str).indexOf(stringToLowerCase(val)) !== -1;
}

const bigSzRegex = /ẞ/g;
function stringToLowerCase(str) {
    return hasUmlauts() ? str.toLowerCase().replaceAll(bigSzRegex, "ß") : str.toLowerCase();
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
    let url = window.location.href.replaceAll(new RegExp("([\?&])" + param + "=[^&#]*", "g"), (str, args) => {
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
    setUrlParam("input", input.value);
}

invalid.onchange = () => {
    setUrlParam("wrong", invalid.value);
}