const input = document.getElementById("input");
const invalid = document.getElementById("invalid");

//to replace "_" with regex
const wildCardRegex = /[_-]+/g;

let lastWordLength = 0;
let words = [];

function getRegex() {
    //TODO: Umlauts Boolean
    const invalidChars = "[^" + invalid.value + "]"; //TODO: Ignore chars in input.value too?
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

    console.log(regex);

    const matches = [];
    const letters = new Map();

    let index = 0;
    for (let i = 0; i < words.length; i++) {
        if (regex.test(words[i])) {
            matches[index++] = words[i];
            const usedChars = [];
            for (let j = 0; j < words[i].length; j++) {
                let char = words[i].charAt(j);
                if (!arrayContains(usedChars, char)) {
                    usedChars.push(char);
                    letters.set(char, letters.has(char) ? letters.get(char) + 1 : 1);
                }
            }
        }
    }

    console.log(matches);
    const lettersSorted = new Map([...letters.entries()].sort((a, b) => b[1] - a[1]));
    console.log(lettersSorted);
}

function arrayContains(arr, val) {
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] === val) {
            return true;
        }
    }
    return false;
}