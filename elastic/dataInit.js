const elasticService = require('./elasticservice');
const weighting = require('./../weighting');
const randomizer = require('./../randomizer');
const byCategories = require('./../byCategories');

// elastic.create({
//     text: 'some text to test the function',
//     payload: [{word: "text", value: 1}, {word: "function", value: 0.9}]
// })
// elastic.create({
//     head:'some of the first words to have a search onto the persons name',
//     text: 'sometimes you need a little bit of confidence to function correctly and write a good text.',
//     payload: [{word: "text", value: 0.7}, {word: "function", value: 1.9}]
// })
const word = "search"

const query = {
        "query": {
            "multi_match" : {
                "query" : word,
                "fields" : ["payload.word^3", 'head']
            }
        }
}


module.exports = function (config) {
    const elastic = elasticService(config.current.elasticObj)

    const init = (config) => {
    
    }
    
    const getWeightedData = async (dataToWeight) => {
        const data = await dataToWeight;
        const weightedData = [];
        if(config.current.weighting.mode === 'verbCount') {
            data.forEach(async (doc) => {
                weightedData.push(await weighting.verbCount(config.current.weighting, doc))
            });
        } else if(config.current.weighting.mode === 'byFrequency') {
            data.forEach(async (doc) => {
                weightedData.push(await randomizer({...config.current, max: config.max}))
            });
        }
        console.log("-xx-x-x--x". weightedData)
        return weightedData;
    }
    
    const getSelectedData = async (array) => {
        console.log("getSelectedData", await array)
        return array;
    }
    
    
    return async (data) => {
        let result;
        if(config.current.method.type == 'category') {
            //console.log(await byCategories({...config.current, log: config.log}))
            result = getWeightedData(getSelectedData(byCategories({...config.current, log: config.log})))
        } else if (config.current.method.type == 'random') {
            result = getWeightedData(getSelectedData(randomizer({...config.current, log: config.log})))
        } else {
            console.log('Unknown method.')
            result = undefined;
        }
        console.log("--done")
        return result;
    }
}
