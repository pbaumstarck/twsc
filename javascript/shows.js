
var node = typeof module != "undefined" && module;

if (node) {
    var $$ = require("mst");
}

// Decode an episode reference from a number, returning a tuple of 'season' and 'number'
function decodeEpNumber(str) {
    var match = str.match(/^([\d\w]+)(\d{2})$/i);
    return {
        season: match[1],
        number: parseInt(match[2].replace(/^0+(?=\d)/g, ""))
    };
}

// class: Show
// A show.
function Show(name, epsList) {
    var _this = this,
        _seasons = [];

    function _ctor() {
        var seasonsMap = {};
        $$.each(epsList, function(ep) {
            ep = decodeEpEntry(ep);
            var season;
            if (!(ep.season in seasonsMap)) {
                season = new Season(_this, ep.season);
                seasonsMap[ep.season] = season;
                _seasons.push(season);
            } else {
                season = seasonsMap[ep.season];
            }
            ep = new Episode(season, ep.number, ep.title);
        });
    }


    _this.name = function() { return name; }
    _this.seasons = function() { return _seasons.slice(); }
    // Decode an episode reference from a number, returning a tuple of 'season' and 'number'
    function decodeEpEntry(str) {
        var match = str.match(/^([\d\w]+)(\d{2})\s*\-*\s*(.*)$/i);
        return {
            season: match[1].toUpperCase(),
            number: parseInt(match[2].replace(/^0+(?=\d)/g, "")),
            title: match[3]
        };
    }
    // Get the season after that given one
    _this.nextSeason = function(season) {
        var ix = _seasons.indexOf(season);
        return ix == -1 || ix >= _seasons.length - 1 ? null :
            _seasons[ix + 1];
    }
    // Get the season before the given one
    _this.prevSeason = function(season) {
        var ix = _seasons.indexOf(season);
        return ix <= 0 ? null : _seasons[ix - 1];
    }
    // Get the season of the given name
    _this.getSeason = function(seasonName) {
        for (var i = 0; i < _seasons.length; ++i) {
            var season = _seasons[i];
            if (season.name() == seasonName) {
                return season;
            }
        }
        return null;
    }
    // Get an episode based on a number
    _this.getEpisode = function(epNum) {
        var ep = decodeEpEntry(epNum);
        if (!ep) {
            return null;
        }
        var season = _this.getSeason(ep.season);
        return !season ? null : season.getEpisode(ep.number);
    }
    // Gets the list of all episodes
    _this.getAllEpisodes = function() {
        return $$.flatten($$.select(_seasons, function(season) {
            return season.episodes();
        }));
    }
    // Get the range of episodes expressed in a '314-22'-style string.
    //
    // parameters:
    //   str: The String to parse
    //
    // returns:
    //   A list of 'Episode' objects
    _this.getEpRange = function(str) {
        var match = str.match(/([k\d]\d{2,3})\-(k?\d+)/i),
            first = match[1],
            last = match[2];
        // If the 'last' match is too short, transplant from the 'first'
        if (last.length <= 2) {
            // Must transplant
            last = first.substr(0, first.length - last.length) + last;
        }
        var firstEp = _this.getEpisode(first),
            lastEp = _this.getEpisode(last);
        if (firstEp == null) {
            if (lastEp == null) {
                return [];
            } else {
                return [lastEp];
            }
        } else {
            if (lastEp == null) {
                return [firstEp];
            } else {
                var ret = [firstEp],
                    next = firstEp;
                while ((next = next.next()) != null) {
                    ret.push(next);
                    if (next == lastEp) {
                        break;
                    }
                }
                return ret;
            }
        }
    }
    // Gets the name of the show.
    _this.toString = function() { return name; }


    _ctor();
}
Show.get = (function() {
    var _map = {},
        mst3k = ["K00- THE GREEN SLIME (pilot, never shown)","K01- INVADERS FROM THE DEEP","K02- REVENGE OF THE MYSTERONS","K03- STAR FORCE: FUGITIVE ALIEN 2","K04- GAMERA VS. BARUGON","K05- GAMERA","K06- GAMERA VS. GAOS","K07- GAMERA VS. ZIGRA","K08- GAMERA VS. GUIRON","K09- PHASE IV","K10- COSMIC PRINCESS","K11- HUMANOID WOMAN","K12- FUGITIVE ALIEN","K13- SST DEATH FLIGHT","K14- MIGHTY JACK","K15- SUPERDOME","K16- CITY ON FIRE","K17- TIME OF THE APES","K18- THE MILLION EYES OF SU-MURU","K19- HANGAR 18","K20- THE LAST CHASE","K21- LEGEND OF THE DINOSAUR","101- THE CRAWLING EYE","102- THE ROBOT VS. THE AZTEC MUMMY with short: COMMANDO CODY AND THE RADAR MEN FROM THE MOON PT 1","103- MAD MONSTER with short: COMMANDO CODY PT 2","104- WOMEN OF THE PREHISTORIC PLANET","105- THE CORPSE VANISHES with short: COMMANDO CODY PT 3","106- THE CRAWLING HAND","107- ROBOT MONSTER with shorts: COMMANDO CODY PTS 4 and 5","108- THE SLIME PEOPLE with short: COMMANDO CODY PT 6","109- PROJECT MOONBASE with shorts: COMMANDO CODY PTS 7 and 8","110- ROBOT HOLOCAUST with short: COMMANDO CODY PT 9 (partial)","111- MOON ZERO TWO","112- UNTAMED YOUTH","113- THE BLACK SCORPION","201- ROCKETSHIP X-M","202- THE SIDEHACKERS","203- JUNGLE GODDESS with short: THE PHANTOM CREEPS PT 1","204- CATALINA CAPER","205- ROCKET ATTACK USA with short: THE PHANTOM CREEPS PT 2","206- THE RING OF TERROR with short: THE PHANTOM CREEPS PT 3","207- WILD REBELS","208- LOST CONTINENT","209- THE HELLCATS","210- KING DINOSAUR with short: X MARKS THE SPOT","211- FIRST SPACESHIP ON VENUS","212- GODZILLA VS. MEGALON","213- GODZILLA VS. THE SEA MONSTER","301- CAVE DWELLERS","302- GAMERA","303- POD PEOPLE","304- GAMERA VS. BARUGON","305- STRANDED IN SPACE","306- TIME OF THE APES","307- DADDY-O with short: ALPHABET ANTICS","308- GAMERA VS. GAOS","309- THE AMAZING COLOSSAL MAN","310- FUGITIVE ALIEN","311- IT CONQUERED THE WORLD with short: SNOW THRILLS","312- GAMERA VS. GUIRON","313- EARTH VS. THE SPIDER with short: USING YOUR VOICE","314- MIGHTY JACK","315- TEENAGE CAVEMAN with shorts: AQUATIC WIZARDS and CATCHING TROUBLE","316- GAMERA VS. ZIGRA","317- VIKING WOMEN VS. THE SEA SERPENT with short: THE HOME ECONOMICS STORY","318- STAR FORCE - FUGITIVE ALIEN II","319- WAR OF THE COLOSSAL BEAST with short: MR. B. NATURAL","320- THE UNEARTHLY with shorts: POSTURE PALS and APPRECIATING OUR PARENTS","321- SANTA CLAUS CONQUERS THE MARTIANS","322- MASTER NINJA I","323- THE CASTLE OF FU-MANCHU","324- MASTER NINJA II","401- SPACE TRAVELERS","402- THE GIANT GILA MONSTER","403- CITY LIMITS","404- TEENAGERS FROM OUTER SPACE","405- BEING FROM ANOTHER PLANET","406- ATTACK OF THE GIANT LEECHES with short: UNDERSEA KINGDOM PT 1","407- THE KILLER SHREWS with short: JUNIOR RODEO DAREDEVILS","408- HERCULES UNCHAINED","409- THE INDESTRUCTIBLE MAN with short: UNDERSEA KINGDOM PT 2","410- HERCULES AGAINST THE MOON MEN","411- THE MAGIC SWORD","412- HERCULES AND THE CAPTIVE WOMEN","413- MANHUNT IN SPACE with short: GENERAL HOSPITAL PT 1","414- TORMENTED","415- THE BEATNIKS with short: GENERAL HOSPITAL PT 2","416- FIRE MAIDENS OF OUTER SPACE","417- CRASH OF THE MOONS with short: GENERAL HOSPITAL PT 3","418- ATTACK OF THE THE EYE CREATURES","419- THE REBEL SET with short: JOHNNY AT THE FAIR","420- THE HUMAN DUPLICATORS","421- MONSTER A-GO-GO with short: CIRCUS ON ICE","422- THE DAY THE EARTH FROZE with short: HERE COMES THE CIRCUS","423- BRIDE OF THE MONSTER with short: HIRED! PT 1","424- \"MANOS\": THE HANDS OF FATE with short: HIRED! PT 2","501- WARRIOR OF THE LOST WORLD","502- HERCULES","503- SWAMP DIAMONDS with short: WHAT TO DO ON A DATE","504- SECRET AGENT SUPER DRAGON","505- MAGIC VOYAGE OF SINBAD","506- EEGAH!","507- I ACCUSE MY PARENTS with short: THE TRUCK FARMER","508- OPERATION DOUBLE 007","509- GIRL IN LOVER'S LANE","510- THE PAINTED HILLS with short: BODY CARE AND GROOMING","511- GUNSLINGER","512- MITCHELL","513- THE BRAIN THAT WOULDN'T DIE","514- TEEN-AGE STRANGLER with short: IS THIS LOVE?","515- WILD, WILD WORLD OF BATWOMAN with short: CHEATING","516- ALIEN FROM L.A.","517- THE BEGINNING OF THE END","518- THE ATOMIC BRAIN with short: WHAT ABOUT JUVENILE DELINQUENCY?","519- OUTLAW (OF GOR)","520- RADAR SECRET SERVICE with short: LAST CLEAR CHANCE","521- SANTA CLAUS","522- TEEN-AGE CRIME WAVE","523- VILLAGE OF THE GIANTS","524- 12 TO THE MOON with short: DESIGN FOR DREAMING","601- GIRLS TOWN","602- INVASION U.S.A. with short: A DATE WITH YOUR FAMILY","603- THE DEAD TALK BACK with short: THE SELLING WIZARD","604- ZOMBIE NIGHTMARE","605- COLOSSUS AND THE HEADHUNTERS","606- THE CREEPING TERROR","607- BLOODLUST with short: UNCLE JIM'S DAIRY FARM","608- CODE NAME: DIAMOND HEAD with short: A DAY AT THE FAIR","609- THE SKY DIVERS with short: WHY STUDY THE INDUSTRIAL ARTS?","610- THE VIOLENT YEARS with short: YOUNG MAN'S FANCY","611- LAST OF THE WILD HORSES","612- THE STARFIGHTERS","613- THE SINISTER URGE with short: KEEPING CLEAN AND NEAT","614- SAN FRANCISCO INTERNATIONAL","615- KITTEN WITH A WHIP","616- RACKET GIRLS with short: ARE YOU READY FOR MARRIAGE?","617- THE SWORD AND THE DRAGON","618- HIGH SCHOOL BIG SHOT with short: OUT OF THIS WORLD","619- RED ZONE CUBA with short: SPEECH","620- DANGER! DEATH RAY","621- THE BEAST OF YUCCA FLATS with shorts: MONEY TALKS! and PROGRESS ISLAND, U.S.A.","622- ANGELS' REVENGE","623- THE AMAZING TRANSPARENT MAN with short: THE DAYS OF OUR LIVES","624- SAMSON VS. THE VAMPIRE WOMEN","M01- THIS ISLAND EARTH","701- NIGHT OF THE BLOOD BEAST with short: ONCE UPON A HONEYMOON","702- THE BRUTE MAN with short: THE CHICKEN OF TOMORROW","703- DEATHSTALKER AND THE WARRIORS FROM HELL","704- THE INCREDIBLE MELTING MAN","705- ESCAPE 2000","706- LASERBLAST","801- REVENGE OF THE CREATURE","802- THE LEECH WOMAN","803- THE MOLE PEOPLE","804- THE DEADLY MANTIS","805- THE THING THAT COULDN'T DIE","806- THE UNDEAD","807- TERROR FROM THE YEAR 5000","808- THE SHE CREATURE","809- I WAS A TEENAGE WEREWOLF","810- THE GIANT SPIDER INVASION","811- \"PARTS\": THE CLONUS HORROR","812- THE INCREDIBLY STRANGE CREATURES WHO STOPPED LIVING AND BECAME MIXED-UP ZOMBIES","813- JACK FROST","814- RIDING WITH DEATH","815- AGENT FOR H.A.R.M.","816- PRINCE OF SPACE","817- HORROR OF PARTY BEACH","818- DEVIL DOLL","819- INVASION OF THE NEPTUNE MEN","820- SPACE MUTINY","821- TIME CHASERS","822- OVERDRAWN AT THE MEMORY BANK","901- THE PROJECTED MAN","902- PHANTOM PLANET","903- PUMA MAN","904- WEREWOLF","905- THE DEADLY BEES","906- THE SPACE CHILDREN with short: CENTURY 21 CALLING","907- HOBGOBLINS","908- THE TOUCH OF SATAN","909- GORGO","910- THE FINAL SACRIFICE","911- DEVIL FISH","912- THE SCREAMING SKULL with short: ROBOT RUMPUS","913- QUEST OF THE DELTA KNIGHTS","1001- SOULTAKER","1002- THE GIRL IN GOLD BOOTS","1003- MERLIN'S SHOP OF MYSTICAL WONDERS","1004- FUTURE WAR","1005- BLOOD WATERS OF DR. Z","1006- BOGGY CREEK II","1007- TRACK OF THE MOON BEAST","1008- FINAL JUSTICE","1009- HAMLET","1010- IT LIVES BY NIGHT","1011- HORRORS OF SPIDER ISLAND","1012- SQUIRM with short: A CASE OF SPRING FEVER","1013- DIABOLIK"];
    return function(name) {
        if (name.match(/mst3k/i)) {
            name = "mst3k";
            if (!(name in _map)) {
                _map[name] = new Show("MST3K", mst3k);
            }
            return _map[name];
        } else {
            return null;
        }
    };
})();


// class: Season
// Stored as an integer or string and to be initialized from strings, with
// links to its 'Episode's.
function Season(show, name) {
    var _this = this,
        _episodes = [];


    // The name of the season
    _this.name = function() { return name; }
    // Get a search name for the season
    _this.searchName = function() {
        if (name.match(/^\d+$/)) {
            var value = parseInt(name);
            return (value >= 10 ? value.toString(16) : "" + value).toUpperCase();
        } else {
            return name;
        }
    }
    // Accessor to the episodes list
    _this.episodes = function() { return _episodes; }
    // The number of episodes that is in this season
    _this.nEps = function() { return _episodes.length; }

    // Adds an episode to us
    _this.addEpisode = function(ep) { _episodes.push(ep); }

    // Get the next season after this one
    _this.nextSeason = function() { return show.nextSeason(_this); }
    // Get the season before this one
    _this.prevSeason = function() { return show.prevSeason(_this); }
    // Get the next episode after this one
    _this.nextEpisode = function(ep) {
        var ix = _episodes.indexOf(ep);
        if (ix == -1) {
            console.log("missing");
            return null;
        }
        if (ix < _episodes.length - 1) {
            return _episodes[ix + 1];
        }
        var nextSeason = _this.nextSeason();
        return nextSeason == null ? null : nextSeason.episodes()[0];
    }
    // Get the episode before this one
    _this.prevEpisode = function(ep) {
        var ix = _episodes.indexOf(ep);
        if (ix == -1) {
            console.log("missing");
            return null;
        }
        if (ix > 0) {
            return _episodes[ix - 1];
        }
        var prevSeason = _this.prevSeason();
        if (prevSeason == null) {
            return null;
        }
        var eps = prevSeason.episodes();
        return eps[eps.length - 1];
    }
    // Get the episode of the given value
    _this.getEpisode = function(ep) {
        for (var i = 0; i < _episodes.length; ++i) {
            var episode = _episodes[i];
            if (episode.number() == ep) {
                return episode;
            }
        }
        return null;
    }

    _this.toString = function() { return "" + name; }
}
// Get all the episodes from a list of seasons in a flat array
Season.getEpisodes = function(seasons) {
    return $$.flatten($$.select(seasons, function(season) {
        return season.episodes();
    }));
};


// class: Episode
// An episode, which can be initialized from a string representation.
function Episode(season, number, title) {
    var _this = this;

    function _ctor() {
        season.addEpisode(_this);
    }

    _this.season = function() { return season; }
    _this.number = function() { return number; }
    _this.title = function() { return title; }

    // Return the next episode
    _this.next = function() { return season.nextEpisode(_this); }
    // Return the previous episode
    _this.prev = function() { return season.prevEpisode(_this); }

    _this.toString = function(pretty) {
        if (pretty === true) {
            return _this.toString() + (title ? " - " + title : "");
        } else {
            return season.toString() + (number < 10 ? "0" : "") + number;
        }
    }

    _ctor();
}

if (node) {
    module.exports = {
        Show: Show,
        Season: Season,
        Episode: Episode
    };
}
