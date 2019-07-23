const readline = require("readline");
const fs = require('fs');

const createCategoryObject = (config) => {
    return new Promise((resolve, reject) => {
        if(!config.method) reject(config)
        let readLine = readline.createInterface({
            input: fs.createReadStream(config.method.clearedDataFilePath),
            crlfDelay: Infinity
        });

        let categories = {};
        let line_no = 0;
        let length = 0;

        readLine.on("line", async function (line) {
            let cat = line.split(']')[0];
            cat = cat.slice(1);
            cat = cat.replace(/('|")/g,'');
            cat = cat.split(',');
            cat.forEach(category => {
                category = category.toLowerCase().trim(); // @TODO
                if(categories[category]) {
                    categories[category].push(line_no)
                } else {
                    categories[category] = [line_no];
                    length++;
                }
            })
            line_no++;
        });

        readLine.on("close", function () {
            const result = `Total lines: ${line_no}\nTotal Categories found: ${length}\n`;
            console.log(result);
            config.max = line_no;
            if(config.log.enable) {
                writeToFile(config.log.filePath, config.log.fileName, result, '10')
            }
            resolve(categories);
        });
    })
}



const writeToFile = async (filePath, fileName, asyncData, category) => {
    if (!fs.existsSync(filePath)) {
        fs.mkdirSync(filePath);
    }
    const data = await asyncData;
    fs.writeFileSync(filePath + '/' + fileName, JSON.stringify( await data));
    console.log("writeToFile:", data[category])
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
        articleNumbers = readFile(
            config.method.filePath, 
            config.method.fileName, 
            config.method.category.toLowerCase()
            );
        console.log("reading")
    } else {
        if(!config.method) {
            console.error("Can't read config.method.path")
            console.log(config)
            return articleNumbers;
        }
        try {
            articleNumbers = await writeToFile(
                config.method.filePath, 
                config.method.fileName, 
                createCategoryObject(config),
                config.method.category)
                console.log("articleNumbers: ",articleNumbers)
        } catch (error) {
            console.error('Config Error in Method: Categories', error)
        }
    }
    return articleNumbers;
}


module.exports = getArticlesByCategory;