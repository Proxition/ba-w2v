const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const init = () => {
    app.listen(process.env.PORT, () => {
        console.log('Listening on Port', process.env.PORT)
    })
}

app.post('/', (req, res) => {
    console.log(res);
})



module.exports = {
    init
}