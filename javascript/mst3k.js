
var node = typeof module != "undefined" && module != null;

if (node) {
    var $$ = require('mst'),
        shows = require('./shows.js'),
        Show = shows.Show,
        Season = shows.Season,
        Episode = shows.Episode;
}

// Keep only the seasons represented in the search string
function assertSeasons(seasons, searchStr) {
    return $$.where(seasons, function(season) {
        return searchStr.indexOf(season.searchName()) != -1;
    });
}

// Evict the seasons found in the search string
function deassertSeasons(seasons, searchStr) {
    return $$.where(seasons, function(season) {
        return searchStr.indexOf(season.searchName()) == -1;
    });
}

// Check for a request for a random MST3K episode
function checkMstConsole(value) {
    if (!value.match(/^mst(\s|$)/)) {
        return;
    }
    var args = value.split(/\s+/),
        show = Show.get("MST3K"),
        seasons = show.seasons(),
        mode = "random",
        lookups = [],
        searchTerm,
        match;
    for (var i = 1; i < args.length; ++i) {
        var arg = args[i];
        if (arg.indexOf("-s=") === 0) {
            // Include only these seasons
            seasons = assertSeasons(seasons, arg.substr(3));
            mode = "random";
        } else if (arg.indexOf("-ns=") === 0) {
            // They want to disallow these seasons
            seasons = deassertSeasons(seasons, arg.substr(4));
            mode = "random";
        } else if (arg.indexOf("-f=") === 0) {
            mode = "find";
            searchTerm = arg.substr(3);
        } else if (arg.match(/^[k\d]\d{2,3}(,[k\d]\d{2,3})*$/i)) {
            // They want to look up specific episodes
            mode = "lookup";
            lookups = lookups.concat(arg.split(/,/));
        } else if (arg.match(/^((k|\d{1,2})\d{2})\-(k?\d+)$/i)) {
            // They're interested in a range of episodes
            mode = "lookup";
            $$.each(show.getEpRange(arg), function(ep) {
                lookups.push(ep.toString());
            });
        }
    }

    // Perform the user action
    if (mode == "random") {
        var list = Season.getEpisodes(seasons),
        // getEpList(seasons),
            ix = Math.floor(list.length * Math.random());
        return "Your random " + show.name() + " episode (from season" + (_keys(seasons).length > 1 ? "s" : "")
            + " " + _englishJoin(_keys(seasons)) + ") is:<br/>\n"
            + list[ix].toString(true);
    } else if (mode == "find") {
        // Display episodes that match 'searchTerm'
        var regex = new RegExp(searchTerm, "i"),
            list = $$.where(Season.getEpisodes(seasons), function(item) {
            return item.toString(true).match(regex) != null;
        });
        return "Your search over '" + searchTerm + "' yielded:<br/>\n"
            + $$.select(list, function(ep) {
                var str = ep.toString(true),
                    match = str.match(regex);
                return str.substr(0, match.index) + "<b>" + match[0]
                    + "</b>" + str.substr(match.index + match[0].length);
            }).join("<br/>\n");
    } else if (mode == "lookup") {
        var str = "";
        $$.each(lookups, function(ep) {
            if (!(ep = show.getEpisode(ep))) {
                return;
            }
            var randID = "search" + ("" + Math.random()).substr(2),
                q = show.name().toLowerCase() + " "
                    + ep.title().match(/^([^a-z]*)/)[0].replace(/(^\s+|\s+$)/g,"");
            str += (str.length > 0 ? "<br />\n" : "") + ep.toString(true);// + " - " + ep.title();

            if (node) {
                // In test mode, don't do anything more.
                return;
            }
            console.log(q);
            str += '<div id="' + randID + '">Fetching YouTube links ...</div>';
            youtubeQueue.attach(function(signal) {
                // Excise the name for the search
                var request = gapi.client.youtube.search.list({
                    q: q,
                    part: 'snippet',
                    maxResults: 5,
                    order: 'relevance',
                    type: 'video'
                    //videoDuration: 'long'
                });
                request.execute(function(response) {
                    signal();
                    // Score each thing by looking up its info
                    var vids = [],
                        // The number of in-flight requests,
                        nWaiting = 0,
                        // A continuation for when we're done with everything
                        cont = function() {
                        // Filter out any that are too short, and keep only the top 5
                        vids = $$.where(vids, function(vid) {
                            return vid.data.data.duration >= 3600;
                        }).slice(0, 5);
                        var vidLinks = [];
                        $$.each(vids, function(vid) {
                            vidLinks.push('<div class="yt-video-link">'
                                    + '<a href="https://www.youtube.com/watch?v=' + vid.item.id.videoId
                                    + '" title="' + vid.item.snippet.title + '">'
                                    + '<img src="' + vid.item.snippet.thumbnails["default"].url + '"></a>'
                                    + '</img>'
                                    + '<br />' + vid.item.snippet.title + ' ('
                                    + Math.round(vid.data.data.duration / 60) + 'm)'
                                + '</div>');
                        });
                        $('#' + randID).html(vidLinks.join("")
                            + '<div style="clear: both;"></div>');
                    };
                    $$.each(response.items, function(item, ix) {
                        if (item.id.videoId) {
                            ++nWaiting;
                            youtubeQueue.attach(function(signal) {
                                $.getJSON('http://gdata.youtube.com/feeds/api/videos/'
                                    + item.id.videoId + '?v=2&alt=jsonc', function(data) {
                                    signal();
                                    vids.push({
                                        item: item,
                                        data: data
                                    })
                                    if (--nWaiting == 0) {
                                        // Everyone is back, so run the continuation
                                        cont();
                                    }
                                });
                            });
                        }
                    });
                });
            });
        });
        return "The " + show.name() + " episode" + (lookups.length > 1 ? "s" : "") + " you requested "
            + (lookups.length > 1 ? "are" : "is") + ":<br />\n" + str;
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
    if (obj instanceof Array) {
        $$.each(obj, function(elem) {
            ret.push(elem instanceof Season ? elem.name() : elem);
        });
    } else {
        $$.each(obj, function(key, value) {
            if (value !== false) {
                ret.push(key);
            }
        });
    }
    return ret;
}

// Test operations on seasons
function testSeasons(console) {
    var show = Show.get("MST3K");
    var seasons = show.seasons();
    // Test asserting and de-asserting seasons
    console.log(_keys(seasons));
    // console.log(_keys(splitSeasonArg("1234")));
    // console.log(_keys(splitSeasonArg("123456789A")));
    // console.log(_keys(splitSeasonArg("1,2,3,4,5,6,7,8,9,10")));
    // console.log(_keys(splitSeasonArg("AK")));
    console.log(_keys(assertSeasons(show.seasons(), "1234")));
    console.log(_keys(deassertSeasons(show.seasons(), "1234")));
    console.log(_keys(assertSeasons(show.seasons(), "A")));
    console.log(_keys(deassertSeasons(show.seasons(), "K")));

    // Test episode list lengths
    console.log("All: " + Season.getEpisodes(seasons).length);
    console.log("Sans K: " + Season.getEpisodes(deassertSeasons(seasons, "K")).length);
    console.log("Just 10: " + Season.getEpisodes(assertSeasons(seasons, "A")).length);
    console.log("Just 2,8: " + Season.getEpisodes(assertSeasons(seasons, "2,8")).length);

    // // Test decoding episode numbers
    // console.log(JSON.stringify(decodeEpNumber("k01")));
    // console.log(JSON.stringify(decodeEpNumber("k02")));
    // console.log(JSON.stringify(decodeEpNumber("101")));
    // console.log(JSON.stringify(decodeEpNumber("313")));
    // console.log(JSON.stringify(decodeEpNumber("1001")));
    // console.log(JSON.stringify(decodeEpNumber("1013")));
    // console.log(JSON.stringify(decodeEpNumber("717")));
    // console.log(JSON.stringify(decodeEpNumber("1009")));
}

// Test querying for an episode range
function testEpRange(console) {
    var show = Show.get("MST3K");
    console.log(show.getEpRange("314-22"));
    console.log(show.getEpRange("301-05"));
    console.log(show.getEpRange("301-10"));
    console.log(show.getEpRange("309-11"));
    console.log(show.getEpRange("K01-19"));
    console.log(show.getEpRange("K00-1"));
    console.log(show.getEpRange("K21-103"));
    console.log(show.getEpRange("620-802"));
    //console.log(show.getEpRange("301-308"));
}

// Test full queries
function testQueries(console) {
    console.log(checkMstConsole("mst 107"));
    console.log(checkMstConsole("mst 1009"));
    console.log(checkMstConsole("mst 107 1009"));
    console.log(checkMstConsole("mst 1008,1009,313 314,315"));
    console.log(checkMstConsole("mst 301-8"));
}

// Verify the contents of the episode map
function testEpMap(console) {
    var show = Show.get("MST3K"),
        eps = show.getAllEpisodes(),
        epMap = {};
    $$.each(eps, function(ep) {
        var seasonName = ep.season().name();
        if (!(seasonName in epMap)) {
            epMap[seasonName] = [];
        }
        epMap[seasonName].push({
            number: ep.toString(),
            title: ep.title()
        });
    });
    console.log(JSON.stringify(epMap));
    $$.each(epMap, function(key, value) {
        console.log(key + " => " + value.length);
    });
}

// Test building 'Episode' objects
function testEpisodes(console) {
    function print(ep) {
        var ep1 = show.getEpisode(ep);
        if (ep1 == null) {
            console.log("'" + ep + "' not found.");
        } else {
            ep = ep1;
            function kernel(ep) {
                return ep == null ? "*" :
                    ep.toString() + ' - ' + ep.season() + '|' + ep.number();
            }
            console.log(kernel(ep.prev()) + " ===> " + kernel(ep) + " ===> " + kernel(ep.next()));
        }
    }
    var show = Show.get("MST3K");
    print("K01");
    print("K22");
    print("101");
    print("113");
    print("114");
    print("1001");
    print("1013");
}

if (node) {
    module.exports = {
        test: function(console) {
            testEpMap(console);
            testSeasons(console);
            testQueries(console);
            testEpRange(console);
            testEpisodes(console);
        },
        Episode: Episode,
        Season: Season
    };
}


