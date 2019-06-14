const readline = require("readline");
const fs = require('fs');

const createCategoryObject = (config) => {
    return new Promise((resolve, reject) => {
        let readLine = readline.createInterface({
            input: fs.createReadStream(config.clearedDataFilePath),
            crlfDelay: Infinity
        });

        let categorys = {};
        let line_no = 0;
        let length = 0;

        readLine.on("line", async function (line) {
            let cat = line.split(']')[0];
            cat = cat.slice(1);
            cat = cat.replace(/('|")/g,'');
            cat = cat.split(',');
            cat.forEach(category => {
                category = category.toLowerCase().trim();
                if(categorys[category]) {
                    categorys[category].push(line_no)
                } else {
                    categorys[category] = [line_no];
                    length++;
                }
            })
            line_no++;
        });

        readLine.on("close", function () {
            console.log("Total lines : " + line_no, " Total Categories: ", length);
            resolve(categorys);
        });
    })
}



const writeToFile = async (filePath, fileName, asyncData, category) => {
    if (!fs.existsSync(filePath)) {
        fs.mkdirSync(filePath);
    }
    const data = await asyncData;
    fs.writeFileSync(filePath + '/' + fileName, JSON.stringify(await data));
    return data[category];


}

const fileAlreadyExist = (filePath, fileName) => {
    return (fs.existsSync(filePath) && fs.existsSync(filePath + '/' + fileName))
}

const readFile = (filePath, fileName, category) => {
    return JSON.parse(fs.readFileSync(filePath + '/' + fileName))[category]
}

const getArticlesByCategory = async (config) => {
    let articleNumbers = [];
    if (fileAlreadyExist(config.filePath, config.fileName)) {
        articleNumbers = readFile(config.filePath, config.fileName, config.category.toLowerCase());
    } else {
        articleNumbers = await writeToFile(config.filePath, config.fileName, createCategoryObject(config), config.category.toLowerCase())
    }
    return articleNumbers;
}


module.exports = getArticlesByCategory;