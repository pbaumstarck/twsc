
var node = typeof module != "undefined" && module;

if (node) {
  var $$ = require('mst'),
    shows = require('./shows.js'),
    Show = shows.Show;
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

  // Get the min and max dates
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

  // d3.select(self.frameElement).style("height", "2910px");
}

function checkMstViz(value) {
  var show = Show.get("MST3K");
  var pattern = /(^|\s)(([\w\d]{1,2})\d{2})\s*\-\s*((\d{4}[\.\-]\d{1,2}[\.\-]\d{1,2}(r|q|t\d*))(\s*[\,\;]\s*(\d{4}[\.\-]\d{1,2}[\.\-]\d{1,2}(r|q|t\d*))))/i;
  var rows = [],
    leDates = {},
    // A map going from 'Episode' strings to convenience objects of '{ ep: {Episode}, views: [{Date}+] }'
    epViews = {};
  // And seed that with all episodes
  $$.each(show.getAllEpisodes(), function(ep) {
    epViews[ep.toString()] = {
      ep: ep,
      views: []
    };
  });

  while ((match = pattern.exec(value))) {
    var number = match[2],
      dates = match[4],
      ep = show.getEpisode(number);
    if (ep) {
      // Parse all dates
      var subValue = match[0],
        datePattern = /(\d{4}[\.\-]\d{1,2}[\.\-]\d{1,2})(r|q|t\d*)/i,
        subMatch;
      while ((subMatch = datePattern.exec(subValue)) != null) {
        var date = new Date(subMatch[1]),
          watchKind = subMatch[2],
          gi,
          key = date.getFullYear() + "-"
            + ((gi = date.getMonth() + 1) < 10 ? "0" + gi : gi) + "-"
            + ((gi = date.getDate()) < 10 ? "0" + gi : gi);
        epViews[ep.toString()].views.push(date);
        if (!(key in leDates)) {
          leDates[key] = {
            date: key,
            views: []
          };
          rows.push(leDates[key]);
        }
        leDates[key].views.push(1);
        subValue = subValue.substr(subMatch.index + subMatch[0].length + 1);
      }
    }
    value = value.substr(match.index + match[0].length + 1);
  }
  // Sort all the views by date ascending
  $$.each(epViews, function(key, value) {
    value.views.sort(function(a, b) {
      return (+a) - (+b);
    });
  });

  if (!node) {
    setTimeout(function() {
      drawCalendar('calendar', rows);

      // Convert 'epViews' to a list
      var epList = $$.toArray(epViews),
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
          return '<i>' + prefix + '</i> &ndash; ' + epListElem.ep.toString()
            + ' ' + epListElem.ep.title();
        };

      var divWidth = 250;
      // Fill in the 'stats' thing
      // - Most watched
      epList.sort(function(a, b) {
        return -(a.views.length - b.views.length);
      });
      str.push('<div style="float: left; width: ' + divWidth + 'px;"><b>Most watched:</b>');
      var mostWatched = [];
      for (var i = 0; i < 5 && i < epList.length; ++i) {
        str.push('<br />' + epKernel(epList[i], "viewCount"));
      }
      str.push('</div>');

      // - Least watched
      str.push('<div style="float: left; width: ' + divWidth + 'px;"><b>Least watched:</b>');
      var mostWatched = [];
      for (var i = epList.length - 1; i >= epList.length - 5 && i >= 0; --i) {
        str.push('<br />' + epKernel(epList[i], "viewCount"));
      }
      str.push('</div>');

      // - Most recently watched
      epList.sort(function(a, b) {
        return -((a.views.length ? a.views[a.views.length - 1] : 0)
          - (b.views.length ? b.views[b.views.length - 1] : 0));
      });
      str.push('<div style="float: left; width: ' + divWidth + 'px;"><b>Most recently watched:</b>');
      var mostWatched = [];
      for (var i = 0; i < epList.length && i < 5; ++i) {
        str.push('<br />' + epKernel(epList[i], "mostRecent"));
      }
      str.push('</div>');

      // - Least recently watched
      epList.sort(function(a, b) {
        return (a.views.length ? a.views[0] : 0) - (b.views.length ? b.views[0] : 0);
      });
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
  while ((ix = testValue.indexOf("^^^", ix + 1)) != -1) {
    var ix2 = testValue.indexOf("$$$", ix + 3);
    if (ix2 == -1) {
      break;
    }
    var segments = testValue.substring(ix + 3, ix2).
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
    ret.push(obj);
  }
  return ret;
}

function testParseShowRecords(console) {
  var records = parseShowRecords(testValue);
  $$.each(records, function(record) {
    console.log(record.show + ": " + record.body.length
      + ", BTW's: " + (record.btws ? record.btws.join(",") : "None"));
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


