const elasticService = require('./elasticservice');
const weighting = require('./../weighting');
const randomizer = require('./../randomizer');
const byCategories = require('./../byCategories');
const fs = require('fs');
const readline = require("readline");
const { ModelLoader } = require('./../ba-w2v-v1/load');

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

    const waitForAll = (promiseArray) => {
        return new Promise( async (resolve, reject) => {
            Promise.all((await promiseArray).map(obj =>  {
                return new Promise((resolve, reject) => {
                    Object.keys(obj).forEach(async (key) => {
                        console.log(key, obj[key]);
                        obj[key] = await obj[key];
                    })
                    resolve(obj);
                })
            }))
            .then(result => {
                resolve(result);
            }).catch(reject)
        })
    }

    const init = async (weightedData) => {
        let elasticArticle = {
            'head': 'text',
            'text': 'article',
            'payload': []
        }
        const wData = await waitForAll(weightedData);
        console.log("result::::", wData);
        //if(wData.length < 1) process.exit(-1);
        wData.forEach((elasticArticle, i) => {
            elastic.create(elasticArticle);
            console.log(i,". ", elasticArticle.head.splice(0,50));
        })
    }
    
    const createHead = (doc) => {
        return doc.substring(0, 250);
    }

    const createElasticObject = async (payload, doc) => {
        return {
            payload: await payload, 
            text: doc, 
            head: createHead(doc)
        }
    }

    const getVerbCountedWeightedData = async (data) => {
        return new Promise( async (resolve, reject) => {
            Promise.all((await data).map(
                async (doc) => {
                    return createElasticObject(
                        weighting.verbCount(config.current.weighting, doc),
                        doc
                    )}))
            .then(result => {
                resolve(result);
            })
            .catch(reject);
        })
    }
    
    const getWeightedData = async (dataToWeight) => {
        console.log("getWeightedData")
        const data = await dataToWeight;
        let weightedData = [];
        if(config.current.weighting.mode === 'verbCount') {
            console.log("byVerbCount")
            weightedData = getVerbCountedWeightedData(data);
        } else if(config.current.weighting.mode === 'byFrequency') {
            console.log("byFrequency", weighting.byFrequency)
            const modelLoader = new ModelLoader(config.current.weighting);
            data.forEach(async (doc) => {
                weightedData.push(
                    await createElasticObject(
                        await weighting.byFrequency(config.current.weighting, doc, modelLoader), 
                        doc
                    )
                );
                console.log("updated: ",weightedData[weightedData.length-1]);
            });
        }
        return weightedData;
    }
    
    const getSelectedData = async (articleNumbers) => {
        console.log("getSelectedData");
        articleNumbers = (await articleNumbers).sort((a,b) => a - b); // TODO randomize output anpassen to promise
        console.log("getSelectedData after sort", await articleNumbers);

        return new Promise((resolve, reject) => {
            let readLine = readline.createInterface({
                input: fs.createReadStream(config.current.method.clearedDataFilePath),
                crlfDelay: Infinity
            });
            let line_no = 0;
            let articleArray = [];
            readLine.on("line", async function (line) {
                    if(articleNumbers.includes(line_no)) {
                        let lineSplit = line.split("\t"); // the first tab separates info from Corpus
                    if (lineSplit.length === 1) {
                        lineSplit = lineSplit[0].split("]");
                    } 
                    if(lineSplit.length > 0) {
                        lineSplit.shift(); // only take the text
                        lineSplit = lineSplit.join(" ");
                    }

                    lineSplit = lineSplit.split("== References ==")[0]; // remove the Reference Section and External Link Section
                    lineSplit = lineSplit.split("== External links ==")[0]; // just incase they are swapped on an article
                    lineSplit = lineSplit.split("== Notes ==")[0];
                    let withoutSectionTitles = lineSplit.replace(/==\s\w+[^=]*\s==/g, "");
                    withoutSectionTitles = withoutSectionTitles.replace(/=|-{2,}|\s{2,}/g, " ");
                    articleArray.push(withoutSectionTitles);
                }
                line_no++;
            })
            readLine.on("close", function (line) {
                resolve(articleArray);
            });    
        });
    }

    const weightedData = async () => {
        let result;
        if(config.current.method.type == 'category') {
            result = getWeightedData(getSelectedData(byCategories({...config.current, log: config.log})))
        } else if (config.current.method.type == 'random') {
            result = getWeightedData(getSelectedData(randomizer({...config.current, log: config.log})))
        } else {
            console.log('Unknown method.')
            result = undefined;
        }
        return result;
    }
    
    
    return async () => {
        return init(await weightedData());
    }
}
