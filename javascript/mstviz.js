
var node = typeof module != "undefined" && module;

if (node) {
  var $$ = require('mst'),
    shows = require('./shows.js'),
    Show = shows.Show,
    WatchRecord = require('./watchrecord.js').WatchRecord,
    crossfilter = require('./crossfilter.min.js').crossfilter,
    getMst3kEpisodesMeta = require('./mstmeta.js').getMst3kEpisodesMeta;
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

var totalWatchesBySeasonChart;
// var mostWatchedEpsChart;
var totalWatchesByHostChart;
var totalWatchesByCrowChart;
var totalWatchesByTomChart;
var totalWatchesByMadChart;
var totalWatchesByKindChart;

function checkMstViz(value) {
  var records = parseShowRecords(value);
  var allWatchRecord = new WatchRecord();
  $$.each(records, function(record) {
    if (record.getShows().join("-") == "MST3K") {
      allWatchRecord.addWatches(record);
    }
  });

  if (!node) {
    setTimeout(function() {
      var watches = allWatchRecord.getWatchesJson();
      var epsMeta = getMst3kEpisodesMeta();
      watches = leftJoin(watches, epsMeta, ["episode"]);
      watches = crossfilter(watches);
      // Define group all for counting.
      var all = watches.groupAll();

      var dateDim = watches.dimension(function(w) { return w.dateKey; });
      var dateDimGroup = dateDim.group();

      var seasonDim = watches.dimension(function(w) { return w.season; });
      var seasonDimGroup = seasonDim.group();
      totalWatchesBySeasonChart = dc.rowChart("#total-watches-by-season")
          .width(240).height(330)
          .group(seasonDimGroup)
          .dimension(seasonDim)
          .margins({top: 20, left: 10, right: 10, bottom: 20})
          .renderTitle(true);

      var epDim = watches.dimension(function(w) { return w.episode; });
      var epDimGroup = epDim.group();

      var pieSize = {
        width: 280,
        height: 200,
        radius: 90,
        innerRadius: 40
      };

      var pieTitle = function(d) {
        return d.data.key + " (" +
            Math.floor(d.data.value / all.value() * 100) + "%)";
      };
      var hostDim = watches.dimension(function(w) { return w.host; });
      var hostDimGroup = hostDim.group();
      totalWatchesByHostChart = dc.pieChart("#total-watches-by-host")//, "chartGroup")
            .width(pieSize.width).height(pieSize.height)
            .transitionDuration(500)
            .radius(pieSize.radius)
            .innerRadius(pieSize.innerRadius)
            .dimension(hostDim).group(hostDimGroup)
            .renderLabel(true).renderTitle(true)
            .label(pieTitle).title(pieTitle);

      var crowDim = watches.dimension(function(w) { return w.Crow; });
      var crowDimGroup = crowDim.group();
      totalWatchesByCrowChart = dc.pieChart("#total-watches-by-crow")//, "chartGroup")
            .width(pieSize.width).height(pieSize.height)
            .transitionDuration(500)
            .radius(pieSize.radius)
            .innerRadius(pieSize.innerRadius)
            .dimension(crowDim).group(crowDimGroup)
            .renderLabel(true).renderTitle(true)
            .label(pieTitle).title(pieTitle);

      var tomDim = watches.dimension(function(w) { return w.Tom; });
      var tomDimGroup = tomDim.group();
      totalWatchesByTomChart = dc.pieChart("#total-watches-by-tom")//, "chartGroup")
            .width(pieSize.width).height(pieSize.height)
            .transitionDuration(500)
            .radius(pieSize.radius)
            .innerRadius(pieSize.innerRadius)
            .dimension(tomDim).group(tomDimGroup)
            .renderLabel(true).renderTitle(true)
            .label(pieTitle).title(pieTitle);

      var madDim = watches.dimension(function(w) { return w.Mads[0]; });
      var madDimGroup = madDim.group();
      totalWatchesByMadChart = dc.pieChart("#total-watches-by-mad")//, "chartGroup")
            .width(pieSize.width).height(pieSize.height)
            .transitionDuration(500)
            .radius(pieSize.radius)
            .innerRadius(pieSize.innerRadius)
            .dimension(madDim).group(madDimGroup)
            .renderLabel(true).renderTitle(true)
            .label(pieTitle).title(pieTitle);

      var kindDim = watches.dimension(function(w) { return w.kind; });
      var kindDimGroup = kindDim.group();
      totalWatchesByKindChart = dc.pieChart("#total-watches-by-kind")//, "chartGroup")
            .width(pieSize.width).height(pieSize.height)
            .transitionDuration(500)
            .radius(pieSize.radius)
            .innerRadius(pieSize.innerRadius)
            .dimension(kindDim).group(kindDimGroup)
            .renderLabel(true).renderTitle(true)
            .label(pieTitle).title(pieTitle);

      dc.renderAll();

      var renderEpsList = function(eps) {
        return '<div class="eps-table">'
            + $$.select(eps, function(ep) {
              return ''
                  + '<div class="eps-row">'
                      + '<div class="count">' + ep.value + '</div>'
                      + '<div class="number">' + ep.key + '</div>'
                      + '<div class="title">' + ep.title + '</div>'
                  + '</div>';
            }).join('')
            + '</div>'
      };
      totalWatchesBySeasonChart.renderlet(function() {
        drawCalendar('calendar', dateDimGroup.reduceCount().all());

        var limit = 10;
        var topEps = leftJoin(
            epDimGroup.reduceCount().top(limit), epsMeta,
            [{left: "key", right: "episode"}]);
        $("#most-watched-eps").html(renderEpsList(topEps));
        var bottomEps = epDimGroup.reduceCount().top(Infinity);
        // console.log(JSON.stringify(bottomEps));
        bottomEps.reverse();
        bottomEps = bottomEps.slice(0, Math.min(bottomEps.length, limit));
        var bottomEps = leftJoin(
            bottomEps, epsMeta,
            [{left: "key", right: "episode"}]);
        $("#least-watched-eps").html(renderEpsList(bottomEps));
      });
    }, 1);
  }
  return ''
      + '<div id="calendar" style="clear: both;" class="calendar"></div>'
      + '<div class="dc-charts">'
          + '<div id="total-watches-by-season">'
              + '<strong>Total Watches by Season</strong>'
              + '<a class="reset" href="javascript:totalWatchesBySeasonChart.filterAll();dc.redrawAll();" '
                  + 'style="display: none;">reset</a>'
              + '<div class="clearfix"></div>'
          + '</div>'
          + '<div id="total-watches-by-kind">'
              + '<strong>Total Watches by Kind</strong>'
              + '<a class="reset" href="javascript:totalWatchesByKindChart.filterAll();dc.redrawAll();" '
                  + 'style="display: none;">reset</a>'
              + '<div class="clearfix"></div>'
          + '</div>'
          + '<div id="total-watches-by-host">'
              + '<strong>Total Watches by Host</strong>'
              + '<a class="reset" href="javascript:totalWatchesByHostChart.filterAll();dc.redrawAll();" '
                  + 'style="display: none;">reset</a>'
              + '<div class="clearfix"></div>'
          + '</div>'
          + '<div id="total-watches-by-crow">'
              + '<strong>Total Watches by Crow</strong>'
              + '<a class="reset" href="javascript:totalWatchesByCrowChart.filterAll();dc.redrawAll();" '
                  + 'style="display: none;">reset</a>'
              + '<div class="clearfix"></div>'
          + '</div>'
          + '<div id="total-watches-by-tom">'
              + '<strong>Total Watches by Tom</strong>'
              + '<a class="reset" href="javascript:totalWatchesByTomChart.filterAll();dc.redrawAll();" '
                  + 'style="display: none;">reset</a>'
              + '<div class="clearfix"></div>'
          + '</div>'
          + '<div id="total-watches-by-mad">'
              + '<strong>Total Watches by Mad</strong>'
              + '<a class="reset" href="javascript:totalWatchesByMadChart.filterAll();dc.redrawAll();" '
                  + 'style="display: none;">reset</a>'
              + '<div class="clearfix"></div>'
          + '</div>'
          + '<br style="clear: both;">'
          + '<div>'
              + '<strong>Most Watched Episodes</strong>'
              + '<div id="most-watched-eps"></div>'
          + '</div>'
          + '<div>'
              + '<strong>Least Watched Episodes</strong>'
              + '<div id="least-watched-eps"></div>'
          + '</div>'
      + '</div>';
}

function testMstViz(console) {
  var value = "Key: R - By (R)andom selection Q - By re(Q)uest T - By total viewing walk(T)hrough   1 - 2013.2.6...  ^^^ MST3K 101 - 2013.2.6T1 102 - 2013.2.6T1 103 - 2013.2.7T1 104 - 2013.2.7T1 105 - 2013.2.8T1 106 - 2013.2.8T1 107 - 2013.2.11T1 108 - 2013.2.11T1 109 - 2013.2.11T1 110 - 2013.2.11T1 111 - 2013.2.12T1 112 - 2013.2.12T1 113 - 2013.2.12T1 201 - 2013.2.13T1 202 - 2013.2.13T1 203 - 2013.2.13T1 204 - 2013.2.14T1 205 - 2013.2.14T1 206 - 2013.2.15T1 207 - 2013.2.19T1, 2013.2.25Q 208 - 2013.2.19T1 209 - 2013.2.19T1 210 - 2013.2.20T1 211 - 2013.2.20T1 212 - 2013.2.22T1, 2013.3.15Q 213 - 2013.2.25T1 301 - 2013.2.22Q, 2013.2.27T1 302 - 2013.2.27T1 303 - 2013.2.27T1 304 - 2013.2.27T1 305 - 2013.3.1T1 306 - 2013.3.1T1 307 - 2013.2.15R, 2013.3.4T1 308 - 2013.3.4T1 309 - 2013.3.5T1 310 - 2013.3.6T1 311 - 2013.3.6T1 312 - 2013.3.6T1 313 - 2013.3.6T1 314 - 2013.3.7T1 315 - 2013.3.8T1 316 - 2013.3.8T1 317 - 2013.2.11R, 2013.3.8T1 318 - 2013.3.11T1 319 - 2013.3.11T1 320 - 2013.3.13T1 321 - 2013.3.13T1 322 - 2013.3.13T1 323 - 2013.3.14T1 324 - 2013.3.14T1 401 - 2013.3.14T1 402 - 2013.3.15T1 403 - 2013.3.15T1 404 - 2013.3.18T1 405 - 2013.3.18T1 406 - 2013.3.18T1 407 - 2013.3.21T1 408 - 2013.3.22T1 409 - 2013.3.22T1 410 - 2013.3.22T1 411 - 2013.3.22T1 412 - 2013.3.25T1 413 - 2013.3.25T1 414 - 2013.3.25T1 415 - 2013.3.4R, 2013.3.26T1 416 - 2013.3.26T1 417 - 2013.3.26T1 418 - 2013.3.27T1 419 - 2013.3.27T1 420 - 2013.3.27T1 421 - 2013.2.26R, 2013.3.28T1 422 - 2013.3.28T1 423 - 2013.3.29T1 424 - 2013.3.29T1 501 - 2013.3.29T1 502 - 2013.3.29T1 503 -  504 - 505 - 506 - 507 - 508 - 509 - 510 - 511 - 512 - 513 - 514 - 515 - 2013.3.19R 516 - 517 - 518 - 519 - 520 - 521 - 522 - 523 - 524 - 601 - 602 - 603 - 2013.2.25R 604 - 2013.3.20R 605 - 606 - 2013.2.25R 607 - 608 - 609 - 610 - 611 - 612 - 2013.2.20Q 613 - 2013.2.12R 614 - 615 - 616 - 617 - 618 - 619 - 2013.3.19R 620 - 621 - 622 - 623 - 2013.2.4R 624 - M01 - 701 - 702 - 703 - 704 - 705 - 706 - 707 - 801 - 802 - 2013.3.31R... 803 - 804 - 805 - 2013.3.20R 806 - 807 - 808 - 809 - 810 - 811 - 812 - 2013.3.4R 813 - 814 - 815 - 816 - 817 - 2013.3.29Q... 818 - 819 - 820 - 821 - 2013.3.20R 822 - 901 - 902 - 903 - 2013.3.20R 904 - 905 - 906 - 907 - 908 - 909 - 910 - 911 - 912 - 2013.3.15Q 913 - 2013.2.22R 1001 - 1002 - 1003 - 1004 - 1005 - 2013.2.13R 1006 - 1007 - 1008 - 1009 - 1010 - 1011 - 2013.2.15R 1012 - 1013 - $$$  ^^^ TFC KFS - 2013.2.19Q, 2013.2.20Q $$$  ^^^ Friends :: Paul 101 - 2013.3.17T3 102 - 2013.3.20T3 … 908 - 2013.3.15T1 909 - 2013.3.15T1 910 - 2013.3.16T1 911 - 2013.3.16T1 912 - 2013.3.17T1 913 - 2013.3.18T1 914 - 2013.3.18T1 915 - 2013.3.19T1 916 - 2013.3.19T1 917 - 2013.3.20T1 918 - 2013.3.20T1 919 - 2013.3.21T1 920 - 2013.3.22T1 921 - 2013.3.22T1 922 - 2013.3.22T1 923 - 2013.3.22T1 924 - 2013.3.23T1 925 - 2013.3.23T1 1001 - 2013.3.23T1 1002 - 2013.3.23T1 1003 - 2013.3.25T1 1004 - 2013.3.25T1 1005 - 2013.3.26T1 1006 - 2013.3.26T1 1007 - 2013.3.26T1 1008 - 2013.3.28T1 1009 - 2013.3.28T1 $$$  ^^^ Friends :: Emma 601 - 2013.3.22T1 602 - 2013.3.22T1 603 - 2013.3.22T1 604 - 2013.3.22T1 605 - 2013.3.22T1 606 - 2013.3.22T1 607 - 2013.3.22T1 608 - 2013.3.22T1 609 - 2013.3.22T1 610 - 2013.3.22T1 611 - 2013.3.22T1 612 - 2013.3.22T1 $$$";
  checkMstViz(value);
}


if (node) {
    module.exports = {
        checkMstViz: checkMstViz,

        test: function(console) {
            testMstViz(console);
        }
    };
}


