#!/bin/bash
#script to generate the word files.

#file with all words, one in each line:
input="full_wordlist.txt"
input2="full_wordlist_tmp.txt"

#make everything lowercase:
sed -i "s/.*/\L&/g" $input
#remove duplicates and sort words:
sort -u $input >> $input2

while read word; do
    echo "$word" >> "${#word}.txt"
    echo "$word: ${#word}"
done < $input2

rm $input2
