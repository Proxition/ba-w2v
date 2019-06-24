module.exports = {
    stepByStep: true,
    takeStep: {
        parse: true,
        w2p: false,
        w2vModelCreate: false,
        w2vModelLoad: false,
        elastic: false,
        mode: false
    },
    log: {
        filePath: './logs',
        fileName: 'log1.log',
        enable: true
    },
    parsing: {
        dataFilePath: './BiographyCorpus/Data/fullTextContent.tsv',
        parsedFilePath: './parsedText-stemmed.txt',
        continueParsingAtLine : 0,
        stemming: true,
        stemOnlyVerbs: false,
        toLowerCase: true,
        failCounter: 0,
        lineCount: 1031911,
        createClearedData: {
            enable: true,
            filePath: './cleanText.txt'
        },
        skipArticleList: [] // Articles that are making trouble and are not biographies
    },
    w2p: {
        create: [
            {
                trainingDataPath: './ba-w2v-v1/data/micro.txt',
                modelFileName: './ba-w2v-v1/data/micro_w2p.txt',
                modelOptions : {
                    minCount: 1,
                    threshold: 100
                }
            }
        ]
    },
    w2vModel: {
        create: [
            {
                trainingDataPath: './dataForModel.txt',
                modelFileName: 'final-skip.bin',
                modelOptions : {
                    size: 500,
                    window: 5,
                    hs: 1,
                    threads: 1,
                    iter: 20,
                    alpha: 0.25,
                    binary: 1
                }
            },
            {
                trainingDataPath: './dataForModel.txt',
                modelFileName: 'final-cbow.bin',
                modelOptions : {
                    size: 500,
                    window: 5,
                    hs: 1,
                    threads: 1,
                    iter: 20,
                    alpha: 0.05,
                    binary: 1
                }
            }
        ],
        load: [
            {
                modelFileName: './ba-w2v-v1/data2/fd_pw2v_m3.bin',
                output: true,
                similarityAmount: 10,
                testOn: ['ridiculous', 'fathom'] // check if model is working
            }
        ]
    },
    elastic: [
        {
            elasticObj: {
                index: '',
                type: ''
            },
            maxSearchResults: 10000,
            method: {
                type: 'random',
                filePath: './test',
                fileName: 'randomSample.json',
                amount: 50000,
                max: 1031911
            },
            weighting: {
                modelFileName: './ba-w2v-v1/data2/fd_pw2v_m3.bin',
                output: true,
                similarityAmount: 10,
                amountToWeight: 20
            }
        },
        {
            elasticObj: {
                index: '',
                type: ''
            },
            maxSearchResults: 10000,
            method: {
                type: 'category',
                category: '1920 births',
                filePath: './test',
                fileName: 'categories1.json',
                clearedDataFilePath: './BiographyCorpus/Data/fullTextContent.tsv'
            },
            weighting: {
                modelFileName: './ba-w2v-v1/data2/fd_pw2v_m3.bin',
                output: true,
                similarityAmount: 10,
                amountToWeight: 20
            }
        }
    ],
    mode2: {
        type: 'category',
        category: '1920 births',
        filePath: './test',
        fileName: 'categories1.json',
        clearedDataFilePath: './BiographyCorpus/Data/fullTextContent.tsv'
    }
}

