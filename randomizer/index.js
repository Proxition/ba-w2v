const fs = require('fs');

const getRandom = (amount, max) => {
    let randomArray = [];
    let randomNumber = 0;
    for (let i = 0; i < amount; i++) {
        randomNumber = Math.floor(Math.random() * max);
        randomArray.includes(randomNumber) ? i-- : randomArray.push(randomNumber);
        console.log('...', Math.floor(i/amount*100), '%');
    }
    return randomArray;
}

const makeRandom = (config) => {
    if (config.amount / config.max < 0.5) {
        return { res: getRandom(config.amountToWeight, config.max) }
    } else {
        return { res: getRandom(config.max - config.amountToWeight, config.max), inverted: true };
    }
}

const prepData = (data) => {
    data.res = data.res.sort((a,b) => a - b);
    return data;
}

const writeToFile = (filePath, fileName, data) => {
    if (!fs.existsSync(filePath)) {
        fs.mkdirSync(filePath);
    }
    fs.writeFileSync(filePath + '/' + fileName, JSON.stringify(prepData(data)));
    return data;
}

const fileAlreadyExist = (filePath, fileName) => {
    return (fs.existsSync(filePath) && fs.existsSync(filePath + '/' + fileName))
}

const readFile = (filePath, fileName) => {
    return fs.readFileSync(filePath + '/' + fileName)
}

function randomizer (config) {
    return new Promise((resolve) => {
        if (fileAlreadyExist(config.method.filePath, config.method.fileName)) {
            resolve(readFile(config.method.filePath, config.method.fileName));
        } else {
            resolve(writeToFile(config.method.filePath, config.method.fileName, makeRandom(config.weighting)))
        }
    })
}


module.exports = randomizer;