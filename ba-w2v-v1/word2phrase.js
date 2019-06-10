const w2v = require("word2vec");


const word2phrase = (options) => {
    return new Promise((resolve, reject) => {
        w2v.word2phrase(options.trainingDataPath, options.modelFileName, options.modelOptions, (arg) => {
            resolve(arg);
        })
    })
}



module.exports = word2phrase;