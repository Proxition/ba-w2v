const elastic = require('./elasticservice')({index: 'test', type: 'nr1'});
const bodybuilder = require('bodybuilder');

elastic.create({
    text: 'some text to test the function',
    payload: [{word: "text", value: 1}, {word: "function", value: 0.9}]
})
elastic.create({
    head:'some of the first words to have a search onto the persons name',
    text: 'sometimes you need a little bit of confidence to function correctly and write a good text.',
    payload: [{word: "text", value: 0.7}, {word: "function", value: 1.9}]
})

const body = bodybuilder()
    .filter('payload', 'word', 'function')
    .sort('value', 'desc')
    .build()


const test = async () => {
    //console.log(await elastic.search(body))
}
test();