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

const stemVerbs = sentence => {
  let doc = compromise(sentence);
  let verbs = doc.verbs().out("array");
  return verbs.map(natural.PorterStemmer.stem).join(" ");
};

const getVerbs = sentence => {
  let doc = compromise(sentence);
  return doc.verbs().out("array");
};

const extendVerbs = (sentence, verb, extendingVerbs) => {
  let extended = sentence.slice();
  return extended.replace(" " + verb + " ", " [" + extendingVerbs + "] ");
};

// before model build

//console.log(removeStopwords(changeVerbsToPresentTense(origin)))

// after Model build

// let prep = changeVerbsToPresentTense(origin);

// getVerbs(prep).forEach(verb => {
//   prep = extendVerbs(prep, verb, [verb, "aloha", "meaning", "thing"]);
// });

//console.log(prep);
//console.log(removeStopwords(prep));

const dataPath = "./../BiographyCorpus/Data/fullTextContent.tsv";
//const dataPath = "./testCase.txt";
const failedParsing = "./../failed.txt";

const readline = require("readline");
const fs = require("fs");

// create instance of readline
// each instance is associated with single input stream

let readLine = readline.createInterface({
  input: fs.createReadStream(dataPath),
  crlfDelay: Infinity
});

let writePrepData = fs.createWriteStream("./../dataForModel.txt", {
  flags: "a" // 'a' means appending (old data will be preserved)
});

const writeAll = true;

let line_no = 0;
let fail_counter=0;
// continue: 
fail_counter = 21;
// Articles that are making trouble and are not biographies
const skipArticleList = [165704, 456988]

// event is emitted after each line
readLine.on("line", async function(line) {
  line_no++;
  //if(line_no === 456988) console.log(line)

  if (writeAll && typeof line === "string" && !skipArticleList.includes(line_no) && line_no > 456987) {
    let lineSplit = line.split("\t"); // the first tab seperates info from Corpus
    if (lineSplit.length === 1) {
      lineSplit = lineSplit[0].split("]");
    }
    lineSplit.shift(); // only take the text

    lineSplit = lineSplit.join(" ");
    lineSplit = lineSplit.split("== References ==")[0]; // remove the Reference Section and External Link Section
    lineSplit = lineSplit.split("== External links ==")[0]; // just incase they are swapped on an article
    lineSplit = lineSplit.split("== Notes ==")[0];
    lineSplit = lineSplit.split("== Career statistics ==")[0];
    let withoutSectionTitles = lineSplit.replace(/==\s\w+[^=]*\s==/g, "");
    withoutSectionTitles = withoutSectionTitles.replace(/=|-{2,}|\s{2,}/g, " ");

    const trimmed = removeStopwords(
      changeVerbsToPresentTense(withoutSectionTitles)
    );
    if (!trimmed) {
      fail_counter++;
      return extendFile(failedParsing, line)
    }
    console.log(
      "==",
      Math.floor((line_no / 1031911) * 10000)/100,
      "% with number: ",
      line_no,
      "\t \t number of parse fails: ",
      fail_counter
    );

    await writePrepData.write(trimmed + "\n", error => {
      if (error) console.error(error);
    });
  }
});

readLine.on("close", function(line) {
  console.log("Total lines : " + line_no);
});


const extendFile = (filepath, extension) => {
  let templates = fs.readFileSync(filepath, "utf8");
  templates += '\n' + extension;
  fs.writeFileSync(filepath, templates);
  return true;
}
