#!/bin/sh

#script to generate the word files.

while read line; do
    word="${line^^}"
    echo "$word" >> "${#word}.txt"
    echo "$word: ${#word}"
done < "full_wordlist.txt"
