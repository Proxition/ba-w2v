#!/usr/bin/python
# -*- coding: utf-8 -*

"""DBPedia TitleFile Splitter

Split the file with titles as wiki IDs into lots of smaller files to help speed up processing in the next step
Saves the result in the files in /WikiCat/Data/splitIDFiles/

Adapted from https://stackoverflow.com/questions/546508/how-can-i-split-a-file-in-python
"""

# 10,000 lines per file
splitLen = 10000
outputBase = 'titleLinks'

input = open('../Data/titleLinks.csv', 'r')

count = 0
at = 0
dest = None
for line in input:
    if count % splitLen == 0:
        if dest: dest.close()
        dest = open(outputBase + str(at) + '.csv', 'w')
        at += 1
    dest.write(line)
    count += 1
