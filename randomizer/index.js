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
        return { res: getRandom(config.amount, config.max) }
    } else {
        return { res: getRandom(config.max - config.amount, config.max), inverted: true };
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

const randomizer = (config) => {
    console.log(config)
    if (fileAlreadyExist(config.filePath, config.fileName)) {
        return readFile(config.filePath, config.fileName);
    } else {
        return writeToFile(config.filePath, config.fileName, makeRandom(config))
    }
}


module.exports = randomizer;