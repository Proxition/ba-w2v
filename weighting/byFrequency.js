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

function compare ( a, b ) {
    if ( a.weight > b.weight ){
        return -1;
    } else if ( a.weight < b.weight ){
        return 1;
    }
    return 0;
}

const objectToArray = obj => {
    const array = [];
    for (key in obj) {
        array.push({word: key, weight: obj[key]});
    }
    return array;
}

const wordCount = (options, doc, modelLoader) => {
    let words = {};
    let entry = changeVerbsToPresentTense(doc).replace(/\./g, ' ');
    entry = entry.replace(/\s\s+/g, ' ');
    entry = removeStopwords(entry);
    return new Promise(async (resolve, reject) => {
        for(word of entry.split(' ')) {
            if(!word.match(/^[0-9]+$/)) {
                if(!words[word]){
                    words[word] = 1;
                } else {
                    words[word] += 1;
                }
            }
        }
        const wordsCopy = Object.assign({}, words);
        for(word in wordsCopy) {
            let similars = await modelLoader.getSimilar(word, options.similarityAmount);
            similars && similars.forEach(similar => {
                if(!words[similar.word]){
                    words[similar.word] = similar.dist;
                } else {
                    words[similar.word] = words[similar.word] * (1+similar.dist) + similar.dist;
                }
            })
        }
        resolve(words);
    })
}

const wordCountWrapper = async (options, doc, modelLoader) => {
    const words = await wordCount(options, doc, modelLoader);
    return await objectToArray(words).sort(compare).slice(0, options.amountToWeight);
}

module.exports = wordCountWrapper;