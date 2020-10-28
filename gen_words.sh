#!/bin/bash
#script to generate the word files.

#file with all words, one in each line:
input="full_wordlist.txt"
#not present file:
tmp="full_wordlist_tmp.txt"

#make everything lowercase:
sed -i "s/.*/\L&/g" $input
#remove duplicates and sort words:
sort -u $input >> $tmp

while read word; do
    echo "$word" >> "${#word}.txt"
    echo "$word: ${#word}"
done < $tmp

rm $tmp
