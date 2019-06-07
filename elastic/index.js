require('dotenv').config({path: './../.env'});
const { init } = require('./server');
const { elasticsearchStatus } = require('./elasticService')({
    index: '_cluster',
    type: 'health'
});

function waitForElastic(callback) {
    elasticsearchStatus((val) => {
        if (val) {
            return callback();
        } else {
            setTimeout(() => {
                return waitForElastic(callback);
            }, 15000);
        }
        return;
    })
}

waitForElastic(init);

