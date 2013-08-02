
/**
 * Draws a calendar using the given data
 * @param {!Element} div The 'div' where to draw the calendar.
 * @param {!Array.<!{key: string, value: number}>} rows The watches grouped by
 *     date.
 */
function drawCalendar(div, rows) {
  $("#" + div).empty();
  var width = 960,
      height = 136,
      cellSize = 17; // cell size

  // Get the min and max years.
  var minYear = -1,
    maxYear = -1,
    maxViews = 1;
  $$.each(rows, function(row) {
    if (maxViews == -1 || row.value > maxViews) {
      maxViews = row.value;
    }
    // Isolate all the years.
    var match = row.key.match(/^\d{4}/);
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
    .key(function(d) { return d.key; }) // date; })
    .rollup(function(d) { return d[0].value; }) // d[0].views.length; })
    .map(rows);
  rect.filter(function(d) { return d in data; })
      .attr("class", function(d) { return "day " + color(data[d]); })
    .select("title")
      .text(function(d) { return d + ": " + data[d]; });
}
