const input = document.getElementById("input");
const invalid = document.getElementById("invalid");
const output = document.getElementById("output");

//to replace "_" with regex
const wildCardRegex = /[_-]+/g;
//to strip whitespaces
const whiteSpaceRegex = /\s+/g

let lastWordLength = 0;
let words = [];

function getInvalidChars() {
    return (invalid.value + input.value.replaceAll(wildCardRegex, "")).toUpperCase();
}

function getRegex() {
    //TODO: Umlauts Boolean
    const invalidChars = "[^" + getInvalidChars() + "]"; //TODO: Ignore chars in input.value too?
    const regexStr = input.value.replaceAll(wildCardRegex, (s) => {
        return invalidChars + (s.length > 1 ? "{" + s.length + "}" : "");
    })
    return new RegExp("^" + regexStr + "$", "iu")
}

//This gets called on button press
function updateWords() {
    input.value = input.value.replaceAll(whiteSpaceRegex, "");
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
    console.log(lettersSorted);
    
    let letterList = "<div class='letter-list'>\n";
    //TODO: Better print:
    lettersSorted.forEach(((value, key) => {
        letterList += key + ": " + value + ", \n";
    }));
    letterList = letterList.substring(0, letterList.length - 3) + "</div>";
    console.log(letterList);
    output.innerHTML = letterList;
}

function stringContainsIgnoreCase(str, val) {
    return str.indexOf(val) !== -1 || str.toUpperCase().indexOf(val.toUpperCase()) !== -1;
}