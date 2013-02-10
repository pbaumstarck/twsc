
var node = typeof module != "undefined" && module != null;

if (node) {
    var $$ = require('mst');
}

// The list of all episodes, line by line
var epList = ["K00- THE GREEN SLIME (pilot, never shown)","K01- INVADERS FROM THE DEEP","K02- REVENGE OF THE MYSTERONS","K03- STAR FORCE: FUGITIVE ALIEN 2","K04- GAMERA VS. BARUGON","K05- GAMERA","K06- GAMERA VS. GAOS","K07- GAMERA VS. ZIGRA","K08- GAMERA VS. GUIRON","K09- PHASE IV","K10- COSMIC PRINCESS","K11- HUMANOID WOMAN","K12- FUGITIVE ALIEN","K13- SST DEATH FLIGHT","K14- MIGHTY JACK","K15- SUPERDOME","K16- CITY ON FIRE","K17- TIME OF THE APES","K18- THE MILLION EYES OF SU-MURU","K19- HANGAR 18","K20- THE LAST CHASE","K21- LEGEND OF THE DINOSAUR","101- THE CRAWLING EYE","102- THE ROBOT VS. THE AZTEC MUMMY with short: COMMANDO CODY AND THE RADAR MEN FROM THE MOON PT 1","103- MAD MONSTER with short: COMMANDO CODY PT 2","104- WOMEN OF THE PREHISTORIC PLANET","105- THE CORPSE VANISHES with short: COMMANDO CODY PT 3","106- THE CRAWLING HAND","107- ROBOT MONSTER with shorts: COMMANDO CODY PTS 4 and 5","108- THE SLIME PEOPLE with short: COMMANDO CODY PT 6","109- PROJECT MOONBASE with shorts: COMMANDO CODY PTS 7 and 8","110- ROBOT HOLOCAUST with short: COMMANDO CODY PT 9 (partial)","111- MOON ZERO TWO","112- UNTAMED YOUTH","113- THE BLACK SCORPION","201- ROCKETSHIP X-M","202- THE SIDEHACKERS","203- JUNGLE GODDESS with short: THE PHANTOM CREEPS PT 1","204- CATALINA CAPER","205- ROCKET ATTACK USA with short: THE PHANTOM CREEPS PT 2","206- THE RING OF TERROR with short: THE PHANTOM CREEPS PT 3","207- WILD REBELS","208- LOST CONTINENT","209- THE HELLCATS","210- KING DINOSAUR with short: X MARKS THE SPOT","211- FIRST SPACESHIP ON VENUS","212- GODZILLA VS. MEGALON","213- GODZILLA VS. THE SEA MONSTER","301- CAVE DWELLERS","302- GAMERA","303- POD PEOPLE","304- GAMERA VS. BARUGON","305- STRANDED IN SPACE","306- TIME OF THE APES","307- DADDY-O with short: ALPHABET ANTICS","308- GAMERA VS. GAOS","309- THE AMAZING COLOSSAL MAN","310- FUGITIVE ALIEN","311- IT CONQUERED THE WORLD with short: SNOW THRILLS","312- GAMERA VS. GUIRON","313- EARTH VS. THE SPIDER with short: USING YOUR VOICE","314- MIGHTY JACK","315- TEENAGE CAVEMAN with shorts: AQUATIC WIZARDS and CATCHING TROUBLE","316- GAMERA VS. ZIGRA","317- VIKING WOMEN VS. THE SEA SERPENT with short: THE HOME ECONOMICS STORY","318- STAR FORCE - FUGITIVE ALIEN II","319- WAR OF THE COLOSSAL BEAST with short: MR. B. NATURAL","320- THE UNEARTHLY with shorts: POSTURE PALS and APPRECIATING OUR PARENTS","321- SANTA CLAUS CONQUERS THE MARTIANS","322- MASTER NINJA I","323- THE CASTLE OF FU-MANCHU","324- MASTER NINJA II","401- SPACE TRAVELERS","402- THE GIANT GILA MONSTER","403- CITY LIMITS","404- TEENAGERS FROM OUTER SPACE","405- BEING FROM ANOTHER PLANET","406- ATTACK OF THE GIANT LEECHES with short: UNDERSEA KINGDOM PT 1","407- THE KILLER SHREWS with short: JUNIOR RODEO DAREDEVILS","408- HERCULES UNCHAINED","409- THE INDESTRUCTIBLE MAN with short: UNDERSEA KINGDOM PT 2","410- HERCULES AGAINST THE MOON MEN","411- THE MAGIC SWORD","412- HERCULES AND THE CAPTIVE WOMEN","413- MANHUNT IN SPACE with short: GENERAL HOSPITAL PT 1","414- TORMENTED","415- THE BEATNIKS with short: GENERAL HOSPITAL PT 2","416- FIRE MAIDENS OF OUTER SPACE","417- CRASH OF THE MOONS with short: GENERAL HOSPITAL PT 3","418- ATTACK OF THE THE EYE CREATURES","419- THE REBEL SET with short: JOHNNY AT THE FAIR","420- THE HUMAN DUPLICATORS","421- MONSTER A-GO-GO with short: CIRCUS ON ICE","422- THE DAY THE EARTH FROZE with short: HERE COMES THE CIRCUS","423- BRIDE OF THE MONSTER with short: HIRED! PT 1","424- \"MANOS\": THE HANDS OF FATE with short: HIRED! PT 2","501- WARRIOR OF THE LOST WORLD","502- HERCULES","503- SWAMP DIAMONDS with short: WHAT TO DO ON A DATE","504- SECRET AGENT SUPER DRAGON","505- MAGIC VOYAGE OF SINBAD","506- EEGAH!","507- I ACCUSE MY PARENTS with short: THE TRUCK FARMER","508- OPERATION DOUBLE 007","509- GIRL IN LOVER'S LANE","510- THE PAINTED HILLS with short: BODY CARE AND GROOMING","511- GUNSLINGER","512- MITCHELL","513- THE BRAIN THAT WOULDN'T DIE","514- TEEN-AGE STRANGLER with short: IS THIS LOVE?","515- WILD, WILD WORLD OF BATWOMAN with short: CHEATING","516- ALIEN FROM L.A.","517- THE BEGINNING OF THE END","518- THE ATOMIC BRAIN with short: WHAT ABOUT JUVENILE DELINQUENCY?","519- OUTLAW (OF GOR)","520- RADAR SECRET SERVICE with short: LAST CLEAR CHANCE","521- SANTA CLAUS","522- TEEN-AGE CRIME WAVE","523- VILLAGE OF THE GIANTS","524- 12 TO THE MOON with short: DESIGN FOR DREAMING","601- GIRLS TOWN","602- INVASION U.S.A. with short: A DATE WITH YOUR FAMILY","603- THE DEAD TALK BACK with short: THE SELLING WIZARD","604- ZOMBIE NIGHTMARE","605- COLOSSUS AND THE HEADHUNTERS","606- THE CREEPING TERROR","607- BLOODLUST with short: UNCLE JIM'S DAIRY FARM","608- CODE NAME: DIAMOND HEAD with short: A DAY AT THE FAIR","609- THE SKY DIVERS with short: WHY STUDY THE INDUSTRIAL ARTS?","610- THE VIOLENT YEARS with short: YOUNG MAN'S FANCY","611- LAST OF THE WILD HORSES","612- THE STARFIGHTERS","613- THE SINISTER URGE with short: KEEPING CLEAN AND NEAT","614- SAN FRANCISCO INTERNATIONAL","615- KITTEN WITH A WHIP","616- RACKET GIRLS with short: ARE YOU READY FOR MARRIAGE?","617- THE SWORD AND THE DRAGON","618- HIGH SCHOOL BIG SHOT with short: OUT OF THIS WORLD","619- RED ZONE CUBA with short: SPEECH","620- DANGER! DEATH RAY","621- THE BEAST OF YUCCA FLATS with shorts: MONEY TALKS! and PROGRESS ISLAND, U.S.A.","622- ANGELS' REVENGE","623- THE AMAZING TRANSPARENT MAN with short: THE DAYS OF OUR LIVES","624- SAMSON VS. THE VAMPIRE WOMEN","701- NIGHT OF THE BLOOD BEAST with short: ONCE UPON A HONEYMOON","702- THE BRUTE MAN with short: THE CHICKEN OF TOMORROW","703- DEATHSTALKER AND THE WARRIORS FROM HELL","704- THE INCREDIBLE MELTING MAN","705- ESCAPE 2000","706- LASERBLAST","801- REVENGE OF THE CREATURE","802- THE LEECH WOMAN","803- THE MOLE PEOPLE","804- THE DEADLY MANTIS","805- THE THING THAT COULDN'T DIE","806- THE UNDEAD","807- TERROR FROM THE YEAR 5000","808- THE SHE CREATURE","809- I WAS A TEENAGE WEREWOLF","810- THE GIANT SPIDER INVASION","811- \"PARTS\": THE CLONUS HORROR","812- THE INCREDIBLY STRANGE CREATURES WHO STOPPED LIVING AND BECAME MIXED-UP ZOMBIES","813- JACK FROST","814- RIDING WITH DEATH","815- AGENT FOR H.A.R.M.","816- PRINCE OF SPACE","817- HORROR OF PARTY BEACH","818- DEVIL DOLL","819- INVASION OF THE NEPTUNE MEN","820- SPACE MUTINY","821- TIME CHASERS","822- OVERDRAWN AT THE MEMORY BANK","901- THE PROJECTED MAN","902- PHANTOM PLANET","903- PUMA MAN","904- WEREWOLF","905- THE DEADLY BEES","906- THE SPACE CHILDREN with short: CENTURY 21 CALLING","907- HOBGOBLINS","908- THE TOUCH OF SATAN","909- GORGO","910- THE FINAL SACRIFICE","911- DEVIL FISH","912- THE SCREAMING SKULL with short: ROBOT RUMPUS","913- QUEST OF THE DELTA KNIGHTS","1001- SOULTAKER","1002- THE GIRL IN GOLD BOOTS","1003- MERLIN'S SHOP OF MYSTICAL WONDERS","1004- FUTURE WAR","1005- BLOOD WATERS OF DR. Z","1006- BOGGY CREEK II","1007- TRACK OF THE MOON BEAST","1008- FINAL JUSTICE","1009- HAMLET","1010- IT LIVES BY NIGHT","1011- HORRORS OF SPIDER ISLAND","1012- SQUIRM with short: A CASE OF SPRING FEVER","1013- DIABOLIK"];
// A map going from season names to episode lists
var epMap = (function() {
    var ret = {};
    $$.each(epList, function(ep) {
        var match = ep.match(/^(([K\d]\d*)\d{2})\-\s*(.*)$/i),
            season = match[2],
            number = match[1],
            title = match[3];
        if (!(season in ret)) {
            ret[season] = [];
        }
        ret[season].push(number + " - " + title);
    })
    return ret;
})();

// Decode an episode reference from a number, returning a tuple of 'season' and 'number'
function decodeEpNumber(str) {
    var match = str.match(/^([k\d]\d?)(\d{2})$/i);
    return {
        season: match[1],
        number: parseInt(match[2].replace(/^0+/g, ""))
    };
}

// Get a boolean map of all MST seasons
function getSeasons() {
    return {
        "K": true,
        "1": true,
        "2": true,
        "3": true,
        "4": true,
        "5": true,
        "6": true,
        "7": true,
        "8": true,
        "9": true,
        "10": true
    };
}

// Get a map of season names from the argument
function splitSeasonArg(arg) {
    var elems;
    if (arg.indexOf(",") != -1) {
        // Split along commas
        elems = arg.split(/,/);
    } else {
        // Take each character
        elems = [];
        for (var j = 0; j < arg.length; ++j) {
            elems.push(arg.charAt(j));
        }
    }
    // Assert these seasons in 'seasons'
    var elemMap = {};
    $$.each(elems, function(elem) {
        elemMap[elem] = true;
    });
    if ('A' in elemMap) {
        // Convert this to a '10'
        elemMap['10'] = elemMap.A;
        delete elemMap.A;
    }
    return elemMap;
}

// Assert the seasons specified by 'arg' into 'seasons'
function assertSeasons(seasons, arg) {
    var elemMap = splitSeasonArg(arg);
    $$.each(seasons, function(season, value) {
        seasons[season] = season in elemMap && elemMap[season] === true;
    });
    return seasons;
}

// De-assert the seasons specified by 'arg' onto 'seasons'
function deassertSeasons(seasons, arg) {
    var elemMap = splitSeasonArg(arg);
    $$.each(seasons, function(season, value) {
        seasons[season] = !(season in elemMap) || elemMap[season] !== true;
    });
    return seasons;
}

// Get the episode list for the boolean-valued map of seasons
function getEpList(seasons) {
    var ret = [];
    $$.each(seasons, function(season, value) {
        if (value === true) {
            ret = ret.concat(epMap[season]);
        }
    });
    return ret;
}

// Check for a request for a random MST3K episode
function checkMstConsole(value) {
    if (!value.match(/^mst(\s|$)/)) {
        return;
    }
    var args = value.split(/\s+/),
        seasons = getSeasons(),
        mode = "random",
        lookups = [];
    for (var i = 1; i < args.length; ++i) {
        var arg = args[i];
        if (arg.indexOf("-s=") === 0) {
            // Include only these seasons
            assertSeasons(seasons, arg.substr(3));
            mode = "random";
        } else if (arg.indexOf("-ns=") === 0) {
            // They want to disallow these seasons
            deassertSeasons(seasons, arg.substr(4));
            mode = "random";
        } else if (arg.match(/[k\d]\d{2,3}(,[k\d]\d{2,3})*/)) {
            // They want to look up specific episodes
            mode = "lookup";
            lookups = lookups.concat(arg.split(/,/));
        }
    }

    // Perform the user action
    if (mode == "random") {
        var list = getEpList(seasons),
            ix = Math.floor(list.length * Math.random());
        return "Your random MST3K episode (from season" + (_keys(seasons).length > 1 ? "s" : "")
            + " " + _englishJoin(_keys(seasons)) + ") is:<br/>\n"
            + list[ix];
    } else if (mode == "lookup") {
        var str = "";
        $$.each(lookups, function(ep) {
            ep = decodeEpNumber(ep);
            str += (str.length > 0 ? "<br />\n" : "") + epMap[ep.season][ep.number - 1];
        });
        return "The MST3K episodes you requested are:<br />\n" + str;
    }
}

// Perform an English join of the array
function _englishJoin(arr) {
    if (arr.length == 0) {
        return "";
    } else if (arr.length == 1) {
        return "" + arr[0];
    } else if (arr.length == 2) {
        return arr.join(" and ");
    } else {
        return arr.slice(0, arr.length - 1).join(", ") + ", and " + arr[arr.length - 1];
    }
}

// Return the modules that have MST3K modules
function getMst3kModules() {
    return [{
        // Checks for plotting things
        name: "MST3K",
        precedence: 1,
        kernel: checkMstConsole
    }];    
}

function _keys(obj) {
    var ret = [];
    $$.each(obj, function(key, value) {
        if (value !== false) {
            ret.push(key);
        }
    });
    return ret;
}

// Test operations on seasons
function testSeasons(console) {
    var seasons = getSeasons();
    // Test asserting and de-asserting seasons
    console.log(_keys(seasons));
    console.log(_keys(splitSeasonArg("1234")));
    console.log(_keys(splitSeasonArg("123456789A")));
    console.log(_keys(splitSeasonArg("1,2,3,4,5,6,7,8,9,10")));
    console.log(_keys(splitSeasonArg("AK")));
    console.log(_keys(assertSeasons(getSeasons(), "1234")));
    console.log(_keys(deassertSeasons(getSeasons(), "1234")));
    console.log(_keys(assertSeasons(getSeasons(), "A")));
    console.log(_keys(deassertSeasons(getSeasons(), "K")));
    
    // Test episode list lengths
    console.log("All: " + getEpList(getSeasons()).length);
    console.log("Sans K: " + getEpList(deassertSeasons(getSeasons(), "K")).length);
    console.log("Just 10: " + getEpList(assertSeasons(getSeasons(), "A")).length);
    console.log("Just 2,8: " + getEpList(assertSeasons(getSeasons(), "2,8")).length);
    
    // Test decoding episode numbers
    console.log(JSON.stringify(decodeEpNumber("k01")));
    console.log(JSON.stringify(decodeEpNumber("k02")));
    console.log(JSON.stringify(decodeEpNumber("101")));
    console.log(JSON.stringify(decodeEpNumber("313")));
    console.log(JSON.stringify(decodeEpNumber("1001")));
    console.log(JSON.stringify(decodeEpNumber("1013")));
    console.log(JSON.stringify(decodeEpNumber("717")));
    console.log(JSON.stringify(decodeEpNumber("1009")));
}

// Test full queries
function testQueries(console) {
    console.log(checkMstConsole("mst 107"));
    console.log(checkMstConsole("mst 1009"));
    console.log(checkMstConsole("mst 107 1009"));
    console.log(checkMstConsole("mst 1008,1009,313 314,315"));
}

// Verify the contents of the episode map
function testEpMap(console) {
    console.log(JSON.stringify(epMap));
    $$.each(epMap, function(key, value) {
        console.log(key + " => " + value.length);
    });
}

if (node) {
    module.exports = {
        test: function(console) {
            testEpMap(console);
            testSeasons(console);
            testQueries(console);
        }
    };    
}


