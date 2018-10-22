var FeersumNluApi = require("feersum_nlu_api");
var api;

var instanceName = 'xhosabot_matcher';
var api_key = "2707cee1-e4f9-4880-a99e-b9ed5303a176";

let twiml;

exports.handler = function(context, event, callback) {
    twiml = new Twilio.twiml.MessagingResponse();

    if(null === event.Body){
        callback("null", null);
    }

    const messageText = event.Body;
    console.log("Initiating Message lookup: " + messageText);

    createModel(messageText).then((outputText) => {
        twiml.message(outputText);
        callback(null, twiml);
    });


};

function createModel(messageText){
    defaultClient = FeersumNluApi.ApiClient.instance;

    var APIKeyHeader = defaultClient.authentications['APIKeyHeader'];
    APIKeyHeader.apiKey = api_key;
    api = new FeersumNluApi.Faq_matchersApi(defaultClient);
    let createDetails = new FeersumNluApi.CreateDetails(instanceName, true);
    console.log('Initiating model create.');
    return api.faqMatcherCreate(createDetails)
        .then(function(data) {
            // Successful authentication and model fetch
            console.log('Model Create called successfully.');
            return queryModel(messageText);
        }, function(error) {
            console.log("FAQ Matcher error thrown: " + error);
            return;
        }).catch(function(err) {
            console.log("Error in FAQ Process: " + err);
            return;
        })
}


function queryModel(messageText){
    let textInput = new FeersumNluApi.TextInput(messageText);
    console.log("Attempt question match " + textInput.text);
    return api.faqMatcherRetrieve(instanceName, textInput)
        .then(function(data) {
            // Highest probability response contained in: data[0].label
            console.log('API called successfully. Returned data: ' + data[0].label);
            // Find response corresponding to label
            let outputText = responseGenerator(data[0].label);
            console.log("Response message: " + outputText);
            return outputText;
        }, function(error) {
            console.error("FAQ Matcher error thrown: " + error);
        }).catch(function(alsoError){
            console.error("Error in FAQ Process: " + alsoError);
        });
}

function responseGenerator(label) {
    if (null !== label) {
        for (var response in labelledResponseList) {
            if (label === labelledResponseList[response][0]) {
                return labelledResponseList[response][1];
            }
        }
    }
}


var labelledResponseList = [
    // Response 1:
    ["lala", "Usana olusanda kuzalwa kufanele lulale iiyure ezilishumi" +
    "elinesithandathu ( 16 hours) ngemini ubuncinane. Kodwa ukulala" +
    "ngokungekho sesiqhelweni kuqhelekile. Ukuba umntwana wakho akalali" +
    "kwaye ulila kakhulu kusenokwenzeka ulambile, akakhululekanga okanye" +
    "udikiwe. Ukubanceda ukuba balale ungabagungqisa ngeengalo zakho" +
    "okanye umsongele umombathise ngengubo. Kufanele umthathe umntwana" +
    "wakho umse ekliniki ukuba ucinga ukuba uyagula."],

    // Response 2:
    ["bhala", "Kufanele ubhalise umntwana wakho kwiintsuku ezingamashumi" +
    "amathathu ( 30 days) zokuqala. Yiya e Home Affairs uyokugcwalisa" +
    "ingcombolo zakho kwi fomu eyi BI-24, ukubhalisa kumahala. Kufanele" +
    "uphathe isazisi (ID) sakho kunye nekopi yesiqinisekiso yesatifiketi somtshato" +
    "okanye ingcombolo zikatata ukuba uyakwazi."],

    // Response 3:
    ["zokubeleka", "Kusenokwenzeka ukuba uzokubeleka ukuba unamazantsi esisu" +
    "akuphatha rhoqo kwaye amanzi akho agqabhukile. Ezinye impawu yincindiebomvana " +
    "ephuma ngaphantsi kubu mama bakho nokuvuleka okuyi 10 cm" +
    "ngaphantsi. ukuba uzakubeleka kufanele uye ekliniki ngoko nangoko."],

    // Response 4:
    ["phambi", "Kuqhelekile ukuba namazantsi esisu nokuva ngathi isibeleko sakho siye" +
    "siqina, kodwa ukuba usentlungwini kakhulu, uva iintlungu ngemva emqolo," +
    "unenkantsi kwaye uphuma incindi eninzi ngaphantsi kusenokwezeka" +
    "uzokubeleka phambi kwexesha. Ukuba ucinga ukuba uzobeleka kufanele uye" +
    "ekliniki ngoko nangoko."],

    // Response 5:
    ["pre-eclampsia", "I pre-eclamsia yi high blood pressure xa ukhulelwe kwaye yenzeka emva" +
    "kweeveki ezingamashumi amabini ( 20 weeks). Ukuyinceda kufanele" +
    "ufumane u Vitamin D ne Calcium –kwizidlo ezifana nentlanzi nobisi. Nciphisa" +
    "etyuweni usele amanzi amaninzi. Khumbula ukuphumla ngokwaneleyo kwaye" +
    "uzikhathalele."],

    // Response 6:
    ["ixhesha", "Ngokwesiqhelo ukubeleka kuthatha iiyure ezisibhozo (8 hours), kodwa " +
    "kungathatha neeyure ezifikelela kwishumi elinesibhozo( 18 hours). Kanye xa" +
    "uvuleke kangange 10 cm ukulungele ukubeleka."],

    // Response 7:
    ["morning_sickness", "Isifo sasekuseni siqulathe ukugabha nokuba nesicaphu-caphu. Isifo" +
    "sasekuseni singenzeka kwiiveki ezimbini emva kokukhulelwa. Kuqhelekile" +
    "kwaye kwenziwa kukutshintsha kweehormones. Ukutya isonka esingenanto" +
    "nee crackers, nokutya izidlo ezincinci kuyanceda kumaxesha amanzinzi."],

    // Response 8:
    ["uti", "I UTIs ziqhelekile xa ukhulelwe. Usuleleko lunganyusa izinga" +
    "lokubeleka phambi kwexesha xa lunganyangwanga. Ukunyanga iUTI selaamanzi amaninzi ne Citric Soda. " +
    "Ukuba ayibingcono ikliniki ingakunika ii antibiotics​ ."],

    // Response 9:
    ["high-blood", "Ukuba wawune high-blood pressure ngaphambili ukukhulelwa" +
    "ngungayandisa. I Pre-eclampsia yi high-blood pressure xa ukhulelwe." +
    "Impawu ze high-blood pressure ziquka ukubanesiyezi, ukugabha nentloko" +
    "ebuhlungu. Ukuzinceda fumana u Vitamin D ne Calcium ngokuthi utye I" +
    "intlanzi usele nobisi. Nciphisa etyuweni usele namanzi amaninzi. Khumbula" +
    "ukuphumla ngokwaneleyo kwaye uzikhathalele."],

    // Response 10:
    ["std", "Ukuba unesifo sokosulelana ngesondo ngelixa ukhulelwe ingabubungozi" +
    "emntwaneni wakho. Yiya ekliniki uyokufumana unyango. Iimpawu ziquka" +
    "ukubabomvu, ukurhawuzelela, izilonda ,umchamo obuhlungu nencindi" +
    "ephuma ngaphantsi ngokungaqhelekanga."],

    // Response 11:
    ["ndiyagula", "Kufanele uzikhathalele xa ukhulelwe, uphumle kakhulu, utye no Vitamin C" +
    "usele namanzi kakhulu. I panado ne vicks uvumelekile ukuba ungazithatha" +
    "xa ukhulelwe."],

    // Response 12:
    ["uyagula", "Ukuba umntwana wakho unomkhuhlane (fever), ulila kakhulu okanye" +
    "uyagabha. Ukuba ezozinto azipheli ngobusuku kufaneleke use umntwana" +
    "wakho ekliniki."],

    // Response 13:
    ["ekliniki", "Ukuba uneentlungu ezinzima ngelixa ukhulelwe okanye emva kokuba" +
    "ukhulelwe kufuneka uye ekliniki. Funa umntu wokusa ukuba udinga uncedo" +
    "olukhawulezileyo. Ungatsalela nalenombolo yoncedo olukhawulezileyo 112"],

    // Response 14:
    ["dumbileyo", "Imilenze edumbileyo xa ukhulelwe iqhelekile. Ukuzinceda, kufuneka" +
    "ungami ngenyawo ixesha elide kwaye ungaphumlisi inyawo zakho phezulu ." +
    "Yehlisa ityuwa oyityayo, usele amanzi amaninzi."],

    // Response 15:
    ["ndondle", "Ukuncancisa usana olutsha kokona kulungileyo, kodwa ungamtyisa" +
    "nefomula yomntwana. Abantwana kufaneleke batye kwiyure enye ukuya" +
    "kweyesithathu (every 1-3 hours) kwiiveki zokuqala ezimbalwa. Abantwana" +
    "abaneeveki ezingaphantsi kwezilishumi akufanele bafune amanzi ne jusi" +
    "(juice)"],

    // Response 16:
    ["opha", "Amachaphaza okanye ukhopha okuncinci kwiiveki ezilishumi elinambini" +
    "(12 weeks) zokuqala ngelixa ukhulelwe kuqhelekile. Ukhopha kakhulu" +
    "kungazimpawu zokuphuma kwesisu(miscarriage) okanye enye ingxaki." +
    "Ukuba ubona ukuba wopha kakhulu okanye ngendlela engaqhelekanga" +
    "kufaneleke uye ekliniki."],

    // Response 17:
    ["depressed", "ucinezelelo lwengqondo emva kokukhulelwa lubizwa ngokuba yi" +
    "Postpartum Depression .Inokubangelwa lutshintsho lwee (hormones)" +
    "notshintsho kwimpilo yakho. Kubalulekile ukufumana uncedo xa uziva" +
    "unocinezelelo lwengqondo (depressed), ungatsalela lenombolo yoncedo :" +
    "0800 12 13 14"],

    // Response 18:
    ["isibonelelo", "Kufuneka uye kwi ofisi yakwa SASSA ekufutshane phatha isazisi(ID)" +
    "sakho kunye ne satifiketi (certificate) somntwana. Uzokufumana irisiti e" +
    "ofisini kwaye kufuneka uyigcine njengobungqina bokubhalisa."],

    // Response 19:
    ["hiv", "Ukuba ukhulelwe une HIV kufuneka uxelele ikliniki. Bangakunika i(" +
    "Zidovudine) yakho nosana ezokwehlisa amathuba okosuleleka komntwana." +
    "Akunabungozi ukusebenzisa ii ARVs ngexesha ukhulelwe."],

    // Response 20:
    ["hiv_cancisa", "Ncancisa naxa une HIV , ukuba ufumana unyango ekliniki, mancinci" +
    "kakhulu amathuba okuba umntwana wakho osuleleke yi HIV."],

    // Response 21:
    ["nappy_rash", "Umoya opholileyo ne cream yabantwana yeempundu zinganceda" +
    "ukunciphisa urhawuzelelo (rash) . Kodwa I cream yeempundu enintsi, ii" +
    "(wipes) ezimanzi kakhulu nee (nappy) ezimdaka zingayandisa."],

    // Response 22:
    ["akatyi", "Amasana amatsha awaqhelanga ukuginya kwaye angasokola kwiivekana" +
    "zokuqala ezimbalwa. Ukuba lento ayithomalali okanye umntwana akatyanga" +
    "ngaphezu kweeyure(hours) ezine kufuneka uye ekliniki. Ukuba umntwana" +
    "wakho uyagula usenokungafuni ukutya."],

    // Response 23:
    ["ngesondo", "Kukhuselekile ukuzibandakanya ngezesondo xa ukhulelwe xa isikhuseli" +
    "(protection) sisetyenziswa"],

    // Response 24:
    ["c-section", "Ii C sections/ uqhaqho zenziwa kwiingxakeko kumaxesha amaninzi kwaye" +
    "zinobungozi kunokuzibelekela . Kumaxesha amaninzi zenziwa xa umntwana" +
    "esengxakini okanye intloko yomntwana inkulu kakhulu."]
]