const { ModelLoader } = require('./../ba-w2v-v1/load');

const compromise = require("compromise");
const natural = require("natural");
const tokenizer = new natural.WordTokenizer();
const stopword = require("stopword");

const changeVerbsToPresentTense = sentence => {
    let sent;
    let doc = compromise(sentence);
    sent = doc
        .sentences()
        .toPresentTense()
        .out("normal");
    return sent;
};

const removeStopwords = sentence => {
    let tokenized = stopword.removeStopwords(tokenizer.tokenize(sentence));
    return tokenized.join(" ");
};

function compare ( a, b ) {
    if ( a.weight > b.weight ){
        return -1;
    } else if ( a.weight < b.weight ){
        return 1;
    }
    return 0;
}

const objectToArray = obj => {
    const array = [];
    for (key in obj) {
        array.push({word: key, weight: obj[key]});
    }
    return array;
}

const wordCount = (options, doc) => {
    let words = {};
    const modelLoader = new ModelLoader(options);
    let entry = changeVerbsToPresentTense(doc).replace(/\./g, ' ');
    entry = entry.replace(/\s\s+/g, ' ');
    entry = removeStopwords(entry);
    return new Promise(async (resolve, reject) => {
        for(word of entry.split(' ')) {
            if(!words[word]){
                words[word] = 1;
            } else {
                words[word] += 1;
            }
        }
        const wordsCopy = Object.assign({},words);
        for(word in wordsCopy) {
            let similars = await modelLoader.getSimilar(word, options.similarityAmount);
            similars && similars.forEach(similar => {
                if(!words[similar.word]){
                    words[similar.word] = similar.dist;
                } else {
                    words[similar.word] = words[similar.word] * (1+similar.dist) + similar.dist;
                }
            })  
        }
        resolve(words);
    })
}

const wordCountWrapper = async (options, doc) => {
    let words = await wordCount(options, doc);
    return objectToArray(words).sort(compare).slice(0, options.amountToWeight);
}

const test = `Sean Mattison is an American former professional surfer and current professional surf coach and mastermind behind Kelly Slater's "nubster". A fifth fin that was created by Mattison that some critics say helped Kelly Slater win his 11th ASP World Championship. Mattison also is the designer of his own alternative high performance surfboards and surfboard fins named Von-Sol.In 2009 Assistant Coach Sean Mattison along with Head Coach Ian Cairns founder of the Association of Surfing Professionals coached the 2009 USA Surf Team to a Gold Medal in the 2009 ISA World Championships. Prior to that win, the USA had not won a Gold Medal since 1996. in Costa Rica; France: 2nd Place, Australia: 3rd Place. Mattison was born in Kalamazoo, Michigan, United States on 24 March 1969. Mattison moved to Atlantic Beach, Florida in 1973 and started surfing in 1974. By 1977 Mattison started competing in surf competitions at the age of eight in Jacksonville Beach, Florida. Mattison grew up surfing on the east coast in the ESA also known as Eastern Surfing Association. In 1980, Mattison was a member of the ESA All-Stars with fellow professional surfer and 11x ASP World Champion Kelly Slater. Mattison also placed 5th overall at the NSSA Nationals and was a member of the NSSA national team. Mattison's amateur career was between 1977–1987.ESA East Coast Titles 1978 1980 1981 1983 1985 ESA East Coast Runner-up19841986. In 1988, Mattison established himself as an elite surfer and earned himself a spot in the top 30 ranked surfers in the (PSAA) Bud Surf Tour on his rookie year.Mattison had his best year in 1990 when he was rated #2 in the (PSAA)Bud Surf Tour mid-way through the season and finishing #7 in the (PSAA) Bud Surf Tour.Mattison won 2nd Place in the 1990 Body Glove Memorial Surf Classic.Mattison was on the cover of Surfer Magazine in 1993.Crowned 2003 United States Surfing Champion.Mattison was on a cover of a controversial Longboard Magazine in 2006 which had him surfing a "fish" rather than a longboard.Mattison won a Gold Medal with Team USA in the 2011 ISA World Championships in Punta Roca, El Salvador Mattison was part of the USA Master's Team with former three time ASP world champion Tom Curren and fellow professional surfer Jim Hogan.Mattison is a member of the Jacksonville Surfing Hall of Fame. Sean Mattison was the General Manager and Chief Board Buyer for Surf Ride Inc. in Oceanside, California from 1997 through 2007. Known as a surfboard specialist, Surfing Magazine did an article on Mattison called "Lord of the Boards". When Clark Foam a surfboard foam manufacturer that supplied 90% of blank surfboards in the United States closed its doors, Surfer Magazine ran its only cover in history that just has a surfboard on its cover with Mattison's quotes going across, "This Changes Everything" Mattison is the owner, operator, and head coach of Surf Coach USA. Mattison has testimonials from some of the elite professional surfers in the world.2012 ISA World Juniors Assistant Coach Team USA Copper Medal 2011 PACSUN Team USA in Peru 5th Place2010 Founder Calvary Christian Surf Club2010 ISA World Juniors Assistant Coach Team USA in New Zealand - Bronze Medal 2009 PACSUN USA Surf Team ISA World Champions Assistant Coach Team USA in Costa Rica - Gold Medal 2009 ISA World Juniors Assistant Coach Team USA - Bronze Medal2008 Athletics Coach Calvary Vista Christian School2007 Athletics Coach / Surf PE Coach Calvary Vista Christian School2005 National Surfing League "The Game" California Cup Pro Series Assistant Coach2005 San Diego Sea Lions Water Coach Champions - Runner Up2005 San Diego Sea Lions Assistant Team Coach Team Champions - Runner Up2004 National Surfing League "The Game" California Cup Professional Series2002 ISA World Games Assistant Coach USA Surf Team Durban South Africa Mattison is the designer of his own surfboard label Von-Sol Surfboards. Mattison having a former background in design collaborated with Mike Hynson to make the "Black Knight Quad" a four fin surfboard that had much success in design. Mike Hynson is co-star of the hit 1966 surf movie "The Endless Summer" directed by Bruce Brown. Mike Hynson and fellow co- star Robert August travel the world in search for surf.Another notable design influenced by Mattison was, Kelly Slater's "nubster". A fifth fin that was created by Mattison that some critics say helped Kelly Slater win his 11th ASP World Championship. In 1990, Mattison married and had his first child in 1993. In Their Own Words: Sean Mattison - PacSun USA Surf Team Assistant Coach Mattison and his wife are now parents of three children. Mattison won the [U.S. Open of Surfing] Master's Division the same year his wife competed and won 4th in the Women's. Mattison and his family were in an article for Coastal Living Magazine called Hang Ten Holidays.`
const test2 = `Sean M. Berkowitz (born 1967) is a former director of the Department of Justice's Enron Task Force. He prosecuted former employees of Enron who were accused of white collar crimes, principally accounting fraud. Most significantly, he was the lead prosecutor in the joint trial of Kenneth Lay and Jeffrey Skilling. In 2006, shortly after securing guilty verdicts against both, Berkowitz left the Department of Justice to become a partner at Latham & Watkins LLP in Chicago.Berkowitz was assigned to the Task Force in December 2003 from the U.S. Attorney's Office for the Northern District of Illinois, where he led many high-profile prosecutions of white collar crime and corporate fraud. Prior to his five years at the United States Department of Justice, Berkowitz worked for the law firm Katten Muchin Zavis, now Katten Muchin Rosenman LLP, in Chicago, Illinois. Berkowitz cross-examined Jeffrey K. Skilling (Enron President and COO), sending the former CEO into a temper tantrum on the stand. He was also the ending voice for the prosecution as he concluded the government’s closing arguments to the jury by urging them to send a message to Lay and Skilling that "you can’t buy justice, you have to earn it."In his closing arguments, Berkowitz used a large black and white cardboard display with the word "truth" emblazoned on one side and "lies" on other side. "You get to decide whether they told truth or lies, black and white," he told the jury. "Don't let the defendants, with their high-paid experts and their lawyers, buy their way out of this," he said. "I'm asking you to send them a message that it's not all right. You can't buy justice; you have to earn it."On May 25, 2006, after the jury found both Skilling and Lay guilty, Berkowitz scolded the Enron executives, saying that "you can't lie to shareholders, you can't put yourselves in front of your employees' interests. No matter how rich and powerful you are, you have to play by the rules." Berkowitz noted the FBI spent five years investigating the Enron case and that his team spent many long nights working on the trial, warning other executives who think about committing fraud that "no matter how complicated or sophisticated a case may be, people like that stand ready to investigate." Berkowitz received his B.A. degree summa cum laude from Tulane University (with a Dean's Honor Scholarship) in 1989 and received his J.D. degree cum laude from Harvard Law School in 1992.He was an avid and skilled high school debater at Glenbrook North High School (class of 1985). He won the Glenbrook North Distinguished Alumnus Award on May 25, 2007. Berkowitz married Bethany McLean, a Vanity Fair magazine editor and one of the authors of the book Enron: The Smartest Guys in the Room, in May 2008.`


const asyncTest = async () => {
    console.log(await wordCountWrapper({
        modelFileName: './../ba-w2v-v1/data2/fd_pw2v_m3.bin',
        output: false,
        similarityAmount: 10,
        amountToWeight: 50
    }, test2));
}

asyncTest();

module.exports = wordCountWrapper;