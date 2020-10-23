const input = document.getElementById("input");
const invalid = document.getElementById("invalid");
const output = document.getElementById("output");

//to replace "_" with regex
const wildCardRegex = /[_-]+/g;

let lastWordLength = 0;
let words = [];

function getInvalidChars() {
    return invalid.value + input.value.replaceAll(wildCardRegex, "");
}

function getRegex() {
    //TODO: Umlauts Boolean
    const invalidChars = "[^" + getInvalidChars() + "]"; //TODO: Ignore chars in input.value too?
    const regexStr = input.value.replaceAll(wildCardRegex, (s) => {
        return invalidChars + (s.length > 1 ? "{" + s.length + "}" : "");
    })
    return new RegExp("^" + regexStr + "$", "iu")
}

//TODO: Call this function on button press.
function updateWords() {
    const wordLength = input.value.length;
    if (lastWordLength === wordLength) {
        onWordsLoaded();
    } else {
        const reader = new XMLHttpRequest() || new ActiveXObject("MSXML2.XMLHTTP");
        reader.open("get", "words/" + wordLength + ".txt", true);
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
            const usedChars = [];
            for (let j = 0; j < words[i].length; j++) {
                let char = words[i].charAt(j);
                if (!arrayOrStringContains(usedChars, invalidChars, char)) {
                    usedChars.push(char);
                    letters.set(char, letters.has(char) ? letters.get(char) + 1 : 1);
                }
            }
        }
    }

    console.log(matches);
    console.log(letters);

    let highestValue = -1;
    let highestKey = undefined;
    letters.forEach((value, key) => {
        if (value > highestValue) {
            highestValue = value;
            highestKey = key;
        }
    });

    output.innerHTML = "Probiere es mit: " + highestKey;
}

function arrayOrStringContains(arr, str, val) {
    if (str.indexOf(val) !== -1) {
        return true;
    }
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] === val) {
            return true;
        }
    }
    return false;
}