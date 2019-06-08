
const w2v = require("word2vec");
const trainFile = './../dataForModelcp.txt';
const modelFile = './data2/fd_pw2v_m4.bin';

const makeModel = false;

const modelOptions = [
    {
        size: 300,
        window: 5,
        hs: 1,
        threads: 20,
        iter: 100,
        alpha: 0.05,
        binary: 1
    }
]

if(makeModel) {
    let starttimes = [];

    const word2vecPromise = (i) => {
        starttimes.push(new Date());
        return new Promise((resolve, reject) => {
            w2v.word2vec(trainFile, `./data2/fd_pw2v_m${i+4}.bin`, modelOptions[i], (arg) => {
                resolve(arg);
                starttimes[i] = new Date() - starttimes[i];
            })
        })
    }
    word2vecPromise(0).then(() => {
        //word2vecPromise(1).then( () => {
            // word2vecPromise(2).then( () => {
                 console.log(starttimes);
             //})
         //})
    });
} else {
    w2v.loadModel( modelFile, (error, model)=>{
        if(error) console.error(error);

        const similars = model.mostSimilar("study", 10);
        //console.log("mostSimilar: ", similars );

        similars && similars.forEach(vector => {
            console.log("similar: ", vector.word);
        });


         // console.log("next", model.getNearestWords(model.getVector( 'elephant' ), 3))

        //console.log("analogy: ", model.analogy("book", ["song", "instrument"], 10))
    });
}