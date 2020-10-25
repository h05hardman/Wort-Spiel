#!/bin/sh

#script to generate the word files.

sed -i "s/.*/\L&/g" "full_wordlist.txt" #make everything lowercase

while read word; do
    echo "$word" >> "${#word}.txt"
    echo "$word: ${#word}"
done < "full_wordlist.txt" #read from full_wordlist.txt (a file with all words, one in each line)
