const { ModelLoader } = require('./../ba-w2v-v1/load');

const compromise = require("compromise");

const changeVerbsToPresentTense = sentence => {
    let sent;
    let doc = compromise(sentence);
    sent = doc
        .sentences()
        .toPresentTense()
        .out("normal");
    return sent;
};

const getVerbs = sentence => {
    let doc = compromise(sentence);
    return doc.verbs().out('frequency');
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

const verbCount = (options, doc) => {
    let verbs = {};
    const modelLoader = new ModelLoader(options);

    return new Promise(async (resolve, reject) => {
        for(verb of getVerbs(changeVerbsToPresentTense(doc))) {
            if(!verbs[verb.normal]){
                verbs[verb.normal] = verb.count;
            } else {
                verbs[verb.normal] += verb.count;
            }
            let similars = await modelLoader.getSimilar(verb.normal, options.similarityAmount);
            similars && similars.forEach(similar => {
                if(!verbs[similar.word]){
                    verbs[similar.word] = similar.dist;
                } else {
                    verbs[similar.word] = verbs[similar.word] * (1+similar.dist) + similar.dist;
                }
            })
        }
        resolve(verbs);
    })
}

const verbCountWrapper = async (options, doc) => {
    let verbs = await verbCount(options, doc);
    return objectToArray(verbs).sort(compare).slice(0, options.amountToWeight);
}


module.exports = verbCountWrapper;