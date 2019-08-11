const readline = require("readline");
const fs = require("fs");
const compromise = require("compromise");
const natural = require("natural");
const tokenizer = new natural.WordTokenizer();
const stopword = require("stopword");

const changeVerbsToPresentTense = sentence => {
    let sent;
    let doc = compromise(sentence);
    sent = doc
        .sentences()
        .toPresentTense()
        .out("normal");
    return sent;
};

const removeStopwords = sentence => {
    let tokenized = stopword.removeStopwords(tokenizer.tokenize(sentence));
    return tokenized.join(" ");
};

const getVerbs = sentence => {
    let doc = compromise(sentence);
    return doc.verbs().out("array");
};

const stemmedVerbs = verbs => {
    return verbs.map(natural.PorterStemmer.stem).join(" ");
};

const stemSentence = sentence => {
    let sentenceCopy = sentence.slice();
    return sentenceCopy.split(" ").map(natural.PorterStemmer.stem).join(" ");
};

const stemOnlyVerbs = (sentence) => {
    let sentenceCopy = sentence.slice();
    const verbs = getVerbs(sentenceCopy);
    const verbsStemmed = stemmedVerbs(verbs);
    verbs.forEch((verb, index) => {
        sentenceCopy.replace(verb, verbsStemmed[i]);
    })
}
const extendVerbs = (sentence, verb, extendingVerbs) => {
    let extended = sentence.slice();
    return extended.replace(" " + verb + " ", " [" + extendingVerbs + "] ");
};


const parseData = (options) => {
    return new Promise((resolve, reject) => {

        let readLine = readline.createInterface({
            input: fs.createReadStream(options.dataFilePath),
            crlfDelay: Infinity
        });
        let writePrepData = fs.createWriteStream(options.parsedFilePath, {
            flags: "a" // 'a' means appending (old data will be preserved)
        });

        let writeClearedData = fs.createWriteStream(options.createClearedData.filePath, {
            flags: "a"
        });

        let fail_counter = options.failCounter || 0;
        let line_no = 0;
        const failedParsing = "./ParsingFails.txt";

        readLine.on("line", async function (line) {
            if (!options.skipArticleList.includes(line_no) && line_no > options.continueParsingAtLine) {
                let lineSplit = line.split("\t"); // the first tab separates info from Corpus
                if (lineSplit.length === 1) {
                    lineSplit = lineSplit[0].split("]");
                }
                lineSplit.shift(); // only take the text

                lineSplit = lineSplit.join(" ");
                lineSplit = lineSplit.split("== References ==")[0]; // remove the Reference Section and External Link Section
                lineSplit = lineSplit.split("== External links ==")[0]; // just incase they are swapped on an article
                lineSplit = lineSplit.split("== Notes ==")[0];
                let withoutSectionTitles = lineSplit.replace(/==\s\w+[^=]*\s==/g, "");
                withoutSectionTitles = withoutSectionTitles.replace(/=|-{2,}|\s{2,}/g, " ");

                let trimmed = removeStopwords(
                    changeVerbsToPresentTense(withoutSectionTitles)
                );
                if (!trimmed) {
                    fail_counter++;
                    return extendFile(failedParsing, line)
                }
                if (options.stemming) {
                    trimmed = stemSentence(trimmed);
                } else if (options.stemOnlyVerbs) {
                    trimmed = stemOnlyVerbs(trimmed);
                }
                if (options.toLowerCase) {
                    trimmed = trimmed.toLowerCase();
                }
                options.createClearedData.enable && await writeClearedData.write(line + "\n", error => error && console.error(error))
                console.log(
                    "==",
                    Math.floor((line_no / options.lineCount) * 10000) / 100,
                    "% with number: ",
                    line_no,
                    "\t \t number of parse fails: ",
                    fail_counter
                );

                await writePrepData.write(trimmed + "\n", error => {
                    if (error) console.error(error);
                });
                line_no++;
            }
        });

        readLine.on("close", function (line) {
            console.log("Total lines : " + line_no);
            resolve({ failCounter: fail_counter, lineCount: line_no });
        });
    })
}

const extendFile = (filePath, extension) => {
    let templates = fs.existsSync(filePath) && fs.readFileSync(filePath, "utf8") || '';
    templates += '\n' + extension;
    fs.writeFileSync(filePath, templates);
    return true;
}

module.exports = parseData;