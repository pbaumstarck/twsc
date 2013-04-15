
var node = typeof module != "undefined" && module;

if (node) {
  var $$ = require('mst'),
    shows = require('./shows.js'),
    Show = shows.Show;
}

// class: DateViews
// Holds views for a date.
function Watch(date, episode) {
  var _this = this;

  _this.date = function() { return date; }
  _this.views = function() { return views; }
}


// class: WatchRecord
// A record of watching things for a show.
function WatchRecord() {
  var _this = this,
    _shows = [],
    _pattern = /(^|\s)(([\w\d][\w\d]?)\d{2})\s*\-\s*((\d{4}[\.\-]\d{1,2}[\.\-]\d{1,2}(r|q|t\d*))(\s*[\,\;]\s*(\d{4}[\.\-]\d{1,2}[\.\-]\d{1,2}(r|q|t\d*)))*)/i,
    // A map going from keyed dates ('2013-04-03') to lists of episode--show--date
    // triplets.
    _watches = [],
    _btws = [];
    // _datesToViews = {},
    // // A map going from show--episode names ('MST3K-101') to lists of episode--
    // // show--date triplets.
    // _epsToViews = {};

  // Return the shows that are stored internally.
  _this.shows = function() { return _shows; }
  // List of all the shows we have watches for.
  _this.getShows = function() {
    var showSet = {};
    $$.each(_shows, function(show) {
      showSet[show.toString()] = true;
    });
    return $$.toArray(showSet, function(key, value) { return key; });
  }
  // The number of watches that we have.
  _this.nWatches = function() { return _watches.length; }
  // Public accessor to the watches list.
  _this.watches = function() { return _watches; }
  // The list of our BTW strings.
  _this.btws = function() { return _btws; }

  // function: _getDateKey
  // Get a string key to use for a date, e.g., '2013-04-10'
  function _getDateKey(date) {
    var gi;
    return date.getFullYear() + "-"
      + ((gi = date.getMonth() + 1) < 10 ? "0" + gi : gi) + "-"
      + ((gi = date.getDate()) < 10 ? "0" + gi : gi);
  }

  // function: addWatches
  // Add the processed watches to the record.
  _this.addWatches = function(obj) {
    if (obj instanceof WatchRecord) {
      _shows = _shows.concat(obj.shows())
      _watches = _watches.concat(obj.watches());
      return;
    }
    var show = Show.get(obj.show) || obj.show,
      hasShow = typeof show != "string",
      showKey = hasShow ? show.toString() : obj.show,
      watches = obj.body;
    if (obj.btws) {
      _btws = _btws.concat(obj.btws);
    }
    _shows.push(show);

    var value = obj.body;
    //console.log("Le value: " + value);
    while ((match = _pattern.exec(value))) {
      var number = match[2],
        dates = match[4],
        ep = hasShow ? show.getEpisode(number) : number;
      //console.log("Matched: " + match[2] + ": " + match[4]);
      // Parse all dates
      var subValue = match[0],
        datePattern = /(\d{4}[\.\-]\d{1,2}[\.\-]\d{1,2})(r|q|t\d*)/i,
        subMatch;
      while ((subMatch = datePattern.exec(subValue)) != null) {
        _watches.push({
          show: show,
          episode: ep,
          date: new Date(subMatch[1]),
          kind: subMatch[2]
        });
          //watchKind = subMatch[2],
          // dateKey = _getDateKey(date);
        // var fullEpKey = showKey + "::" + epKey;
        // if (!(fullEpKey in _epsToViews)) {
        //   _epsToViews[fullEpKey] = [];
        // }
        // _epsToViews[fullEpKey].push(tuple);
        // if (!(dateKey in _datesToViews)) {
        //   _datesToViews[fullEpKey] = [];
        // }
        // _datesToViews[fullEpKey].push(tuple);
        subValue = subValue.substr(subMatch.index + subMatch[0].length + 1);
      }
      value = value.substr(match.index + match[0].length + 1);
    }
  }

  function _getGrouped(keyKernel, ctorKernel, updateKernel, asList) {
    var groupedMap = {};
    $$.each(_watches, function(tuple) {
      var key = keyKernel(tuple);//_getDateKey(tuple.date);
      if (!(key in groupedMap)) {
        groupedMap[key] = ctorKernel(tuple);//{
        //   date: key,
        //   views: []
        // };
      }
      // groupedMap[key].views.push(tuple);
      updateKernel(groupedMap[key], tuple);
    });
    if (asList === true) {
      return $$.toArray(groupedMap, function(key, value) { return value; });
    }
    return groupedMap;
  }

  // Get the list of all views grouped by date.
  _this.getGroupedByDate = function(asList) {
    return _getGrouped(
        function(tuple) { return _getDateKey(tuple.date); },
        function(tuple) { return { date: _getDateKey(tuple.date), views: [] }; },
        function(elem, tuple) { elem.views.push(tuple); },
        asList);
  }

  // Get the list of all views grouped by episode.
  _this.getGroupedByEpisode = function(asList) {
    var keyKernel = function(tuple) {
      return (tuple.show ? tuple.show.toString() : "NULL") + "::" +
          (tuple.episode ? tuple.episode.toString() : "NULL");
    },
      ctorKernel = function(tuple) {
      return {
        ep: tuple.episode,
        show: tuple.show,
        views: []
      };
    },
      grouped = _getGrouped(
        keyKernel,
        ctorKernel,
        function(elem, tuple) { elem.views.push(tuple.date); },
        false);
    // Fill in the missing episodes for every show.
    $$.each(_shows, function(show) {
      $$.each(show.getAllEpisodes(), function(ep) {
        var tuple = {
          show: show,
          episode: ep
        },
          key = keyKernel(tuple);
        if (!(key in grouped)) {
          grouped[key] = ctorKernel(tuple);
        }
      });
    });
    if (asList === true) {
      return $$.toArray(grouped, function(key, value) { return value; });
    }
    return grouped;
  }
}

// Return the modules that do MST3K visualization
function getMst3kVizModules() {
    return [{
        // Checks for plotting things
        name: "MST3K-Viz",
        precedence: 1,
        kernel: checkMstViz
    }];
}

// Draws a calendar using the given data
function drawCalendar(div, rows) {
  var width = 960,
      height = 136,
      cellSize = 17; // cell size

  // Get the min and max years.
  var minYear = -1,
    maxYear = -1,
    maxViews = 1;
  $$.each(rows, function(row) {
    if (maxViews == -1 || row.views.length > maxViews) {
      maxViews = row.views.length;
    }
    var match = row.date.match(/^\d{4}/);
    if (match) {
      var gi = parseInt(match[0]);
      if (minYear == -1 || gi < minYear) {
        minYear = gi;
      }
      if (maxYear == -1 || gi > maxYear) {
        maxYear = gi;
      }
    }
  });
  if (maxViews == -1) {
    maxViews = 1;
  }
  if (minYear == -1) {
    minYear = 2013;
  }
  if (maxYear == -1) {
    maxYear = 2014;
  } else {
    maxYear += 1;
  }

  var day = d3.time.format("%w"),
      week = d3.time.format("%U"),
      percent = d3.format(".1%"),
      format = d3.time.format("%Y-%m-%d");

  var color = d3.scale.quantize()
      // .domain([-.05, .05])
      .domain([-maxViews, maxViews])
      .range(d3.range(11).map(function(d) { return "q" + d + "-11"; }));

  var monthPath = function(t0) {
    var t1 = new Date(t0.getFullYear(), t0.getMonth() + 1, 0),
        d0 = +day(t0), w0 = +week(t0),
        d1 = +day(t1), w1 = +week(t1);
    return "M" + (w0 + 1) * cellSize + "," + d0 * cellSize
        + "H" + w0 * cellSize + "V" + 7 * cellSize
        + "H" + w1 * cellSize + "V" + (d1 + 1) * cellSize
        + "H" + (w1 + 1) * cellSize + "V" + 0
        + "H" + (w0 + 1) * cellSize + "Z";
  };

  var leRange = d3.range(minYear, maxYear);
  leRange.reverse();
  var svg = d3.select("#" + div).selectAll("svg")
      // .data(d3.range(minYear, maxYear))
      .data(leRange)
    .enter().append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("class", "RdYlGn")
    .append("g")
      .attr("transform", "translate(" + ((width - cellSize * 53) / 2) + ", " + (height - cellSize * 7 - 1) + ")");

  svg.append("text")
      .attr("transform", "translate(-6," + cellSize * 3.5 + ")rotate(-90)")
      .style("text-anchor", "middle")
      .text(function(d) { return d; });

  var rect = svg.selectAll(".day")
      .data(function(d) { return d3.time.days(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
    .enter().append("rect")
      .attr("class", "day")
      .attr("width", cellSize)
      .attr("height", cellSize)
      .attr("x", function(d) { return week(d) * cellSize; })
      .attr("y", function(d) { return day(d) * cellSize; })
      .datum(format);

  rect.append("title")
      .text(function(d) { return d; });

  svg.selectAll(".month")
      .data(function(d) { return d3.time.months(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
    .enter().append("path")
      .attr("class", "month")
      .attr("d", monthPath);

  var data = d3.nest()
    .key(function(d) { return d.date; })
    .rollup(function(d) { return d[0].views.length; })
    .map(rows);
  rect.filter(function(d) { return d in data; })
      .attr("class", function(d) { return "day " + color(data[d]); })
    .select("title")
      .text(function(d) { return d + ": " + data[d]; });
}

function sortEpList(epList, mode) {
  var mostWatched = mode == "mostWatched",
    leastWatched = mode == "leastWatched",
    byCount = mostWatched || leastWatched,
    mostRecent = mode == "mostRecent",
    leastRecent = mode == "leastRecent",
    byRecent = mostRecent || leastRecent;
  if (!byCount && !byRecent) {
    throw new Error("Invalid mode: '" + mode + "'");
  }
  epList.sort(function(a, b) {
    var gi;
    if (byCount && (gi = a.views.length - b.views.length) != 0) {
      return mostWatched ? -gi : gi;
    }
    // Check out the recency.
    var i = a.views.length - 1,
      j = b.views.length - 1;
    while (i >= 0 && j >= 0) {
      if ((gi = a.views[i] - b.views[j]) != 0) {
        return mostWatched || mostRecent ? -gi : gi;
      }
      --i;
      --j;
    }
    if (i >= 0) {
      // 'i' had more watches.
      return mostWatched || mostRecent ? -1 : 1;
    } else if (j >= 0) {
      // 'j' had more watches.
      return mostWatched || mostRecent ? 1 : -1;
    } else {
      return 0;
    }
  });
}

function checkMstViz(value) {
  var records = parseShowRecords(value);
  var allWatchRecord = new WatchRecord();
  $$.each(records, function(record) {
    if (record.getShows().join("-") == "MST3K") {
      allWatchRecord.addWatches(record);
    }
    //console.log(record.getShows() + record.nWatches());
  });

  if (!node) {
    setTimeout(function() {
      drawCalendar('calendar', allWatchRecord.getGroupedByDate(true));// rows);

      var epList = allWatchRecord.getGroupedByEpisode(true),
      // // Convert 'epViews' to a list
      // var epList = $$.toArray(epViews),
        str = [],
        // Get an episode listing in simple form
        epKernel = function(epListElem, prefix) {
          if (prefix === undefined || prefix == "viewCount") {
            prefix = epListElem.views.length;
          } else if (prefix == "mostRecent") {
            var views = epListElem.views;
            if (views.length) {
              prefix = views[views.length - 1];
            } else {
              prefix = "N/A";
            }
          } else if (prefix == "leastRecent") {
            var views = epListElem.views;
            if (views.length) {
              prefix = views[0];
            } else {
              prefix = "N/A";
            }
          }
          if (typeof prefix == "object") {
            prefix = prefix.getFullYear() + "." + (prefix.getMonth() + 1) + "."
              + prefix.getDate();
          }
          return '<i>' + prefix + '</i> &ndash; ' + (epListElem.ep == null ?
              'NULL' : epListElem.ep.toString() + ' ' + epListElem.ep.title());
        };
      //console.log("epList.length: " + epList.length);

      var divWidth = 250;
      // Fill in the 'stats' thing
      // // - Most watched
      // epList.sort(function(a, b) {
      //   return -(a.views.length - b.views.length);
      // });
      sortEpList(epList, "mostWatched");
      str.push('<div style="float: left; width: ' + divWidth + 'px;"><b>Most watched:</b>');
      var mostWatched = [];
      for (var i = 0; i < 5 && i < epList.length; ++i) {
        str.push('<br />' + epKernel(epList[i], "viewCount"));
      }
      str.push('</div>');

      // - Least watched
      str.push('<div style="float: left; width: ' + divWidth + 'px;"><b>Least watched:</b>');
      var mostWatched = [];
      sortEpList(epList, "leastWatched");
      for (var i = 0; i < 5 && i < epList.length; ++i) {
        str.push('<br />' + epKernel(epList[i], "viewCount"));
      }
      str.push('</div>');

      // - Most recently watched
      // epList.sort(function(a, b) {
      //   return -((a.views.length ? a.views[a.views.length - 1] : 0)
      //     - (b.views.length ? b.views[b.views.length - 1] : 0));
      // });
      sortEpList(epList, "mostRecent");
      str.push('<div style="float: left; width: ' + divWidth + 'px;"><b>Most recently watched:</b>');
      var mostWatched = [];
      for (var i = 0; i < epList.length && i < 5; ++i) {
        str.push('<br />' + epKernel(epList[i], "mostRecent"));
      }
      str.push('</div>');

      // - Least recently watched
      // epList.sort(function(a, b) {
      //   return (a.views.length ? a.views[0] : 0) - (b.views.length ? b.views[0] : 0);
      // });
      sortEpList(epList, "leastRecent");
      str.push('<div style="float: left; width: ' + divWidth + 'px;"><b>Least recently watched:</b>');
      var mostWatched = [];
      for (var i = 0; i < epList.length && i < 5; ++i) {
        str.push('<br />' + epKernel(epList[i], "leastRecent"));
      }
      str.push('</div>');

      // Fill in the 'div'
      $('#stats').html(str.join(""));
    }, 1);
  }
  return '<div id="stats"></div>'
    + '<div id="calendar" style="clear: both;" class="calendar"></div>';
}

var testValue = "Key: R - By (R)andom selection Q - By re(Q)uest T - By total viewing walk(T)hrough   1 - 2013.2.6...  ^^^ MST3K 101 - 2013.2.6T1 102 - 2013.2.6T1 103 - 2013.2.7T1 104 - 2013.2.7T1 105 - 2013.2.8T1 106 - 2013.2.8T1 107 - 2013.2.11T1 108 - 2013.2.11T1 109 - 2013.2.11T1 110 - 2013.2.11T1 111 - 2013.2.12T1 112 - 2013.2.12T1 113 - 2013.2.12T1 201 - 2013.2.13T1 202 - 2013.2.13T1 203 - 2013.2.13T1 204 - 2013.2.14T1 205 - 2013.2.14T1 206 - 2013.2.15T1 207 - 2013.2.19T1, 2013.2.25Q 208 - 2013.2.19T1 209 - 2013.2.19T1 210 - 2013.2.20T1 211 - 2013.2.20T1 212 - 2013.2.22T1, 2013.3.15Q 213 - 2013.2.25T1 301 - 2013.2.22Q, 2013.2.27T1 302 - 2013.2.27T1 303 - 2013.2.27T1 304 - 2013.2.27T1 305 - 2013.3.1T1 306 - 2013.3.1T1 307 - 2013.2.15R, 2013.3.4T1 308 - 2013.3.4T1 309 - 2013.3.5T1 310 - 2013.3.6T1 311 - 2013.3.6T1 312 - 2013.3.6T1 313 - 2013.3.6T1 314 - 2013.3.7T1 315 - 2013.3.8T1 316 - 2013.3.8T1 317 - 2013.2.11R, 2013.3.8T1 318 - 2013.3.11T1 319 - 2013.3.11T1 320 - 2013.3.13T1 321 - 2013.3.13T1 322 - 2013.3.13T1 323 - 2013.3.14T1 324 - 2013.3.14T1 401 - 2013.3.14T1 402 - 2013.3.15T1 403 - 2013.3.15T1 404 - 2013.3.18T1 405 - 2013.3.18T1 406 - 2013.3.18T1 407 - 2013.3.21T1 408 - 2013.3.22T1 409 - 2013.3.22T1 410 - 2013.3.22T1 411 - 2013.3.22T1 412 - 2013.3.25T1 413 - 2013.3.25T1 414 - 2013.3.25T1 415 - 2013.3.4R, 2013.3.26T1 416 - 2013.3.26T1 417 - 2013.3.26T1 418 - 2013.3.27T1 419 - 2013.3.27T1 420 - 2013.3.27T1 421 - 2013.2.26R, 2013.3.28T1 422 - 2013.3.28T1 423 - 2013.3.29T1 424 - 2013.3.29T1 501 - 2013.3.29T1 502 - 2013.3.29T1 503 -  504 - 505 - 506 - 507 - 508 - 509 - 510 - 511 - 512 - 513 - 514 - 515 - 2013.3.19R 516 - 517 - 518 - 519 - 520 - 521 - 522 - 523 - 524 - 601 - 602 - 603 - 2013.2.25R 604 - 2013.3.20R 605 - 606 - 2013.2.25R 607 - 608 - 609 - 610 - 611 - 612 - 2013.2.20Q 613 - 2013.2.12R 614 - 615 - 616 - 617 - 618 - 619 - 2013.3.19R 620 - 621 - 622 - 623 - 2013.2.4R 624 - M01 - 701 - 702 - 703 - 704 - 705 - 706 - 707 - 801 - 802 - 2013.3.31R... 803 - 804 - 805 - 2013.3.20R 806 - 807 - 808 - 809 - 810 - 811 - 812 - 2013.3.4R 813 - 814 - 815 - 816 - 817 - 2013.3.29Q... 818 - 819 - 820 - 821 - 2013.3.20R 822 - 901 - 902 - 903 - 2013.3.20R 904 - 905 - 906 - 907 - 908 - 909 - 910 - 911 - 912 - 2013.3.15Q 913 - 2013.2.22R 1001 - 1002 - 1003 - 1004 - 1005 - 2013.2.13R 1006 - 1007 - 1008 - 1009 - 1010 - 1011 - 2013.2.15R 1012 - 1013 - $$$  ^^^ TFC KFS - 2013.2.19Q, 2013.2.20Q $$$  ^^^ Friends :: Paul :: 101 - 2013.3.17T3 102 - 2013.3.20T3 … 908 - 2013.3.15T1 909 - 2013.3.15T1 910 - 2013.3.16T1 911 - 2013.3.16T1 912 - 2013.3.17T1 913 - 2013.3.18T1 914 - 2013.3.18T1 915 - 2013.3.19T1 916 - 2013.3.19T1 917 - 2013.3.20T1 918 - 2013.3.20T1 919 - 2013.3.21T1 920 - 2013.3.22T1 921 - 2013.3.22T1 922 - 2013.3.22T1 923 - 2013.3.22T1 924 - 2013.3.23T1 925 - 2013.3.23T1 1001 - 2013.3.23T1 1002 - 2013.3.23T1 1003 - 2013.3.25T1 1004 - 2013.3.25T1 1005 - 2013.3.26T1 1006 - 2013.3.26T1 1007 - 2013.3.26T1 1008 - 2013.3.28T1 1009 - 2013.3.28T1 $$$  ^^^ Friends :: Emma :: 601 - 2013.3.22T1 602 - 2013.3.22T1 603 - 2013.3.22T1 604 - 2013.3.22T1 605 - 2013.3.22T1 606 - 2013.3.22T1 607 - 2013.3.22T1 608 - 2013.3.22T1 609 - 2013.3.22T1 610 - 2013.3.22T1 611 - 2013.3.22T1 612 - 2013.3.22T1 $$$";

function testMstViz(console) {
  //var value = "Key: R - By (R)andom selection Q - By re(Q)uest T - By total viewing walk(T)hrough   1 - 2013.2.6...  MST3K 101 - 2013.2.6T1 102 - 2013.2.6T1 103 - 2013.2.7T1 104 - 2013.2.7T1 105 - 2013.2.8T1 106 - 2013.2.8T1 107 - 2013.2.11T1 108 - 2013.2.11T1 109 - 2013.2.11T1 110 - 2013.2.11T1 111 - 2013.2.12T1 112 - 2013.2.12T1 113 - 2013.2.12T1 201 - 2013.2.13T1 202 - 2013.2.13T1 203 - 2013.2.13T1 204 - 2013.2.14T1 205 - 2013.2.14T1 206 - 2013.2.15T1 207 - 2013.2.19T1, 2013.2.25Q 208 - 2013.2.19T1 209 - 2013.2.19T1 210 - 2013.2.20T1 211 - 2013.2.20T1 212 - 2013.2.22T1 213 - 2013.2.25T1 301 - 2013.2.22Q, 2013.2.27T 302 - 2013.2.27T1 303 - 2013.2.27T1 304 - 2013.2.27T1 305 - 2013.3.1T1 306 - 2013.3.1T1 307 - 2013.2.15R 308 - 309 - 310 - 311 - 312 - 313 - 314 - 315 - 316 - 317 - 2013.2.11R 318 - 319 - 320 - 321 - 322 - 323 - 324 - 401 - 402 - 403 - 404 - 405 - 406 - 407 - 408 - 409 - 410 - 411 - 412 - 413 - 414 - 415 - 416 - 417 - 418 - 419 - 420 - 421 - 2013.2.26R 422 - 423 - 424 - 501 - 502 - 503 - 504 - 505 - 506 - 507 - 508 - 509 - 510 - 511 - 512 - 513 - 514 - 515 - 516 - 517 - 518 - 519 - 520 - 521 - 522 - 523 - 524 - 601 - 602 - 603 - 2013.2.25R 604 - 605 - 606 - 2013.2.25R 607 - 608 - 609 - 610 - 611 - 612 - 2013.2.20Q 613 - 2013.2.12R 614 - 615 - 616 - 617 - 618 - 619 - 620 - 621 - 622 - 623 - 2013.2.4R 624 - TM - 701 - 702 - 703 - 704 - 705 - 706 - 707 - 801 - 802 - 803 - 804 - 805 - 806 - 807 - 808 - 809 - 810 - 811 - 812 - 813 - 814 - 815 - 816 - 817 - 818 - 819 - 820 - 821 - 822 - 901 - 902 - 903 - 904 - 905 - 906 - 907 - 908 - 909 - 910 - 911 - 912 - 913 - 2013.2.22R 1001 - 1002 - 1003 - 1004 - 1005 - 2013.2.13R 1006 - 1007 - 1008 - 1009 - 1010 - 1011 - 2013.2.15R 1012 - 1013 -  TFC KFS - 2013.2.19Q, 2013.2.20Q";
  var value = "Key: R - By (R)andom selection Q - By re(Q)uest T - By total viewing walk(T)hrough   1 - 2013.2.6...  ^^^ MST3K 101 - 2013.2.6T1 102 - 2013.2.6T1 103 - 2013.2.7T1 104 - 2013.2.7T1 105 - 2013.2.8T1 106 - 2013.2.8T1 107 - 2013.2.11T1 108 - 2013.2.11T1 109 - 2013.2.11T1 110 - 2013.2.11T1 111 - 2013.2.12T1 112 - 2013.2.12T1 113 - 2013.2.12T1 201 - 2013.2.13T1 202 - 2013.2.13T1 203 - 2013.2.13T1 204 - 2013.2.14T1 205 - 2013.2.14T1 206 - 2013.2.15T1 207 - 2013.2.19T1, 2013.2.25Q 208 - 2013.2.19T1 209 - 2013.2.19T1 210 - 2013.2.20T1 211 - 2013.2.20T1 212 - 2013.2.22T1, 2013.3.15Q 213 - 2013.2.25T1 301 - 2013.2.22Q, 2013.2.27T1 302 - 2013.2.27T1 303 - 2013.2.27T1 304 - 2013.2.27T1 305 - 2013.3.1T1 306 - 2013.3.1T1 307 - 2013.2.15R, 2013.3.4T1 308 - 2013.3.4T1 309 - 2013.3.5T1 310 - 2013.3.6T1 311 - 2013.3.6T1 312 - 2013.3.6T1 313 - 2013.3.6T1 314 - 2013.3.7T1 315 - 2013.3.8T1 316 - 2013.3.8T1 317 - 2013.2.11R, 2013.3.8T1 318 - 2013.3.11T1 319 - 2013.3.11T1 320 - 2013.3.13T1 321 - 2013.3.13T1 322 - 2013.3.13T1 323 - 2013.3.14T1 324 - 2013.3.14T1 401 - 2013.3.14T1 402 - 2013.3.15T1 403 - 2013.3.15T1 404 - 2013.3.18T1 405 - 2013.3.18T1 406 - 2013.3.18T1 407 - 2013.3.21T1 408 - 2013.3.22T1 409 - 2013.3.22T1 410 - 2013.3.22T1 411 - 2013.3.22T1 412 - 2013.3.25T1 413 - 2013.3.25T1 414 - 2013.3.25T1 415 - 2013.3.4R, 2013.3.26T1 416 - 2013.3.26T1 417 - 2013.3.26T1 418 - 2013.3.27T1 419 - 2013.3.27T1 420 - 2013.3.27T1 421 - 2013.2.26R, 2013.3.28T1 422 - 2013.3.28T1 423 - 2013.3.29T1 424 - 2013.3.29T1 501 - 2013.3.29T1 502 - 2013.3.29T1 503 -  504 - 505 - 506 - 507 - 508 - 509 - 510 - 511 - 512 - 513 - 514 - 515 - 2013.3.19R 516 - 517 - 518 - 519 - 520 - 521 - 522 - 523 - 524 - 601 - 602 - 603 - 2013.2.25R 604 - 2013.3.20R 605 - 606 - 2013.2.25R 607 - 608 - 609 - 610 - 611 - 612 - 2013.2.20Q 613 - 2013.2.12R 614 - 615 - 616 - 617 - 618 - 619 - 2013.3.19R 620 - 621 - 622 - 623 - 2013.2.4R 624 - M01 - 701 - 702 - 703 - 704 - 705 - 706 - 707 - 801 - 802 - 2013.3.31R... 803 - 804 - 805 - 2013.3.20R 806 - 807 - 808 - 809 - 810 - 811 - 812 - 2013.3.4R 813 - 814 - 815 - 816 - 817 - 2013.3.29Q... 818 - 819 - 820 - 821 - 2013.3.20R 822 - 901 - 902 - 903 - 2013.3.20R 904 - 905 - 906 - 907 - 908 - 909 - 910 - 911 - 912 - 2013.3.15Q 913 - 2013.2.22R 1001 - 1002 - 1003 - 1004 - 1005 - 2013.2.13R 1006 - 1007 - 1008 - 1009 - 1010 - 1011 - 2013.2.15R 1012 - 1013 - $$$  ^^^ TFC KFS - 2013.2.19Q, 2013.2.20Q $$$  ^^^ Friends :: Paul 101 - 2013.3.17T3 102 - 2013.3.20T3 … 908 - 2013.3.15T1 909 - 2013.3.15T1 910 - 2013.3.16T1 911 - 2013.3.16T1 912 - 2013.3.17T1 913 - 2013.3.18T1 914 - 2013.3.18T1 915 - 2013.3.19T1 916 - 2013.3.19T1 917 - 2013.3.20T1 918 - 2013.3.20T1 919 - 2013.3.21T1 920 - 2013.3.22T1 921 - 2013.3.22T1 922 - 2013.3.22T1 923 - 2013.3.22T1 924 - 2013.3.23T1 925 - 2013.3.23T1 1001 - 2013.3.23T1 1002 - 2013.3.23T1 1003 - 2013.3.25T1 1004 - 2013.3.25T1 1005 - 2013.3.26T1 1006 - 2013.3.26T1 1007 - 2013.3.26T1 1008 - 2013.3.28T1 1009 - 2013.3.28T1 $$$  ^^^ Friends :: Emma 601 - 2013.3.22T1 602 - 2013.3.22T1 603 - 2013.3.22T1 604 - 2013.3.22T1 605 - 2013.3.22T1 606 - 2013.3.22T1 607 - 2013.3.22T1 608 - 2013.3.22T1 609 - 2013.3.22T1 610 - 2013.3.22T1 611 - 2013.3.22T1 612 - 2013.3.22T1 $$$";
  checkMstViz(value);
}

function parseShowRecords(value) {
  var ret = [];
  var ix = -1;
  while ((ix = value.indexOf("^^^", ix + 1)) != -1) {
    var ix2 = value.indexOf("$$$", ix + 3);
    if (ix2 == -1) {
      break;
    }
    var segments = value.substring(ix + 3, ix2).
      replace(/(^\s+|\s+$)/g, "").
      split(/\s+\:\:\s+/),
      obj;
    if (segments.length == 1) {
      // The thing name is just the first thing
      var match = segments[0].match(/^\S+/);
      obj = {
        show: match[0],
        body: segments[0].substr(match.index + match[0].length)
      };
    } else if (segments.length == 2) {
      // A multi-word show name or something
      obj = {
        show: segments[0],
        body: segments[1]
      };
    } else {
      // A multi-word show name with BTW sections
      obj = {
        show: segments[0],
        btws: segments.slice(1, segments.length - 1),
        body: segments[segments.length - 1]
      };
    }
    // Look for '::' delimiters
    var record = new WatchRecord();
    record.addWatches(obj);
    ret.push(record);
  }
  return ret;
}

function testParseShowRecords(console) {
  var records = parseShowRecords(testValue);
  $$.each(records, function(record) {
    console.log(record.getShows().join(",") + ": " + record.nWatches()
      + ", BTW's: " + record.btws().join(","));
  });
}

if (node) {
    module.exports = {
        test: function(console) {
            testMstViz(console);
            testParseShowRecords(console);
        }
    };
}


