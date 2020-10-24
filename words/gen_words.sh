#!/bin/sh

#script to generate the word files.

while read line; do
    word="${line,,}"
    echo "$word" >> "${#word}.txt"
    echo "$word: ${#word}"
done < "full_wordlist.txt" #read from full_wordlist.txt (a file with all words, one in each line)
