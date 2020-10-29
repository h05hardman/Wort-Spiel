const input = document.getElementById("input");
const invalid = document.getElementById("invalid");
const letterOutput = document.getElementById("output");
const wordOutput = document.getElementById("output2");
//only in german:
const umlautCheckbox = isGerman() ? document.getElementById("has-umlauts") : null;

//to replace "_" with regex
const wildCardRegex = /[_?-]+/g;
//to replace ?, or - with _
const notRealWildCardRegex = /[-?]/g;
//to strip whitespaces
const whiteSpaceRegex = /\s+/g;
//to remove duplicate chars:
const duplicateCharsRegex = /(.)(?=.*\1)/g;

let lastWordLength = 0;
let lastHasUmlauts = undefined;
let words = [];

function getInvalidChars() {
    return (invalid.value + input.value.replace(wildCardRegex, "")).toLowerCase()
        .replace(whiteSpaceRegex, "")
        .replace(duplicateCharsRegex, "");
}

function getRegex() {
    const invalidChars = "[^" + getInvalidChars() + "]";
    const regexStr = input.value.toLowerCase().replace(wildCardRegex, (s) => {
        return invalidChars + (s.length > 1 ? "{" + s.length + "}" : "");
    });
    return new RegExp("^" + regexStr + "$", hasUmlauts() ? "u" : "");
}

function isGerman() {
    return getLanguage() === "de";
}

function hasUmlauts() {
    return isGerman() && umlautCheckbox.checked;
}

function getWordsFolder() {
    return isGerman()
        ? (hasUmlauts() ? "words/words_de/" : "words/words_de_only_a-z/")
        : "../words/words_" + getLanguage() + "/";
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
            readFile( getWordsFolder() + wordLength + ".txt", (success, response) => {
                if (success) {
                    lastWordLength = wordLength;
                    lastHasUmlauts = umlautsBoo;
                    words = response.split("\n");
                    onWordsLoaded();
                } else {
                    words = [];
                    noWordsFound();
                }
            });
        }
    }
}

function readFile(filename, callback) {//function callback(wasSuccessful, responseText)
    const reader = new XMLHttpRequest() || new ActiveXObject("MSXML2.XMLHTTP");
    reader.open("get", filename, true);
    reader.onreadystatechange = function () {
        // In local files, status is 0 upon success in Mozilla Firefox
        if(reader.readyState === XMLHttpRequest.DONE) {
            const status = reader.status;
            callback(status === 0 || (status >= 200 && status < 400), reader.responseText);
        }
    };
    reader.send(null);
}

function onWordsLoaded() {
    const letters = new Map();
    let count = 0;
    let matchList = "";
    const invalidChars = getInvalidChars();

    const inputWithoutWildCards = input.value.replace(wildCardRegex, "");
    const matchesAlways = invalidChars.length === 0 && inputWithoutWildCards.length === 0; //no letter input, only wildcards

    if (inputWithoutWildCards.length === input.value.length) { //max one word, without wildcard, just search for it
        let word = inputWithoutWildCards.toLowerCase();
        if (binarySearch(words, word)) { //if the word is present
            count = 1;
            matchList += "<li>" + word + "</li>";
        }
    } else { //have to search

        const regex = getRegex();

        words.forEach(word => {
            if (matchesAlways || regex.test(word)) {
                count++;

                if (count < 100) {
                    matchList += "<li>" + word + "</li>";
                } else if (count === 100) {
                    matchList += "<li>...</li>"; //to show something is missing
                    if (matchesAlways) return;
                }

                if (!matchesAlways) {
                    let used = invalidChars.split(""); //faster than to clone the array
                    for (let j = 0; j < word.length; j++) {
                        const char = word[j];
                        if (!used.includes(char)) {
                            letters.set(char, letters.has(char) ? letters.get(char) + 1 : 1);
                            used.push(char);
                        }
                    }
                }
            }
        });
    }

    if (matchesAlways) {
        count = words.length;
        readFile(getWordsFolder() + words[0].length + "_letters.txt", (success, response) => {
            letterOutput.innerHTML = response;
        });
    }

    if (count > 0) {
        wordOutput.innerHTML = count + " " + getMatchingWordsString(count)
            + ":<ul class='match-list'>" + matchList + "</ul>";

        if (!matchesAlways) {
            // sort by value
            const lettersSorted = new Map([...letters.entries()]
                .sort((a, b) => b[1] - a[1]));
            let letterList = "";
            //TODO: Better print?:
            lettersSorted.forEach(((value, key) => {
                letterList += key + ": " + value + ", ";
            }));
            //close div and remove last ", "
            letterOutput.innerHTML = letterList.substring(0, letterList.length - 2);
        }
    } else {
        noWordsFound();
    }
    ready = true;
}

function binarySearch(arr, toSearch) {
    let start = 0;
    let end = arr.length-1;
    // Iterate while start not meets end
    while (start <= end){
        // Find the mid index
        let mid = Math.floor((start + end) / 2);
        // If element is present at mid, return True
        if (arr[mid] === toSearch)
            return true;
        // Else look in left or right half accordingly
        else if (arr[mid] < toSearch)
            start = mid + 1;
        else
            end = mid - 1;
    }
    return false;
}

function getMatchingWordsString(count) {
    const countIsOne = count === 1;
    return (isGerman() ?
        countIsOne ? "passendes Wort" : "passende Wörter" :
        countIsOne ? "matching word" : "matching words");
}

function noWordsFound() {
    letterOutput.innerHTML = isGerman()
        ? "Keine passenden Wörter gefunden."
        :  "No matching words found.";
    wordOutput.innerHTML = "";
}

function stringContainsIgnoreCase(str, val) {
    return str.indexOf(val) !== -1 || str.toLowerCase().indexOf(val.toLowerCase()) !== -1;
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
    setUrlParam("input", input.value.toLowerCase()
        .replace(whiteSpaceRegex, "")
        .replace(notRealWildCardRegex, "_"));
}

invalid.onchange = () => {
    setUrlParam("wrong", invalid.value.toLowerCase()
        .replace(whiteSpaceRegex, "")
        .replace(wildCardRegex, "")
        .replace(duplicateCharsRegex, ""));
}