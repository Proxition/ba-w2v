const w2v = require("word2vec");

class ModelLoader {
    
    constructor(options) {
        this.options = options;
        this.w2vModel;

        this.isReady = new Promise((resolve, reject) => {
            w2v.loadModel( this.options.modelFileName, (error, model)=>{
                if(error) reject(error);
                resolve(model);
            });
        }).then((model) => {
            this.w2vModel = model;
            this.options.output && console.info("Loading of Model was successful.");
            return true;
        }).then(res => {
            this.isReady = new Promise((resolve) => resolve(true))
        })
        .catch(error => {
            console.error("Could not load Model.", error);
        })
    }
   

    getSimilar (word, amount=10) {
        return this.isReady.then( () => {
            const result = this.w2vModel.mostSimilar(word, amount);
            this.options.output && console.log(result);
            return result;
        })
    }
}

const w2vLoad = async (options) => {
    console.info("Loading Model...");
    let w2vModel = new ModelLoader({...options, output: false});
    let result = options.testOn.map(word => w2vModel.getSimilar(word, options.similarityAmount));
    return await Promise.all(result).then(results => results);
}


module.exports = {
    ModelLoader,
    w2vLoad
} 