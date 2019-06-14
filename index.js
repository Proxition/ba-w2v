const config = require('./config');
const fs = require('fs');

const { w2vLoad } = require('./ba-w2v-v1/load');
const w2vCreate = require('./ba-w2v-v1/create');
const word2phrase = require('./ba-w2v-v1/word2phrase');

const randomizer = require('./randomizer/index');
const getArticlesByCategory = require('./byCategories')

const parser = require('./data-preprocessing/parseData');



const parsing = async (options, loggingOptions) => {
    const startDate = new Date();
    const result = await parser(options);
    const endDate = new Date();
    if (loggingOptions && loggingOptions.enable) {
        writeLog(loggingOptions, `
Parsing of ${options.dataFilePath} started at ${startDate}.
${result.lineCount} has been parsed with ${result.failCounter} entries failing.
Parsing ended at ${endDate}.
        `);
    }
    return result;
}

const w2p = async (options, loggingOptions) => {
    const startDate = new Date();
    const result = await word2phrase(options);
    const endDate = new Date();
    if (loggingOptions && loggingOptions.enable) {
        writeLog(loggingOptions, `
Phrase2Vector Preprocessing started at ${startDate}.
Phrase2Vector Preprocessing ended at ${endDate}.
        `)
    }
    return result;
}

const w2vModelCreate = async (options, loggingOptions) => {
    const startDate = new Date();
    const result = await w2vCreate(options);
    const endDate = new Date();
    if (loggingOptions && loggingOptions.enable) {
        writeLog(loggingOptions, `
Word2Vector Model Calculation started at ${startDate}.
The chosen Model Type is a ${options.modelOptions.alpha === 0.05 ? 'CBOW': 'Skip-Gram'}.
The Vectors have a depth of ${options.modelOptions.size} and were calculated with a window of ${options.modelOptions.window} and an iteration of ${options.modelOptions.iter} times.
Word2Vector Model Calculation ended at ${endDate}.
        `)
    }
    return result;
}

const w2vModelLoad = async (options, loggingOptions) => {
    const startDate = new Date();
    const result = await w2vLoad(options);
    const endDate = new Date();
    if (loggingOptions && loggingOptions.enable) {
        writeLog(loggingOptions, `
Word2Vector load started at ${startDate}. with following word(s): ${options.testOn.join(', ')}.
Testing on following words in order: ${options.testOn.join(', ')}.
    ${result.map(res => res ? res.map(values => `"word": "${values.word}", \t\t\t"dist": ${values.dist}`).join('\n'): 'Word out of dictionary.').join('\n\n')}
Word2Vector load ended at ${endDate}.
        `)
    }
    return result;
}

// -- utils
const writeLog = (loggingOptions, logText) => {
    console.info("writing log...")
    return extendFile(
        loggingOptions.filePath,
        loggingOptions.fileName,
        logText);
}

const __makeSureFolderExists = (filePath) => {
  if(!fs.existsSync(filePath)) {
    fs.mkdirSync(filePath);
  }
}

const extendFile = (filePath,filename, extension) => {
  if(filePath && (filePath != '.' || filePath != './'))
    __makeSureFolderExists(filePath);
  if(!filePath || filePath === './') filePath = '.';
  const concatPath = filePath+'/'+filename;
  let templates = fs.existsSync(concatPath) && fs.readFileSync(concatPath, "utf8") || '';
  templates += '\n' + extension;
  fs.writeFileSync(concatPath, templates);
  return true;
}

// ------------ Init

const init = async () => {
    if (config.stepByStep) {
        config.takeStep.parse && await parsing(config.parsing, config.log);
        config.takeStep.w2p && config.w2p.create.forEach(async options => await w2p(options, config.log));
        config.takeStep.w2vModelCreate && config.w2vModel.create.forEach(async options => await w2vModelCreate(options, config.log));
        config.takeStep.w2vModelLoad && config.w2vModel.load.forEach(async options => await w2vModelLoad(options, config.log));
        config.takeStep.elastic && console.log('TODO');
        //config.takeStep.mode && randomizer(config.mode);
        config.takeStep.mode && getArticlesByCategory(config.mode2)
    } else {
        await parsing(config.parsing, config.log);
        config.w2p.create.forEach(async options => await w2p(options, config.log));
        config.w2vModel.create.forEach(async options => await w2vModelCreate(options, config.log));
        config.w2vModel.load.forEach(async options => await w2vModelLoad(options, config.log));
        // todo elastic
    }
}
init();
