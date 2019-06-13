module.exports = {
    stepByStep: true,
    takeStep: {
        parse: false,
        w2p: false,
        w2vModelCreate: false,
        w2vModelLoad: false,
        elastic: false,
        mode: true
    },
    log: {
        filePath: './logs',
        fileName: 'log1.log',
        enable: true
    },
    parsing: {
        dataFilePath: './test.txt',
        parsedFilePath: './parsedText.txt',
        continueParsingAtLine : 0,
        stemming: true,
        stemOnlyVerbs: false,
        toLowerCase: true,
        failCounter: 0,
        lineCount: 1031911,
        createClearedData: {
            enable: true,
            filePath: './cleanTest.txt'
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
                trainingDataPath: './ba-w2v-v1/data/micro.txt',
                modelFileName: 'test.bin',
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
                testOn: ['study', 'write', 'roger_staub', 'move'] // check if model is working
            },
            {
                modelFileName: './test.bin',
                output: true,
                similarityAmount: 10,
                testOn: ['study', 'write', 'roger_staub', 'move'] // check if model is working
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
            }
        }
    ],
    mode: {
        type: 'random',
        filePath: './test',
        fileName: 'randomSample.json',
        amount: 50000,
        max: 1031911
    }

}