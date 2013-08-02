
var node = typeof module != "undefined" && module;

if (node) {
  var $$ = require('mst'),
    WatchRecord = require('./watchrecord.js').WatchRecord,
    showrecord = require('./showrecord.js');
    crossfilter = require('./crossfilter.min.js').crossfilter,
    getMst3kEpisodesMeta = require('./mstmeta.js').getMst3kEpisodesMeta,
    leftJoin = require('./leftjoin.js').leftJoin;
}

// showrecord.testParseShowRecords(console);
var watchRecords = showrecord.testParseShowRecords(console);
var msts = watchRecords[0].getWatchesJson();
$$.each(msts, function(view) {
  view.season = view.episode.match(/^(.+)..$/)[1];
});

var crossed = crossfilter(msts);
console.log(crossed.size());

var epDim = crossed.dimension(function(w) { return w.episode; });
console.log("epDim.top(5):");
console.log(epDim.top(5));
var epDimGrouped = epDim.group();
console.log("epDimGrouped.size():");
console.log(epDimGrouped.size());

console.log("\nTop episodes:");
console.log(epDimGrouped.reduceCount().top(5));

var seasonDim = crossed.dimension(function(w) { return w.season; });
console.log("\nTop seasons:");
console.log(seasonDim.group().reduceCount().all().sort(
    function(a, b) { return -(a.value - b.value); }));

var dateDim = crossed.dimension(function(w) { return w.dateKey; });
console.log(dateDim.group().reduceCount().all(5));

var epsMeta = getMst3kEpisodesMeta();
console.log(epsMeta);

var joined = leftJoin(msts, epsMeta, ["episode"]);
console.log(joined);

// var mostWatched = epDimGrouped.reduceCount().top(1)
// console.log(mostWatched);

// var watchesPerEp = crossfilter(epDimGrouped.reduceCount().all());
// var epsByNumWatches = watchesPerEp.dimension(function(r) { return r.value; });
// console.log(epsByNumWatches.filter(function(d) { return d <= 2; }).top(4));

// // var epsByDim
// console.log(epDim.group().reduce(
//     function(p, v) {
//       ++p.count;
//       p.watches.push(v.date);
//       return p;
//     },
//     function(p, v) {
//       --p.count;
//       throw new Error("What is this I don't even");
//       // return p;
//     },
//     function() {
//       return {
//         count: 0,
//         watches: []
//       };
//     }).all());
