#!/bin/bash

input="full_wordlist.txt"

sed -i "s/.*/\L&/g" $input
sed -i s/ä/ae/g $input
sed -i s/ö/oe/g $input
sed -i s/ü/ue/g $input
sed -i s/ß/ss/g $input
