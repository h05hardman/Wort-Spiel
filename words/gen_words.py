file = "full_wordlist.txt"

# read lines
text = open(file).read().lower()  # read text
lines = text.splitlines()  # split into lines

# sort lines unique
lines_sorted = sorted(set(lines))

letters = {}

for line in lines_sorted:
    word = line
    length = str(len(word))
    with open(length + ".txt", "a") as file:
        file.write(word)
        file.write("\n")
    print(word)
    m = letters.get(length, {})
    for index in range(0, len(word)):
        letter = word[index]
        if word.index(letter) is index:
            m[letter] = m.get(letter, 0) + 1
    letters[length] = m

print("Generating letters:")

for key, value in letters.items():
    print("length: " + key)
    print_val = []
    for k2, v2 in sorted(value.items(), key=lambda x: x[1], reverse=True):
        print_val.append(k2)
        print_val.append(": ")
        print_val.append(str(v2))
        print_val.append(", ")
    del print_val[-1]  # delete last item
    with open(key + "_letters.txt", "w") as file:
        file.write("".join(print_val))
