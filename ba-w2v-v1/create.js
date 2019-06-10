const w2v = require("word2vec");


const w2vCreate = (options) => {
    return new Promise((resolve, reject) => {
        w2v.word2vec(options.trainingDataPath, options.modelFileName, options.modelOptions, (arg) => {
            resolve(arg);
        })
    })
}

module.exports = w2vCreate;