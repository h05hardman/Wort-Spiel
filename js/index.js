const input = document.getElementById("input");
const invalid = document.getElementById("invalid");
const output = document.getElementById("output");
const umlautCheckbox = document.getElementById("has-umlauts");

//to replace "_" with regex
const wildCardRegex = /[_-]+/g;
//to strip whitespaces
const whiteSpaceRegex = /\s+/g

let lastWordLength = 0;
let words = [];

function getInvalidChars() {
    return stringToLowerCase(invalid.value + input.value.replaceAll(wildCardRegex, ""));
}

function getRegex() {
    //TODO: Umlauts Boolean
    const invalidChars = "[^" + getInvalidChars() + "]";
    const regexStr = input.value.replaceAll(wildCardRegex, (s) => {
        return invalidChars + (s.length > 1 ? "{" + s.length + "}" : "");
    })
    return new RegExp("^" + stringToLowerCase(regexStr) + "$", "u")
}

function hasUmlauts() {
    return umlautCheckbox.checked;
}

function getWordsFolder() {
    return hasUmlauts() ? "words/" : "words_only_a-z/";
}

let ready = true;
//This gets called on button press
function updateWords() {
    if (!ready) return;

    ready = false;
    input.value = input.value.replaceAll(whiteSpaceRegex, "");
    const wordLength = input.value.length;
    if (lastWordLength === wordLength) {
        onWordsLoaded();
    } else {
        const reader = new XMLHttpRequest() || new ActiveXObject("MSXML2.XMLHTTP");
        reader.open("get", getWordsFolder() + wordLength + ".txt", true);
        reader.onreadystatechange = function() {
            lastWordLength = wordLength;
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

    console.log(matches);

    // sort by value
    const lettersSorted = new Map([...letters.entries()].sort((a, b) => b[1] - a[1]));

    let letterList = "<div class='letter-list'>\n";
    //TODO: Better print:
    lettersSorted.forEach(((value, key) => {
        letterList += key + ": " + value + ", \n";
    }));
    //close div and remove last ", \n"
    letterList = letterList.substring(0, letterList.length - 3) + "</div>";
    console.log(letterList);
    output.innerHTML = letterList;
    ready = true;
}

function stringContainsIgnoreCase(str, val) {
    return str.indexOf(val) !== -1 || stringToLowerCase(str).indexOf(stringToLowerCase(val)) !== -1;
}

const bigSzRegex = /ẞ/g;
function stringToLowerCase(str) {
    return hasUmlauts() ? str.toLowerCase().replaceAll(bigSzRegex, "ß") : str.toLowerCase();
}