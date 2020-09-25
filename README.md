## BA Code for improving elasticsearch results based on word2vec over Wikipedia Biographies ##

This Project is build to support my bachelor thesis of improving elasticsearch results based on word2vector models build over the data set of english wikipedia biographies.

## Installation ## 

You need to install [nodejs with npm](https://nodejs.org/en/download/) as well as [docker](https://www.docker.com/).

Download the repository and change into the directory, run the command `npm install` in your shell / comander / bash console, to install the dependencies.

Make sure that the file `.env` exists, and has following variables: 

```
#ELK
ELK_VERSION=6.3.2
ELASTICSEARCH_BASE_URL=http://localhost:9200
ELASTICSEARCH_CLIENT_LOG_TYPE="error"

PORT=40040
```

## How to run ##

The code is broken down into multiple steps due to the time necessary to process each step providing a better control over results. 
This said you only need to run docker via `docker-compose up` on the last few steps - more about it when we get to the config.

You have to run each step one by one, but can do that with changing the active step in the __config.js__ file and run the _index.js_ simply via `node index.js`.


## Config break down ##

The config is the heart to control the processing of each single step. 

### takeStep ###

This object is controlling which step is about to be run via index.js.
The whole process is split into following steps:

1. **parse** : the parsing of the initial data from wikipedia
2. **w2p**   : word2phrase is preprocessing the parsed data
3. **w2vModelCreate** : creates the word2vector model over the parsed and preprocessed data
4. **w2vModelLoad** : loads the word2vec model to test if its working
5. **createElasticData** : assembles the data to create the final elastic entries 
6. **initElasticData** : adds the entries into the elasticsearch (from here on, you need to run the docker container)
7. **startServer** : starts the server you can post onto with a new search or an complete query

_example:_ 
```javascript
takeStep: {
        parse: false,
        w2p: false,
        w2vModelCreate: false,
        w2vModelLoad: false,
        createElasticData: false,
        initElasticData: false,
        startServer: true,
    }
```

### log ###

In the first steps logging is possible if enabled via the config. You can set the file path and file name for the log.

_example:_ 

```javascript
    log: {
        filePath: './logs',
        fileName: 'log2.log',
        enable: true
    }
```

### parsing (step 1) ###

The english wikipedia biography data is provided by __Robin Jegan__ in a form like: 

\[categories\] First passage == Passage Name == passage * repeating == References == references == External links == links etc. 

The word2vec program by Tomas Mikolov does not work well with special signs especially if they follow each other. To lessen problems in creating the model, some options are given.

This step also shows you the amount of entries this dataset has. You will need this information for later steps.

+ **dataFilePath** : the path towards the provided data
+ **parsedFilePath** : path to save the parsed data
+ **continueParsingAtLine** : if the parsing should stop at a point due to an error you can continue by setting a line number
+ **stemming** : enable word stemming
+ **stemOnlyVerbs** : enable to stem only verbs identified by a dictionary library
+ **toLowerCase** : if enabled, sets everything to lower case
+ **failCounter** : sets the start of the fail counter, you might want to set it, if you had to set the continueParsingAtLine
+ **lineCount** : is used to calculate the percentage of parsing
+ **createClearedData** : it is advised to enable it for later steps to have a file of all articles without those of error
  * **enable** : enables the creation of a cleared data file
  * **filePath** : provides the path where to save the cleared data
+ **skipArticleList** : an array of numbers of lines to skip due to known errors or wrong entries 

_example:_ 
```javascript
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
        skipArticleList: [] // Articles that are making trouble and/or are not biographies
    }
```

### w2p (step2) ###

Word2Phrase does not have to be run, and can be skipped if not wanted.

+ **trainingDataPath** : path to the parsed data to be trained on
+ **modelFileName** : path to the to be created model
+ **modelOptions**
  * **minCount** : the minimum amount of a word occurrence in the data
  * **threshold** : 

_example:_  
```javascript
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
    }
```

### w2vModelCreate (step3) ###

This runs the word2vec program by Tomas Mikolov 

+ **trainingDataPath** : path to the parsed data to be trained on
+ **modelFileName** : path to the to be created model
+ **modelOptions**
  * **size** : 
  * **window** : 
  * **hs** : 
  * **threads** : how many threads are to be used
  * **iter** : the amount of iterations
  * **alpha** : 0.25 = skip, 0.05 = CBOW
  * **binary** : if it shall be saved as binary (0: false, 1: true)

_example:_ 
```javascript
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
    },
 ```
### w2vModelLoad (step5) ###

This is part of the w2vModel (as well as w2vModelCreate (step3) ).

To test the model if it does work, you can use this to check directly after creating the model if the model can be loaded and read.
This step can be skipped, due to not having impact on final results, but it is advicable to not skip due to the time it takes to process each step.

+ **modelFileName** : the path to the to be tested model
+ **output** : enables detailed output
+ **similarityAmount** : the amount of most similar words to be looked at
+ **testOn** : sample words, to test the model with

_example:_ 
 ```javascript
     w2vModel: {
        load: [
            {
                modelFileName: './ba-w2v-v1/data2/fd_pw2v_m3.bin',
                output: true,
                similarityAmount: 10,
                testOn: ['ridiculous', 'fathom']
            }
        ]
     },
 ```
 
### createElasticData (step5) & initElasticData (step6) & startServer (step7) ###

All three steps are using the same config parameters.

Even though an array is provided to be used, it is advisable to only use a single elastic config object here, due to the amout of RAM this process is using.

+ **elasticObj** : the basic elastic search config
  * **index** : the index under which elastic search is saving the entry
  * **type** : the type under which elastic search is saving the entry
+ **maxSearchResults** : sets the maximum amount a search request can response with (max 10.000)
+ **method** : two selection methods are available, _random_ and _category_
+ **weighting** : the custom weighting based on the word2vec model results used on the verbs of the entry
  * **mode** : there are two weighting modes you can select from 'byFrequency' and 'verbCount'
  * **modelFileName** : the path to the word2vec model
  * **output** : enable detailed output
  * **similarityAmount** : the amount of most similar words to be looked at
  * **amountToWeight** : the amount of verbs that shall be weighted

#### Methods ####

Those methods are created to speed up the analyzing part. Otherwise the whole weighting process has to be done for each entry of the dataset and be saved into elasticsearch.

##### Random #####

This method is selecting randomly entries of the dataset to add those into elasticsearch.

+ **type** : 'random' 
+ **filePath** : path where the _fileName_ is to be saved
+ **fileName** : name of the file for the random selected entries
+ **amount** : the amount of randomly selected entries
+ **max** : the max amount - this value is provided by the first step and has to be manuel written down here

##### Category #####

This method is selecting entries by a provided category

+ **type** : 'category' 
+ **category** : You can find the categories in the unprocessed dataset
+ **filePath** : path where the _fileName_ is to be saved
+ **fileName** : name of the file for by category selected entries
+ **clearedDataFilePath** : file to the 'cleaned' version of the unprocessed dataset without error entries

 _example:_ 
 ```
    elastic: [
        // {
        //     elasticObj: {
        //         index: 'test3',
        //         type: 'third'
        //     },
        //     maxSearchResults: 10000,
        //     method: {
        //         type: 'random',
        //         filePath: './test',
        //         fileName: 'randomSample.json',
        //         amount: 50000,
        //         max: 1031911
        //     },
        //     weighting: {
        //         mode: 'verbCount',
        //         modelFileName: './ba-w2v-v1/data2/fd_pw2v_m3.bin',
        //         output: true,
        //         similarityAmount: 10,
        //         amountToWeight: 20
        //     }
        // },
        {
            elasticObj: {
                index: 'test4',
                type: 'fourth'
            },
            maxSearchResults: 10000,
            method: {
                type: 'category',
                category: 'Professors',
                filePath: './test',
                fileName: 'categories2.json',
                clearedDataFilePath: './BiographyCorpus/Data/fullTextContent.tsv'
            },
            weighting: {
                mode: 'byFrequency',
                modelFileName: './final-cbow.bin',
                weightedDataSave: './weightedDataSave1.json',
                output: true,
                similarityAmount: 10,
                amountToWeight: 20
            }
        }
    ]
```




Large Files uploaded via https://git-lfs.github.com
