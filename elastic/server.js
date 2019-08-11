const express = require('express');
const bodyParser = require('body-parser');
const elasticService = require('./elasticservice');

const app = express();
app.use(bodyParser.json());

const init = () => {
    app.listen(process.env.PORT || 40040, () => {
        console.log('Listening on Port', process.env.PORT || 40040)
    })
}

const query = (word) => {
    return {
        "query": {
            "multi_match" : {
                "query" : word,
                "fields" : ["payload.word^3", 'head']
            }
        }
    }
}

app.post('/search', async (req, res) => {
    console.log(req.body);
    const currentElasticSearchConnection = elasticService({
        index: req.body.index || req.body.elastic.index ||  'test2',
        type: req.body.type || req.body.elastic.type ||'second'
    })
    const result = req.body.search && await currentElasticSearchConnection.search(query(req.body.search));
    res.send(result || []);
})

app.post('/query', async (req, res) => {
    console.log(req.body);
    const currentElasticSearchConnection = elasticService({
        index: req.body.index || req.body.elastic.index ||  'test2',
        type: req.body.type || req.body.elastic.type ||'second'
    })
    const result = req.body.query && await currentElasticSearchConnection.search(req.body.query);
    res.send(result || []);
})

module.exports = {
    init
}